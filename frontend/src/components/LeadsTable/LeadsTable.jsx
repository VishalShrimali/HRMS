import React, { useState, useEffect } from "react";

const LeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", position: "" });
  const [editId, setEditId] = useState(null);

  // Fetch Leads (Simulated API)
  useEffect(() => {
    const storedLeads = JSON.parse(localStorage.getItem("leads")) || [];
    setLeads(storedLeads);
  }, []);

  // Save to Local Storage
  const saveToLocalStorage = (updatedLeads) => {
    localStorage.setItem("leads", JSON.stringify(updatedLeads));
    setLeads(updatedLeads);
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add Lead
  const handleAddLead = () => {
    if (!formData.name || !formData.email || !formData.position) return;

    const newLead = { id: Date.now(), ...formData };
    const updatedLeads = [...leads, newLead];

    saveToLocalStorage(updatedLeads);
    setFormData({ name: "", email: "", position: "" });
  };

  // Edit Lead
  const handleEditLead = (id) => {
    const leadToEdit = leads.find((lead) => lead.id === id);
    setFormData(leadToEdit);
    setEditId(id);
  };

  // Update Lead
  const handleUpdateLead = () => {
    const updatedLeads = leads.map((lead) =>
      lead.id === editId ? { ...lead, ...formData } : lead
    );

    saveToLocalStorage(updatedLeads);
    setEditId(null);
    setFormData({ name: "", email: "", position: "" });
  };

  // Delete Lead
  const handleDeleteLead = (id) => {
    const updatedLeads = leads.filter((lead) => lead.id !== id);
    saveToLocalStorage(updatedLeads);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Leads Management</h2>

      {/* Form to Add/Edit Leads */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          name="name"
          placeholder="Employee Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="email"
          name="email"
          placeholder="Employee Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="text"
          name="position"
          placeholder="Position"
          value={formData.position}
          onChange={handleChange}
          className="border p-2 rounded w-1/4"
        />
        {editId ? (
          <button onClick={handleUpdateLead} className="bg-blue-500 text-white px-4 py-2 rounded">
            Update
          </button>
        ) : (
          <button onClick={handleAddLead} className="bg-green-500 text-white px-4 py-2 rounded">
            Add
          </button>
        )}
      </div>

      {/* Leads Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Position</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="text-center">
              <td className="border p-2">{lead.name}</td>
              <td className="border p-2">{lead.email}</td>
              <td className="border p-2">{lead.position}</td>
              <td className="border p-2">
                <button onClick={() => handleEditLead(lead.id)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteLead(lead.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;
