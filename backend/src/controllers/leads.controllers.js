import { Lead } from "../models/leads.models.js";

// Centralized error handler
const handleError = (res, error, statusCode = 500) => {
    console.error(error.message || error);
    if (!res.headersSent) {
        res.status(statusCode).json({ message: error.message || "Internal Server Error" });
    }
};

// Fetch all leads
export const getLeads = async (req, res) => {
    try {
        const leads = await Lead.find();
        res.status(200).json({ message: "Leads fetched successfully", leads });
    } catch (error) {
        handleError(res, error);
    }
};

// Fetch lead by ID
export const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        res.status(200).json(lead);
    } catch (error) {
        handleError(res, error);
    }
};

// Create a new lead
export const createLead = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            country,
            secondPhoneNumber,
            addresses,
            dates,
            userPreferences
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !country) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Check if email already exists
        const existingLead = await Lead.findOne({ email });
        if (existingLead) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create fullName and initialize other fields
        const fullName = `${firstName} ${lastName}`;
        const newLead = new Lead({
            firstName,
            lastName,
            fullName,
            email,
            phone,
            secondPhoneNumber,
            country,
            addresses,
            dates: {
                joinDate: dates?.joinDate || Date.now(),
                birthDate: dates?.birthDate || "",
                lastLogin: dates?.lastLogin || "",
                passwordChangedAt: dates?.passwordChangedAt || "",
            },
            userPreferences: {
                policy: userPreferences?.policy || "active",
                whatsappMessageReceive: !!userPreferences?.whatsappMessageReceive,
                browserNotifications: !!userPreferences?.browserNotifications,
                emailReceive: !!userPreferences?.emailReceive,
            }
        });

        const savedLead = await newLead.save();
        res.status(201).json({ message: "Lead created successfully", savedLead });
    } catch (error) {
        handleError(res, error);
    }
};

// Update a lead
export const updateLead = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            fullName,
            email,
            phone,
            secondPhoneNumber,
            country,
            addresses,
            dates,
            userPreferences
        } = req.body;

        const updateData = {};

        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (fullName !== undefined) {
            updateData.fullName = fullName;
        } else if (firstName || lastName) {
            const lead = await Lead.findById(req.params.id);
            updateData.fullName = `${firstName || lead.firstName || ""} ${lastName || lead.lastName || ""}`.trim();
        }

        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (secondPhoneNumber !== undefined) updateData.secondPhoneNumber = secondPhoneNumber;
        if (country !== undefined) updateData.country = country;
        if (addresses !== undefined) updateData.addresses = addresses;
        if (dates !== undefined) updateData.dates = dates;
        if (userPreferences !== undefined) updateData.userPreferences = userPreferences;

        const updatedLead = await Lead.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedLead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        res.status(200).json({ message: "Lead updated successfully", lead: updatedLead });
    } catch (error) {
        console.error("Error updating lead:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Delete a lead
export const deleteLead = async (req, res) => {
    try {
        const deletedLead = await Lead.findByIdAndDelete(req.params.id);
        if (!deletedLead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        res.status(200).json({ message: "Lead deleted successfully", deletedLead });
    } catch (error) {
        handleError(res, error);
    }
};