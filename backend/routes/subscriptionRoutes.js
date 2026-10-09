import express from "express";

import {
  getMySubscriptions,
} from "../controllers/subscriptionController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/my-subscriptions",
  verifyToken,
  authorizeRoles("student"),
  getMySubscriptions
);

export default router;