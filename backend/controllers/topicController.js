import mongoose from "mongoose";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import Exam from "../models/Exam.js";

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createTopic = async (req, res) => {
  try {
    const { subjectId, name, description, displayOrder } = req.body;
    if (!subjectId || !name?.trim()) return res.status(400).json({ success:false, message:"Subject and topic name are required" });
    if (!validId(subjectId)) return res.status(400).json({ success:false, message:"Invalid subject ID" });
    const subject = await Subject.findOne({ _id:subjectId, isActive:true });
    if (!subject) return res.status(404).json({ success:false, message:"Active subject not found" });
    const exam = await Exam.findOne({ _id:subject.examId, isActive:true });
    if (!exam) return res.status(404).json({ success:false, message:"Parent exam not found or inactive" });
    const trimmedName = name.trim();
    if (await Topic.findOne({ subjectId, name:trimmedName })) return res.status(409).json({ success:false, message:"Topic already exists for this subject" });
    const topic = await Topic.create({ subjectId, name:trimmedName, description:description?.trim(), displayOrder });
    return res.status(201).json({ success:true, message:"Topic created successfully", topic });
  } catch (error) {
    console.error("Create topic error:", error.message);
    if (error.code === 11000) return res.status(409).json({ success:false, message:"Topic already exists for this subject" });
    return res.status(400).json({ success:false, message:error.name === "ValidationError" ? Object.values(error.errors).map(e=>e.message).join(", ") : "Failed to create topic" });
  }
};

export const getTopicsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    if (!validId(subjectId)) return res.status(400).json({ success:false, message:"Invalid subject ID" });
    const subject = await Subject.findOne({ _id:subjectId, isActive:true });
    if (!subject) return res.status(404).json({ success:false, message:"Active subject not found" });
    const exam = await Exam.findOne({ _id:subject.examId, isActive:true });
    if (!exam) return res.status(404).json({ success:false, message:"Parent exam not found or inactive" });
    const topics = await Topic.find({ subjectId, isActive:true }).sort({ displayOrder:1 });
    return res.status(200).json({ success:true, count:topics.length, topics });
  } catch (error) {
    console.error("Get topics error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to fetch topics" });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ success:false, message:"Invalid topic ID" });
    const topic = await Topic.findOne({ _id:id, isActive:true });
    if (!topic) return res.status(404).json({ success:false, message:"Topic not found" });
    const { name, description, displayOrder } = req.body;
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success:false, message:"Topic name is required" });
      const duplicate = await Topic.findOne({ _id:{ $ne:id }, subjectId:topic.subjectId, name:name.trim(), isActive:true });
      if (duplicate) return res.status(409).json({ success:false, message:"Topic already exists for this subject" });
      topic.name = name.trim();
    }
    if (description !== undefined) topic.description = description.trim();
    if (displayOrder !== undefined) topic.displayOrder = Number(displayOrder);
    await topic.save();
    return res.status(200).json({ success:true, message:"Topic updated successfully", topic });
  } catch (error) {
    console.error("Update topic error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to update topic" });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ success:false, message:"Invalid topic ID" });
    const topic = await Topic.findOne({ _id:id, isActive:true });
    if (!topic) return res.status(404).json({ success:false, message:"Topic not found" });
    topic.isActive = false;
    await topic.save();
    return res.status(200).json({ success:true, message:"Topic deleted successfully" });
  } catch (error) {
    console.error("Delete topic error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to delete topic" });
  }
};
