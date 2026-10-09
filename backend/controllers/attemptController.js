import mongoose from "mongoose";
import Attempt from "../models/Attempt.js";
import Test from "../models/Test.js";
import Question from "../models/Question.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const startAttempt = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!isValidObjectId(testId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    const test = await Test.findOne({
      _id: testId,
      isActive: true,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found",
      });
    }

    // Check for an existing active attempt
    const existingAttempt = await Attempt.findOne({
      userId: req.user._id,
      testId,
      status: "inProgress",
    });

    if (existingAttempt) {
      const elapsedSeconds = Math.floor(
        (Date.now() - existingAttempt.startedAt.getTime()) / 1000
      );

      const allowedSeconds = test.duration * 60;

      // If old attempt has expired, close it automatically
      if (elapsedSeconds >= allowedSeconds) {
        existingAttempt.status = "expired";
        existingAttempt.timeTaken = allowedSeconds;
        existingAttempt.submittedAt = new Date();

        await existingAttempt.save();
      } else {
        // Still valid — resume the existing attempt
        return res.status(400).json({
          success: false,
          message: "You already have an active attempt for this test",
          attemptId: existingAttempt._id,
          status: "inProgress",
          remainingSeconds: allowedSeconds - elapsedSeconds,
        });
      }
    }

    const questions = await Question.find({
      _id: { $in: test.questionIds },
      isActive: true,
    })
      .select("_id questionText options difficulty marks negativeMarks")
      .sort({ createdAt: 1 });

    if (questions.length !== test.questionIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some questions in this test are unavailable",
      });
    }

    const attempt = await Attempt.create({
      userId: req.user._id,
      testId,
      answers: [],
      startedAt: new Date(),
      status: "inProgress",
    });

    return res.status(201).json({
      success: true,
      message: "Mock test started successfully",
      attempt: {
        id: attempt._id,
        testId: test._id,
        startedAt: attempt.startedAt,
        status: attempt.status,
      },
      test: {
        title: test.title,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        negativeMarking: test.negativeMarking,
      },
      questions,
    });
  } catch (error) {
    console.error("Start attempt error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to start mock test",
    });
  }
};

export const submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      userId: req.user._id,
      status: "inProgress",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Active attempt not found",
      });
    }

    const test = await Test.findOne({
      _id: attempt.testId,
      isActive: true,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found",
      });
    }

    const elapsedSeconds = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000
    );

    const allowedSeconds = test.duration * 60;

    if (elapsedSeconds > allowedSeconds) {
      attempt.status = "expired";
      attempt.timeTaken = allowedSeconds;
      attempt.submittedAt = new Date();

      await attempt.save();

      return res.status(400).json({
        success: false,
        message: "Mock test time has expired",
        attemptId: attempt._id,
        timeTaken: allowedSeconds,
        duration: test.duration,
        status: "expired",
      });
    }

    // Prevent duplicate answers for the same question
    const submittedQuestionIds = answers.map((answer) =>
      String(answer.questionId)
    );

    if (
      new Set(submittedQuestionIds).size !== submittedQuestionIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Duplicate answers for the same question are not allowed",
      });
    }

    const questions = await Question.find({
      _id: { $in: test.questionIds },
      isActive: true,
    });

    if (questions.length !== test.questionIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some questions are unavailable",
      });
    }

    const testQuestionIds = new Set(
      test.questionIds.map((id) => id.toString())
    );

    // Reject answers for questions not belonging to this test
    for (const answer of answers) {
      if (!isValidObjectId(answer.questionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID in answers",
        });
      }

      if (!testQuestionIds.has(String(answer.questionId))) {
        return res.status(400).json({
          success: false,
          message: "Answer contains a question not belonging to this test",
        });
      }
    }

    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;

    const submittedAnswers = [];

    for (const question of questions) {
      const submitted = answers.find(
        (answer) =>
          String(answer.questionId) === String(question._id)
      );

      if (
        !submitted ||
        submitted.selectedAnswer === null ||
        submitted.selectedAnswer === undefined
      ) {
        unanswered++;

        submittedAnswers.push({
          questionId: question._id,
          selectedAnswer: null,
        });

        continue;
      }

      const selectedAnswer = Number(submitted.selectedAnswer);

      if (
        !Number.isInteger(selectedAnswer) ||
        selectedAnswer < 0 ||
        selectedAnswer > 3
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid answer option",
        });
      }

      if (selectedAnswer === question.correctAnswer) {
        correctAnswers++;
        score += question.marks;
      } else {
        wrongAnswers++;

        if (test.negativeMarking) {
          score -= question.negativeMarks;
        }
      }

      submittedAnswers.push({
        questionId: question._id,
        selectedAnswer,
      });
    }

    const submittedAt = new Date();

    const timeTaken = Math.min(
      Math.floor(
        (submittedAt.getTime() - attempt.startedAt.getTime()) / 1000
      ),
      allowedSeconds
    );

    attempt.answers = submittedAnswers;
    attempt.score = Math.max(0, score);
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = wrongAnswers;
    attempt.unanswered = unanswered;
    attempt.timeTaken = timeTaken;
    attempt.submittedAt = submittedAt;
    attempt.status = "submitted";

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "Mock test submitted successfully",

      result: {
        attemptId: attempt._id,
        score: attempt.score,
        totalMarks: test.totalMarks,
        correctAnswers,
        wrongAnswers,
        unanswered,
        timeTaken,
        submittedAt,
        status: attempt.status,
      },
    });
  } catch (error) {
    console.error("Submit attempt error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to submit mock test",
    });
  }
};

export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({
      userId: req.user._id,
    })
      .populate({
        path: "testId",
        select: "title examId duration totalQuestions totalMarks negativeMarking",
        populate: { path: "examId", select: "name category" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    console.error("Get attempts error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attempt history",
    });
  }
};

// Get a student's active/in-progress attempt
export const getActiveAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      userId: req.user._id,
      status: "inProgress",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Active attempt not found",
      });
    }

    const test = await Test.findOne({
      _id: attempt.testId,
      isActive: true,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found",
      });
    }

    // Check whether the test time has already expired
    const elapsedSeconds = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000
    );

    const allowedSeconds = test.duration * 60;

    if (elapsedSeconds >= allowedSeconds) {
      attempt.status = "expired";
      attempt.timeTaken = allowedSeconds;
      attempt.submittedAt = new Date();

      await attempt.save();

      return res.status(400).json({
        success: false,
        message: "Mock test time has expired",
        attemptId: attempt._id,
        status: "expired",
      });
    }

    const questions = await Question.find({
      _id: { $in: test.questionIds },
      isActive: true,
    })
      .select("_id questionText options difficulty marks negativeMarks")
      .sort({ createdAt: 1 });

    if (questions.length !== test.questionIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some questions in this test are unavailable",
      });
    }

    return res.status(200).json({
      success: true,
      attempt: {
        id: attempt._id,
        testId: test._id,
        answers: attempt.answers,
        startedAt: attempt.startedAt,
        status: attempt.status,
      },
      test: {
        _id: test._id,
        title: test.title,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        negativeMarking: test.negativeMarking,
      },
      questions,
    });
  } catch (error) {
    console.error(
      "Get active attempt error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load active mock test",
    });
  }
};

export const reviewAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      userId: req.user._id,
      status: { $in: ["submitted", "expired"] },
    }).populate(
      "testId",
      "title duration totalQuestions totalMarks negativeMarking"
    );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Completed attempt not found",
      });
    }

    const questionIds = attempt.answers.map(
      (answer) => answer.questionId
    );

    const questions = await Question.find({
      _id: { $in: questionIds },
    }).select(
      "_id questionText options correctAnswer explanation difficulty marks negativeMarks"
    );

    const review = questions.map((question) => {
      const submittedAnswer = attempt.answers.find(
        (answer) =>
          String(answer.questionId) === String(question._id)
      );

      const selectedAnswer = submittedAnswer
        ? submittedAnswer.selectedAnswer
        : null;

      let result = "unanswered";
      let marksObtained = 0;

      if (selectedAnswer !== null) {
        if (selectedAnswer === question.correctAnswer) {
          result = "correct";
          marksObtained = question.marks;
        } else {
          result = "wrong";

          if (attempt.testId.negativeMarking) {
            marksObtained = -question.negativeMarks;
          }
        }
      }

      return {
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        marks: question.marks,
        negativeMarks: question.negativeMarks,
        result,
        marksObtained,
      };
    });

    return res.status(200).json({
      success: true,

      attempt: {
        id: attempt._id,
        status: attempt.status,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        unanswered: attempt.unanswered,
        timeTaken: attempt.timeTaken,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      },

      test: attempt.testId,

      review,
    });
  } catch (error) {
    console.error("Review attempt error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to review attempt",
    });
  }
};