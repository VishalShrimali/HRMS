import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, addLead, deleteLead, updateLead } from '../api/api';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const data = await getLeads(config);
      setLeads(data);
    } catch (err) {
      setError('Failed to fetch leads. Please log in.');
      navigate('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await addLead(newLead, config);
      setLeads([...leads, response]);
      setNewLead({ name: '', email: '', phone: '' });
    } catch (err) {
      setError('Failed to add lead');
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await deleteLead(leadId, config);
      setLeads(leads.filter((lead) => lead._id !== leadId));
    } catch (err) {
      setError('Failed to delete lead');
    }
  };

  const handleUpdateLead = async (leadId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await updateLead(leadId, updatedData, config);
      setLeads(leads.map((lead) => (lead._id === leadId ? response : lead)));
    } catch (err) {
      setError('Failed to update lead');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Leads Management</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      <form onSubmit={handleAddLead} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newLead.name}
            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newLead.email}
            onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
            className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={newLead.phone}
            onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
            className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-200 w-full"
        >
          Add Lead
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-gray-700">Name</th>
              <th className="p-3 text-left text-gray-700">Email</th>
              <th className="p-3 text-left text-gray-700">Phone</th>
              <th className="p-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} className="border-t">
                <td className="p-3">{lead.name}</td>
                <td className="p-3">{lead.email}</td>
                <td className="p-3">{lead.phone}</td>
                <td className="p-3 flex space-x-2">
                  <button
                    onClick={() =>
                      handleUpdateLead(lead._id, {
                        ...lead,
                        name: `${lead.name} (Updated)`,
                      })
                    }
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteLead(lead._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leads;