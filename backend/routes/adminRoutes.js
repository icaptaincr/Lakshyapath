import express from "express";
import { getAdminDashboard, getStudents, updateStudentStatus, getAdminPayments, getAdminSubscriptions } from "../controllers/adminController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(verifyToken, authorizeRoles("admin"));
router.get("/dashboard", getAdminDashboard);
router.get("/students", getStudents);
router.patch("/students/:id/status", updateStudentStatus);
router.get("/payments", getAdminPayments);
router.get("/subscriptions", getAdminSubscriptions);
export default router;
