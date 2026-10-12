
import express from "express";

import {
  registerStudent,
  loginStudent,
  getStudentProfile,
} from "../controllers/authController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerStudent);

// Common login for students and admins
router.post("/login", loginStudent);

// Student-only profile route
router.get(
  "/profile",
  verifyToken,
  authorizeRoles("student"),
  getStudentProfile
);

export default router;