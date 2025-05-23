import express from "express";
import { Meeting } from "../models/meeting.models.js";

const router = express.Router();

// GET /api/leads/:leadId/meetings - Get all meetings for a lead
router.get("/leads/:leadId/meetings", async (req, res) => {
  try {
    const meetings = await Meeting.find({ lead: req.params.leadId }).sort({ dateTime: -1 });
    res.json({ meetings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/leads/:leadId/meetings - Schedule a new meeting for a lead
router.post("/leads/:leadId/meetings", async (req, res) => {
  try {
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