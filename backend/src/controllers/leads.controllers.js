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
        // Ensure user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated" });
        }

        // If user is admin, get all leads. Otherwise, get only user's leads
        const query = req.user.role.name === "ADMIN" ? {} : { userId: req.user._id };
        
        // Add timestamps to ensure fresh data
        const leads = await Lead.find(query)
            .sort({ updatedAt: -1 }) // Sort by most recently updated
            .lean(); // Convert to plain JavaScript objects

        res.status(200).json({ 
            message: "Leads fetched successfully", 
            leads,
            timestamp: new Date().toISOString() // Add timestamp to response
        });
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
        console.log('Request body:', req.body); // Add logging
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
        console.log('Validating fields:', { firstName, lastName, phone }); // Add logging
        if (!firstName || !lastName || !phone) {
            console.log('Missing required fields:', { 
                hasFirstName: !!firstName, 
                hasLastName: !!lastName, 
                hasPhone: !!phone 
            }); // Add logging
            return res.status(400).json({ message: "First name, last name, and phone are required" });
        }

        // Create fullName and initialize other fields
        const fullName = `${firstName} ${lastName}`.trim();
        const newLead = new Lead({
            userId: req.user._id, // Add the current user's ID
            firstName,
            lastName,
            fullName,
            email,
            phone,
            secondPhoneNumber,
            country,
            addresses: addresses ? [{
                line1: addresses[0]?.line1 || "",
                line2: addresses[0]?.line2 || "",
                line3: addresses[0]?.line3 || "",
                pincode: addresses[0]?.pincode || "",
                city: addresses[0]?.city || "",
                state: addresses[0]?.state || "",
                county: addresses[0]?.county || "",
                country: addresses[0]?.country || ""
            }] : [],
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

        // Only try to add to group if groupId is provided and not empty
        if (groupId && groupId.trim() !== "") {
            const group = await Group.findById(groupId);
            if (!group) {
                // If group not found, still return success but with a warning
                return res.status(201).json({ 
                    message: "Lead created successfully but group not found", 
                    savedLead 
                });
            }

            // Add the lead's _id to the group's leads array
            group.leads.push(savedLead._id);
            await group.save();
            
            // Update the lead with the groupId
            savedLead.groupId = group._id;
            await savedLead.save();
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

        // Remove lead from any groups it belongs to
        if (lead.groupId) {
            const group = await Group.findById(lead.groupId);
            if (group) {
                group.leads = group.leads.filter(id => id.toString() !== lead._id.toString());
                await group.save();
            }
        }

        const deletedLead = await Lead.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Lead deleted successfully", deletedLead });
    } catch (error) {
        console.error("Error deleting lead:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
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

