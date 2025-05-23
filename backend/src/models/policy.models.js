import mongoose from "mongoose";
import { connectionDB } from "../utils/database.utils.js";
connectionDB()
const PolicySchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    policyNumber: { type: String, required: true, unique: true },
    provider: { type: String, required: true },
    renewalDate: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Policy = mongoose.model("Policy", PolicySchema);
