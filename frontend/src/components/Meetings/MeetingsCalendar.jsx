import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
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

function MeetingsCalendar() {
  const [events, setEvents] = useState([]);

  return (
    <div className="h-[calc(100vh-4rem)] p-4">
      <div className="bg-white rounded-lg shadow p-4 h-full">
        <h2 className="text-2xl font-semibold mb-4">Meetings Calendar</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100% - 3rem)' }}
        />
      </div>
    </div>
  );
}

export { MeetingsCalendar as default }; 