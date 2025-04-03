import React, { useState, useEffect, useRef } from "react";
import { getLeads, addLead, updateLead, deleteLead } from "../../api/LeadsApi";
import {
  Search, Upload, Download, Plus, ChevronLeft, ChevronRight,
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
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "USA (+1)",
    phoneNumber: "",
    secondPhoneNumber: "",
    date: "",
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
      const response = await addLead({ ...formData, date: new Date().toISOString() }, apiConfig);
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
      "First Name,Last Name,Email,Country,Phone Number,Second Phone Number,Date",
      ...leads.map((lead) =>
        `${lead.firstName},${lead.lastName},${lead.email},${lead.country || "N/A"},${lead.phoneNumber || "N/A"},${lead.secondPhoneNumber || "N/A"},${lead.date || "N/A"}`
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
      const rows = e.target.result.split("\n").slice(1);
      for (const row of rows) {
        const [firstName, lastName, email, country, phoneNumber, secondPhoneNumber, date] = row.split(",").map((item) => item.trim());
        if (firstName && lastName && email) {
          try {
            await addLead({ firstName, lastName, email, country, phoneNumber, secondPhoneNumber, date }, apiConfig);
          } catch (err) {
            console.error("Error importing lead:", err);
            setError(err.response?.data?.message || "Failed to import lead");
          }
        }
      }
      fetchLeads();
    };
    reader.readAsText(file);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      country: "USA (+1)",
      phoneNumber: "",
      secondPhoneNumber: "",
      date: "",
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
    <div className="flex h-screen">
      {/* Sidebar */}
      {/* <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold">HRMS DASHBOARD</h1>
        </div>
        <nav className="flex-1">
          <ul>
            <li className="p-4 hover:bg-gray-700">
              <a href="#" className="flex items-center">
                <Users className="mr-2" size={20} /> Dashboard
              </a>
            </li>
            <li className="p-4 bg-blue-500">
              <a href="#" className="flex items-center">
                <Users className="mr-2" size={20} /> Leads
              </a>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <a href="#" className="flex items-center">
                <Users className="mr-2" size={20} /> Email Editor
              </a>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <a href="#" className="flex items-center">
                <Users className="mr-2" size={20} /> Employees
              </a>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <a href="#" className="flex items-center">
                <Users className="mr-2" size={20} /> Settings
              </a>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <a href="#" className="flex items-center">
                <Users className="mr-2" size={20} /> Logout
              </a>
            </li>
          </ul>
        </nav>
        <div className="p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center mr-2">
              JD
            </div>
            <div>
              <p className="font-semibold">John Doe</p>
              <p className="text-sm text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto bg-white">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Users className="mr-2" size={20} />
            <h2 className="text-2xl font-semibold text-gray-800">Leads</h2>
            <span className="ml-2 text-gray-500">({leads.length} Records Found)</span>
          </div>
          <div className="relative">
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-72 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-6 py-2 -mb-px ${activeTab === "personal" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"} font-medium focus:outline-none`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Leads
          </button>
          <button
            className={`px-6 py-2 -mb-px ${activeTab === "groups" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"} font-medium focus:outline-none ml-2`}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>
        </div>

        {/* Controls Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".csv"
            />
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
              onClick={() => fileInputRef.current.click()}
            >
              <Upload className="mr-2" size={16} /> Import
            </button>
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
              onClick={handleExport}
            >
              <Download className="mr-2" size={16} /> Export
            </button>
          </div>
          <div className="flex space-x-4 items-center">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 w-20 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="mr-2" size={16} /> Add New
            </button>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full bg-white shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        onChange={handleSelectAll}
                        checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-semibold">Name & Email</th>
                    <th className="p-4 text-left text-sm font-semibold">Country</th>
                    <th className="p-4 text-left text-sm font-semibold">Phone</th>
                    <th className="p-4 text-left text-sm font-semibold">Date</th>
                    <th className="p-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedLeads.includes(lead._id)}
                          onChange={() => handleSelectLead(lead._id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </td>
                      <td className="p-4 text-gray-700">{lead.country || "N/A"}</td>
                      <td className="p-4 text-gray-700">{lead.phoneNumber || "N/A"}</td>
                      <td className="p-4 text-gray-700">{new Date(lead.date).toLocaleString() || "N/A"}</td>
                      <td className="p-4 flex space-x-2">
                        <button
                          className="bg-gray-500 text-white px-3 py-1 rounded-lg flex items-center hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            setEditingLead(lead);
                            setFormData({
                              firstName: lead.firstName || "",
                              lastName: lead.lastName || "",
                              email: lead.email || "",
                              country: lead.country || "USA (+1)",
                              phoneNumber: lead.phoneNumber || "",
                              secondPhoneNumber: lead.secondPhoneNumber || "",
                              date: lead.date || "",
                            });
                            setShowEditModal(true);
                          }}
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-red-700 transition-colors"
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
          </div>
        )}

        {/* Pagination Section */}
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            className="bg-white border border-gray-300 rounded-l-md px-4 py-2 flex items-center text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            className="bg-white border border-gray-300 rounded-r-md px-4 py-2 flex items-center text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Add Lead Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h5 className="text-xl font-semibold text-gray-800">Add Lead</h5>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAddModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.firstName ? "border-red-500" : "border-gray-300"}`}
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
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.lastName ? "border-red-500" : "border-gray-300"}`}
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="USA (+1)">USA (+1)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.phoneNumber ? "border-red-500" : "border-gray-300"}`}
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
                    <label htmlFor="secondPhoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Second Phone Number
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.secondPhoneNumber ? "border-red-500" : "border-gray-300"}`}
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
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    onClick={() => setShowAddModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Lead Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h5 className="text-xl font-semibold text-gray-800">Edit Lead</h5>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.firstName ? "border-red-500" : "border-gray-300"}`}
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
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.lastName ? "border-red-500" : "border-gray-300"}`}
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="USA (+1)">USA (+1)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.phoneNumber ? "border-red-500" : "border-gray-300"}`}
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
                    <label htmlFor="secondPhoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Second Phone Number
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.secondPhoneNumber ? "border-red-500" : "border-gray-300"}`}
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
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    onClick={() => setShowEditModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsTable;