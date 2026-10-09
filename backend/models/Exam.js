import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "SSC",
        "RRB",
        "Banking",
        "UPSC",
        "Defence",
        "State PSC",
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    expectedExamDate: {
      type: Date,
      default: null,
    },

    notificationStatus: {
      type: String,
      enum: ["Not Announced", "Expected", "Confirmed"],
      default: "Not Announced",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model("Exam", examSchema);

export default Exam;