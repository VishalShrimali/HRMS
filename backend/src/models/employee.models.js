// models/employee.models.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  phoneNumber: { type: String },
  password: { type: String }, // Password is optional for leads
  joiningDate: { type: Date, required: true },
  birthday: { type: Date, required: true },
  workAnniversary: { type: Date },
  address: { type: String },
  country: { type: String, default: "United States" },
  tags: { type: String },
  role: { type: String, enum: ["Employee", "HR Admin"], default: "Employee" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  notifications: {
    birthdayWishSent: { type: Boolean, default: false },
    anniversaryWishSent: { type: Boolean, default: false },
    policyRenewalReminderSent: { type: Boolean, default: false },
  },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }], // New field to track groups
});

// Hash password before saving if it exists
employeeSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
employeeSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // No password set for leads
  return await bcrypt.compare(candidatePassword, this.password);
};

export const Employee = mongoose.model("Employee", employeeSchema);