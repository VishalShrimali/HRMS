import React, { useState, useEffect, useRef } from "react";
import { getLeads, addLead, updateLead, deleteLead } from "../../api/LeadsApi";
import { Search, Users } from "lucide-react";
import AddLeadModel from "./AddLeadModel";
import EditLeadModal from "./EditLeadModel";
import PaginationSection from "./PaginationSection";
import LeadsControlsComponent from "./LeadsControlsComponent";
import LeadsTableComponent from "./LeadsTableComponent";
import GroupsComponent from "./GroupsComponent";

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

  const fileInputRef = useRef(null);

  // Fetch leads from API with sanitization
  const fetchLeads = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeads();
      const leadsArray = Array.isArray(data.leads)
        ? data.leads
        : Array.isArray(data)
        ? data
        : [];
      const sanitizedLeads = leadsArray.filter(
        (lead) =>
          lead && typeof lead === "object" && lead.firstName && lead.lastName
      );
      setLeads(sanitizedLeads);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First Name is required";
    if (!formData.lastName) errors.lastName = "Last Name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Valid email is required";
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) errors.phoneNumber = "Valid 10-digit phone number is required";
    if (!formData.phone) errors.phone = "Phone is required";
    if (!formData.birthDate) errors.birthDate = "Birth Date is required";
    if (!formData.joinDate) errors.joinDate = "Join Date is required";
    if (!formData.address.line1) errors.line1 = "Address Line 1 is required";
<<<<<<< HEAD
    if (!formData.address.pincode || !/^[0-9]{5,6}$/.test(formData.address.pincode)) errors.pincode = "Valid pincode is required";
=======
    if (
      !formData.address.pincode ||
      !/^[0-9]{5,6}$/.test(formData.address.pincode)
    )
      errors.pincode = "Valid pincode is required";
>>>>>>> e7a496821d0c13554a2b2d9b9ed88d63450fcdfe
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
      const response = await addLead({
        ...formData,
        date: new Date().toISOString(),
      });
      setLeads(
        [...leads, response.lead].filter((lead) => lead && lead.firstName)
      );
>>>>>>> e7a496821d0c13554a2b2d9b9ed88d63450fcdfe
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
      const response = await updateLead(editingLead._id, formData);
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
      setError(err.response?.data?.message || "Failed to update lead");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead(id);
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
    try {
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
      setError("Failed to export leads : " + err);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
<<<<<<< HEAD
    if (!file) {
      setError('No file selected');
      return;
    }
  
    try {
      console.log('Uploading file:', file.name, file.size, file.type); // Debug log
      const response = await importLeads(file); // Get the response data
      console.log('Import successful:', response); // Log success
      await fetchLeads();
      setError(null); // Clear errors on success
    } catch (err) {
      const errorMessage = err.message || 'Failed to import leads';
      console.error('Import failed:', errorMessage, err); // Log full error
      setError(errorMessage); // Display error to user
    }
=======
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
            await addLead({
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
            });
          } catch (err) {
            setError(err.response?.data?.message || "Failed to import lead");
          }
        }
      }
      fetchLeads();
    };
    reader.readAsText(file);
>>>>>>> e7a496821d0c13554a2b2d9b9ed88d63450fcdfe
  };
  

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

        {activeTab === "personal" && (
          <>
            <LeadsControlsComponent
              fileInputRef={fileInputRef}
              handleExport={handleExport}
              handleImport={handleImport}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              setCurrentPage={setCurrentPage}
              setShowAddModal={setShowAddModal}
            />

            {/* Table Section */}
            {loading ? (
              <div className="text-center py-10 text-gray-600">Loading...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <LeadsTableComponent
                paginatedLeads={paginatedLeads}
                selectedLeads={selectedLeads}
                handleSelectAll={handleSelectAll}
                handleSelectLead={handleSelectLead}
                setEditingLead={setEditingLead}
                setFormData={setFormData}
                setShowEditModal={setShowEditModal}
                handleDelete={handleDelete}
              />
            )}

            {/* Pagination Section */}
            <PaginationSection
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
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
          </>
        )}

        {activeTab === "groups" && (
          <>
            <GroupsComponent />
          </>
        )}
      </div>
    </div>
  );
};

export default LeadsTable;


