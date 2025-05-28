const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['annual_review', 'follow_up', 'initial', 'custom'],
    default: 'custom'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
meetingSchema.index({ dateTime: 1 });
meetingSchema.index({ lead: 1 });
meetingSchema.index({ status: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting; 