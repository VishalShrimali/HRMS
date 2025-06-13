import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [showMeetingHistory, setShowMeetingHistory] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!lead?._id) return;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/leads/${lead._id}/meetings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeetings(response.data.meetings || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch meetings');
      } finally {
        setLoading(false);
      }
    };

    if (showModal) {
      fetchMeetings();
      // Set default meeting title using lead's name
      setMeetingTitle(`Annual Review with ${lead?.firstName} ${lead?.lastName}`);
    }
  }, [lead?._id, showModal]);

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !meetingTitle || !meetingLink) {
      setError('Please fill out all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const meetingDateTime = new Date(`${selectedDate}T${selectedTime}`);
      await axios.post(
        `${API_BASE_URL}/leads/${lead._id}/meetings`,
        {
          dateTime: meetingDateTime.toISOString(),
          title: meetingTitle, // Send title
          link: meetingLink,   // Send link
          notes: meetingNotes,
          type: 'annual_review',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const response = await axios.get(`${API_BASE_URL}/leads/${lead._id}/meetings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeetings(response.data.meetings || []);
      setSelectedDate('');
      setSelectedTime('');
      setMeetingNotes('');
      setMeetingTitle('');
      setMeetingLink('');
      setShowCalendar(false);

      if (onMeetingScheduled) {
        onMeetingScheduled();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
    }
  };

  const handleDownloadAnnualReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/leads/${lead._id}/annual-review`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Ensure the response is treated as a binary file
      });

      // Create a URL for the file and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Annual_Review_${lead?.firstName}_${lead?.lastName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download annual review:', err);
      setError('Failed to download annual review. Please try again.');
    }
  };

  if (!showModal) return null;

  return (
    <dialog
      open={showModal}
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h5 className="text-2xl font-semibold text-gray-800">
              Annual Review - {lead?.firstName} {lead?.lastName}
            </h5>
            <p className="text-sm text-gray-500">Manage meetings and download annual review report</p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowModal(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Calendar className="mr-2" size={20} />
            Schedule Meeting
          </button>
          <button
            onClick={handleDownloadAnnualReview}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Download className="mr-2" size={20} />
            Download Annual Review
          </button>
        </div>

        {/* Schedule Meeting Form */}
        {showCalendar && (
          <form onSubmit={handleScheduleMeeting} className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h6 className="text-lg font-medium text-gray-700 mb-4">Schedule New Meeting</h6>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter meeting title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter meeting link"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Notes</label>
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
            {showMeetingHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                    className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="mr-2" size={16} />
                        <span>{new Date(meeting.dateTime).toLocaleString()}</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          meeting.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Notes:</strong> {meeting.notes || 'No notes'}
                      </p>
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