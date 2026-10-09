import express from "express";
import { createTopic, getTopicsBySubject, updateTopic, deleteTopic } from "../controllers/topicController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/subject/:subjectId", getTopicsBySubject);
router.post("/", verifyToken, authorizeRoles("admin"), createTopic);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateTopic);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteTopic);
export default router;
