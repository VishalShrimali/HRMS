import React, { useState, useEffect } from "react";
import { getLeads, addLead, updateLead, deleteLead } from "../../api/LeadsApi";

const LeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLead, setEditingLead] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthday: "",
    country: "",
    joiningDate: "",
    tags: "",
    role: "Employee",
    status: "Active",
    group: "",
  });

  const token = localStorage.getItem("token");
  const apiConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeads(apiConfig);
      setLeads(Array.isArray(data.leads) ? data.leads : data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName) errors.fullName = "Full name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Valid email is required";
    if (!formData.phone || !/^\d{10}$/.test(formData.phone))
      errors.phone = "Valid 10-digit phone number is required";
    if (!formData.joiningDate) errors.joiningDate = "Joining date is required";
    if (!formData.birthday) errors.birthday = "Birthday is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let response;
      if (editingLead) {
        response = await updateLead(editingLead._id, formData, apiConfig);
        setLeads(leads.map(lead => (lead._id === editingLead._id ? response.lead : lead)));
      } else {
        response = await addLead(formData, apiConfig);
        setLeads([...leads, response.lead]);
      }
      setShowModal(false);
      resetForm();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save lead");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead(id, apiConfig);
        setLeads(leads.filter(lead => lead._id !== id));
        setSelectedLeads(selectedLeads.filter(selectedId => selectedId !== id));
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete lead");
      }
    }
  };

  const handleGroupSelected = () => {
    if (selectedLeads.length === 0 || !groupName) {
      alert("Please select leads and enter a group name");
      return;
    }
    setLeads(leads.map(lead => 
      selectedLeads.includes(lead._id) ? { ...lead, group: groupName } : lead
    ));
    setSelectedLeads([]);
    setGroupName("");
  };

  const handleExport = () => {
    const csv = [
      "Full Name,Email,Phone,Status,Country,Joining Date,Birthday,Tags,Group",
      ...leads.map(lead =>
        `${lead.fullName},${lead.email},${lead.phone},${lead.status},${lead.country},${lead.joiningDate},${lead.birthday},${lead.tags || ""},${lead.group || ""}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    console.log("Selected file:", file);
    alert("Import functionality to be implemented! File selected: " + file.name);
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      birthday: "",
      country: "",
      joiningDate: "",
      tags: "",
      role: "Employee",
      status: "Active",
      group: "",
    });
    setEditingLead(null);
    setFormErrors({});
  };

  const handleCheckboxChange = (id) => {
    setSelectedLeads(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  // Filter leads for tabs
  const filteredLeads = leads.filter(lead =>
    lead.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedLeads = filteredLeads.filter(lead => lead.group);

  // Group leads by group name for the Groups tab
  const groupedByName = groupedLeads.reduce((acc, lead) => {
    const group = lead.group || "Ungrouped";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(lead);
    return acc;
  }, {});

  const renderTable = (leadsToShow) => (
    <div className="h-[calc(100vh-12rem)] overflow-auto">
      <table className="table-auto w-full text-left border-collapse border border-gray-300">
        <thead className="sticky top-0 bg-gray-100 z-10">
          <tr>
            <th className="border px-2 py-1">
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelectedLeads(e.target.checked ? leadsToShow.map(lead => lead._id) : [])
                }
                checked={selectedLeads.length === leadsToShow.length && leadsToShow.length > 0}
              />
            </th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Country</th>
            <th className="border px-2 py-1">Birthday</th>
            <th className="border px-2 py-1">Joining</th>
            <th className="border px-2 py-1">Tags</th>
            <th className="border px-2 py-1">Group</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leadsToShow.map((lead) => (
            <tr key={lead._id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedLeads.includes(lead._id)}
                  onChange={() => handleCheckboxChange(lead._id)}
                />
              </td>
              <td className="border px-2 py-1">{lead.fullName}</td>
              <td className="border px-2 py-1">{lead.email}</td>
              <td className="border px-2 py-1">{lead.phone}</td>
              <td className="border px-2 py-1">{lead.status || "N/A"}</td>
              <td className="border px-2 py-1">{lead.country || "N/A"}</td>
              <td className="border px-2 py-1">{lead.birthday}</td>
              <td className="border px-2 py-1">{lead.joiningDate}</td>
              <td className="border px-2 py-1">{lead.tags || "N/A"}</td>
              <td className="border px-2 py-1">{lead.group || "N/A"}</td>
              <td className="border px-2 py-1 whitespace-nowrap">
                <button
                  onClick={() => {
                    setEditingLead(lead);
                    setFormData(lead);
                    setShowModal(true);
                  }}
                  className="text-blue-500 mr-2 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(lead._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="ml-64 mt-16 mr-2 p-2 h-[calc(100vh-4rem)] overflow-hidden">
      <div className="mb-2">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === "personal" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Leads
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "groups" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>
        </div>
      </div>

      <div className="flex justify-between mb-2 flex-wrap gap-2">
        <div className="relative w-1/3 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name..."
            className="border border-gray-300 rounded-lg py-1 pl-8 pr-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
        <div className="flex space-x-2 flex-wrap gap-2">
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Add Lead
          </button>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border border-gray-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-colors"
              onClick={handleGroupSelected}
            >
              Group Selected
            </button>
          </div>
          <label className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors cursor-pointer">
            Import
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
            onClick={handleExport}
          >
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading...
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <>
          {activeTab === "personal" && renderTable(filteredLeads)}
          {activeTab === "groups" && (
            <div className="h-[calc(100vh-12rem)] overflow-auto">
              {Object.keys(groupedByName).length === 0 ? (
                <div className="text-center py-4">No grouped leads found.</div>
              ) : (
                Object.entries(groupedByName).map(([group, groupLeads]) => (
                  <div key={group} className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{group}</h3>
                    {renderTable(groupLeads)}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-lg font-bold mb-3">
              {editingLead ? "Edit Lead" : "Add New Lead"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`mt-1 border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${
                      formErrors.fullName ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${
                      formErrors.email ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`mt-1 border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${
                      formErrors.phone ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Birthday</label>
                  <input
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleChange}
                    className={`mt-1 border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${
                      formErrors.birthday ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {formErrors.birthday && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.birthday}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                  <input
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className={`mt-1 border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${
                      formErrors.joiningDate ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {formErrors.joiningDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.joiningDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <input
                    name="tags"
                    type="text"
                    value={formData.tags}
                    onChange={handleChange}
                    className="mt-1 border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Group</label>
                  <input
                    name="group"
                    type="text"
                    value={formData.group}
                    onChange={handleChange}
                    className="mt-1 border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;