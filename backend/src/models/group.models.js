// models/group.models.js
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  leads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }], // References to Employee (leads)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, // Admin who created the group
  createdDate: { type: Date, default: Date.now },
});

export const Group = mongoose.model("Group", groupSchema);