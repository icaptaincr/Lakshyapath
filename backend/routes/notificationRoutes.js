import express from "express";

import {
  createNotification,
  getAllNotifications,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Create notification
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  createNotification
);

// Get all active notifications
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  getAllNotifications
);

// Update notification
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  updateNotification
);

// Deactivate notification
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteNotification
);

export default router;