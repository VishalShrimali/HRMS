import express from "express";
import { Meeting } from "../models/meeting.models.js";
import { protect } from "../middleware/auth.middlware.js";
import { Lead } from "../models/leads.models.js";
import ics from "ics";
import { sendEmail } from "../utils/email.utils.js";

const router = express.Router({mergeParams:true});

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/v1/leads/:leadId/meetings - Get all meetings for a lead
router.get("/", async (req, res) => {
  try {
    const meetings = await Meeting.find({ lead: req.params.leadId }).sort({ dateTime: -1 });
    res.json({ meetings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/leads/:leadId/meetings - Schedule a new meeting for a lead
router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const { dateTime, notes, type, title, link } = req.body;

    // Create a new meeting with the logged-in user's ID and selected lead's ID
    const meeting = new Meeting({
      lead: req.params.leadId, // Lead ID from the route parameter
      user: req.user._id,      // Logged-in user's ID from the authentication middleware
      dateTime,
      notes,
      type: type || "annual_review",
      title,                   // Store the title
      link                     // Store the link
    });

    await meeting.save();

    // Email reminder logic
    const lead = await Lead.findById(req.params.leadId);
    if (lead && lead.email) {
      const meetingTime = new Date(dateTime);
      const reminderTime = new Date(meetingTime.getTime() - 60 * 60 * 1000); // 1 hour before
      const now = new Date();
      const msUntilReminder = reminderTime - now;
      if (msUntilReminder > 0) {
        setTimeout(async () => {
          await sendEmail(
            lead.email,
            "Meeting Reminder",
            `You have a meeting scheduled at ${meetingTime.toLocaleString()}.\nNotes: ${notes || ""}`
          );
        }, msUntilReminder);
      }
    }

    res.status(201).json({ meeting });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/meetings/all - Get all meetings for the logged-in user
router.get("/all", async (req, res) => {
  try {
    // First find all leads owned by this user
    const leads = await Lead.find({ userId: req.user._id }).select("_id");
    const leadIds = leads.map(l => l._id);

    // const response = req.user._id;
    
    
    // Then find all meetings for these leads
    const meetings = await Meeting.find({ lead: { $in: leadIds } })
      .populate({
        path: "lead",
        select: "firstName lastName email phone" // Only populate necessary lead fields
      })
      .sort({ dateTime: 1 });
    
    res.json({ meetings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/meetings/:meetingId/ics - Export a meeting as an ICS file
router.get("/:meetingId/ics", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId).populate("lead");
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    const event = {
      start: [
        meeting.dateTime.getFullYear(),
        meeting.dateTime.getMonth() + 1,
        meeting.dateTime.getDate(),
        meeting.dateTime.getHours(),
        meeting.dateTime.getMinutes()
      ],
      duration: { hours: 1 },
      title: `Meeting with ${meeting.lead.firstName} ${meeting.lead.lastName}`,
      description: meeting.notes || "",
      status: meeting.status,
    };
    ics.createEvent(event, (error, value) => {
      if (error) return res.status(500).json({ message: error.message });
      res.setHeader("Content-Type", "text/calendar");
      res.setHeader("Content-Disposition", `attachment; filename=meeting-${meeting._id}.ics`);
      res.send(value);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/meetings/upcoming - Get all upcoming meetings for the logged-in user
router.get("/upcoming", async (req, res) => {
  try {
    const leads = await Lead.find({ userId: req.user._id }).select("_id");
    const leadIds = leads.map(l => l._id);
    const currentDate = new Date();
    
    const meetings = await Meeting.find({
      lead: { $in: leadIds },
      dateTime: { $gte: currentDate }
    })
    .populate("lead")
    .sort({ dateTime: 1 });
    
    res.json({ meetings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;