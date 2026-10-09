import express from "express";
import { createSubject, getSubjectsByExam, updateSubject, deleteSubject } from "../controllers/subjectController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/exam/:examId", getSubjectsByExam);
router.post("/", verifyToken, authorizeRoles("admin"), createSubject);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateSubject);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteSubject);
export default router;
