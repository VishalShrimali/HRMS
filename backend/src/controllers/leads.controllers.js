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
        const { firstName, lastName, email, phone, country } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !country ) {
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
            ...req.body,
            fullName,
            dates: { joinDate: Date.now() },
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
        const { firstName, lastName, email, phone, country } = req.body;

        // Validate required fields
        if (!firstName && !lastName && !email && !phone && !country) {
            return res.status(400).json({ message: "At least one field must be provided for update" });
        }

        // If firstName or lastName is updated, update fullName as well
        if (firstName || lastName) {
            req.body.fullName = `${firstName || ""} ${lastName || ""}`.trim();
        }

        const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedLead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        res.status(200).json({ message: "Lead updated successfully", updatedLead });
    } catch (error) {
        handleError(res, error);
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

// Leads with pagination
// export const LeadsPagination = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search = "" } = req.query;

//         const query = search
//             ? { fullName: { $regex: search, $options: "i" } }
//             : {};

//         const leads = await Lead.find(query)
//             .skip((page - 1) * limit)
//             .limit(parseInt(limit));

//         const totalLeads = await Lead.countDocuments(query);

//         res.status(200).json({
//             leads,
//             totalPages: Math.ceil(totalLeads / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (error) {
//         handleError(res, error);
//     }
// };