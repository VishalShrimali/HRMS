import mongoose, { model } from "mongoose";

const logSchema = new mongoose.Schema({
  action: { type: String, required: true }, // Example: "EMPLOYEE_ADDED", "LOGIN", "POLICY_UPDATED"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, // Admin ID
  details: { type: String }, // Extra details about the action
  timestamp: { type: Date, default: Date.now } // When the action happened
});

export const Log  = mongoose.model("Log", logSchema);
