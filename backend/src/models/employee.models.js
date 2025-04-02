import mongoose from "mongoose";
import { connectionDB } from "../utils/database.utils.js";

const EmployeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "HR", "Employee"],
      default: "Employee",
    },
    joiningDate: { type: Date, required: true },
    birthday: { type: Date, required: true },
    workAnniversary: { type: Date },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Resigned"],
      default: "Active",
    },
    notifications: {
      birthdayWishSent: { type: Boolean, default: false },
      anniversaryWishSent: { type: Boolean, default: false },
      policyRenewalReminderSent: { type: Boolean, default: false },
    },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  },
  { timestamps: true }
);

export const Employee = mongoose.model("Employee", EmployeeSchema);
