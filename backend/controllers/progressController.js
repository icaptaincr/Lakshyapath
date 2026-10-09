import mongoose from "mongoose";
import StudentProgress from "../models/StudentProgress.js";
import Exam from "../models/Exam.js";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import Attempt from "../models/Attempt.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const initializeProgress = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const exam = await Exam.findOne({
      _id: examId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const existingProgress = await StudentProgress.findOne({
      userId: req.user._id,
      examId,
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: "Progress already initialized for this exam",
        progress: existingProgress,
      });
    }

    const subjects = await Subject.find({
      examId,
      isActive: true,
    }).sort({ displayOrder: 1 });

    const subjectProgress = [];

    for (const subject of subjects) {
      const totalTopics = await Topic.countDocuments({
        subjectId: subject._id,
        isActive: true,
      });

      subjectProgress.push({
        subjectId: subject._id,
        completedTopics: 0,
        totalTopics,
        progressPercentage: 0,
      });
    }

    const progress = await StudentProgress.create({
      userId: req.user._id,
      examId,
      subjectProgress,
      overallProgress: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Progress initialized successfully",
      progress,
    });
  } catch (error) {
    console.error("Initialize Progress Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Progress already initialized for this exam",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to initialize progress",
    });
  }
};

export const getMyProgress = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const exam = await Exam.findOne({
      _id: examId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const progress = await StudentProgress.findOne({
      userId: req.user._id,
      examId,
    })
      .populate("examId", "name category")
      .populate("subjectProgress.subjectId", "name description");

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found for this exam",
      });
    }

    return res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Get Progress Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
    });
  }
};

export const completeTopic = async (req, res) => {
  try {
    const { examId, topicId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    if (!isValidObjectId(topicId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid topic ID",
      });
    }

    const exam = await Exam.findOne({
      _id: examId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const progress = await StudentProgress.findOne({
      userId: req.user._id,
      examId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message:
          "Progress not found for this exam. Please initialize progress first.",
      });
    }

    const topic = await Topic.findOne({
      _id: topicId,
      isActive: true,
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    const subject = await Subject.findOne({
      _id: topic.subjectId,
      examId,
      isActive: true,
    });

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Topic does not belong to this exam",
      });
    }

    const subjectProgress = progress.subjectProgress.find(
      (item) =>
        item.subjectId.toString() === subject._id.toString()
    );

    if (!subjectProgress) {
      return res.status(400).json({
        success: false,
        message: "Subject progress not found for this topic",
      });
    }

    // Get the current active topic count.
    const totalTopics = await Topic.countDocuments({
      subjectId: subject._id,
      isActive: true,
    });

    subjectProgress.totalTopics = totalTopics;

    // Prevent progress from exceeding the actual topic count.
    if (subjectProgress.completedTopics >= totalTopics) {
      return res.status(400).json({
        success: false,
        message: "All topics in this subject are already completed",
      });
    }

    subjectProgress.completedTopics += 1;

    subjectProgress.progressPercentage =
      totalTopics > 0
        ? Math.min(
            100,
            Math.round(
              (subjectProgress.completedTopics / totalTopics) * 100
            )
          )
        : 0;

    // Calculate overall progress from all subjects.
    let totalTopicCount = 0;
    let completedTopicCount = 0;

    progress.subjectProgress.forEach((item) => {
      totalTopicCount += item.totalTopics;
      completedTopicCount += item.completedTopics;
    });

    progress.overallProgress =
      totalTopicCount > 0
        ? Math.min(
            100,
            Math.round(
              (completedTopicCount / totalTopicCount) * 100
            )
          )
        : 0;

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Topic marked as completed successfully",
      progress,
    });
  } catch (error) {
    console.error("Complete Topic Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update topic progress",
    });
  }
};

export const getMyProgressOverview = async (req, res) => {
  try {
    const progressRecords = await StudentProgress.find({ userId: req.user._id })
      .populate("examId", "name category expectedExamDate notificationStatus")
      .populate("subjectProgress.subjectId", "name description")
      .sort({ updatedAt: -1 });

    const attempts = await Attempt.find({
      userId: req.user._id,
      status: { $in: ["submitted", "expired"] },
    }).populate({
      path: "testId",
      select: "title examId totalMarks duration",
      populate: { path: "examId", select: "name category" },
    }).sort({ submittedAt: -1 });

    const attemptMap = new Map();
    for (const attempt of attempts) {
      const examId = attempt.testId?.examId?._id?.toString();
      if (!examId) continue;
      if (!attemptMap.has(examId)) attemptMap.set(examId, []);
      attemptMap.get(examId).push(attempt);
    }

    const preparations = progressRecords.map((progress) => {
      const examId = progress.examId?._id?.toString();
      const examAttempts = attemptMap.get(examId) || [];
      const scores = examAttempts.map((item) => Number(item.score || 0));
      const averageScore = scores.length
        ? Number((scores.reduce((a,b)=>a+b,0) / scores.length).toFixed(2))
        : 0;
      const highestScore = scores.length ? Math.max(...scores) : 0;
      const latestAttempt = examAttempts[0] || null;
      const accuracyValues = examAttempts.map((item) => {
        const total = Number(item.correctAnswers || 0) + Number(item.wrongAnswers || 0) + Number(item.unanswered || 0);
        return total ? (Number(item.correctAnswers || 0) / total) * 100 : 0;
      });
      const averageAccuracy = accuracyValues.length
        ? Number((accuracyValues.reduce((a,b)=>a+b,0) / accuracyValues.length).toFixed(2))
        : 0;

      return {
        progress,
        exam: progress.examId,
        overallProgress: progress.overallProgress,
        subjectProgress: progress.subjectProgress,
        testProgress: {
          testsAttempted: examAttempts.length,
          averageScore,
          highestScore,
          averageAccuracy,
          latestAttempt: latestAttempt ? {
            attemptId: latestAttempt._id,
            testTitle: latestAttempt.testId?.title,
            score: latestAttempt.score,
            totalMarks: latestAttempt.testId?.totalMarks,
            submittedAt: latestAttempt.submittedAt,
          } : null,
          history: examAttempts.slice(0, 10).map((item) => ({
            attemptId: item._id,
            testTitle: item.testId?.title,
            score: item.score,
            totalMarks: item.testId?.totalMarks,
            percentage: item.testId?.totalMarks ? Number(((item.score / item.testId.totalMarks) * 100).toFixed(1)) : 0,
            submittedAt: item.submittedAt,
          })),
        },
      };
    });

    return res.status(200).json({ success: true, count: preparations.length, preparations });
  } catch (error) {
    console.error("Get Progress Overview Error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to fetch preparation overview" });
  }
};
