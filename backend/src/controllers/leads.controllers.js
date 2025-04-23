import validator from 'validator';
import { Lead } from '../models/leads.models.js';
import { Group } from '../models/group.models.js';
import mongoose from 'mongoose';
import { Parser } from 'json2csv';


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
        // If user is admin, get all leads. Otherwise, get only user's leads
        const query = req.user.role.name === "ADMIN" ? {} : { userId: req.user._id };
        const leads = await Lead.find(query);
        res.status(200).json({ message: "Leads fetched successfully", leads });
    } catch (error) {
        handleError(res, error);
    }
};

// Fetch lead by ID
export const getLeadById = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid lead ID' });
    }

    try {
        const lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json(lead);
    } catch (error) {
        console.error('Error fetching lead by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// Create a new lead
export const createLead = async (req, res) => {
    try {
        const {
            groupId,
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
            userId: req.user._id, // Add the current user's ID
            firstName,
            lastName,
            fullName,
            email,
            phone,
            secondPhoneNumber,
            country,
            addresses,
            dates: {
                joinDate: dates?.joinDate ? new Date(dates?.joinDate).getTime() : Date.now(),
                birthDate: dates?.birthDate ? new Date(dates?.birthDate).getTime() : "",
                lastLogin: dates?.lastLogin ? new Date(dates?.lastLogin).getTime() : "",
                passwordChangedAt: dates?.passwordChangedAt ? new Date(dates?.passwordChangedAt).getTime() : "",
            },
            userPreferences: {
                policy: userPreferences?.policy || "active",
                whatsappMessageReceive: !!userPreferences?.whatsappMessageReceive,
                browserNotifications: !!userPreferences?.browserNotifications,
                emailReceive: !!userPreferences?.emailReceive,
            }
        });

        const savedLead = await newLead.save();

        if (groupId !== "") {
            // Find the group by groupId and add the new lead's _id to the leads array
            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(400).json({ message: "Group not found" });
            }

            // Add the lead's _id to the group's leads array
            group.leads.push(savedLead._id);

            // Save the updated group
            await group.save();
        }

        res.status(201).json({ message: "Lead created successfully", savedLead });
    } catch (error) {
        handleError(res, error);
    }
};


// Update a lead
export const updateLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        // Check if user owns the lead or is admin
        if (lead.userId.toString() !== req.user._id.toString() && req.user.role.name !== "ADMIN") {
            return res.status(403).json({ message: "You can only update your own leads" });
        }

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
        if (fullName !== undefined) updateData.fullName = fullName;
        else if (firstName || lastName) {
            const lead = await Lead.findById(req.params.id);
            updateData.fullName = `${firstName || lead.firstName || ""} ${lastName || lead.lastName || ""}`.trim();
        }

        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (secondPhoneNumber !== undefined) updateData.secondPhoneNumber = secondPhoneNumber;
        if (country !== undefined) updateData.country = country;
        if (addresses !== undefined) updateData.addresses = addresses;

        // Handle updating dates and userPreferences fields
        if (dates !== undefined) {
            updateData.dates = {
                joinDate: dates?.joinDate ? new Date(dates?.joinDate).getTime() : Date.now(),
                birthDate: dates?.birthDate ? new Date(dates?.birthDate).getTime() : "",
                lastLogin: dates?.lastLogin ? new Date(dates?.lastLogin).getTime() : "",
                passwordChangedAt: dates?.passwordChangedAt ? new Date(dates?.passwordChangedAt).getTime() : "",
            };
        }

        if (userPreferences !== undefined) {
            updateData.userPreferences = {
                policy: userPreferences?.policy || "active",
                whatsappMessageReceive: !!userPreferences?.whatsappMessageReceive,
                browserNotifications: !!userPreferences?.browserNotifications,
                emailReceive: !!userPreferences?.emailReceive,
            };
        }

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
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        // Check if user owns the lead or is admin
        if (lead.userId.toString() !== req.user._id.toString() && req.user.role.name !== "ADMIN") {
            return res.status(403).json({ message: "You can only delete your own leads" });
        }

        const deletedLead = await Lead.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Lead deleted successfully", deletedLead });
    } catch (error) {
        handleError(res, error);
    }
};

export const importLeads = async (req, res) => {
  try {
    const rows = req.body; // Now expecting an array of lead objects (from PapaParse)
    const leads = [];
    const errors = [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No data provided.' });
    }

    const sanitize = (val) => (typeof val === 'string' ? val.trim() : '');

    rows.forEach((row, index) => {
      const fullName = `${sanitize(row['First Name'])} ${sanitize(row['Last Name'])}`.trim();
      const email = sanitize(row['Email']);

      if (!fullName) {
        errors.push(`Row ${index + 1}: Missing name`);
        return;
      }

      if (!email || !validator.isEmail(email)) {
        errors.push(`Row ${index + 1}: Invalid or missing email`);
        return;
      }

      const lead = {
        name: fullName,
        email: email.toLowerCase(),
        country: sanitize(row['Country']),
        phoneNumber: sanitize(row['Phone Number']),
        birthDate: row['Birth Date'] ? new Date(row['Birth Date']) : null,
        joinDate: row['Join Date'] ? new Date(row['Join Date']) : null,
        address: {
          line1: sanitize(row['Address Line 1']),
          pincode: sanitize(row['Pincode']),
          city: sanitize(row['City']),
          state: sanitize(row['State']),
          country: sanitize(row['Address Country']),
        },
        createdAt: new Date(),
      };
      console.log(lead);
      
      leads.push(lead);
    });

    if (leads.length === 0) {
      return res.status(400).json({
        message: 'No valid leads found.',
        errors: errors.length ? errors : ['Empty or invalid data'],
      });
    }

    const result = await Lead.insertMany(leads, { ordered: false });

    res.status(200).json({
      message: 'Leads imported successfully!',
      importedCount: result.length,
      failedCount: errors.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (error) {
    console.error('Import Error:', error);
    res.status(500).json({
      message: 'Failed to import leads',
      error: error.message || 'Something went wrong',
    });
  }
};

//  Adjust path if needed
export const exportLeads = async (req, res) => {
    try {
        const leads = await Lead.find();

        const formattedLeads = leads.map(lead => {
            const address = lead.addresses?.[0] || {};
            return {
                firstName: lead.firstName || "",
                lastName: lead.lastName || "",
                email: lead.email || "",
                phone: lead.phone || "",
                secondPhoneNumber: lead.secondPhoneNumber || "",
                fullName: lead.fullName || "",
                country: lead.country || "",
                joinDate: lead.dates?.joinDate || "",
                birthDate: lead.dates?.birthDate || "",
                lastLogin: lead.dates?.lastLogin || "",
                passwordChangedAt: lead.dates?.passwordChangedAt || "",
                addressLine1: address.line1 || "",
                pincode: address.pincode || "",
                city: address.city || "",
                state: address.state || "",
                county: address.county || "",
                addressCountry: address.country || "",
                policy: lead.userPreferences?.policy || "",
                whatsappMessageReceive: lead.userPreferences?.whatsappMessageReceive || false,
                browserNotifications: lead.userPreferences?.browserNotifications || false,
                emailReceive: lead.userPreferences?.emailReceive || false
            };
        });

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(formattedLeads);

        res.header("Content-Type", "text/csv");
        res.attachment("leads.csv");
        return res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to export leads" });
    }
};

// export const exportLeads = async () => {
//   try {
//     const response = await api.get('/leads/export', {
//       responseType: 'blob', // Important for file downloads
//     });

//     const blob = new Blob([response.data], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'leads_export.csv';
//     a.click();

//     window.URL.revokeObjectURL(url);
//   } catch (error) {
//     console.error('Error exporting leads:', error);
//     throw error;
//   }
// };

