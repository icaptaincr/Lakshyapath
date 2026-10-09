import mongoose from "mongoose";

const subjectProgressSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    completedTopics: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalTopics: {
      type: Number,
      default: 0,
      min: 0,
    },

    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    _id: false,
  }
);

const studentProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    subjectProgress: [subjectProgressSchema],

    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// One progress document per student per exam
studentProgressSchema.index(
  { userId: 1, examId: 1 },
  { unique: true }
);

const StudentProgress = mongoose.model(
  "StudentProgress",
  studentProgressSchema
);

export default StudentProgress;