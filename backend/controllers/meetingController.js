const Meeting = require('../models/Meeting');
const ical = require('ical-generator');
const { isValidObjectId } = require('mongoose');

// Get all meetings
exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate('lead', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ dateTime: 1 });

    res.json({ meetings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings', error: error.message });
  }
};

// Get meetings for a specific lead
exports.getLeadMeetings = async (req, res) => {
  try {
    const { leadId } = req.params;
    if (!isValidObjectId(leadId)) {
      return res.status(400).json({ message: 'Invalid lead ID' });
    }

    const meetings = await Meeting.find({ lead: leadId })
      .populate('lead', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ dateTime: 1 });

    res.json({ meetings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lead meetings', error: error.message });
  }
};

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    const { dateTime, notes, type } = req.body;
    const { leadId } = req.params;
    
    if (!isValidObjectId(leadId)) {
      return res.status(400).json({ message: 'Invalid lead ID' });
    }

    const meeting = new Meeting({
      lead: leadId,
      dateTime,
      notes,
      type,
      createdBy: req.user._id
    });

    await meeting.save();
    
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('lead', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({ meeting: populatedMeeting });
  } catch (error) {
    res.status(500).json({ message: 'Error creating meeting', error: error.message });
  }
};

// Update a meeting
exports.updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { dateTime, notes, type, status } = req.body;

    if (!isValidObjectId(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const meeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { dateTime, notes, type, status },
      { new: true }
    ).populate('lead', 'firstName lastName email')
     .populate('createdBy', 'firstName lastName');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({ meeting });
  } catch (error) {
    res.status(500).json({ message: 'Error updating meeting', error: error.message });
  }
};

// Delete a meeting
exports.deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    if (!isValidObjectId(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const meeting = await Meeting.findByIdAndDelete(meetingId);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meeting', error: error.message });
  }
};

// Generate ICS file for a meeting
exports.generateICS = async (req, res) => {
  try {
    const { meetingId } = req.params;

    if (!isValidObjectId(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const meeting = await Meeting.findById(meetingId)
      .populate('lead', 'firstName lastName email');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const calendar = ical({ name: 'Meeting Calendar' });
    
    calendar.createEvent({
      start: meeting.dateTime,
      end: new Date(new Date(meeting.dateTime).getTime() + 60 * 60 * 1000), // 1 hour duration
      summary: `Meeting with ${meeting.lead.firstName} ${meeting.lead.lastName}`,
      description: meeting.notes,
      location: 'Virtual Meeting',
      url: process.env.FRONTEND_URL
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=meeting-${meetingId}.ics`);
    
    res.send(calendar.toString());
  } catch (error) {
    res.status(500).json({ message: 'Error generating ICS file', error: error.message });
  }
}; 