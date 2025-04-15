// models/group.models.js
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lead" }], // or ref: "User"
  createdDate: { type: Date, default: Date.now },
});

export const Group = mongoose.model("Group", groupSchema);