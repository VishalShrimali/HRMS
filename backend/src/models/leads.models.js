import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    line1: { type: String, required: true },
    line2: { type: String },
    line3: { type: String },
    pincode: { type: String, required: true, match: /^[0-9]{5,6}$/ },
    city: { type: String, required: true },
    state: { type: String, required: true },
    county: { type: String },
    country: { type: String, required: true },
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
    joinDate: { type: Number, required: true },
    lastLogin: { type: Date }, // Example: Add other date fields here
    passwordChangedAt: { type: Date },
    birthDate: { type: Date},
});
const LeadSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        fullName: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        phone: {
            type: String,
            required: true,
            match: /^[0-9]{10,15}$/,
        },
        country: { type: String, required: true },
        password: { type: String, required: true, minlength: 6 },
        addresses: [addressSchema],
        userPreferences: userPreferencesSchema,
        dates: dateSchema, // Embed the date schema here
        role: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Role", 
            required: false
        },
    },
    { timestamps: true }
);

export const Lead = mongoose.model("Lead", LeadSchema);