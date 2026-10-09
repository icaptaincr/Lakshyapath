import express from "express";
import { createTest, getAllTests, deleteTest } from "../controllers/testController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", getAllTests);
router.post("/", verifyToken, authorizeRoles("admin"), createTest);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteTest);
export default router;
