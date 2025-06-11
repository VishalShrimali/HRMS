import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/BASEURL';
import { X, FileText, CalendarPlus, History } from 'lucide-react';
import ScheduleMeeting from '../Meetings/ScheduleMeeting';

const AnnualReviewModal = ({ lead, onClose, onMeetingScheduled }) => {
  const [meetingHistory, setMeetingHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    const fetchMeetingHistory = async () => {
      if (!lead || !lead._id) {
        setHistoryError('Lead information is missing.');
        setLoadingHistory(false);
        return;
      }

      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setHistoryError('Authentication token missing. Please log in.');
          setLoadingHistory(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/meetings/lead/${lead._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMeetingHistory(response.data.meetings || []);
      } catch (err) {
        console.error('Error fetching meeting history:', err);
        setHistoryError(err.response?.data?.message || 'Failed to fetch meeting history.');
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchMeetingHistory();
  }, [lead]);

  const handleDownloadAnnualReview = async () => {
    if (!lead || !lead._id) {
      setDownloadError('Lead information is missing. Cannot download annual review.');
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setDownloadError('Authentication token missing. Please log in.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/leads/${lead._id}/annual-review-pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Annual_Review_${lead.firstName}_${lead.lastName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);

    } catch (err) {
      console.error('Error downloading annual review:', err);
      setDownloadError(err.response?.data?.message || 'Failed to download annual review. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleScheduleButtonClick = () => {
    if (!lead || !lead._id) {
      setDownloadError('Lead information is missing. Cannot schedule meeting.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setDownloadError('You are not authenticated. Please log in again.');
      return;
    }
    setShowScheduleModal(true);
  };

  const handleMeetingScheduled = () => {
    setShowScheduleModal(false);
    if (onMeetingScheduled) {
      onMeetingScheduled();
    }
    // Re-fetch meeting history after a new meeting is scheduled
    const fetchMeetingHistory = async () => {
      if (!lead || !lead._id) return;
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get(`${API_BASE_URL}/meetings/lead/${lead._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMeetingHistory(response.data.meetings || []);
      } catch (err) {
        console.error('Error re-fetching meeting history:', err);
        setHistoryError(err.response?.data?.message || 'Failed to re-fetch meeting history.');
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchMeetingHistory();
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 ring-1 ring-gray-100">
        <div className="flex justify-between items-center pb-2 mb-3 border-b border-gray-200">
          <h2 className="text-xl font-extrabold text-gray-900">Annual Review</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Lead Information Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-lg shadow-lg flex items-center justify-between">
            <h3 className="text-base font-semibold">
              Review for {lead.firstName} {lead.lastName}
            </h3>
            <span className="text-xs opacity-80">ID: {lead._id.substring(0, 8)}...</span>
          </div>

          {/* Annual Review Document Section */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200 shadow-md flex flex-col items-center text-center overflow-hidden transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
            <div className="absolute inset-0 bg-pattern-dots opacity-10"></div> {/* Subtle background pattern */}
            <FileText size={28} className="text-blue-600 mb-2 animate-fade-in" />
            <h3 className="text-base font-extrabold text-gray-900 mb-1">Annual Review Document</h3>
            <p className="text-gray-700 mb-3 text-xs max-w-prose leading-relaxed">Generate and download the annual review document for <span className="font-semibold text-blue-700">{lead.firstName} {lead.lastName}</span>.</p>
            {downloadError && <p className="text-red-500 text-xs mb-2">Error: {downloadError}</p>}
            <button
              onClick={handleDownloadAnnualReview}
              className="relative w-full max-w-[180px] px-3 py-1.5 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95 transform"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </span>
              ) : (
                <><FileText size={14} /> Download PDF</>
              )}
            </button>
          </div>

          {/* Meeting History Section */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <History size={28} className="text-gray-600" />
              <h3 className="text-base font-bold text-gray-800">Meeting History</h3>
            </div>
            {loadingHistory ? (
              <div className="text-center py-3 text-gray-500 flex flex-col items-center">
                <div className="animate-spin text-xl mb-1">⟳</div>
                <p className="text-xs">Loading meeting history...</p>
              </div>
            ) : historyError ? (
              <div className="text-center py-3 text-red-500 text-xs">
                <p className="font-medium">Error: {historyError}</p>
              </div>
            ) : meetingHistory.length > 0 ? (
              <ul className="space-y-2">
                {meetingHistory.map(meeting => (
                  <li key={meeting._id} className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-xs shadow-sm hover:shadow-md transition-shadow">
                    <p className="font-medium text-sm mb-0.5">{meeting.title || 'Untitled Meeting'}</p>
                    <p className="text-gray-600 text-xs">Date: {new Date(meeting.dateTime).toLocaleDateString()}</p>
                    <p className="text-gray-600 text-xs">Time: {new Date(meeting.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    {meeting.notes && <p className="text-gray-700 mt-1 italic break-words">Notes: {meeting.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-center py-3 text-xs">No previous meetings found for this lead.</p>
            )}
          </div>

          {/* Schedule New Meeting Button */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-md flex flex-col items-center text-center">
            <CalendarPlus size={28} className="text-green-500 mb-2" />
            <h3 className="text-base font-bold text-gray-800 mb-1">Schedule New Meeting</h3>
            <p className="text-gray-600 mb-3 text-xs">Arrange a new meeting with <span className="font-semibold text-green-700">{lead.firstName} {lead.lastName}</span>.</p>
            <button
              onClick={handleScheduleButtonClick}
              className="w-full max-w-[180px] px-3 py-1.5 bg-green-700 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 font-semibold text-sm flex items-center justify-center gap-1 shadow-sm hover:shadow-md"
            >
              <CalendarPlus size={14} /> Schedule Meeting
            </button>
          </div>
        </div>

        {showScheduleModal && (
          <ScheduleMeeting
            lead={lead}
            meetingType="annual_review"
            onClose={() => setShowScheduleModal(false)}
            onMeetingScheduled={handleMeetingScheduled}
          />
        )}
      </div>
    </div>
  );
};

export default AnnualReviewModal;