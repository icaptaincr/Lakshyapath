import mongoose from "mongoose";
import HomeContent from "../models/HomeContent.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildPayload = (body) => ({
  title: body.title?.trim(),
  description: body.description?.trim() || "",
  imageUrl: body.imageUrl?.trim() || "",
  category: body.category?.trim() || "Announcement",
  buttonText: body.buttonText?.trim() || "",
  buttonLink: body.buttonLink?.trim() || "",
  displayOrder: Number(body.displayOrder ?? 0),
  isActive: body.isActive !== false,
});

export const getActiveHomeContent = async (req, res) => {
  try {
    const content = await HomeContent.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: content.length, content });
  } catch (error) {
    console.error("Get home content error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch home content" });
  }
};

export const getAllHomeContent = async (req, res) => {
  try {
    const content = await HomeContent.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: content.length, content });
  } catch (error) {
    console.error("Get all home content error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch home content" });
  }
};

export const createHomeContent = async (req, res) => {
  try {
    const payload = buildPayload(req.body);

    if (!payload.title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    if (!Number.isInteger(payload.displayOrder) || payload.displayOrder < 0) {
      return res.status(400).json({ success: false, message: "Display order must be a non-negative integer" });
    }

    const content = await HomeContent.create({ ...payload, createdBy: req.user._id });

    return res.status(201).json({ success: true, message: "Home content created successfully", content });
  } catch (error) {
    console.error("Create home content error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to create home content" });
  }
};

export const updateHomeContent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid home content ID" });
    }

    const content = await HomeContent.findById(id);
    if (!content) {
      return res.status(404).json({ success: false, message: "Home content not found" });
    }

    const payload = buildPayload({ ...content.toObject(), ...req.body });
    if (!payload.title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!Number.isInteger(payload.displayOrder) || payload.displayOrder < 0) {
      return res.status(400).json({ success: false, message: "Display order must be a non-negative integer" });
    }

    Object.assign(content, payload);
    await content.save();

    return res.status(200).json({ success: true, message: "Home content updated successfully", content });
  } catch (error) {
    console.error("Update home content error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update home content" });
  }
};

export const deleteHomeContent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid home content ID" });
    }

    const content = await HomeContent.findById(id);
    if (!content) {
      return res.status(404).json({ success: false, message: "Home content not found" });
    }

    await content.deleteOne();
    return res.status(200).json({ success: true, message: "Home content deleted successfully" });
  } catch (error) {
    console.error("Delete home content error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete home content" });
  }
};
