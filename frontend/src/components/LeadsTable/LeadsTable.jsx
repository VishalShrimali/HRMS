import React, { useState, useEffect, useRef } from "react";
import { getLeads, addLead, updateLead, deleteLead } from "../../api/LeadsApi";
import {
  Search,
  Upload,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash,
  Users,
  X,
} from "lucide-react";
import AddLeadModel from "./AddLeadModel";
import EditLeadModal from "./EditLeadModel";
import PaginationSection from "./PaginationSection";

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

  const fileInputRef = useRef(null);

  // Fetch leads from API with sanitization
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeads(apiConfig);
      console.log("Raw API Response:", data);
      const leadsArray = Array.isArray(data.leads)
        ? data.leads
        : Array.isArray(data)
        ? data
        : [];
      const sanitizedLeads = leadsArray.filter(
        (lead) =>
          lead && typeof lead === "object" && lead.firstName && lead.lastName
      );
      console.log("Sanitized Leads:", sanitizedLeads);
      setLeads(sanitizedLeads);
      setError(null);
    } catch (err) {
      console.error("Fetch Leads Error:", err);
      setError(err.response?.data?.message || "Failed to fetch leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First Name is required";
    if (!formData.lastName) errors.lastName = "Last Name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Valid email is required";
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber))
      errors.phoneNumber = "Valid 10-digit phone number is required";
    if (!formData.phone) errors.phone = "Phone is required";
    if (!formData.birthDate) errors.birthDate = "Birth Date is required";
    if (!formData.joinDate) errors.joinDate = "Join Date is required";
    if (!formData.address.line1) errors.line1 = "Address Line 1 is required";
    if (
      !formData.address.pincode ||
      !/^[0-9]{5,6}$/.test(formData.address.pincode)
    )
      errors.pincode = "Valid pincode is required";
    if (!formData.address.city) errors.city = "City is required";
    if (!formData.address.state) errors.state = "State is required";
    if (!formData.address.country) errors.country = "Country is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
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

  // Handle Add Lead submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      console.log("Adding Lead:", formData);
      const response = await addLead(
        { ...formData, date: new Date().toISOString() },
        apiConfig
      );
      setLeads(
        [...leads, response.lead].filter((lead) => lead && lead.firstName)
      );
      setShowAddModal(false);
      resetForm();
      setError(null);
      fetchLeads();
    } catch (err) {
      console.error("Add Lead Error:", err);
      setError(err.response?.data?.message || "Failed to add lead");
    }
  };

  // Handle Edit Lead submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      console.log("Updating Lead:", editingLead._id, formData);
      const response = await updateLead(editingLead._id, formData, apiConfig);
      setLeads(
        leads
          .map((lead) => (lead._id === editingLead._id ? response.lead : lead))
          .filter((lead) => lead && lead.firstName)
      );
      setShowEditModal(false);
      resetForm();
      setError(null);
      fetchLeads();
    } catch (err) {
      console.error("Edit Lead Error:", err);
      setError(err.response?.data?.message || "Failed to update lead");
    }
  };

  // Handle Delete Lead
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        console.log("Deleting Lead ID:", id);
        await deleteLead(id, apiConfig);
        setLeads(leads.filter((lead) => lead._id !== id));
        setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id));
        setError(null);
        fetchLeads();
      } catch (err) {
        console.error("Delete Lead Error:", err);
        setError(err.response?.data?.message || "Failed to delete lead");
      }
    }
  };

  // Handle Export to CSV
  const handleExport = () => {
    try {
      console.log("Exporting Leads:", leads);
      const csv = [
        "First Name,Last Name,Email,Country,Phone Number,Second Phone Number,Birth Date,Join Date,Address Line 1,Pincode,City,State,County,Country,Date",
        ...leads.map(
          (lead) =>
            `${lead.firstName || ""},${lead.lastName || ""},${
              lead.email || ""
            },${lead.country || "N/A"},${lead.phoneNumber || "N/A"},${
              lead.secondPhoneNumber || "N/A"
            },${lead.birthDate || "N/A"},${lead.joinDate || "N/A"},${
              lead.address?.line1 || "N/A"
            },${lead.address?.pincode || "N/A"},${
              lead.address?.city || "N/A"
            },${lead.address?.state || "N/A"},${
              lead.address?.county || "N/A"
            },${lead.address?.country || "N/A"},${lead.date || "N/A"}`
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "leads.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export Error:", err);
      setError("Failed to export leads");
    }
  };

  // Handle Import from CSV
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const rows = e.target.result.split("\n").slice(1);
      for (const row of rows) {
        const [
          firstName,
          lastName,
          email,
          country,
          phoneNumber,
          secondPhoneNumber,
          birthDate,
          joinDate,
          line1,
          pincode,
          city,
          state,
          county,
          addressCountry,
          date,
        ] = row.split(",").map((item) => item.trim());
        if (firstName && lastName && email) {
          try {
            console.log("Importing Lead:", { firstName, lastName, email });
            await addLead(
              {
                firstName,
                lastName,
                email,
                country,
                phoneNumber,
                secondPhoneNumber,
                birthDate,
                joinDate,
                address: {
                  line1,
                  pincode,
                  city,
                  state,
                  county,
                  country: addressCountry,
                },
                date,
              },
              apiConfig
            );
          } catch (err) {
            console.error("Import Error:", err);
            setError(err.response?.data?.message || "Failed to import lead");
          }
        }
      }
      fetchLeads();
    };
    reader.readAsText(file);
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
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
    setEditingLead(null);
    setFormErrors({});
  };

  // Handle lead selection
  const handleSelectLead = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(paginatedLeads.map((lead) => lead._id));
    } else {
      setSelectedLeads([]);
    }
  };

  // Filter and paginate leads with defensive check
  const filteredLeads = leads.filter((lead) =>
    lead && lead.firstName && lead.lastName
      ? (lead.firstName + " " + lead.lastName)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : false
  );
  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4 overflow-auto bg-white">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Users className="mr-2" size={20} />
            <h2 className="text-2xl font-semibold text-gray-800">Leads</h2>
            <span className="ml-2 text-gray-500">
              ({leads.length} Records Found)
            </span>
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
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-6 py-2 -mb-px ${
              activeTab === "personal"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            } font-medium focus:outline-none`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Leads
          </button>
          <button
            className={`px-6 py-2 -mb-px ${
              activeTab === "groups"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            } font-medium focus:outline-none ml-2`}
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
                        checked={
                          selectedLeads.length === paginatedLeads.length &&
                          paginatedLeads.length > 0
                        }
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-semibold">
                      Name & Email
                    </th>
                    <th className="p-4 text-left text-sm font-semibold">
                      Country
                    </th>
                    <th className="p-4 text-left text-sm font-semibold">
                      Phone
                    </th>
                    <th className="p-4 text-left text-sm font-semibold">
                      Date
                    </th>
                    <th className="p-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedLeads.includes(lead._id)}
                          onChange={() => handleSelectLead(lead._id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.email}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">
                        {lead.country || "N/A"}
                      </td>
                      <td className="p-4 text-gray-700">
                        {lead.phone || "N/A"}
                      </td>
                      <td className="p-4 text-gray-700">
                        {lead.dates.joinDate
                          ? new Date(lead.dates.joinDate).toLocaleDateString()
                          : "N/A"}
                      </td>
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
                              joinDate: lead.dates.joinDate || "",
                              address: {
                                line1: lead.address?.line1 || "",
                                line2: lead.address?.line2 || "",
                                line3: lead.address?.line3 || "",
                                pincode: lead.address?.pincode || "",
                                city: lead.address?.city || "",
                                state: lead.address?.state || "",
                                county: lead.address?.county || "",
                                country: lead.address?.country || "USA",
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
        <PaginationSection
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />

        {/* Add Lead Modal */}
        {showAddModal && (
          <AddLeadModel
            handleAddSubmit={handleAddSubmit}
            handleChange={handleChange}
            formData={formData}
            formErrors={formErrors}
            setShowAddModal={setShowAddModal}
          />
        )}

        {/* Edit Lead Modal */}
        {showEditModal && (
          <EditLeadModal
            formData={formData}
            formErrors={formErrors}
            handleChange={handleChange}
            handleEditSubmit={handleEditSubmit}
            setShowEditModal={setShowEditModal}
          />
        )}
      </div>
    </div>
  );
};

export default LeadsTable;
