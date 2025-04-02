import React, { useState, useEffect, useRef } from "react";
import { getLeads, addLead, updateLead, deleteLead } from "../../api/LeadsApi";
import {
  Search, Filter, Upload, Download, Plus, ChevronLeft, ChevronRight,
  Edit, Trash, Users, X
} from "lucide-react";

const LeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLead, setEditingLead] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLeads, setSelectedLeads] = useState([]);

  // Updated formData to match the fields in the image
  const [formData, setFormData] = useState({
    contactGroup: "",
    shareLead: "",
    pipeline: "",
    firstName: "",
    lastName: "",
    email: "",
    country: "USA (+1)", // Default value as shown in the image
    phoneNumber: "",
    secondPhoneNumber: "",
    otherInformation: "",
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
    if (!formData.firstName) errors.firstName = "First Name is required";
    if (!formData.lastName) errors.lastName = "Last Name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Valid email is required";
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber))
      errors.phoneNumber = "Valid 10-digit phone number is required";
    if (formData.secondPhoneNumber && !/^\d{10}$/.test(formData.secondPhoneNumber))
      errors.secondPhoneNumber = "Valid 10-digit phone number is required";
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await addLead(formData, apiConfig);
      setLeads([...leads, response.lead]);
      setShowAddModal(false);
      resetForm();
      setError(null);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lead");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await updateLead(editingLead._id, formData, apiConfig);
      setLeads(leads.map((lead) => (lead._id === editingLead._id ? response.lead : lead)));
      setShowEditModal(false);
      resetForm();
      setError(null);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lead");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead(id, apiConfig);
        setLeads(leads.filter((lead) => lead._id !== id));
        setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id));
        setError(null);
        fetchLeads();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete lead");
      }
    }
  };

  const handleExport = () => {
    const csv = [
      "First Name,Last Name,Email,Country,Phone Number,Second Phone Number,Other Information",
      ...leads.map((lead) =>
        `${lead.firstName},${lead.lastName},${lead.email},${lead.country || "N/A"},${ LEAD.phoneNumber || "N/A"},${lead.secondPhoneNumber || "N/A"},${lead.otherInformation || "N/A"}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const rows = e.target.result.split("\n").slice(1); // Skip header
      for (const row of rows) {
        const [firstName, lastName, email, country, phoneNumber, secondPhoneNumber, otherInformation] = row.split(",").map((item) => item.trim());
        if (firstName && lastName && email) { // Ensure required fields are present
          try {
            await addLead({ firstName, lastName, email, country, phoneNumber, secondPhoneNumber, otherInformation }, apiConfig);
          } catch (err) {
            console.error("Error importing lead:", err);
            setError(err.response?.data?.message || "Failed to import lead");
          }
        }
      }
      fetchLeads(); // Refresh table after import
    };
    reader.readAsText(file);
  };

  const resetForm = () => {
    setFormData({
      contactGroup: "",
      shareLead: "",
      pipeline: "",
      firstName: "",
      lastName: "",
      email: "",
      country: "USA (+1)",
      phoneNumber: "",
      secondPhoneNumber: "",
      otherInformation: "",
    });
    setEditingLead(null);
    setFormErrors({});
  };

  const handleSelectLead = (id) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(paginatedLeads.map((lead) => lead._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const filteredLeads = leads.filter((lead) =>
    (lead.firstName + " " + lead.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const fileInputRef = useRef(null);

  return (
    <div className="ml-5 mt-5 mr-5 p-4 h-[calc(100vh-2rem)] overflow-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Users className="mr-2" size={20} />
          <h2 className="mb-0 text-xl font-semibold">Leads</h2>
          <small className="ml-2 text-gray-500">({leads.length} Records Found)</small>
        </div>
        <div className="flex items-center">
          <div className="relative mr-2">
            <input
              type="text"
              className="pl-8 form-control border border-gray-300 rounded p-2 w-52"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Search className="absolute left-2 top-2.5" size={16} />
          </div>
          <button
            className="bg-gray-800 text-white px-3 py-2 rounded flex items-center hover:bg-gray-700"
            onClick={() => {/* Implement filter functionality */}}
          >
            <Filter className="mr-1" size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Import/Export and Add New Section */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".csv"
          />
          <button
            className="bg-gray-800 text-white px-3 py-2 rounded flex items-center mr-2 hover:bg-gray-700"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload className="mr-1" size={16} /> Import
          </button>
          <button
            className="bg-gray-800 text-white px-3 py-2 rounded flex items-center mr-2 hover:bg-gray-700"
            onClick={handleExport}
          >
            <Download className="mr-1" size={16} /> Export
          </button>
        </div>
        <div className="flex items-center">
          <select
            className="form-select border border-gray-300 rounded p-2 mr-2 w-20"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button
            className="bg-gray-800 text-white px-3 py-2 rounded flex items-center hover:bg-gray-700"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-1" size={16} /> Add New
          </button>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      onChange={handleSelectAll}
                      checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                    />
                  </th>
                  <th className="border border-gray-300 p-2 text-left">Name & Email</th>
                  <th className="border border-gray-300 p-2 text-left">Country</th>
                  <th className="border border-gray-300 p-2 text-left">Phone</th>
                  <th className="border border-gray-300 p-2 text-left">Tags</th>
                  <th className="border border-gray-300 p-2 text-left">Date</th>
                  <th className="border border-gray-300 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={selectedLeads.includes(lead._id)}
                        onChange={() => handleSelectLead(lead._id)}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <div>{lead.firstName} {lead.lastName}</div>
                      <div className="text-gray-500 text-sm">{lead.email}</div>
                    </td>
                    <td className="border border-gray-300 p-2">{lead.country || "N/A"}</td>
                    <td className="border border-gray-300 p-2">{lead.phoneNumber || "N/A"}</td>
                    <td className="border border-gray-300 p-2">{lead.tags || "N/A"}</td>
                    <td className="border border-gray-300 p-2">{lead.date || "N/A"}</td>
                    <td className="border border-gray-300 p-2">
                      <button
                        className="bg-gray-500 text-white px-2 py-1 rounded mr-2 flex items-center inline-flex hover:bg-gray-600"
                        onClick={() => {
                          setEditingLead(lead);
                          setFormData({
                            contactGroup: lead.contactGroup || "",
                            shareLead: lead.shareLead || "",
                            pipeline: lead.pipeline || "",
                            firstName: lead.firstName || "",
                            lastName: lead.lastName || "",
                            email: lead.email || "",
                            country: lead.country || "USA (+1)",
                            phoneNumber: lead.phoneNumber || "",
                            secondPhoneNumber: lead.secondPhoneNumber || "",
                            otherInformation: lead.otherInformation || "",
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <Edit size={14} className="mr-1" /> Edit
                      </button>
                      <button
                        className="bg-gray-800 text-white px-2 py-1 rounded flex items-center inline-flex hover:bg-gray-900"
                        onClick={() => handleDelete(lead._id)}
                      >
                        <Trash size={14} className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="flex justify-center mt-6">
            <button
              className="bg-white border border-gray-300 rounded-l px-3 py-1 flex items-center disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-1 border-t border-b border-gray-300 flex items-center">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              className="bg-white border border-gray-300 rounded-r px-3 py-1 flex items-center disabled:opacity-50"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b p-4">
              <h5 className="text-lg font-semibold">Add Leads</h5>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleAddSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactGroup" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Group
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="contactGroup"
                      name="contactGroup"
                      value={formData.contactGroup}
                      onChange={handleChange}
                    >
                      <option value="">Select Group</option>
                      {/* Add options as needed */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="shareLead" className="block text-sm font-medium text-gray-700 mb-1">
                      Share Lead
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="shareLead"
                      name="shareLead"
                      value={formData.shareLead}
                      onChange={handleChange}
                    >
                      <option value="">Select or search</option>
                      {/* Add options as needed */}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Tags
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                    >
                      <option value="">Select Tags...</option>
                      {/* Add options as needed */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pipeline" className="block text-sm font-medium text-gray-700 mb-1">
                      Pipelines
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="pipeline"
                      name="pipeline"
                      value={formData.pipeline}
                      onChange={handleChange}
                    >
                      <option value="">--Select Pipeline--</option>
                      {/* Add options as needed */}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.firstName && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.firstName}</div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.lastName && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.lastName}</div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.email && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.email}</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="USA (+1)">USA (+1)</option>
                      {/* Add more country options as needed */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.phoneNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                    {formErrors.phoneNumber && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="secondPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Second Phone Number
                    </label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.secondPhoneNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      id="secondPhoneNumber"
                      name="secondPhoneNumber"
                      value={formData.secondPhoneNumber}
                      onChange={handleChange}
                    />
                    {formErrors.secondPhoneNumber && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.secondPhoneNumber}</div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="otherInformation" className="block text-sm font-medium text-gray-700 mb-1">
                    Other Information
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="otherInformation"
                    name="otherInformation"
                    value={formData.otherInformation}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400"
                    onClick={() => setShowAddModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b p-4">
              <h5 className="text-lg font-semibold">Edit Lead</h5>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactGroup" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Group
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="contactGroup"
                      name="contactGroup"
                      value={formData.contactGroup}
                      onChange={handleChange}
                    >
                      <option value="">Select Group</option>
                      {/* Add options as needed */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="shareLead" className="block text-sm font-medium text-gray-700 mb-1">
                      Share Lead
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="shareLead"
                      name="shareLead"
                      value={formData.shareLead}
                      onChange={handleChange}
                    >
                      <option value="">Select or search</option>
                      {/* Add options as needed */}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Tags
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                    >
                      <option value="">Select Tags...</option>
                      {/* Add options as needed */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pipeline" className="block text-sm font-medium text-gray-700 mb-1">
                      Pipelines
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="pipeline"
                      name="pipeline"
                      value={formData.pipeline}
                      onChange={handleChange}
                    >
                      <option value="">--Select Pipeline--</option>
                      {/* Add options as needed */}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.firstName && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.firstName}</div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.lastName && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.lastName}</div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.email && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.email}</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="USA (+1)">USA (+1)</option>
                      {/* Add more country options as needed */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.phoneNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                    {formErrors.phoneNumber && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="secondPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Second Phone Number
                    </label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.secondPhoneNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      id="secondPhoneNumber"
                      name="secondPhoneNumber"
                      value={formData.secondPhoneNumber}
                      onChange={handleChange}
                    />
                    {formErrors.secondPhoneNumber && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.secondPhoneNumber}</div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="otherInformation" className="block text-sm font-medium text-gray-700 mb-1">
                    Other Information
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="otherInformation"
                    name="otherInformation"
                    value={formData.otherInformation}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400"
                    onClick={() => setShowEditModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;