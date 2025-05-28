import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../../api/BASEURL';
import { useNavigate } from 'react-router-dom';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const EventComponent = ({ event }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="flex flex-col p-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow border border-blue-200/40 cursor-pointer transition-all duration-200"
    style={{ minWidth: 0 }}
  >
    <div className="flex items-center gap-2 mb-1">
      <FiCalendar className="text-lg opacity-80 shrink-0" />
      <div className="font-semibold text-sm truncate">{event.title}</div>
    </div>
    <div className="flex items-center gap-2 text-xs opacity-90">
      <FiClock className="shrink-0" />
      <span>{format(new Date(event.start), 'h:mm a')}</span>
    </div>
    {event.lead && (
      <div className="flex items-center gap-2 text-xs opacity-90 mt-1">
        <FiUser className="shrink-0" />
        <span>{event.lead.firstName} {event.lead.lastName}</span>
      </div>
    )}
  </motion.div>
);

function MeetingsCalendar() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.MONTH);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', start: null, end: null, lead: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  // Fetch meetings from backend
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/meetings/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.meetings) {
        const formattedEvents = response.data.meetings.map(meeting => ({
          ...meeting,
          title: meeting.type ? `${meeting.type.replace('_', ' ')} Meeting` : 'Meeting',
          description: meeting.notes || '',
          start: new Date(meeting.dateTime),
          end: new Date(new Date(meeting.dateTime).getTime() + 60 * 60 * 1000),
          lead: meeting.lead
        }));
        setEvents(formattedEvents);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch meetings');
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads for the dropdown
  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data.leads || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchLeads();
  }, []);

  const handleSelectSlot = useCallback(({ start, end }) => {
    setNewEvent({ title: '', description: '', start, end, lead: null });
    setShowModal(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setNewEvent(event);
    setShowModal(true);
  }, []);

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end || !newEvent.lead) {
      setError('Please fill in all required fields');
      return;
    }

    if (!newEvent.lead._id) {
      setError('Invalid lead selected');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/leads/${newEvent.lead._id}/meetings`,
        {
          dateTime: newEvent.start,
          notes: newEvent.description,
          type: 'custom',
          title: newEvent.title
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.meeting) {
        await fetchMeetings();
        setShowModal(false);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create meeting');
      console.error('Error creating meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-48 sm:h-64 opacity-60 p-4">
      <FiCalendar className="text-5xl sm:text-6xl mb-2 text-blue-300" />
      <div className="text-base sm:text-lg font-medium text-center">No meetings scheduled yet</div>
      <div className="text-xs sm:text-sm text-gray-500 text-center">Click the + button to add your first meeting!</div>
    </div>
  );

  // Custom prop getter for day background
  const dayPropGetter = useCallback(date => {
    const hasMeeting = events.some(event => {
      const eventStartDate = new Date(event.start);
      // Compare dates by day, month, and year
      return (
        eventStartDate.getDate() === date.getDate() &&
        eventStartDate.getMonth() === date.getMonth() &&
        eventStartDate.getFullYear() === date.getFullYear()
      );
    });

    if (hasMeeting) {
      return { className: 'has-meeting' };
    } else {
      return {};
    }
  }, [events]);

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl mx-auto bg-white/90 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-8 h-full border border-white/40"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)', minHeight: 420 }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">Meetings Calendar</h2>
        </div>
        <div className="calendar-container min-h-[300px] sm:min-h-[400px] overflow-x-auto rounded-xl bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-blue-500 font-semibold">Loading meetings...</div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600, minWidth: 320 }}
              view={view}
              onView={setView}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              components={{ event: EventComponent }}
              eventPropGetter={() => ({ className: 'cursor-pointer' })}
              className="rounded-xl overflow-x-auto bg-white"
              messages={{ month: '', week: '', day: '', agenda: '' }}
              dayPropGetter={dayPropGetter}
            />
          )}
          {!loading && events.length === 0 && <EmptyState />}
        </div>
        {/* Floating Action Button */}
        <button
          className="fixed bottom-6 right-6 sm:bottom-12 sm:right-12 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-xl p-4 sm:p-5 flex items-center justify-center transition-all duration-200 border-4 border-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.18)' }}
          onClick={() => {
            setNewEvent({ title: '', description: '', start: new Date(), end: new Date(), lead: null });
            setShowModal(true);
          }}
          aria-label="Add Meeting"
        >
          <FiPlus className="text-2xl sm:text-3xl" />
        </button>
        {/* Modal for adding/editing events */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-xs sm:max-w-md mx-auto"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-blue-700">
                  {newEvent._id ? 'Edit Meeting' : 'Add Meeting'}
                </h3>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                      value={newEvent.lead?._id || ''}
                      onChange={e => {
                        const selectedLead = leads.find(l => l._id === e.target.value);
                        if (selectedLead) {
                          setNewEvent(prev => ({ 
                            ...prev, 
                            lead: selectedLead,
                            title: prev.title || `Meeting with ${selectedLead.firstName} ${selectedLead.lastName}`
                          }));
                        } else {
                          setNewEvent(prev => ({ ...prev, lead: null }));
                        }
                      }}
                    >
                      <option value="">Select a lead</option>
                      {leads.map(lead => (
                        <option key={lead._id} value={lead._id}>
                          {lead.firstName} {lead.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                      placeholder="Meeting Title"
                      value={newEvent.title}
                      onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                      placeholder="Description"
                      value={newEvent.description}
                      onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                        value={newEvent.start ? format(newEvent.start, "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={e => setNewEvent(prev => ({ ...prev, start: new Date(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                        value={newEvent.end ? format(newEvent.end, "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={e => setNewEvent(prev => ({ ...prev, end: new Date(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddEvent}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-sm"
                    onClick={() => {
                      setShowModal(false);
                      setError(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default MeetingsCalendar; 