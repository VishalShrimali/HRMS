import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { connectionDB } from "../utils/database.utils.js";

connectionDB();


const AdminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["Super Admin", "HR Admin"],
      default: "HR Admin",
    },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    activityLogs: [
      {
        action: { type: String, required: true }, // Example: "Added Employee"
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords for login authentication
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Admin = mongoose.model("Admin", AdminSchema);
