import mongoose from "mongoose";
import { connectionDB } from "../utils/database.utils.js";

connectionDB()
const NotificationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    type: { type: String, enum: ["Birthday", "Anniversary", "Policy Renewal"], required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", NotificationSchema);
