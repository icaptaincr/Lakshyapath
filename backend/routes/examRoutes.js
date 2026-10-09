import express from "express";

import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
} from "../controllers/examController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   PUBLIC ROUTES
========================================================= */

// Get all active exams
router.get("/", getAllExams);

// Get single exam by ID
router.get("/:id", getExamById);

/* =========================================================
   ADMIN ROUTES
========================================================= */

// Create a new exam
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  createExam
);

// Update exam
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  updateExam
);

// Soft delete
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteExam
);

export default router;