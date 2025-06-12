import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
  dateTime: { type: Date, required: true },
  notes: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, default: "annual_review" },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  title: { type: String }, // Add title field
  link: { type: String }   // Add link field
}, { timestamps: true });

export const Meeting = mongoose.model("Meeting", MeetingSchema);