import Subscription from "../models/Subscription.js";

export const getMySubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      userId: req.user._id,
    })
      .populate("examId", "name category")
      .populate(
        "planId",
        "name price offerPrice offerName durationDays"
      )
      .sort({ createdAt: -1 });

    // Automatically mark expired subscriptions
    const now = new Date();

    for (const subscription of subscriptions) {
      if (
        subscription.status === "active" &&
        subscription.endDate < now
      ) {
        subscription.status = "expired";
        await subscription.save();
      }
    }

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error(
      "Get subscriptions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
    });
  }
};