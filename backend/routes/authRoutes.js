import express from "express";
import {
  registerStudent,
  loginStudent,
  loginAdmin,
  getStudentProfile,
} from "../controllers/authController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/admin-login", loginAdmin);

router.get(
  "/profile",
  verifyToken,
  authorizeRoles("student"),
  getStudentProfile
);

export default router;