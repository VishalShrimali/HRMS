import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
  dateTime: { type: Date, required: true },
  notes: { type: String },
  type: { type: String, default: "annual_review" },
  status: { type: String, enum: ["pending", "completed"], default: "pending" }
}, { timestamps: true });

export const Meeting = mongoose.model("Meeting", MeetingSchema); 