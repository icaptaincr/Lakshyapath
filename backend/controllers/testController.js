import mongoose from "mongoose";
import Test from "../models/Test.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";

/* =========================================================
   CREATE MOCK TEST - ADMIN
========================================================= */

export const createTest = async (req, res) => {
  try {
    const {
      examId,
      title,
      description,
      questionIds,
      duration,
      negativeMarking,
    } = req.body;

    if (!examId || !title || !questionIds || !duration) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one question is required",
      });
    }

    if (new Set(questionIds).size !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate question IDs are not allowed",
      });
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be greater than 0",
      });
    }

    // Check exam
    const exam = await Exam.findOne({
      _id: examId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found or inactive",
      });
    }

    // Validate question IDs
    const invalidQuestionId = questionIds.find(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidQuestionId) {
      return res.status(400).json({
        success: false,
        message: "One or more question IDs are invalid",
      });
    }

    // Fetch active questions
    const questions = await Question.find({
      _id: { $in: questionIds },
      isActive: true,
    });

    if (questions.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more questions are invalid or inactive",
      });
    }

    /* =====================================================
       VERIFY QUESTIONS BELONG TO SELECTED EXAM
    ===================================================== */

    const topicIds = [
      ...new Set(questions.map((question) => question.topicId.toString())),
    ];

    const topics = await Topic.find({
      _id: { $in: topicIds },
      isActive: true,
    });

    if (topics.length !== topicIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more question topics are invalid",
      });
    }

    const subjectIds = [
      ...new Set(topics.map((topic) => topic.subjectId.toString())),
    ];

    const subjects = await Subject.find({
      _id: { $in: subjectIds },
      isActive: true,
    });

    if (subjects.length !== subjectIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more question subjects are invalid",
      });
    }

    const topicMap = new Map(
      topics.map((topic) => [
        topic._id.toString(),
        topic.subjectId.toString(),
      ])
    );

    const subjectMap = new Map(
      subjects.map((subject) => [
        subject._id.toString(),
        subject.examId.toString(),
      ])
    );

    for (const question of questions) {
      const subjectId = topicMap.get(question.topicId.toString());

      const questionExamId = subjectMap.get(subjectId);

      if (questionExamId !== examId.toString()) {
        return res.status(400).json({
          success: false,
          message:
            "One or more questions do not belong to the selected exam",
        });
      }
    }

    /* =====================================================
       CALCULATE TOTAL MARKS FROM QUESTIONS
    ===================================================== */

    const calculatedTotalMarks = questions.reduce(
      (total, question) => total + question.marks,
      0
    );

    const test = await Test.create({
      examId,
      title,
      description,
      questionIds,
      duration,
      totalQuestions: questions.length,
      totalMarks: calculatedTotalMarks,
      negativeMarking:
        negativeMarking !== undefined ? negativeMarking : true,
    });

    return res.status(201).json({
      success: true,
      message: "Mock test created successfully",
      test,
    });
  } catch (error) {
    console.error("Create Test Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET ALL ACTIVE MOCK TESTS
========================================================= */

export const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({
      isActive: true,
    })
      .populate("examId", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tests.length,
      tests,
    });
  } catch (error) {
    console.error("Get Tests Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success:false, message:"Invalid mock test ID" });
    }
    const test = await Test.findOne({ _id:id, isActive:true });
    if (!test) return res.status(404).json({ success:false, message:"Mock test not found" });
    test.isActive = false;
    await test.save();
    return res.status(200).json({ success:true, message:"Mock test deleted successfully" });
  } catch (error) {
    console.error("Delete Test Error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to delete mock test" });
  }
};
