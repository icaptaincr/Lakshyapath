import mongoose from "mongoose";

const homeContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, maxlength: 60, default: "Announcement" },
    buttonText: { type: String, trim: true, maxlength: 50, default: "" },
    buttonLink: { type: String, trim: true, maxlength: 300, default: "" },
    displayOrder: { type: Number, min: 0, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const HomeContent = mongoose.model("HomeContent", homeContentSchema);
export default HomeContent;
