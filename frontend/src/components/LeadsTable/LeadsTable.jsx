import React, { useState, useEffect, useRef } from "react";
import { getLeads, addLead, updateLead, deleteLead } from "../../api/LeadsApi";
import {
  Search, Upload, Download, Plus, ChevronLeft, ChevronRight,
  Edit, Trash, Users, X
} from "lucide-react";
import AddLeadModal from "./AddLeadModel";
import EditLeadModal from "./EditLeadModel";
import PaginationSection from "./PaginationSection";
import LeadsTableComponent from "./LeadsTableComponent";

const LeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");
  const [selectedLeads, setSelectedLeads] = useState([]);

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
    name: "",
    description: "",
  });

  const token = localStorage.getItem("token");
  const apiConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // /const paginatedLeads = leads.slice(startIndex, endIndex);


  const fileInputRef = useRef(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeads(apiConfig);
      const leadsArray = Array.isArray(data.leads) ? data.leads : Array.isArray(data) ? data : [];
      const sanitizedLeads = leadsArray.filter((lead) => lead && typeof lead === "object" && lead.firstName && lead.lastName);
      setLeads(sanitizedLeads);
      setError(null);
    } catch (err) {
      console.error("Fetch Leads Error:", err);
      setError(err.response?.data?.message || "Failed to fetch leads");
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await getGroups(apiConfig);
      const groupsArray = Array.isArray(data.groups) ? data.groups : Array.isArray(data) ? data : [];
      const sanitizedGroups = groupsArray.filter((group) => group && typeof group === "object" && group.name);
      setGroups(sanitizedGroups);
    } catch (err) {
      console.error("Fetch Groups Error:", err);
      setError(err.response?.data?.message || "Failed to fetch groups");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchLeads(), fetchGroups()]).finally(() => setLoading(false));
  }, []);
  // Form validation
  const validateForm = () => {
    const errors = {};
    if (activeTab === "personal") {
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
      if (!formData.address.pincode || !/^[0-9]{5,6}$/.test(formData.address.pincode))
        errors.pincode = "Valid pincode is required";
      if (!formData.address.city) errors.city = "City is required";
      if (!formData.address.state) errors.state = "State is required";
      if (!formData.address.country) errors.country = "Country is required";
    } else if (activeTab === "groups") {
      if (!formData.name) errors.name = "Name is required";
    }
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

  // Handle Add submission (leads or groups)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (activeTab === "personal") {
        console.log("Adding Lead:", formData);
        const response = await addLead({ ...formData, date: new Date().toISOString() }, apiConfig);
        setLeads([...leads, response.lead].filter((lead) => lead && lead.firstName));
      } else if (activeTab === "groups") {
        console.log("Adding Group:", formData);
        const response = await addGroup({ ...formData, createdOn: new Date().toISOString(), members: 0 }, apiConfig);
        setGroups([...groups, response.group].filter((group) => group && group.name));
      }
      setShowAddModal(false);
      resetForm();
      setError(null);
      fetchLeads();
      fetchGroups();
    } catch (err) {
      console.error(`${activeTab === "personal" ? "Add Lead" : "Add Group"} Error:`, err);
      setError(err.response?.data?.message || `Failed to add ${activeTab === "personal" ? "lead" : "group"}`);
    }
  };

  // Handle Edit submission (leads or groups)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (activeTab === "personal" && editingItem) {
        console.log("Updating Lead:", editingItem._id, formData);
        const response = await updateLead(editingItem._id, formData, apiConfig);
        setLeads(leads.map((lead) => (lead._id === editingItem._id ? response.lead : lead)).filter((lead) => lead && lead.firstName));
      } else if (activeTab === "groups" && editingItem) {
        console.log("Updating Group:", editingItem._id, formData);
        const response = await updateGroup(editingItem._id, formData, apiConfig);
        setGroups(groups.map((group) => (group._id === editingItem._id ? response.group : group)).filter((group) => group && group.name));
      }
      setShowEditModal(false);
      resetForm();
      setError(null);
      fetchLeads();
      fetchGroups();
    } catch (err) {
      console.error(`${activeTab === "personal" ? "Edit Lead" : "Edit Group"} Error:`, err);
      setError(err.response?.data?.message || `Failed to update ${activeTab === "personal" ? "lead" : "group"}`);
    }
  };

  // Handle Delete (leads or groups)
  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab === "personal" ? "lead" : "group"}?`)) {
      try {
        if (activeTab === "personal") {
          console.log("Deleting Lead ID:", id);
          await deleteLead(id, apiConfig);
          setLeads(leads.filter((lead) => lead._id !== id));
          setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
        } else if (activeTab === "groups") {
          console.log("Deleting Group ID:", id);
          await deleteGroup(id, apiConfig);
          setGroups(groups.filter((group) => group._id !== id));
          setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
        }
        setError(null);
        fetchLeads();
        fetchGroups();
      } catch (err) {
        console.error(`Delete ${activeTab === "personal" ? "Lead" : "Group"} Error:`, err);
        setError(err.response?.data?.message || `Failed to delete ${activeTab === "personal" ? "lead" : "group"}`);
      }
    }
  };

  // Handle Add Members to Group
  const handleAddMembers = async (groupId) => {
    if (selectedLeads.length === 0) {
      setError("Please select at least one lead to add.");
      return;
    }
    try {
      const group = groups.find(g => g._id === groupId);
      const updatedMembers = group.members + selectedLeads.length;
      await addMemberToGroup(groupId, selectedLeads, apiConfig);
      setGroups(groups.map(g => g._id === groupId ? { ...g, members: updatedMembers } : g));
      setSelectedLeads([]);
      setError(null);
      fetchGroups();
    } catch (err) {
      console.error("Add Members Error:", err);
      setError(err.response?.data?.message || "Failed to add members");
    }
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
      name: "",
      description: "",
    });
    setEditingItem(null);
    setFormErrors({});
  };

  // Handle item selection (leads or groups)
  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    const currentItems = activeTab === "personal" ? paginatedLeads : paginatedGroups;
    if (e.target.checked) {
      setSelectedItems(currentItems.map((item) => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  // Filter and paginate items based on active tab
  const filteredItems = activeTab === "personal"
    ? leads.filter((lead) =>
        lead && lead.firstName && lead.lastName
          ? (lead.firstName + " " + lead.lastName).toLowerCase().includes(searchTerm.toLowerCase())
          : false
      )
    : groups.filter((group) =>
        group && group.name
          ? group.name.toLowerCase().includes(searchTerm.toLowerCase())
          : false
      );
  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle Export to CSV (only for leads for now)
  const handleExport = () => {
    if (activeTab === "personal") {
      try {
        console.log("Exporting Leads:", leads);
        const csv = [
          "First Name,Last Name,Email,Country,Phone Number,Second Phone Number,Birth Date,Join Date,Address Line 1,Pincode,City,State,County,Country,Date",
          ...leads.map((lead) =>
            `${lead.firstName || ""},${lead.lastName || ""},${lead.email || ""},${lead.country || "N/A"},${lead.phoneNumber || "N/A"},${lead.secondPhoneNumber || "N/A"},${lead.birthDate || "N/A"},${lead.joinDate || "N/A"},${lead.address?.line1 || "N/A"},${lead.address?.pincode || "N/A"},${lead.address?.city || "N/A"},${lead.address?.state || "N/A"},${lead.address?.county || "N/A"},${lead.address?.country || "N/A"},${lead.date || "N/A"}`
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
    } else {
      setError("Export is only available for Personal Leads.");
    }
  };

  // Handle Import from CSV (only for leads for now)
  const handleImport = async (event) => {
    if (activeTab === "personal") {
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
              console.log("Importing Lead:", { firstName, lastName, email });
              await addLead({
                firstName, lastName, email, country, phoneNumber, secondPhoneNumber,
                birthDate, joinDate, address: { line1, pincode, city, state, county, country: addressCountry },
                date
              }, apiConfig);
            } catch (err) {
              console.error("Import Error:", err);
              setError(err.response?.data?.message || "Failed to import lead");
            }
          }
        }
        fetchLeads();
      };
      reader.readAsText(file);
    } else {
      setError("Import is only available for Personal Leads.");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4 overflow-auto bg-white">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Users className="mr-2" size={20} />
            <h2 className="text-2xl font-semibold text-gray-800">
              {activeTab === "personal" ? "Leads" : "Groups"}
            </h2>
            <span className="ml-2 text-gray-500">
              ({activeTab === "personal" ? leads.length : groups.length} Records Found)
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
              disabled={activeTab === "groups"}
            />
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
              onClick={() => fileInputRef.current.click()}
              disabled={activeTab === "groups"}
            >
              <Upload className="mr-2" size={16} /> Import
            </button>
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
              onClick={handleExport}
              disabled={activeTab === "groups"}
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
          <LeadsTableComponent paginatedLeads={paginatedLeads} 
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <AddLeadModal
            handleAddSubmit={handleAddSubmit}
            handleChange={handleChange}
            formData={formData}
            formErrors={formErrors}
            setShowAddModal={setShowAddModal}
            activeTab={activeTab}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <EditLeadModal
            formData={formData}
            formErrors={formErrors}
            handleChange={handleChange}
            handleEditSubmit={handleEditSubmit}
            setShowEditModal={setShowEditModal}
            activeTab={activeTab}
          />
        )}
      </div>
    </div>
  );
};

export default LeadsTable;