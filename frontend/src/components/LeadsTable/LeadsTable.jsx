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
    birthDate: "",
    joinDate: "",
    address: {
      line1: "",
      line2: "",
      line3: "",
      pincode: "",
      city: "",
      state: "",
      county: "",
      country: "USA",
    },
    phone: "",
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
    if (formData.country && !/^\d{10}$/.test(formData.country))
    if (!formData.phone) errors.phone = "Phone is required";
    if (!formData.birthDate) errors.birthDate = "Birth Date is required";
    if (!formData.joinDate) errors.joinDate = "Join Date is required";
    if (!formData.address.line1) errors.line1 = "Address Line 1 is required";
    if (!formData.address.pincode || !/^[0-9]{5,6}$/.test(formData.address.pincode))
      errors.pincode = "Valid pincode is required";
    if (!formData.address.city) errors.city = "City is required";
    if (!formData.address.state) errors.state = "State is required";
    if (!formData.address.country) errors.country = "Country is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setFormErrors({ ...formErrors, [name]: "" });
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
      "First Name,Last Name,Email,Country,Phone Number,Second Phone Number,Birth Date,Join Date,Address Line 1,Pincode,City,State,County,Country,Date",
      ...leads.map((lead) =>
        `${lead.firstName},${lead.lastName},${lead.email},${lead.country || "N/A"},${lead.phoneNumber || "N/A"},${lead.secondPhoneNumber || "N/A"},${lead.birthDate || "N/A"},${lead.joinDate || "N/A"},${lead.address.line1 || "N/A"},${lead.address.pincode || "N/A"},${lead.address.city || "N/A"},${lead.address.state || "N/A"},${lead.address.county || "N/A"},${lead.address.country || "N/A"},${lead.date || "N/A"}`
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
        const [
          firstName, lastName, email, country, phoneNumber, secondPhoneNumber,
          birthDate, joinDate, line1, pincode, city, state, county, addressCountry, date
        ] = row.split(",").map((item) => item.trim());
        if (firstName && lastName && email) {
          try {
            await addLead({
              firstName, lastName, email, country, phoneNumber, secondPhoneNumber,
              birthDate, joinDate, address: { line1, pincode, city, state, county, country: addressCountry },
              date
            }, apiConfig);
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
      birthDate: "",
      joinDate: "",
      address: {
        line1: "",
        line2: "",
        line3: "",
        pincode: "",
        city: "",
        state: "",
        county: "",
        country: "USA",
      },
      phone: "",
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
                      <td className="p-4 text-gray-700">{lead.phone || "N/A"}</td>
                      <td className="p-4 text-gray-700">{new Date(lead.dates.joinDate).toLocaleString() || "N/A"}</td>
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
                              birthDate: lead.birthDate || "",
                              joinDate: lead.joinDate || "",
                              address: {
                                line1: lead.address.line1 || "",
                                line2: lead.address.line2 || "",
                                line3: lead.address.line3 || "",
                                pincode: lead.address.pincode || "",
                                city: lead.address.city || "",
                                state: lead.address.state || "",
                                county: lead.address.county || "",
                                country: lead.address.country || "USA",
                              },
                              phone: lead.phone || "",
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
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Lead</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.firstName ? "is-invalid" : ""}`}
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                        {formErrors.firstName && <div className="invalid-feedback">{formErrors.firstName}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.lastName ? "is-invalid" : ""}`}
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                        {formErrors.lastName && <div className="invalid-feedback">{formErrors.lastName}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.phoneNumber ? "is-invalid" : ""}`}
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                        />
                        {formErrors.phoneNumber && <div className="invalid-feedback">{formErrors.phoneNumber}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="birthDate" className="form-label">Birth Date</label>
                        <input
                          type="date"
                          className={`form-control ${formErrors.birthDate ? "is-invalid" : ""}`}
                          id="birthDate"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleChange}
                          required
                        />
                        {formErrors.birthDate && <div className="invalid-feedback">{formErrors.birthDate}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="joinDate" className="form-label">Join Date</label>
                        <input
                          type="date"
                          className={`form-control ${formErrors.joinDate ? "is-invalid" : ""}`}
                          id="joinDate"
                          name="joinDate"
                          value={formData.joinDate}
                          onChange={handleChange}
                          required
                        />
                        {formErrors.joinDate && <div className="invalid-feedback">{formErrors.joinDate}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="country" className="form-label">Country</label>
                        <select
                          className="form-select"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                        >
                          <option value="USA (+1)">USA (+1)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="addressLine1" className="form-label">Address Line 1</label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.line1 ? "is-invalid" : ""}`}
                          id="addressLine1"
                          name="address.line1"
                          value={formData.address.line1}
                          onChange={handleChange}
                          required
                        />
                        {formErrors.line1 && <div className="invalid-feedback">{formErrors.line1}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="pincode" className="form-label">Pincode</label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.pincode ? "is-invalid" : ""}`}
                          id="pincode"
                          name="address.pincode"
                          value={formData.address.pincode}
                          onChange={handleChange}
                          required
                        />
                        {formErrors.pincode && <div className="invalid-feedback">{formErrors.pincode}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="city" className="form-label">City</label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.city ? "is-invalid" : ""}`}
                          id="city"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          required
                        />
                        {formErrors.city && <div className="invalid-feedback">{formErrors.city}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="state" className="form-label">State</label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.state ? "is-invalid" : ""}`}
                          id="state"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          required
                        />
                        {formErrors.state && <div className="invalid-feedback">{formErrors.state}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="county" className="form-label">County</label>
                        <input
                          type="text"
                          className="form-control"
                          id="county"
                          name="address.county"
                          value={formData.address.county}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddModal(false)}
                    >
                      Close
                    </button>
                    <button type="submit" className="btn btn-primary">
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