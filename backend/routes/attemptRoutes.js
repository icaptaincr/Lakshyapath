import express from "express";

import {
  getMyAttempts,
  getActiveAttempt,
  startAttempt,
  submitAttempt,
  reviewAttempt,
} from "../controllers/attemptController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Student starts a mock test
router.post(
  "/start/:testId",
  verifyToken,
  authorizeRoles("student"),
  startAttempt
);

// Student submits a mock test attempt
router.post(
  "/submit/:attemptId",
  verifyToken,
  authorizeRoles("student"),
  submitAttempt
);

// Student views own attempt history
router.get(
  "/my-attempts",
  verifyToken,
  authorizeRoles("student"),
  getMyAttempts
);

// Student reviews a completed attempt
router.get(
  "/review/:attemptId",
  verifyToken,
  authorizeRoles("student"),
  reviewAttempt
);

// Student loads an active/in-progress attempt
router.get(
  "/:attemptId",
  verifyToken,
  authorizeRoles("student"),
  getActiveAttempt
);

export default router;