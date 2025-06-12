import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import axios from 'axios';
import { API_BASE_URL } from '../../api/BASEURL';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function RedesignedMeetingsCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/meetings/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const meetings = response.data.meetings || [];
        const formattedEvents = meetings.map((meeting) => ({
          title: meeting.title || `Meeting with ${meeting.lead?.firstName} ${meeting.lead?.lastName}`,
          start: new Date(meeting.dateTime),
          end: new Date(new Date(meeting.dateTime).getTime() + 60 * 60 * 1000), // 1-hour duration
          notes: meeting.notes,
          link: meeting.link,
        }));

        setEvents(formattedEvents);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch meetings');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleEventClick = (event) => {
    if (event.link) {
      window.open(event.link, '_blank');
    } else {
      alert(`Meeting Details:\nTitle: ${event.title}\nNotes: ${event.notes || 'No notes available.'}`);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Meetings Calendar</h2>
        {error && (
          <div className="text-red-700 bg-red-100 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
      {loading ? (
        <div className="text-center text-gray-500 text-lg">Loading meetings...</div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '80vh', margin: '20px' }}
          onSelectEvent={handleEventClick} // Handle event clicks
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '5px',
              padding: '5px',
            },
          })}
        />
      )}
    </div>
  );
}

export { RedesignedMeetingsCalendar as default };