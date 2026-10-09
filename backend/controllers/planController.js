import mongoose from "mongoose";

import Plan from "../models/Plan.js";
import Exam from "../models/Exam.js";

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

// ----------------------------------------------------
// Create Plan
// ----------------------------------------------------

export const createPlan = async (req, res) => {
  try {
    const {
      examId,
      name,
      durationDays,
      price,
      offerPrice,
      offerName,
      offerStartDate,
      offerEndDate,
      features,
    } = req.body;

    if (!examId || !isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Valid exam ID is required",
      });
    }

    if (!name || !["Free", "Premium"].includes(name)) {
      return res.status(400).json({
        success: false,
        message: "Plan name must be Free or Premium",
      });
    }

    if (
      durationDays === undefined ||
      !Number.isInteger(Number(durationDays)) ||
      Number(durationDays) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number of days",
      });
    }

    if (
      price === undefined ||
      Number.isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required",
      });
    }

    // Free plans cannot have offers.
    if (name === "Free") {
      if (
        offerPrice !== undefined &&
        offerPrice !== null &&
        Number(offerPrice) !== 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Free plans cannot have an offer price",
        });
      }
    }

    // Premium offer validation
    if (name === "Premium" && offerPrice !== undefined && offerPrice !== null) {
      if (
        Number.isNaN(Number(offerPrice)) ||
        Number(offerPrice) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Offer price must be greater than zero",
        });
      }

      if (Number(offerPrice) >= Number(price)) {
        return res.status(400).json({
          success: false,
          message: "Offer price must be lower than regular price",
        });
      }
    }

    // Validate offer dates
    if (offerStartDate && offerEndDate) {
      const start = new Date(offerStartDate);
      const end = new Date(offerEndDate);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer dates",
        });
      }

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: "Offer end date must be after start date",
        });
      }
    }

    const exam = await Exam.findOne({
      _id: examId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Active exam not found",
      });
    }

    const existingPlan = await Plan.findOne({
      examId,
      name,
    });

    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message: `${name} plan already exists for this exam`,
      });
    }

    const plan = await Plan.create({
      examId,
      name,
      durationDays: Number(durationDays),
      price: Number(price),
      offerPrice:
        name === "Premium" &&
        offerPrice !== undefined &&
        offerPrice !== null
          ? Number(offerPrice)
          : null,
      offerName:
        name === "Premium" ? offerName?.trim() || null : null,
      offerStartDate:
        name === "Premium" ? offerStartDate || null : null,
      offerEndDate:
        name === "Premium" ? offerEndDate || null : null,
      features: Array.isArray(features) ? features : [],
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("Create plan error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This plan already exists for the selected exam",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create plan",
    });
  }
};

// ----------------------------------------------------
// Get all active plans
// ----------------------------------------------------

export const getAllPlans = async (req, res) => {
  try {
    const { examId } = req.query;

    const filter = {
      isActive: true,
    };

    if (examId) {
      if (!isValidObjectId(examId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid exam ID",
        });
      }

      filter.examId = examId;
    }

    const plans = await Plan.find(filter)
      .populate("examId", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    console.error("Get plans error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
    });
  }
};

// ----------------------------------------------------
// Get single plan
// ----------------------------------------------------

export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const plan = await Plan.findOne({
      _id: id,
      isActive: true,
    }).populate("examId", "name category");

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Get plan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch plan",
    });
  }
};

// ----------------------------------------------------
// Update Plan
// ----------------------------------------------------

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const plan = await Plan.findOne({
      _id: id,
      isActive: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const {
      durationDays,
      price,
      offerPrice,
      offerName,
      offerStartDate,
      offerEndDate,
      features,
    } = req.body;

    if (durationDays !== undefined) {
      if (
        !Number.isInteger(Number(durationDays)) ||
        Number(durationDays) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Duration must be a positive number of days",
        });
      }

      plan.durationDays = Number(durationDays);
    }

    if (price !== undefined) {
      if (
        Number.isNaN(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

      plan.price = Number(price);
    }

    if (offerPrice !== undefined) {
      if (offerPrice === null || offerPrice === "") {
        plan.offerPrice = null;
      } else {
        const newOfferPrice = Number(offerPrice);

        if (
          Number.isNaN(newOfferPrice) ||
          newOfferPrice <= 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Offer price must be greater than zero",
          });
        }

        const finalPrice =
          price !== undefined ? Number(price) : plan.price;

        if (newOfferPrice >= finalPrice) {
          return res.status(400).json({
            success: false,
            message: "Offer price must be lower than regular price",
          });
        }

        plan.offerPrice = newOfferPrice;
      }
    }

    if (offerName !== undefined) {
      plan.offerName = offerName?.trim() || null;
    }

    if (offerStartDate !== undefined) {
      plan.offerStartDate = offerStartDate || null;
    }

    if (offerEndDate !== undefined) {
      plan.offerEndDate = offerEndDate || null;
    }

    if (features !== undefined) {
      if (!Array.isArray(features)) {
        return res.status(400).json({
          success: false,
          message: "Features must be an array",
        });
      }

      plan.features = features;
    }

    // Validate offer dates after applying updates.
    if (plan.offerStartDate && plan.offerEndDate) {
      const start = new Date(plan.offerStartDate);
      const end = new Date(plan.offerEndDate);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer dates",
        });
      }

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: "Offer end date must be after start date",
        });
      }
    }

    if (
      plan.offerPrice !== null &&
      plan.offerPrice !== undefined &&
      plan.offerPrice >= plan.price
    ) {
      return res.status(400).json({
        success: false,
        message: "Offer price must be lower than regular price",
      });
    }

    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Update plan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update plan",
    });
  }
};

// ----------------------------------------------------
// Soft delete / deactivate Plan
// ----------------------------------------------------

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const plan = await Plan.findOne({
      _id: id,
      isActive: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    plan.isActive = false;

    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Plan deactivated successfully",
    });
  } catch (error) {
    console.error("Delete plan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate plan",
    });
  }
};