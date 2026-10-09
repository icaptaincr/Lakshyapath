import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import Exam from "../models/Exam.js";

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createSubject = async (req, res) => {
  try {
    const { examId, name, description, displayOrder } = req.body;
    if (!examId || !name?.trim()) return res.status(400).json({ success:false, message:"Exam and subject name are required" });
    if (!validId(examId)) return res.status(400).json({ success:false, message:"Invalid exam ID" });
    const exam = await Exam.findOne({ _id: examId, isActive:true });
    if (!exam) return res.status(404).json({ success:false, message:"Active exam not found" });
    const trimmedName = name.trim();
    if (await Subject.findOne({ examId, name: trimmedName })) return res.status(409).json({ success:false, message:"Subject already exists for this exam" });
    const subject = await Subject.create({ examId, name:trimmedName, description:description?.trim(), displayOrder });
    return res.status(201).json({ success:true, message:"Subject created successfully", subject });
  } catch (error) {
    console.error("Create subject error:", error.message);
    if (error.code === 11000) return res.status(409).json({ success:false, message:"Subject already exists for this exam" });
    return res.status(400).json({ success:false, message:error.name === "ValidationError" ? Object.values(error.errors).map(e=>e.message).join(", ") : "Failed to create subject" });
  }
};

export const getSubjectsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    if (!validId(examId)) return res.status(400).json({ success:false, message:"Invalid exam ID" });
    const exam = await Exam.findOne({ _id:examId, isActive:true });
    if (!exam) return res.status(404).json({ success:false, message:"Active exam not found" });
    const subjects = await Subject.find({ examId, isActive:true }).sort({ displayOrder:1 });
    return res.status(200).json({ success:true, count:subjects.length, subjects });
  } catch (error) {
    console.error("Get subjects error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to fetch subjects" });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ success:false, message:"Invalid subject ID" });
    const subject = await Subject.findOne({ _id:id, isActive:true });
    if (!subject) return res.status(404).json({ success:false, message:"Subject not found" });
    const { name, description, displayOrder } = req.body;
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success:false, message:"Subject name is required" });
      const duplicate = await Subject.findOne({ _id:{ $ne:id }, examId:subject.examId, name:name.trim(), isActive:true });
      if (duplicate) return res.status(409).json({ success:false, message:"Subject already exists for this exam" });
      subject.name = name.trim();
    }
    if (description !== undefined) subject.description = description.trim();
    if (displayOrder !== undefined) subject.displayOrder = Number(displayOrder);
    await subject.save();
    return res.status(200).json({ success:true, message:"Subject updated successfully", subject });
  } catch (error) {
    console.error("Update subject error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to update subject" });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ success:false, message:"Invalid subject ID" });
    const subject = await Subject.findOne({ _id:id, isActive:true });
    if (!subject) return res.status(404).json({ success:false, message:"Subject not found" });
    subject.isActive = false;
    await subject.save();
    return res.status(200).json({ success:true, message:"Subject deleted successfully" });
  } catch (error) {
    console.error("Delete subject error:", error.message);
    return res.status(500).json({ success:false, message:"Failed to delete subject" });
  }
};
