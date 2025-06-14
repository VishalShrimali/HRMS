import validator from 'validator';
import { Lead } from '../models/leads.models.js';
import { Group } from '../models/group.models.js';
import mongoose from 'mongoose';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { Meeting } from '../models/meeting.models.js';
import User from '../models/user.model.js';


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

        let query = {};
        const { userId: queryUserId } = req.query; // Get userId from query parameters

        if (req.user.role.name === "ADMIN") {
            if (queryUserId && mongoose.isValidObjectId(queryUserId)) {
                query = { userId: queryUserId }; // Admin wants a specific user's leads
            } else if (queryUserId) {
                // Invalid userId in query by admin
                return res.status(400).json({ message: "Invalid userId format for filtering" });
            }
            // If no queryUserId, admin gets all leads (query remains {})
        } else if (req.user.role.name === "Team Leader") {
            // Get all team members including the team leader
            const teamMembers = await req.user.getSubordinates();
            const teamMemberIds = teamMembers.map(member => member._id);
            
            // Add the current team leader's ID to the list of IDs to query for
            teamMemberIds.push(req.user._id);

            if (queryUserId && mongoose.isValidObjectId(queryUserId)) {
                // Check if the requested user is in the team
                if (teamMemberIds.includes(queryUserId)) {
                    query = { userId: queryUserId };
                } else {
                    return res.status(403).json({ message: "You can only view leads of your team members" });
                }
            } else {
                // If no specific user requested, show all team members' leads
                query = { userId: { $in: teamMemberIds } };
            }
        } else {
            // For team members, they can see only their own leads
            if (queryUserId && mongoose.isValidObjectId(queryUserId)) {
                // Check if the requested user is the team member themselves
                if (queryUserId === req.user._id.toString()) {
                    query = { userId: queryUserId };
                } else {
                    return res.status(403).json({ message: "You can only view your own leads" });
                }
            } else {
                // If no specific user requested, show only the team member's leads
                query = { userId: req.user._id };
            }
        }
        
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
            userPreferences: userPrefs,
            leadStatus
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phone) {
            return res.status(400).json({ message: "First name, last name, and phone are required fields" });
        }

        // Validate phone format
        if (!/^[0-9]{10,15}$/.test(phone)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        // Validate leadStatus if provided
        if (leadStatus && !["new", "existing"].includes(leadStatus)) {
            return res.status(400).json({ message: "Invalid lead status" });
        }

        // Check if email exists and is valid (only if provided)
        if (email) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            const existingLead = await Lead.findOne({ email });
            if (existingLead) {
                return res.status(400).json({ message: "Email already exists" });
            }
        }

        // Create fullName and initialize other fields
        const fullName = `${firstName} ${lastName}`;
        const newLead = new Lead({
            userId: req.user._id,
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
                policy: userPrefs?.policy || "active",
                whatsappMessageReceive: !!userPrefs?.whatsappMessageReceive,
                browserNotifications: !!userPrefs?.browserNotifications,
                emailReceive: !!userPrefs?.emailReceive,
            },
            leadStatus: leadStatus || "new"
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
            userPreferences: userPrefs,
            leadStatus
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
        if (leadStatus !== undefined) {
            if (!["new", "existing"].includes(leadStatus)) {
                return res.status(400).json({ message: "Invalid lead status" });
            }
            updateData.leadStatus = leadStatus;
        }

        // Handle updating dates and userPreferences fields
        if (dates !== undefined) {
            updateData.dates = {
                joinDate: dates?.joinDate ? new Date(dates?.joinDate).getTime() : Date.now(),
                birthDate: dates?.birthDate ? new Date(dates?.birthDate).getTime() : "",
                lastLogin: dates?.lastLogin ? new Date(dates?.lastLogin).getTime() : "",
                passwordChangedAt: dates?.passwordChangedAt ? new Date(dates?.passwordChangedAt).getTime() : "",
            };
        }

        if (userPrefs !== undefined) {
            updateData.userPreferences = {
                policy: userPrefs?.policy || "active",
                whatsappMessageReceive: !!userPrefs?.whatsappMessageReceive,
                browserNotifications: !!userPrefs?.browserNotifications,
                emailReceive: !!userPrefs?.emailReceive,
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
        res.status(200).json({ message: "Lead updated successfully", updatedLead });
    } catch (error) {
        handleError(res, error);
    }
};

// Delete a lead
export const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid lead ID' });
        }

        const lead = await Lead.findById(id);

        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        // Check if user owns the lead or is admin
        if (lead.userId.toString() !== req.user._id.toString() && req.user.role.name !== "ADMIN") {
            return res.status(403).json({ message: "You can only delete your own leads" });
        }

        // Remove lead from any groups it belongs to
        await Group.updateMany(
            { leads: id },
            { $pull: { leads: id } }
        );

        await Lead.findByIdAndDelete(id);
        res.status(200).json({ message: "Lead deleted successfully" });
    } catch (error) {
        handleError(res, error);
    }
};

// Import Leads
export const importLeads = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const csvData = req.file.buffer.toString();
        const records = csvData.split('\n').map(row => row.split(','));

        if (records.length === 0) {
            return res.status(400).json({ message: "CSV file is empty" });
        }

        const headers = records[0].map(header => sanitize(header));
        const leadData = records.slice(1).filter(row => row.length === headers.length).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = sanitize(row[index]);
            });
            return obj;
        });

        const createdLeads = [];
        const existingEmails = [];

        for (const data of leadData) {
            if (!data.firstName || !data.lastName || !data.phone) {
                console.warn('Skipping lead due to missing required fields:', data);
                continue;
            }

            if (!/^[0-9]{10,15}$/.test(data.phone)) {
                console.warn('Skipping lead due to invalid phone number format:', data.phone);
                continue;
            }

            if (data.email) {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                    console.warn('Skipping lead due to invalid email format:', data.email);
                    continue;
                }
                const existingLead = await Lead.findOne({ email: data.email });
                if (existingLead) {
                    existingEmails.push(data.email);
                    continue;
                }
            }

            const newLead = new Lead({
                userId: req.user._id,
                firstName: data.firstName,
                lastName: data.lastName,
                fullName: `${data.firstName} ${data.lastName}`,
                email: data.email || undefined,
                phone: data.phone,
                country: data.country || undefined,
                addresses: data.addressLine1 ? [{
                    line1: data.addressLine1,
                    line2: data.addressLine2,
                    line3: data.addressLine3,
                    pincode: data.pincode,
                    city: data.city,
                    state: data.state,
                    county: data.county,
                    country: data.country
                }] : [],
                userPreferences: {
                    policy: data.policy || "active",
                    whatsappMessageReceive: data.whatsappMessageReceive === 'true',
                    browserNotifications: data.browserNotifications === 'true',
                    emailReceive: data.emailReceive === 'true',
                },
                dates: {
                    joinDate: data.joinDate ? new Date(data.joinDate).getTime() : Date.now(),
                }
            });
            const savedLead = await newLead.save();
            createdLeads.push(savedLead);
        }

        res.status(200).json({
            message: `Successfully imported ${createdLeads.length} leads.`, 
            createdLeads,
            ...(existingEmails.length > 0 && { warnings: `Skipped ${existingEmails.length} leads with existing emails: ${existingEmails.join(', ')}` })
        });

    } catch (error) {
        console.error('Error importing leads:', error);
        handleError(res, error);
    }
};

// Export Leads
export const exportLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ userId: req.user._id }); // Only export leads for the logged-in user
        const fields = [
            { label: 'First Name', value: 'firstName' },
            { label: 'Last Name', value: 'lastName' },
            { label: 'Full Name', value: 'fullName' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Country', value: 'country' },
            { label: 'Policy', value: 'userPreferences.policy' },
            { label: 'Join Date', value: row => row.dates?.joinDate ? new Date(row.dates.joinDate).toLocaleDateString() : '' },
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(leads);

        res.header('Content-Type', 'text/csv');
        res.attachment('leads.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting leads:', error);
        handleError(res, error);
    }
};

// Generate Annual Review PDF
export const generateAnnualReviewPdf = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid lead ID' });
        }

        const lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Fetch total meetings for the lead and meeting history
        const meetings = await Meeting.find({ lead: id }).sort({ dateTime: 1 });

        // Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=annual_review_${lead.firstName}_${lead.lastName}.pdf`);

        // Pipe the PDF into the response
        doc.pipe(res);

        // --- PDF Structure and Content --- //

        const primaryColor = '#2c3e50'; // Dark Blue/Grey
        const secondaryColor = '#3498db'; // Lighter Blue
        const accentColor = '#2ecc71';  // Green Accent
        const textColor = '#333333';   // Dark Grey

        // --- 1. Cover Page ---
        const pageCenterX = doc.page.width / 2;

        // Title
        doc.fillColor(primaryColor).fontSize(60).text('Annual Review', {
            align: 'center',
            y: 70 // Fixed position from top
        });

        // Subtitle (Year)
        doc.fillColor(secondaryColor).fontSize(30).text('2024-2025', {
            align: 'center',
            y: 150 // Fixed position below title
        });

        // Client Name
        doc.fillColor(textColor).fontSize(24).text(`${lead.fullName}`, {
            align: 'center',
            y: 200 // Fixed position below subtitle
        });

        // Subtitle (Insights)
        doc.fontSize(16).text('Personalized Insights | Performance Summary | Future Recommendations', {
            align: 'center',
            y: 250 // Fixed position below client name
        });
        
        // Company Logo
        const logoPath = './public/images/logo.png'; // Path to your logo
        const logoWidth = 150;
        const logoHeight = 150;
        const centerX = (doc.page.width - logoWidth) / 2;
        const logoYPosition = 400; // Significantly increased fixed Y position for the logo
        doc.image(logoPath, centerX, logoYPosition, { width: logoWidth, height: logoHeight });
        
        // Date (placed well below the logo with very generous padding)
        const dateTextY = logoYPosition + logoHeight + 100; // Logo bottom + very generous padding (100 points)
        doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, {
            align: 'center',
            y: dateTextY // Fixed position
        });
        
        doc.addPage();

        // --- 2. Welcome & Summary Page ---
        doc.fillColor(primaryColor).fontSize(24).text('Welcome & Summary', { align: 'left' });
        doc.moveDown();
        doc.fillColor(textColor).fontSize(12).text('Thank you for trusting us with your financial journey.');
        doc.moveDown();
        doc.text('Advisor Name: [Your Advisor Name]');
        doc.text('Advisor Contact: [Advisor Email/Phone]');
        doc.moveDown();
        doc.fontSize(16).fillColor(secondaryColor).text('Quick Snapshot:');
        doc.moveDown(0.5);
        doc.fillColor(textColor).fontSize(12);
        doc.text('Total policies/investments: [X]');
        doc.text('Portfolio growth summary: [Y%]');
        doc.text('Key highlights of the year: [Summary]');
        doc.addPage();

        // --- 3. Personal Information (Optional Section) ---
        doc.fillColor(primaryColor).fontSize(24).text('Personal Information', { align: 'left' });
        doc.moveDown();
        doc.fillColor(textColor).fontSize(12);
        doc.text(`Client Name: ${lead.fullName}`);
        doc.text(`Age: [Client Age]`); // Placeholder
        doc.text(`Risk Profile: ${lead.userPreferences?.policy || 'N/A'}`);
        doc.text(`Goals: [e.g., Retirement by 2040, Child Education]`); // Placeholder
        doc.addPage();

        // --- 4. Portfolio Summary (Placeholder) ---
        doc.fillColor(primaryColor).fontSize(24).text('Portfolio Summary', { align: 'left' });
        doc.moveDown();
        doc.fillColor(textColor).fontSize(12).text('This section would include tables or charts showing investment types, amounts, current values, gains/losses, and percentage changes. It would also feature a pie chart for investment distribution and a line graph for year-over-year performance.');
        doc.text('Data for this section needs to be integrated from your financial tracking system.');
        doc.addPage();

        // --- 5. Policy Details (Placeholder) ---
        doc.fillColor(primaryColor).fontSize(24).text('Policy Details', { align: 'left' });
        doc.moveDown();
        doc.fillColor(textColor).fontSize(12).text('This section would list details for each policy, including Policy Name & No., Company Name, Start Date, Maturity Date, Premium Paid, Frequency, Nominee Name, and Policy Benefits.');
        doc.text('Individual policy data needs to be fetched and formatted here.');
        doc.addPage();

        // --- 6. Investment Plan Review (Placeholder) ---
        doc.fillColor(primaryColor).fontSize(24).text('Investment Plan Review', { align: 'left' });
        doc.moveDown();
        doc.fillColor(textColor).fontSize(12).text('This section would summarize SIPs, maturity timelines, return vs. benchmark, and any changes in risk assessment.');
        doc.text('Relevant investment plan data needs to be integrated.');
        doc.addPage();

        // --- Client Meeting Summary ---
        doc.fillColor(primaryColor).fontSize(24).text('Client Meeting Summary (2024–25)', { align: 'left' });
        doc.moveDown();

        if (meetings.length === 0) {
            doc.fillColor(textColor).fontSize(12).text('No meetings recorded for this period.');
        } else {
            const tableTop = doc.y;
            const col1X = 50;
            const col2X = 150;
            const col3X = 250;
            const col4X = 400;
            const rowHeight = 25;

            // Table Headers
            doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold');
            doc.text('Date', col1X, tableTop, { width: 90 });
            doc.text('Mode', col2X, tableTop, { width: 90 });
            doc.text('Key Discussion Points', col3X, tableTop, { width: 140 });
            doc.text('Action Taken / Notes', col4X, tableTop, { width: 140 });
            doc.moveDown();

            doc.font('Helvetica').fillColor(textColor);
            let currentY = tableTop + rowHeight;

            meetings.forEach(meeting => {
                doc.text(new Date(meeting.dateTime).toLocaleDateString(), col1X, currentY, { width: 90 });
                doc.text(meeting.type === 'annual_review' ? 'Annual Review' : meeting.type, col2X, currentY, { width: 90 });
                doc.text(meeting.notes || 'N/A', col3X, currentY, { width: 140 });
                doc.text('N/A', col4X, currentY, { width: 140 }); // Placeholder for Action Taken
                currentY += rowHeight;
                // Add a page if content overflows
                if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) {
                    doc.addPage();
                    currentY = doc.page.margins.top;
                    // Re-add headers on new page
                    doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold');
                    doc.text('Date', col1X, currentY, { width: 90 });
                    doc.text('Mode', col2X, currentY, { width: 90 });
                    doc.text('Key Discussion Points', col3X, currentY, { width: 140 });
                    doc.text('Action Taken / Notes', col4X, currentY, { width: 140 });
                    currentY += rowHeight;
                    doc.font('Helvetica').fillColor(textColor);
                }
            });
        }
        doc.addPage();

        // --- 7. Recommendations (Placeholder) ---
        doc.fillColor(primaryColor).fontSize(24).text('Recommendations', { align: 'left' });
        doc.moveDown();
        doc.fillColor(textColor).fontSize(12).text('This section would provide personalized recommendations based on the financial review. Examples:');
        doc.list(['Increase SIP to ₹10,000/month.', 'Shift ₹X from low-return plan to tax-saving instrument.', 'Consider Term Insurance due to changed life stage.']);
        doc.addPage();

        // --- 8. Upcoming Events & Reminders (Placeholder) ---
        doc.fillColor(primaryColor).fontSize(24).text('Upcoming Events & Reminders', { align: 'left' });
        doc.moveDown();
        doc.fillColor(textColor).fontSize(12).text('This section would list important dates like Maturity Date Reminders, Premium Due Dates, Tax-saving deadlines, and Goal tracking milestones.');
        doc.addPage();

        // --- 9. Advisor Comments / Final Notes (Placeholder) ---
        doc.fillColor(primaryColor).fontSize(24).text('Advisor Comments / Final Notes', { align: 'left' });
        doc.moveDown();
        doc.fillColor(textColor).fontSize(12).text('A personalized message from the advisor here.');
        doc.moveDown();
        doc.text('Looking forward to serving you in 2025 and beyond.');
        doc.addPage();

        // --- 10. Contact Info / QR Code ---
        doc.fillColor(primaryColor).fontSize(24).text('Contact Information', { align: 'center' });
        doc.moveDown();
        doc.fillColor(textColor).fontSize(12).text('Customer Support: [Your Support Number]', { align: 'center' });
        doc.text('Email: [Your Company Email]', { align: 'center' });
        doc.text('Office Address: [Your Office Address]', { align: 'center' });
        doc.moveDown();
        doc.text('WhatsApp QR Code Placeholder', { align: 'center' });

        // Finalize the PDF and end the stream
        doc.end();

    } catch (error) {
        console.error('Error generating annual review PDF:', error);
        handleError(res, error);
    }
};

