import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, Clock, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/BASEURL';

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
  const [showMeetingHistory, setShowMeetingHistory] = useState(false);

  // Fetch meetings history
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!lead?._id) return;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/leads/${lead._id}/meetings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMeetings(response.data.meetings || []);
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
      
      await axios.post(
        `${API_BASE_URL}/leads/${lead._id}/meetings`,
        {
          dateTime: meetingDateTime.toISOString(),
          notes: meetingNotes,
          type: 'annual_review'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh meetings list
      const response = await axios.get(`${API_BASE_URL}/leads/${lead._id}/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(response.data.meetings || []);
      
      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setMeetingNotes('');
      setShowCalendar(false);
      
      if (onMeetingScheduled) {
        onMeetingScheduled();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
      console.error('Error scheduling meeting:', err);
      console.error('Full error object:', err);
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
            onClick={() => setShowCalendar(!showCalendar)}
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

        {/* Schedule Meeting Form */}
        {showCalendar && (
          <form onSubmit={handleScheduleMeeting} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h6 className="font-medium text-gray-700 mb-4">Schedule New Meeting</h6>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Notes
              </label>
              <textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add any notes about the meeting..."
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCalendar(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Schedule Meeting
              </button>
            </div>
          </form>
        )}

        {/* Meeting History */}
        <div className="mt-6">
          <h6
            className="text-xl font-semibold text-gray-800 mb-4 cursor-pointer flex items-center justify-between"
            onClick={() => setShowMeetingHistory(!showMeetingHistory)}
          >
            Meeting History
            {showMeetingHistory ? <ChevronUp size={20} className="ml-2" /> : <ChevronDown size={20} className="ml-2" />}
          </h6>
          {showMeetingHistory && (
            loading ? (
              <div className="text-center py-4 text-gray-500">Loading meetings...</div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No meeting history found.</div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="mr-2" size={16} />
                        <span>{new Date(meeting.dateTime).toLocaleString()}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Notes:</strong> {meeting.notes || 'No notes'}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadICS(meeting._id);
                          }}
                          className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                        >
                          Add to Calendar
                        </button>
                        <a
                          href={getGoogleCalendarUrl(meeting)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-200 rounded text-sm hover:bg-blue-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Add to Google Calendar
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </dialog>
  );
};

export default AnnualReviewModal;