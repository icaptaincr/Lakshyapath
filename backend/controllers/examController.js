import mongoose from "mongoose";
import Exam from "../models/Exam.js";

/* =========================================================
   CREATE EXAM
========================================================= */

export const createExam = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      expectedExamDate,
      notificationStatus,
    } = req.body;

    if (!name?.trim() || !category) {
      return res.status(400).json({
        success: false,
        message: "Exam name and category are required",
      });
    }

    const trimmedName = name.trim();

    const existingExam = await Exam.findOne({ name });

if (existingExam) {
  if (!existingExam.isActive) {
    existingExam.isActive = true;
    existingExam.category = category;
    existingExam.description = description;
    existingExam.expectedExamDate = expectedExamDate || null;
    existingExam.notificationStatus = notificationStatus;

    await existingExam.save();

    return res.status(200).json({
      message: "Previously deleted exam restored successfully.",
      exam: existingExam,
    });
  }

  return res.status(400).json({
    message: "Exam already exists.",
  });
}

    const exam = await Exam.create({
      name: trimmedName,
      category,
      description: description?.trim(),
      expectedExamDate,
      notificationStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    console.error("Create exam error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Exam already exists",
      });
    }

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
      message: "Failed to create exam",
    });
  }
};

/* =========================================================
   GET ALL ACTIVE EXAMS
========================================================= */

export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    console.error("Get all exams error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exams",
    });
  }
};

/* =========================================================
   GET SINGLE EXAM
========================================================= */

export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const exam = await Exam.findOne({
      _id: id,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    return res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    console.error("Get exam error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam",
    });
  }
};

/* =========================================================
   UPDATE EXAM
========================================================= */

export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "description",
      "expectedExamDate",
      "notificationStatus",
      "isActive",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.name !== undefined) {
      if (!updateData.name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Exam name cannot be empty",
        });
      }

      updateData.name = updateData.name.trim();

      const duplicateExam = await Exam.findOne({
        name: updateData.name,
        _id: { $ne: id },
      });

      if (duplicateExam) {
        return res.status(409).json({
          success: false,
          message: "Another exam with this name already exists",
        });
      }
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      exam: updatedExam,
    });
  } catch (error) {
    console.error("Update exam error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Exam name already exists",
      });
    }

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
      message: "Failed to update exam",
    });
  }
};

/* =========================================================
   SOFT DELETE / ARCHIVE EXAM
========================================================= */

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (!exam.isActive) {
      return res.status(400).json({
        success: false,
        message: "Exam is already archived",
      });
    }

    exam.isActive = false;
    await exam.save();

    return res.status(200).json({
      success: true,
      message: "Exam archived successfully",
    });
  } catch (error) {
    console.error("Delete exam error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to archive exam",
    });
  }
};