import express from "express";
import {
  createQuestion,
  getQuestionsByTopic,
  updateQuestion,
  deleteQuestion,
  checkAnswer,
} from "../controllers/questionController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/topic/:topicId", getQuestionsByTopic);

router.post("/:questionId/check-answer",verifyToken,authorizeRoles("student"),checkAnswer);

// Admin
router.post("/", verifyToken, authorizeRoles("admin"), createQuestion);

router.put("/:id", verifyToken, authorizeRoles("admin"), updateQuestion);

router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteQuestion);

export default router;