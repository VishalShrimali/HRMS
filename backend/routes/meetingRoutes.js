const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get all meetings
router.get('/all', meetingController.getAllMeetings);

// Get meetings for a specific lead
router.get('/leads/:leadId', meetingController.getLeadMeetings);

// Create a new meeting
router.post('/leads/:leadId', meetingController.createMeeting);

// Update a meeting
router.put('/:meetingId', meetingController.updateMeeting);

// Delete a meeting
router.delete('/:meetingId', meetingController.deleteMeeting);

// Generate ICS file for a meeting
router.get('/:meetingId/ics', meetingController.generateICS);

module.exports = router; 