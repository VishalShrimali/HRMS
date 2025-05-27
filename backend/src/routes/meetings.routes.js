import express from "express";
import { Meeting } from "../models/meeting.models.js";
import { protect } from "../middleware/auth.middlware.js";

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
    const { dateTime, notes, type } = req.body;
    const meeting = new Meeting({
      lead: req.params.leadId,
      dateTime,
      notes,
      type: type || "annual_review"
    });
    await meeting.save();
    res.status(201).json({ meeting });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 