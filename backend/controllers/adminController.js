import mongoose from "mongoose";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import Attempt from "../models/Attempt.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAdminDashboard = async (req, res) => {
  try {
    const [students, premiumSubscriptions, attempts, paidPayments, exams] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Subscription.countDocuments({ planName: "Premium", status: "active" }),
      Attempt.countDocuments({ status: { $in: ["submitted", "expired"] } }),
      Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
      Exam.countDocuments({ isActive: true }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        students,
        premiumSubscriptions,
        attempts,
        revenue: paidPayments[0]?.total || 0,
        payments: paidPayments[0]?.count || 0,
        exams,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to fetch admin dashboard" });
  }
};

export const getStudents = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = { role: "student" };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const students = await User.find(filter).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success:true, count:students.length, students });
  } catch (error) {
    console.error("Get students error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to fetch students" });
  }
};

export const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ success:false, message:"Invalid student ID" });
    const student = await User.findOne({ _id:id, role:"student" });
    if (!student) return res.status(404).json({ success:false, message:"Student not found" });
    if (typeof req.body.isActive !== "boolean") return res.status(400).json({ success:false, message:"isActive must be true or false" });
    student.isActive = req.body.isActive;
    await student.save();
    return res.status(200).json({ success:true, message:`Student ${student.isActive ? "activated" : "deactivated"} successfully`, student: { id:student._id, isActive:student.isActive } });
  } catch (error) {
    console.error("Update student status error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to update student status" });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("userId", "fullName email").populate("examId", "name").populate("planId", "name durationDays").sort({ createdAt:-1 });
    return res.status(200).json({ success:true, count:payments.length, payments });
  } catch (error) {
    console.error("Get admin payments error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to fetch payments" });
  }
};

export const getAdminSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate("userId", "fullName email").populate("examId", "name").populate("planId", "name durationDays").sort({ createdAt:-1 });
    return res.status(200).json({ success:true, count:subscriptions.length, subscriptions });
  } catch (error) {
    console.error("Get admin subscriptions error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to fetch subscriptions" });
  }
};
