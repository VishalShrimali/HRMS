import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/BASEURL';
import { FiCalendar, FiClock, FiUser, FiDownload, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, X } from 'lucide-react';

const UpcomingMeetings = ({ onMeetingAdded }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/meetings/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Sort meetings by date, upcoming first
      const sortedMeetings = (response.data.meetings || [])
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
        .filter(meeting => new Date(meeting.dateTime) >= new Date()); // Only show upcoming meetings
      
      setMeetings(sortedMeetings);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch meetings');
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Expose the refresh function to parent components
  useEffect(() => {
    if (onMeetingAdded) {
      onMeetingAdded(fetchMeetings);
    }
  }, [onMeetingAdded]);

  const handleDownloadICS = async (meetingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/meetings/${meetingId}/ics`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-${meetingId}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download calendar file');
      console.error('Error downloading ICS:', err);
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

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upcoming Meetings</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

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
                      </div>
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
      </motion.div>
    </div>
  );
};

export default UpcomingMeetings; 