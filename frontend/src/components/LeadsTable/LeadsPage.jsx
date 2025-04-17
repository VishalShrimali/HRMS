// LeadsPage.jsx or LeadsTable.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const location = useLocation();

  const getGroupIdFromQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get("groupId");
  };

  useEffect(() => {
    const groupId = getGroupIdFromQuery();

    const fetchLeads = async () => {
      try {
        let url = "/api/leads";
        if (groupId) {
          url = `/api/leads/group/${groupId}`; // Filtered API endpoint
        }

        const response = await axios.get(url);
        setLeads(response.data);
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };

    fetchLeads();
  }, [location.search]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Assigned Leads</h2>
      {leads.length === 0 ? (
        <p>No leads found for this group.</p>
      ) : (
        <ul className="space-y-2">
          {leads.map((lead) => (
            <li key={lead._id} className="p-3 bg-white rounded shadow">
              {lead.name} - {lead.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LeadsPage;
