import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  line3: { type: String },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  county: { type: String },
  country: { type: String, required: true },
});

const userPreferencesSchema = new mongoose.Schema({
  policy: { type: String, enum: ["active", "inactive"], default: "active" },
  whatsappMessageReceive: { type: Boolean, default: false },
  browserNotifications: { type: Boolean, default: false },
  emailReceive: { type: Boolean, default: false },
});

const leadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    date: { type: Date, required: true },
    groupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }], // Changed from groupId to groupIds
    addresses: [addressSchema],
    userPreferences: userPreferencesSchema,
  },
  { timestamps: true }
);

export const Lead = mongoose.model("Lead", leadSchema);