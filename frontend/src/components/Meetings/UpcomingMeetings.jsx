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
        console.log('Fetching meetings with token:', token); // Debugging log
        const response = await axios.get(`${API_BASE_URL}/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Meetings fetched:', response.data); // Debugging log
        setMeetings(response.data.meetings || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching meetings:', err); // Debugging log
        setError(err.response?.data?.message || 'Failed to fetch meetings');
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [refreshMeetingsFlag]);

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    } else {
      alert('Meeting link is not available.');
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">All Meetings</h2>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No meetings found</div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    Meeting with {meeting.lead?.firstName} {meeting.lead?.lastName}
                  </h3>
                  <p className="text-gray-600">Scheduled at: {formatDateTime(meeting.dateTime)}</p>
                  {meeting.notes && <p className="mt-2 text-gray-700">Notes: {meeting.notes}</p>}
                  <p className="mt-2 text-gray-700">Status: {meeting.status}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleJoinMeeting(meeting.link)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Join Meeting
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingMeetings;