import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/BASEURL';

const UpcomingMeetings = ({ refreshMeetingsFlag }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/meetings/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMeetings(response.data.meetings || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch meetings');
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [refreshMeetingsFlag]);

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">All Scheduled Meetings</h2>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No meetings scheduled yet</div>
      ) : (
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Date & Time</th>
              <th className="py-2 px-4 border-b">Lead</th>
              <th className="py-2 px-4 border-b">Notes</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Calendar</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(meeting => (
              <tr key={meeting._id}>
                <td className="py-2 px-4 border-b">{new Date(meeting.dateTime).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">{meeting.lead?.firstName} {meeting.lead?.lastName}</td>
                <td className="py-2 px-4 border-b">{meeting.notes}</td>
                <td className="py-2 px-4 border-b">{meeting.status}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleDownloadICS(meeting._id)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Add to Calendar
                  </button>
                  <a
                    href={getGoogleCalendarUrl(meeting)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 px-2 py-1 bg-blue-200 rounded hover:bg-blue-300"
                  >
                    Add to Google Calendar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UpcomingMeetings; 