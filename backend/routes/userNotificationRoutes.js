import express from "express";

import {
  getMyNotifications,
  markAsRead,
  remindLater,
  markAsApplied,
  getUnreadCount,
} from "../controllers/userNotificationController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// Get my notifications
router.get(
  "/",
  verifyToken,
  authorizeRoles("student"),
  getMyNotifications
);

// Get unread notifications count
router.get(
  "/unread-count",
  verifyToken,
  authorizeRoles("student"),
  getUnreadCount
);

// Mark notification as read
router.put(
  "/:id/read",
  verifyToken,
  authorizeRoles("student"),
  markAsRead
);


// Remind me later
router.put(
  "/:id/remind",
  verifyToken,
  authorizeRoles("student"),
  remindLater
);


// Already applied
router.put(
  "/:id/applied",
  verifyToken,
  authorizeRoles("student"),
  markAsApplied
);

export default router;