import fsPromises from 'fs/promises'; // Promise-based methods
import fs from 'fs'; // Regular fs for streams
import csv from 'csv-parser';
import validator from 'validator';
import { Lead } from '../models/leads.models.js';


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
    console.log("Fetching lead with ID:", req.params.id); // Debugging
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        console.log("Fetched lead details:", lead); // Debugging
        res.status(200).json(lead);
    } catch (error) {
        console.error("Error fetching lead by ID:", error);
        res.status(500).json({ message: "Internal server error" });
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



export const importLeads = async (req, res) => {
    try {
      console.log("Uploaded file info:", req.file);
      
      if (!req.file?.path || !req.file.originalname.endsWith('.csv')) {
        return res.status(400).json({ 
          message: 'Please upload a valid CSV file' 
        });
      }
  
      const filePath = req.file.path;
      const leads = [];
      const errors = [];
  
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            console.log('Parsed CSV row:', row); // For debugging
  
            // Combine First Name and Last Name into a single name field
            const fullName = `${row['First Name']?.trim() || ''} ${row['Last Name']?.trim() || ''}`.trim();
            if (!fullName) {
              errors.push(`Missing name in row: ${JSON.stringify(row)}`);
              return;
            }
  
            if (!row.Email?.trim() || !validator.isEmail(row.Email.trim())) {
              errors.push(`Invalid email in row: ${JSON.stringify(row)}`);
              return;
            }
  
            leads.push({
              name: fullName,
              email: row.Email.trim().toLowerCase(),
              country: row.Country || '',
              phoneNumber: row['Phone Number'] || '',
              birthDate: row['Birth Date'] ? new Date(row['Birth Date']) : null,
              joinDate: row['Join Date'] || null,
              address: {
                line1: row['Address Line 1'] || '',
                pincode: row.Pincode || '',
                city: row.City || '',
                state: row.State || '',
                country: row['Address Country'] || ''
              },
              createdAt: new Date()
            });
          })
          .on('end', () => {
            console.log('Total leads parsed:', leads.length);
            console.log('Errors:', errors);
            resolve();
          })
          .on('error', reject);
      });
  
      if (leads.length === 0) {
        return res.status(400).json({ 
          message: 'No valid leads found in CSV',
          errors: errors.length > 0 ? errors : ['CSV file is empty or invalid format']
        });
      }
  
      const result = await Lead.insertMany(leads, { ordered: false });
      await fsPromises.unlink(filePath);
  
      console.log(`Imported ${result.length} leads successfully`);
      return res.status(200).json({
        message: 'Leads imported successfully',
        importedCount: result.length,
        errors: errors.length > 0 ? errors : undefined
      });
  
    } catch (error) {
      if (req.file?.path) {
        try {
          await fsPromises.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
  
      console.error('Error importing leads:', error);
      return res.status(500).json({ 
        message: 'Failed to import leads',
        error: error.message || 'An unexpected error occurred'
      });
    }
  };

 // Adjust path if needed
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

