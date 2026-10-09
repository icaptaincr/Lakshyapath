import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },

    name: {
      type: String,
      enum: ["Free", "Premium"],
      required: true,
    },

    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    offerPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    offerName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    offerStartDate: {
      type: Date,
      default: null,
    },

    offerEndDate: {
      type: Date,
      default: null,
    },

    features: {
      type: [String],
      default: [],
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

// One Free/Premium plan per exam
planSchema.index(
  { examId: 1, name: 1 },
  { unique: true }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;