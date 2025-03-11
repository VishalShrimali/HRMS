import mongoose from "mongoose";
import { connectionDB } from "../utils/database.utils.js";
connectionDB();
const RoleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true },
    permissions: [{ type: String }] // Example: ["View Employees", "Manage Policies"]
  },
  { timestamps: true }
);

export const Role = mongoose.model("Role", RoleSchema);
