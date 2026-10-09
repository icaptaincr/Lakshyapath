import mongoose from "mongoose";
import Question from "../models/Question.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import Exam from "../models/Exam.js";

/* =========================================================
   CREATE QUESTION - ADMIN
========================================================= */

export const createQuestion = async (req, res) => {
  try {
    const {
      topicId,
      questionText,
      options,
      correctAnswer,
      explanation,
      difficulty,
      marks,
      negativeMarks,
    } = req.body;

    if (
      !topicId ||
      !questionText?.trim() ||
      !Array.isArray(options) ||
      correctAnswer === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing or invalid",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid topic ID",
      });
    }

    /* -------------------------------------------------------
       Validate options
    ------------------------------------------------------- */

    if (options.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "Exactly 4 options are required",
      });
    }

    const cleanedOptions = options.map((option) =>
      typeof option === "string" ? option.trim() : ""
    );

    if (cleanedOptions.some((option) => !option)) {
      return res.status(400).json({
        success: false,
        message: "All options must contain text",
      });
    }

    /* -------------------------------------------------------
       Validate correct answer
    ------------------------------------------------------- */

    if (
      !Number.isInteger(correctAnswer) ||
      correctAnswer < 0 ||
      correctAnswer > 3
    ) {
      return res.status(400).json({
        success: false,
        message: "correctAnswer must be between 0 and 3",
      });
    }

    /* -------------------------------------------------------
       Validate marks
    ------------------------------------------------------- */

    if (
      marks !== undefined &&
      (typeof marks !== "number" || marks <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "marks must be greater than 0",
      });
    }

    if (
      negativeMarks !== undefined &&
      (typeof negativeMarks !== "number" || negativeMarks < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "negativeMarks cannot be negative",
      });
    }

    /* -------------------------------------------------------
       Validate Topic → Subject → Exam hierarchy
    ------------------------------------------------------- */

    const topic = await Topic.findOne({
      _id: topicId,
      isActive: true,
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Active topic not found",
      });
    }

    const subject = await Subject.findOne({
      _id: topic.subjectId,
      isActive: true,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Parent subject not found or inactive",
      });
    }

    const exam = await Exam.findOne({
      _id: subject.examId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Parent exam not found or inactive",
      });
    }

    /* -------------------------------------------------------
       Create question
    ------------------------------------------------------- */

    const question = await Question.create({
      topicId,
      questionText: questionText.trim(),
      options: cleanedOptions,
      correctAnswer,
      explanation: explanation?.trim(),
      difficulty,
      marks,
      negativeMarks,
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    console.error("Create Question Error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create question",
    });
  }
};

/* =========================================================
   GET QUESTIONS BY TOPIC - STUDENT SAFE
   Does NOT expose correctAnswer/explanation
========================================================= */

export const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid topic ID",
      });
    }

    /* -------------------------------------------------------
       Validate Topic → Subject → Exam hierarchy
    ------------------------------------------------------- */

    const topic = await Topic.findOne({
      _id: topicId,
      isActive: true,
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Active topic not found",
      });
    }

    const subject = await Subject.findOne({
      _id: topic.subjectId,
      isActive: true,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Parent subject not found or inactive",
      });
    }

    const exam = await Exam.findOne({
      _id: subject.examId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Parent exam not found or inactive",
      });
    }

    /* -------------------------------------------------------
       Return student-safe fields only
    ------------------------------------------------------- */

    const questions = await Question.find({
      topicId,
      isActive: true,
    })
      .select(
        "_id topicId questionText options difficulty marks negativeMarks"
      )
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Get Questions Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
};

/* =========================================================
   UPDATE QUESTION - ADMIN
========================================================= */

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const allowedFields = [
      "questionText",
      "options",
      "correctAnswer",
      "explanation",
      "difficulty",
      "marks",
      "negativeMarks",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.questionText !== undefined) {
      if (
        typeof updates.questionText !== "string" ||
        !updates.questionText.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Question text cannot be empty",
        });
      }

      updates.questionText = updates.questionText.trim();
    }

    if (updates.options !== undefined) {
      if (!Array.isArray(updates.options) || updates.options.length !== 4) {
        return res.status(400).json({
          success: false,
          message: "Exactly 4 options are required",
        });
      }

      updates.options = updates.options.map((option) =>
        typeof option === "string" ? option.trim() : ""
      );

      if (updates.options.some((option) => !option)) {
        return res.status(400).json({
          success: false,
          message: "All options must contain text",
        });
      }
    }

    if (updates.correctAnswer !== undefined) {
      if (
        !Number.isInteger(updates.correctAnswer) ||
        updates.correctAnswer < 0 ||
        updates.correctAnswer > 3
      ) {
        return res.status(400).json({
          success: false,
          message: "correctAnswer must be between 0 and 3",
        });
      }
    }

    if (
      updates.marks !== undefined &&
      (typeof updates.marks !== "number" || updates.marks <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "marks must be greater than 0",
      });
    }

    if (
      updates.negativeMarks !== undefined &&
      (typeof updates.negativeMarks !== "number" ||
        updates.negativeMarks < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "negativeMarks cannot be negative",
      });
    }

    if (updates.explanation !== undefined) {
      updates.explanation =
        typeof updates.explanation === "string"
          ? updates.explanation.trim()
          : updates.explanation;
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error("Update Question Error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update question",
    });
  }
};

/* =========================================================
   SOFT DELETE QUESTION - ADMIN
========================================================= */

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (!question.isActive) {
      return res.status(400).json({
        success: false,
        message: "Question is already archived",
      });
    }

    question.isActive = false;

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Question archived successfully",
    });
  } catch (error) {
    console.error("Delete Question Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to archive question",
    });
  }
};
 
//Check Answer
export const checkAnswer = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { selectedAnswer } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      const error = new Error("Invalid question ID");
      error.statusCode = 400;
      throw error;
    }

    if (selectedAnswer === undefined || selectedAnswer === null) {
      const error = new Error("Selected answer is required");
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(Number(selectedAnswer))) {
      const error = new Error("Selected answer must be an integer");
      error.statusCode = 400;
      throw error;
    }

    const answerIndex = Number(selectedAnswer);

    if (answerIndex < 0 || answerIndex > 3) {
      const error = new Error(
        "Selected answer must be between 0 and 3"
      );
      error.statusCode = 400;
      throw error;
    }

    const question = await Question.findOne({
      _id: questionId,
      isActive: true,
    }).select(
      "questionText options correctAnswer explanation marks negativeMarks"
    );

    if (!question) {
      const error = new Error("Question not found");
      error.statusCode = 404;
      throw error;
    }

    const isCorrect = answerIndex === question.correctAnswer;

    res.status(200).json({
      success: true,
      result: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        marks: isCorrect ? question.marks : 0,
        negativeMarks: !isCorrect ? question.negativeMarks : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};