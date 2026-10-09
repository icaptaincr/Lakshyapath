import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import Exam from "../models/Exam.js";
import StudentProgress from "../models/StudentProgress.js";
import User from "../models/User.js";

import { sendEmail } from "../services/emailService.js";

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const parseOptionalDate = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getTargetStudents = async (audience, examId) => {
  if (audience === "ALL_STUDENTS") {
    return User.find({
      role: "student",
      isActive: true,
    }).select("email fullName");
  }

  const progressRecords = await StudentProgress.find({
    examId,
  }).select("userId");

  const userIds = [
    ...new Set(
      progressRecords.map((progress) =>
        String(progress.userId)
      )
    ),
  ];

  if (userIds.length === 0) {
    return [];
  }

  return User.find({
    _id: { $in: userIds },
    role: "student",
    isActive: true,
  }).select("email fullName");
};

export const createNotification = async (req, res) => {
  try {
    const {
      examId,
      type,
      audience = "ALL_STUDENTS",
      title,
      message,
      applicationStart,
      lastDate,
      sendEmail: shouldSendEmail,
    } = req.body;

    if (!examId || !isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Valid exam ID is required",
      });
    }

    if (!type || !title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Type, title and message are required",
      });
    }

    if (
      !["ALL_STUDENTS", "TRACKING_EXAM"].includes(audience)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Audience must be ALL_STUDENTS or TRACKING_EXAM",
      });
    }

    const exam = await Exam.findOne({
      _id: examId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const startDate = parseOptionalDate(applicationStart);
    const endDate = parseOptionalDate(lastDate);

    if (applicationStart && !startDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid application start date",
      });
    }

    if (lastDate && !endDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid last date",
      });
    }

    if (startDate && endDate && endDate < startDate) {
      return res.status(400).json({
        success: false,
        message:
          "Last date cannot be before application start date",
      });
    }

    const notification = await Notification.create({
      examId,
      type,
      audience,
      title: title.trim(),
      message: message.trim(),
      applicationStart: startDate,
      lastDate: endDate,
      sendEmail: shouldSendEmail === true,
    });

    let emailSummary = {
      attempted: false,
      audience,
      totalStudents: 0,
      sent: 0,
      failed: 0,
    };

    if (shouldSendEmail === true) {
      emailSummary.attempted = true;

      const students = await getTargetStudents(
        audience,
        examId
      );

      emailSummary.totalStudents = students.length;

      for (const student of students) {
        const safeTitle = escapeHtml(title.trim());
        const safeMessage = escapeHtml(message.trim());
        const safeName = escapeHtml(student.fullName);
        const safeExamName = escapeHtml(exam.name);

        const result = await sendEmail({
          to: student.email,

          subject: `${exam.name} - ${title.trim()}`,

          text: `${title.trim()}

${message.trim()}

Exam: ${exam.name}`,

          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>${safeTitle}</h2>

              <p>Hello ${safeName},</p>

              <p>${safeMessage}</p>

              <p>
                <strong>Exam:</strong> ${safeExamName}
              </p>

              ${
                startDate
                  ? `
                    <p>
                      <strong>Application Start:</strong>
                      ${startDate.toLocaleDateString("en-IN")}
                    </p>
                  `
                  : ""
              }

              ${
                endDate
                  ? `
                    <p>
                      <strong>Last Date:</strong>
                      ${endDate.toLocaleDateString("en-IN")}
                    </p>
                  `
                  : ""
              }

              <p>
                Please log in to your LakshyaPath account
                for more details.
              </p>

              <p>
                Regards,<br />
                <strong>LakshyaPath Team</strong>
              </p>
            </div>
          `,
        });

        if (result.success) {
          emailSummary.sent++;
        } else {
          emailSummary.failed++;
        }
      }
    }

    const populatedNotification =
      await Notification.findById(notification._id).populate(
        "examId",
        "name category"
      );

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification: populatedNotification,
      emailSummary,
    });
  } catch (error) {
    console.error(
      "Create Notification Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      isActive: true,
    })
      .populate("examId", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get Notifications Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOne({
      _id: id,
      isActive: true,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const {
      examId,
      type,
      audience,
      title,
      message,
      applicationStart,
      lastDate,
      sendEmail,
    } = req.body;

    if (examId !== undefined) {
      if (!isValidObjectId(examId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid exam ID",
        });
      }

      const exam = await Exam.findOne({
        _id: examId,
        isActive: true,
      });

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      notification.examId = examId;
    }

    if (type !== undefined) {
      notification.type = type;
    }

    if (audience !== undefined) {
      if (
        !["ALL_STUDENTS", "TRACKING_EXAM"].includes(
          audience
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Audience must be ALL_STUDENTS or TRACKING_EXAM",
        });
      }

      notification.audience = audience;
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      notification.title = title.trim();
    }

    if (message !== undefined) {
      if (!message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Message cannot be empty",
        });
      }

      notification.message = message.trim();
    }

    let newStartDate = notification.applicationStart;
    let newLastDate = notification.lastDate;

    if (applicationStart !== undefined) {
      if (
        applicationStart === null ||
        applicationStart === ""
      ) {
        newStartDate = null;
      } else {
        newStartDate =
          parseOptionalDate(applicationStart);

        if (!newStartDate) {
          return res.status(400).json({
            success: false,
            message: "Invalid application start date",
          });
        }
      }
    }

    if (lastDate !== undefined) {
      if (lastDate === null || lastDate === "") {
        newLastDate = null;
      } else {
        newLastDate = parseOptionalDate(lastDate);

        if (!newLastDate) {
          return res.status(400).json({
            success: false,
            message: "Invalid last date",
          });
        }
      }
    }

    if (
      newStartDate &&
      newLastDate &&
      newLastDate < newStartDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Last date cannot be before application start date",
      });
    }

    notification.applicationStart = newStartDate;
    notification.lastDate = newLastDate;

    if (sendEmail !== undefined) {
      notification.sendEmail = sendEmail === true;
    }

    await notification.save();

    const updatedNotification =
      await Notification.findById(
        notification._id
      ).populate("examId", "name category");

    return res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error(
      "Update Notification Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOne({
      _id: id,
      isActive: true,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isActive = false;

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification deactivated successfully",
      notificationId: notification._id,
    });
  } catch (error) {
    console.error(
      "Delete Notification Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate notification",
    });
  }
};