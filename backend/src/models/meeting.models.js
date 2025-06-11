import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
  dateTime: { type: Date, required: true },
  notes: { type: String },
  type: { type: String, default: "annual_review" },
  status: { 
    type: String, 
    enum: ["scheduled", "completed", "cancelled"], 
    default: "scheduled" 
  },
  title: { type: String, required: true },
  duration: { type: Number, default: 60 }, // Duration in minutes
  location: { type: String },
  attendees: [{
    email: String,
    name: String,
    response: {
      type: String,
      enum: ["accepted", "declined", "pending"],
      default: "pending"
    }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export const Meeting = mongoose.model("Meeting", MeetingSchema); 