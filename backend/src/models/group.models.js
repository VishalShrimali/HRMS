// models/group.models.js
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
<<<<<<< HEAD
  description: { type: String, default: "" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lead" }], // or ref: "User"
=======
  leads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lead" }], // References to Employee (leads)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Admin who created the group
>>>>>>> 242b43d564d65e279c16418da246f70fa3f4e42a
  createdDate: { type: Date, default: Date.now },
});

export const Group = mongoose.model("Group", groupSchema);