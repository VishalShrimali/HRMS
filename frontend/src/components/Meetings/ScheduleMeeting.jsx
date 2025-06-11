import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../api/BASEURL';
import { Plus, X, User, Calendar } from 'lucide-react';

// Helper function to format ISO string to YYYY-MM-DDTHH:mm for datetime-local input
const formatDateTimeForInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const ScheduleMeeting = ({ lead: propLead, onClose, meetingType: propMeetingType }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize states directly based on propLead presence
  const [selectedLead, setSelectedLead] = useState(propLead || null);
  const [formData, setFormData] = useState({
    title: propLead ? `Annual Review - ${propLead.firstName} ${propLead.lastName}` : '',
    dateTime: '',
    duration: 60,
    notes: '',
    attendees: []
  });
  const [loading, setLoading] = useState(!propLead);
  const [error, setError] = useState(null);
  const [meetingData, setMeetingData] = useState(null);

  useEffect(() => {
    if (propLead) {
      setError(null);
    } else {
      let currentLead = null;
      let currentMeetingData = null;

      const storedData = sessionStorage.getItem('meetingData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          if (data && data.lead) {
            currentLead = data.lead;
            currentMeetingData = data;
            sessionStorage.removeItem('meetingData');
          }
        } catch (err) {
          console.error("Error parsing meeting data from sessionStorage:", err);
        }
      }

      if (!currentLead) {
        const dataParam = searchParams.get('data');
        if (dataParam) {
          try {
            const data = JSON.parse(decodeURIComponent(dataParam));
            if (data && data.lead && data.lead._id) {
              currentLead = data.lead;
              currentMeetingData = data;
            } else {
              setError('Invalid lead data provided from previous page.');
            }
          } catch (err) {
            console.error("Error parsing meeting data from URL:", err);
            setError('Invalid meeting data provided. Please try again.');
          }
        }
      }

      if (currentLead) {
        setSelectedLead(currentLead);
        setMeetingData(currentMeetingData);
        setFormData(prev => ({
          ...prev,
          title: currentMeetingData?.title || `Annual Review - ${currentLead.firstName} ${currentLead.lastName}`,
          dateTime: formatDateTimeForInput(currentMeetingData?.dateTime),
          duration: currentMeetingData?.duration || 60,
          notes: currentMeetingData?.notes || '',
          attendees: currentMeetingData?.attendees || []
        }));
      } else {
        setError('No lead information available. Please go back and select a lead.');
      }
      setLoading(false);
    }
  }, [propLead, searchParams, propMeetingType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttendeeChange = (index, field, value) => {
    setFormData(prev => {
      const newAttendees = [...prev.attendees];
      newAttendees[index] = {
        ...newAttendees[index],
        [field]: value
      };
      return {
        ...prev,
        attendees: newAttendees
      };
    });
  };

  const addAttendee = () => {
    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, { email: '', name: '', response: 'pending' }]
    }));
  };

  const removeAttendee = (index) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  const handleSchedule = async () => {
    setError(null);
    console.log('ScheduleMeeting: handleSchedule initiated.');
    try {
      if (!selectedLead?._id) {
        setError('Lead information is missing. Please try again.');
        console.error('ScheduleMeeting: Lead information missing.');
        return;
      }

      if (!formData.title || !formData.dateTime) {
        setError('Title and Date & Time are required to schedule a meeting.');
        console.error('ScheduleMeeting: Title or DateTime missing.', { title: formData.title, dateTime: formData.dateTime });
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        navigate('/auth/login');
        console.error('ScheduleMeeting: Authentication token missing.');
        return;
      }

      const meetingDateTime = new Date(formData.dateTime);
      
      if (isNaN(meetingDateTime.getTime())) {
        setError('Invalid date or time selected.');
        console.error('ScheduleMeeting: Invalid dateTime.', formData.dateTime);
        return;
      }

      if (meetingDateTime < new Date()) {
        setError('Please select a future date and time for the meeting.');
        console.error('ScheduleMeeting: Past date selected.', meetingDateTime);
        return;
      }

      const allAttendees = [];
      const primaryLeadEmail = selectedLead?.email;

      if (primaryLeadEmail) {
        allAttendees.push({
          email: primaryLeadEmail,
          name: `${selectedLead?.firstName || ''} ${selectedLead?.lastName || ''}`.trim(),
          response: 'pending'
        });
      }

      formData.attendees.forEach(att => {
        if (att.email && att.email !== primaryLeadEmail) {
          allAttendees.push(att);
        }
      });

      const meetingPayload = {
        ...formData,
        dateTime: meetingDateTime.toISOString(),
        lead: selectedLead._id,
        type: propMeetingType || meetingData?.type || 'annual_review',
        attendees: allAttendees
      };

      console.log('ScheduleMeeting: Attempting to send meeting data to backend:', meetingPayload);

      const response = await axios.post(
        `${API_BASE_URL}/meetings`,
        meetingPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.meeting) {
        console.log('ScheduleMeeting: Meeting scheduled successfully!', response.data.meeting);
        alert('Meeting scheduled successfully!');
        if (onClose) onClose();
        // Optionally, call a refresh function from parent if needed
      } else {
        setError('Failed to create meeting. The server did not return expected data.');
        console.error('ScheduleMeeting: Server did not return expected meeting data.', response.data);
      }
    } catch (err) {
      console.error('ScheduleMeeting: Error scheduling meeting:', err.response?.data || err.message || err);
      setError(err.response?.data?.message || 'Failed to schedule meeting. Please check your inputs and try again.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm w-full mx-auto ring-1 ring-gray-100">
          <div className="animate-spin text-4xl mb-4 text-blue-500">⟳</div>
          <p className="text-gray-700 text-lg font-medium">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm w-full mx-auto ring-1 ring-gray-100">
          <div className="text-red-500 mb-4">
            <X size={48} className="inline-block" />
          </div>
          <p className="font-semibold text-red-700 text-lg mb-2">Error: {error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!selectedLead) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm w-full mx-auto ring-1 ring-gray-100">
          <div className="text-gray-500 mb-4">
            <User size={48} className="inline-block" />
          </div>
          <p className="font-semibold text-gray-700 text-lg mb-2">No lead selected.</p>
          <p className="text-gray-500 text-sm mb-4">Please select a lead first from the leads table or annual review to schedule a meeting.</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200 font-medium shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100 ring-1 ring-gray-100">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
          <h2 className="text-2xl font-extrabold text-gray-900">Schedule Meeting</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {selectedLead && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg flex items-center justify-between mb-4 shadow-sm">
            <span className="font-medium text-sm">
              Meeting for: {selectedLead.firstName} {selectedLead.lastName}
            </span>
            <span className="text-xs opacity-70">ID: {selectedLead._id.substring(0, 8)}...</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSchedule(); }} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Annual Review, Follow-up Meeting"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                min="10"
                max="240"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any specific details or agenda points..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            ></textarea>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><User size={14} /> Attendees</h3>
            <p className="text-xs text-gray-500 mb-2">The primary lead is automatically included. Add other attendees below.</p>
            <div className="space-y-1.5">
              {formData.attendees.map((attendee, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={attendee.name}
                    onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                    placeholder="Name (Optional)"
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="email"
                    value={attendee.email}
                    onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                    placeholder="Email (Required)"
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeAttendee(index)}
                    className="p-0.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAttendee}
              className="mt-2.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors duration-200 text-xs font-medium flex items-center gap-1 shadow-sm hover:shadow-md"
            >
              <Plus size={12} /> Add Attendee
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMeeting; 