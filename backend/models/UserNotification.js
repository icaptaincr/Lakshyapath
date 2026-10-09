import mongoose from "mongoose";

const userNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },

    status: {
      type: String,
      enum: ["unread", "read", "remind_later", "already_applied"],
      default: "unread",
    },

    remindAt: {
      type: Date,
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One notification should have only one user-specific record
userNotificationSchema.index(
  {
    userId: 1,
    notificationId: 1,
  },
  {
    unique: true,
  }
);

const UserNotification = mongoose.model(
  "UserNotification",
  userNotificationSchema
);

export default UserNotification;