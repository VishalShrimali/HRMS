import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, Clock, Plus, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/BASEURL';
import { useNavigate } from 'react-router-dom';

const AnnualReviewModal = ({
  showModal,
  setShowModal,
  lead,
  onMeetingScheduled,
}) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const navigate = useNavigate();

  // Fetch meetings history
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!lead?._id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/leads/${lead._id}/meetings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort meetings by date, most recent first
        const sortedMeetings = (response.data.meetings || []).sort((a, b) => 
          new Date(b.dateTime) - new Date(a.dateTime)
        );
        
        setMeetings(sortedMeetings);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch meetings');
        console.error('Error fetching meetings:', err);
      } finally {
        setLoading(false);
      }
    };

    if (showModal) {
      fetchMeetings();
    }
  }, [lead?._id, showModal]);

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/leads/${lead._id}/annual-review`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annual-review-${lead.firstName}-${lead.lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download PDF');
      console.error('Error downloading PDF:', err);
    }
  };

  // Handle schedule meeting
  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const meetingDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      const response = await axios.post(
        `${API_BASE_URL}/leads/${lead._id}/meetings`,
        {
          dateTime: meetingDateTime.toISOString(),
          notes: meetingNotes,
          type: 'annual_review'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update meetings state with the new meeting
      setMeetings(prevMeetings => [...prevMeetings, response.data.meeting]);
      
      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setMeetingNotes('');
      setShowCalendar(false);
      
      // Notify parent component to refresh upcoming meetings
      if (onMeetingScheduled) {
        onMeetingScheduled();
      }
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
      console.error('Error scheduling meeting:', err);
    }
  };

  const handleDownloadICS = async (meetingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/ics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        alert('Failed to download calendar file');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-${meetingId}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download calendar file');
    }
  };

  function getGoogleCalendarUrl(meeting) {
    const title = encodeURIComponent(`Meeting with ${meeting.lead?.firstName || ''} ${meeting.lead?.lastName || ''}`);
    const description = encodeURIComponent(meeting.notes || '');
    const start = new Date(meeting.dateTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour meeting
    const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dates = `${formatDate(start)}/${formatDate(end)}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${description}`;
  }

  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.start && newEvent.end && lead._id) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/leads/${lead._id}/meetings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dateTime: newEvent.start,
            notes: newEvent.description,
            type: 'custom', // or whatever type you want
          }),
        });
        if (response.ok) {
          await fetchMeetings(); // Refresh meetings from backend
          // Notify parent component to refresh upcoming meetings
          if (onMeetingScheduled) {
            onMeetingScheduled();
          }
          setShowModal(false);
        } else {
          const error = await response.json();
          setError(error.message || 'Failed to create meeting');
        }
      } catch (err) {
        setError('Failed to create meeting');
        console.error('Error creating meeting:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Example function to add a meeting
  async function addMeeting({ dateTime, notes, type }) {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/v1/meetings/general', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dateTime, notes, type }),
    });
    if (!response.ok) throw new Error('Failed to add meeting');
    return await response.json();
  }

  async function fetchMeetings() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/v1/meetings', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch meetings');
    return (await response.json()).meetings;
  }

  if (!showModal) return null;

  return (
    <dialog
      open={showModal}
      className="fixed w-full m-0 h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h5 className="text-xl font-semibold text-gray-800">
              Annual Review - {lead?.firstName} {lead?.lastName}
            </h5>
            <p className="text-sm text-gray-500 mt-1">
              Manage meetings and download annual review report
            </p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowModal(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => navigate('/calendar', { state: { openAddModal: true, prefill: { lead } } })}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Calendar className="mr-2" size={16} />
            Schedule Meeting
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Download className="mr-2" size={16} />
            Download Annual Review
          </button>
        </div>

        {/* Meetings History */}
        <div>
          <h6 className="font-semibold text-lg text-blue-700 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-400" size={20} />
            Meeting History
          </h6>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading meetings...</div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              <Calendar className="mx-auto mb-2" size={32} />
              No meetings scheduled yet
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {meetings.map((meeting) => {
                // Color and icon based on status
                let statusColor = "bg-yellow-100 text-yellow-800";
                let borderColor = "border-yellow-300";
                let statusIcon = <Clock className="text-yellow-500" size={16} />;
                if (meeting.status === "completed") {
                  statusColor = "bg-green-100 text-green-800";
                  borderColor = "border-green-300";
                  statusIcon = <CheckCircle className="text-green-500" size={16} />;
                } else if (meeting.status === "cancelled") {
                  statusColor = "bg-red-100 text-red-800";
                  borderColor = "border-red-300";
                  statusIcon = <X className="text-red-500" size={16} />;
                }

                return (
                  <div
                    key={meeting._id}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border-l-4 ${borderColor} bg-white shadow`}
                  >
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gray-700 font-medium text-base">
                        <Clock className="text-blue-400" size={18} />
                        {new Date(meeting.dateTime).toLocaleString()}
                        {meeting.type && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                            {meeting.type.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      {meeting.lead && (
                        <div className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                          <span className="font-semibold">Lead:</span> {meeting.lead.firstName} {meeting.lead.lastName}
                        </div>
                      )}
                      {meeting.notes && (
                        <div className="text-gray-500 text-sm mt-1">
                          {meeting.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        {statusIcon}
                        {meeting.status}
                      </span>
                      <button
                        onClick={() => handleDownloadICS(meeting._id)}
                        className="ml-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                      >
                        <Download size={14} />
                        ICS
                      </button>
                      <a
                        href={getGoogleCalendarUrl(meeting)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                      >
                        <Calendar size={14} />
                        Google Calendar
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default AnnualReviewModal; 