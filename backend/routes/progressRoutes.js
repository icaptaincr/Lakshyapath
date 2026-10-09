import express from "express";

import {
  initializeProgress,
  getMyProgress,
  completeTopic,
  getMyProgressOverview,
} from "../controllers/progressController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Student preparation overview
router.get(
  "/overview",
  verifyToken,
  authorizeRoles("student"),
  getMyProgressOverview
);

// Initialize progress for an exam
router.post(
  "/exam/:examId/initialize",
  verifyToken,
  authorizeRoles("student"),
  initializeProgress
);

// Get student's progress for an exam
router.get(
  "/exam/:examId",
  verifyToken,
  authorizeRoles("student"),
  getMyProgress
);

// Mark a topic as completed
router.put(
  "/exam/:examId/topic/:topicId/complete",
  verifyToken,
  authorizeRoles("student"),
  completeTopic
);

export default router;