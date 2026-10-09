import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "APPLICATION_OPEN",
        "DEADLINE",
        "ADMIT_CARD",
        "EXAM_DATE_UPDATE",
        "LAKSHYAPATH",
      ],
      required: true,
    },

    audience: {
      type: String,
      enum: ["ALL_STUDENTS", "TRACKING_EXAM"],
      default: "ALL_STUDENTS",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    applicationStart: {
      type: Date,
      default: null,
    },

    lastDate: {
      type: Date,
      default: null,
    },

    sendEmail: {
      type: Boolean,
      default: false,
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

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;