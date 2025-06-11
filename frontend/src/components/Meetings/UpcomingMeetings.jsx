import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/BASEURL';
import { useNavigate } from 'react-router-dom';

const UpcomingMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/meetings`, {
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

  const handleStatusChange = async (meetingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/meetings/${meetingId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMeetings(); // Refresh the meetings list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update meeting status');
    }
  };

  const handleDelete = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMeetings(); // Refresh the meetings list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete meeting');
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

  if (loading) {
    return <div className="text-center py-4">Loading meetings...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Upcoming Meetings</h2>
        
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No meetings scheduled yet
        </div>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{meeting.title}</h3>
                  <p className="text-gray-600 mt-1">
                    {new Date(meeting.dateTime).toLocaleString()}
                  </p>
                  {meeting.location && (
                    <p className="text-gray-600 mt-1">
                      Location: {meeting.location}
                    </p>
                  )}
                  {meeting.notes && (
                    <p className="text-gray-600 mt-2">{meeting.notes}</p>
                  )}
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Duration: {meeting.duration} minutes
                    </p>
                    <p className="text-sm text-gray-500">
                      Type: {meeting.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={meeting.status}
                    onChange={(e) => handleStatusChange(meeting._id, e.target.value)}
                    className="px-2 py-1 border rounded"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => handleDelete(meeting._id)}
                    className="px-2 py-1 text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {meeting.attendees && meeting.attendees.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Attendees
                  </h4>
                  <div className="space-y-1">
                    {meeting.attendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {attendee.name} ({attendee.email})
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          attendee.response === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : attendee.response === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attendee.response}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingMeetings; 