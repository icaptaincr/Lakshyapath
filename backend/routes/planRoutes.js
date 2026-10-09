import express from "express";

import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from "../controllers/planController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public/student can view active plans
router.get("/", getAllPlans);

router.get("/:id", getPlanById);

// Admin only
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  createPlan
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  updatePlan
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deletePlan
);

export default router;