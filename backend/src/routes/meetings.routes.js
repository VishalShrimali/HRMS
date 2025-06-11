import express from "express";
import { Meeting } from "../models/meeting.models.js";
import { protect } from "../middleware/auth.middlware.js";
import { Lead } from "../models/leads.models.js";
import ics from "ics";
import { sendEmail } from "../utils/email.utils.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/v1/meetings - Get all meetings for the logged-in user
router.get("/", async (req, res) => {
  try {
    console.log('Fetching meetings for user:', req.user._id);
    const leads = await Lead.find({ userId: req.user._id }).select("_id");
    const leadIds = leads.map(l => l._id);
    
    const meetings = await Meeting.find({ 
      $or: [
        { lead: { $in: leadIds } },
        { createdBy: req.user._id }
      ]
    })
    .populate("lead")
    .populate("createdBy", "fullName email")
    .sort({ dateTime: 1 });
    
    console.log('Found meetings:', meetings.length);
    res.json({ meetings });
  } catch (err) {
    console.error('Error fetching meetings:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/meetings - Schedule a new meeting
router.post("/", async (req, res) => {
  console.log('Backend: Received new meeting request. Body:', req.body);
  try {
    const { 
      lead, 
      dateTime, 
      notes, 
      type, 
      title, 
      duration, 
      location, 
      attendees 
    } = req.body;

    // Validate required fields
    if (!lead || !dateTime || !title) {
      console.error('Backend: Missing required fields in request body.', { lead, dateTime, title });
      return res.status(400).json({ 
        message: "Missing required fields: lead, dateTime, and title are required" 
      });
    }

    // Validate lead exists and belongs to user
    const leadDoc = await Lead.findOne({ 
      _id: lead, 
      userId: req.user._id 
    });
    
    if (!leadDoc) {
      console.error('Backend: Lead not found or not authorized.', { leadId: lead, userId: req.user._id });
      return res.status(404).json({ message: "Lead not found or not authorized" });
    }

    const meeting = new Meeting({
      lead,
      dateTime: new Date(dateTime),
      notes,
      type: type || "annual_review",
      title,
      duration: duration || 60,
      location,
      attendees: attendees || [],
      createdBy: req.user._id,
      status: "scheduled"
    });

    console.log('Backend: Saving meeting:', meeting);
    await meeting.save();
    console.log('Backend: Meeting saved successfully.');

    // Send email notifications
    const meetingTime = new Date(dateTime);
    
    try {
      // Send to the user who created the meeting
      if (req.user && req.user.email) {
        await sendEmail(
          req.user.email,
          "Meeting Confirmation",
          `You have successfully scheduled a meeting:\n\nTitle: ${title}\nDate: ${meetingTime.toLocaleString()}\nDuration: ${duration} minutes\nLocation: ${location || 'Not specified'}\n\nNotes: ${notes || ""}`
        );
      }

      // Send to lead
      if (leadDoc.email) {
        await sendEmail(
          leadDoc.email,
          "Meeting Scheduled",
          `A meeting has been scheduled with you:\n\nTitle: ${title}\nDate: ${meetingTime.toLocaleString()}\nDuration: ${duration} minutes\nLocation: ${location || 'Not specified'}\n\nNotes: ${notes || ""}`
        );
      }

      // Send to attendees
      if (attendees && attendees.length > 0) {
        for (const attendee of attendees) {
          if (attendee.email) {
            await sendEmail(
              attendee.email,
              "Meeting Invitation",
              `You have been invited to a meeting:\n\nTitle: ${title}\nDate: ${meetingTime.toLocaleString()}\nDuration: ${duration} minutes\nLocation: ${location || 'Not specified'}\n\nNotes: ${notes || ""}`
            );
          }
        }
      }

      // Schedule reminder email (1 hour before)
      const reminderTime = new Date(meetingTime.getTime() - 60 * 60 * 1000); 
      const now = new Date();
      const msUntilReminder = reminderTime - now;
      
      if (msUntilReminder > 0) {
        setTimeout(async () => {
          try {
            if (leadDoc.email) {
              await sendEmail(
                leadDoc.email,
                "Meeting Reminder",
                `Reminder: You have a meeting scheduled in 1 hour:\n\nTitle: ${title}\nDate: ${meetingTime.toLocaleString()}\nDuration: ${duration} minutes\nLocation: ${location || 'Not specified'}`
              );
            }
            if (attendees && attendees.length > 0) {
              for (const attendee of attendees) {
                if (attendee.email) {
                  await sendEmail(
                    attendee.email,
                    "Meeting Reminder",
                    `Reminder: You have a meeting scheduled in 1 hour:\n\nTitle: ${title}\nDate: ${meetingTime.toLocaleString()}\nDuration: ${duration} minutes\nLocation: ${location || 'Not specified'}`
                  );
                }
              }
            }
          } catch (reminderEmailErr) {
            console.error('Backend: Error sending reminder email:', reminderEmailErr);
          }
        }, msUntilReminder);
      }

    } catch (emailErr) {
      console.error('Backend: Error sending initial emails:', emailErr);
      // Don't fail the request if email sending fails, just log it
    }

    res.status(201).json({ meeting });
  } catch (err) {
    console.error('Backend: Error creating meeting:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/meetings/:id - Get a specific meeting
router.get("/:id", async (req, res) => {
  try {
    console.log('Backend: Fetching meeting:', req.params.id);
    const meeting = await Meeting.findById(req.params.id)
      .populate("lead")
      .populate("createdBy", "fullName email");
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if user has access to this meeting
    const lead = await Lead.findById(meeting.lead);
    if (!lead || (lead.userId.toString() !== req.user._id.toString() && 
        meeting.createdBy.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized to view this meeting" });
    }

    res.json({ meeting });
  } catch (err) {
    console.error('Backend: Error fetching meeting:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/v1/meetings/:id - Update a meeting
router.put("/:id", async (req, res) => {
  try {
    console.log('Backend: Updating meeting:', req.params.id, req.body);
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if user has access to update this meeting
    if (meeting.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this meeting" });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate("lead").populate("createdBy", "fullName email");

    res.json({ meeting: updatedMeeting });
  } catch (err) {
    console.error('Backend: Error updating meeting:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/v1/meetings/:id - Delete a meeting
router.delete("/:id", async (req, res) => {
  try {
    console.log('Backend: Deleting meeting:', req.params.id);
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if user has access to delete this meeting
    if (meeting.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this meeting" });
    }

    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: "Meeting deleted successfully" });
  } catch (err) {
    console.error('Backend: Error deleting meeting:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router; 