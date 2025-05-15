import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  line1: { type: String, trim: true },
  line2: { type: String, trim: true },
  line3: { type: String, trim: true },
  pincode: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  county: { type: String, trim: true },
  country: { type: String, trim: true }
});

const userPreferencesSchema = new mongoose.Schema({
  policy: { type: String, enum: ["active", "inactive"], default: "active" },
  whatsappMessageReceive: { type: Boolean, default: false },
  browserNotifications: { type: Boolean, default: false },
  emailReceive: { type: Boolean, default: false },
});

const dateSchema = new mongoose.Schema({
    joinDate: { type: Number },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
    birthDate: { type: Date },
});

const LeadSchema = new mongoose.Schema(
    {   
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        fullName: { type: String, trim: true },
        email: { type: String, trim: true },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: /^\+?[0-9]{10,15}$/,
        },
        country: { type: String },
        addresses: [addressSchema],
        userPreferences: userPreferencesSchema,
        dates: dateSchema,
    },
    { timestamps: true }
);

export const Lead = mongoose.model("Lead", LeadSchema);