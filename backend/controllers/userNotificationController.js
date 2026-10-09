import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import UserNotification from "../models/UserNotification.js";
import StudentProgress from "../models/StudentProgress.js";

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find exams currently tracked by this student
    const progressRecords = await StudentProgress.find({
      userId,
    }).select("examId");

    const trackedExamIds = progressRecords.map(
      (progress) => progress.examId
    );

    // Student receives:
    // 1. ALL_STUDENTS notifications
    // 2. TRACKING_EXAM notifications only for tracked exams
    const notifications = await Notification.find({
      isActive: true,
      $or: [
        {
          audience: "ALL_STUDENTS",
        },
        {
          audience: "TRACKING_EXAM",
          examId: { $in: trackedExamIds },
        },
      ],
    })
      .populate("examId", "name category")
      .sort({ createdAt: -1 });

    const results = [];

    for (const notification of notifications) {
      let userNotification =
        await UserNotification.findOne({
          userId,
          notificationId: notification._id,
        });

      // Create student-specific notification record
      // when the student sees it for the first time.
      if (!userNotification) {
        try {
          userNotification =
            await UserNotification.create({
              userId,
              notificationId: notification._id,
              status: "unread",
            });
        } catch (error) {
          // Handle duplicate creation safely
          if (error.code === 11000) {
            userNotification =
              await UserNotification.findOne({
                userId,
                notificationId: notification._id,
              });
          } else {
            throw error;
          }
        }
      }

      // Reactivate reminder after the reminder time has passed
      if (
        userNotification.status === "remind_later" &&
        userNotification.remindAt &&
        userNotification.remindAt <= new Date()
      ) {
        userNotification.status = "unread";
        userNotification.remindAt = null;

        await userNotification.save();
      }

      results.push({
        notification,
        status: userNotification.status,
        remindAt: userNotification.remindAt,
        readAt: userNotification.readAt,
        userNotificationId: userNotification._id,
      });
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      notifications: results,
    });
  } catch (error) {
    console.error(
      "Get My Notifications Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user notification ID",
      });
    }

    const userNotification =
      await UserNotification.findOne({
        _id: id,
        userId: req.user._id,
      });

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        message: "User notification not found",
      });
    }

    userNotification.status = "read";
    userNotification.readAt = new Date();
    userNotification.remindAt = null;

    await userNotification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      userNotification,
    });
  } catch (error) {
    console.error(
      "Mark As Read Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

export const remindLater = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user notification ID",
      });
    }

    const userNotification =
      await UserNotification.findOne({
        _id: id,
        userId: req.user._id,
      });

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        message: "User notification not found",
      });
    }

    const remindAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    userNotification.status = "remind_later";
    userNotification.remindAt = remindAt;
    userNotification.readAt = null;

    await userNotification.save();

    return res.status(200).json({
      success: true,
      message:
        "Notification reminder set for 24 hours later",
      userNotification,
    });
  } catch (error) {
    console.error(
      "Remind Later Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to set notification reminder",
    });
  }
};

export const markAsApplied = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user notification ID",
      });
    }

    const userNotification =
      await UserNotification.findOne({
        _id: id,
        userId: req.user._id,
      });

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        message: "User notification not found",
      });
    }

    userNotification.status = "already_applied";
    userNotification.remindAt = null;
    userNotification.readAt = new Date();

    await userNotification.save();

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as already applied",
      userNotification,
    });
  } catch (error) {
    console.error(
      "Mark As Applied Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Materialize active notifications for this student so the dashboard
    // unread badge works even before the Notifications page is opened.
    const progressRecords = await StudentProgress.find({ userId }).select("examId");
    const trackedExamIds = progressRecords.map((item) => item.examId);
    const relevantNotifications = await Notification.find({
      isActive: true,
      $or: [
        { audience: "ALL_STUDENTS" },
        { audience: "TRACKING_EXAM", examId: { $in: trackedExamIds } },
      ],
    }).select("_id");

    if (relevantNotifications.length) {
      await UserNotification.bulkWrite(
        relevantNotifications.map((notification) => ({
          updateOne: {
            filter: { userId, notificationId: notification._id },
            update: { $setOnInsert: { userId, notificationId: notification._id, status: "unread" } },
            upsert: true,
          },
        }))
      );
    }

    // Reactivate expired reminders
    await UserNotification.updateMany(
      {
        userId,
        status: "remind_later",
        remindAt: { $lte: new Date() },
      },
      {
        $set: {
          status: "unread",
          remindAt: null,
        },
      }
    );

    const unreadCount =
      await UserNotification.countDocuments({
        userId,
        status: "unread",
      });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get Unread Count Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count",
    });
  }
};