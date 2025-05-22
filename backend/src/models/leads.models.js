import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    line1: { type: String },
    line2: { type: String },
    line3: { type: String },
    pincode: { type: String, match: /^[0-9]{5,6}$/ },
    city: { type: String },
    state: { type: String },
    county: { type: String },
    country: { type: String },
});

const userPreferencesSchema = new mongoose.Schema({
    policy: {
        type: String,
        enum: ["active", "nonactive"],
        default: "active",
    },
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
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        fullName: { type: String, required: true, trim: true },
        email: {
            type: String,
            unique: true,
            sparse: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        phone: {
            type: String,
            required: true,
            match: /^[0-9]{10,15}$/,
        },
        country: { type: String },
        addresses: [addressSchema],
        userPreferences: userPreferencesSchema,
        dates: dateSchema,
        leadStatus: {
            type: String,
            enum: ["new", "existing"],
            default: "new"
        },
    },
    { timestamps: true }
);

export const Lead = mongoose.model("Lead", LeadSchema);