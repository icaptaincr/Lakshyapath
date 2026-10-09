import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
  getMyPayments,
  downloadReceipt,
} from "../controllers/paymentController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Razorpay order - Student only
router.post(
  "/order",
  verifyToken,
  authorizeRoles("student"),
  createPaymentOrder
);

// Verify Razorpay payment - Student only
router.post(
  "/verify",
  verifyToken,
  authorizeRoles("student"),
  verifyPayment
);

// Student payment history
router.get(
  "/my-payments",
  verifyToken,
  authorizeRoles("student"),
  getMyPayments
);

// Download paid payment receipt
router.get(
  "/receipt/:paymentId",
  verifyToken,
  authorizeRoles("student"),
  downloadReceipt
);

export default router;