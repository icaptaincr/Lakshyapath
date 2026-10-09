import express from "express";
import {
  getActiveHomeContent,
  getAllHomeContent,
  createHomeContent,
  updateHomeContent,
  deleteHomeContent,
} from "../controllers/homeContentController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getActiveHomeContent);
router.get("/admin", verifyToken, authorizeRoles("admin"), getAllHomeContent);
router.post("/", verifyToken, authorizeRoles("admin"), createHomeContent);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateHomeContent);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteHomeContent);

export default router;
