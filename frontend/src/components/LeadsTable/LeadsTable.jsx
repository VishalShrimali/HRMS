import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getLeads,
  addLead,
  updateLead,
  deleteLead,
  getLeadById,
  importLeads,
  exportLeads,
} from "../../api/LeadsApi";
import { Search, Users } from "lucide-react";
import AddLeadModal from "./AddLeadModel";
import EditLeadModal from './EditLeadModel';
import PaginationSection from "./PaginationSection";
import LeadsControlsComponent from "./LeadsControlsComponent";
import LeadsTableComponent from "./LeadsTableComponent";
import {
  fetchGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  getAllUsers,
} from "../../api/GroupsApi";
import GroupTable from "../GroupsComponents/GroupTable";
import AddGroupModel from "../GroupsComponents/AddGroupModel";
import AddLeadToGroupModal from "../GroupsComponents/AddLeadToGroupModal";
import GroupsControlsComponent from "../GroupsComponents/GroupsControlsComponent";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the table.</div>;
    }
    return this.props.children;
  }
}

const LeadsTable = () => {
  const [showActionBar, setShowActionBar] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [groupsPerPage, setGroupsPerPage] = useState(10);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: "",
  });
  const [groupFormErrors, setGroupFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLead, setEditingLeadState] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    groupId: "",
    firstName: "",
    lastName: "",
    email: "",
    country: "USA (+1)",
    phoneNumber: "",
    secondPhoneNumber: "",
    dates: {
      birthDate: "",
      joinDate: "",
    },
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
    userPreferences: {
      policy: "active",
      whatsappMessageReceive: false,
      browserNotifications: false,
      emailReceive: false,
    },
  });

  // Fetch leads
  const fetchLeads = useCallback(async () => {
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

  // Fetch groups
  const fetchData = useCallback(async () => {
    try {
      const data = await fetchGroups();
      setGroups(data.groups || []);
      setGroupOptions(
        (data.groups || []).map((g) => ({ label: g.name, value: g._id }))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch groups");
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchData();
  }, [fetchLeads, fetchData]);

  // Validate lead form
  const validateLeadForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First Name is required";
    if (!formData.lastName) errors.lastName = "Last Name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Valid email is required";
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber))
      errors.phoneNumber = "Valid 10-digit phone number is required";
    if (!formData.phone) errors.phone = "Phone is required";
    if (!formData.dates?.birthDate) errors.birthDate = "Birth date is required";
    if (!formData.dates?.joinDate) errors.joinDate = "Join date is required";
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

  // Validate group form
  const validateGroupForm = () => {
    const errors = {};
    if (!groupFormData.name) errors.name = "Group name is required";
    setGroupFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle lead form changes
  const handleLeadChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value },
      });
    } else if (name.startsWith("dates.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        dates: { ...formData.dates, [field]: value },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setFormErrors({ ...formErrors, [name]: "" });
  };

  // Handle group form changes
  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setGroupFormData({
      ...groupFormData,
      [name]: value,
    });
    setGroupFormErrors({ ...groupFormErrors, [name]: "" });
  };

  // Handle user selection for adding lead to group
  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value);
  };

  // Handle add lead
  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    if (!validateLeadForm()) return;
    try {
      const response = await addLead({
        ...formData,
        date: new Date().toISOString(),
        groupId: selectedGroup?._id || formData.groupId,
      });
      setLeads(
        [...leads, response.lead].filter((lead) => lead && lead.firstName)
      );
      setShowAddLeadModal(false);
      resetLeadForm();
      setError(null);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lead");
    }
  };

  // Handle edit lead
  const handleEditLeadSubmit = async (e) => {
    e.preventDefault();
    if (!validateLeadForm()) return;
    try {
      const response = await updateLead(editingLead._id, formData);
      setLeads(
        leads
          .map((lead) => (lead._id === editingLead._id ? response.lead : lead))
          .filter((lead) => lead && lead.firstName)
      );
      setShowEditLeadModal(false);
      resetLeadForm();
      setError(null);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lead");
    }
  };

  // Handle add/edit group
  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    if (!validateGroupForm()) return;
    try {
      if (editingGroup) {
        const response = await updateGroup(editingGroup._id, groupFormData);
        setGroups(
          groups.map((group) =>
            group._id === editingGroup._id
              ? { ...group, ...response.group }
              : group
          )
        );
      } else {
        const response = await addGroup(groupFormData);
        setGroups([...groups, response.group]);
      }
      setShowAddGroupModal(false);
      resetGroupForm();
      setError(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save group");
    }
  };

  // Handle add lead to group
  const handleAddLeadToGroupSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }
    try {
      const response = await addLead({
        userId: selectedUserId,
        groupId: selectedGroup._id,
        date: new Date().toISOString(),
      });
      setLeads(
        [...leads, response.lead].filter((lead) => lead && lead.firstName)
      );
      setShowAddLeadModal(false);
      setSelectedUserId("");
      setError(null);
      fetchLeads();
      fetchData(); // Refresh groups to update leads count
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lead to group");
    }
  };

  // Handle delete lead
  const handleDeleteLead = async (id) => {
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

  // Handle delete group
  const handleDeleteGroup = async (id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await deleteGroup(id);
        setGroups(groups.filter((group) => group._id !== id));
        setSelectedGroups(selectedGroups.filter((groupId) => groupId !== id));
        setError(null);
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete group");
      }
    }
  };

  // Handle export leads
  const handleExport = async () => {
    try {
      await exportLeads();
      setError(null);
    } catch (err) {
      setError("Failed to export leads");
    }
  };

  // Handle import leads
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError("No file selected");
      return;
    }
    try {
      await importLeads(file);
      fetchLeads();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to import leads");
    }
  };

  // Open add lead modal
  const handleOpenAddLeadModal = () => {
    resetLeadForm();
    setShowAddLeadModal(true);
  };

  // Reset lead form
  const resetLeadForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      country: "USA (+1)",
      phoneNumber: "",
      secondPhoneNumber: "",
      dates: {
        birthDate: "",
        joinDate: "",
      },
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
      userPreferences: {
        policy: "active",
        whatsappMessageReceive: false,
        browserNotifications: false,
        emailReceive: false,
      },
    });
    setEditingLeadState(null);
    setSelectedGroup(null);
    setFormErrors({});
  };

  // Reset group form
  const resetGroupForm = () => {
    setGroupFormData({ name: "", description: "" });
    setEditingGroup(null);
    setGroupFormErrors({});
  };

  // Handle lead selection
  const handleSelectLead = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]
    );
  };

  // Handle select all leads
  const handleSelectAllLeads = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(paginatedLeads.map((lead) => lead._id));
    }
  };

  // Handle group selection
  const handleSelectGroup = (id) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  // Handle select all groups
  const handleSelectAllGroups = () => {
    if (selectedGroups.length === paginatedGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(paginatedGroups.map((group) => group._id));
    }
  };

  // Update action bar visibility
  useEffect(() => {
    setShowActionBar(selectedLeads.length > 0 || selectedGroups.length > 0);
  }, [selectedLeads, selectedGroups]);

  // Handle create group
  const handleCreateGroup = () => {
    if (selectedLeads.length === 0) {
      alert("Please select at least one lead to create a group.");
      return;
    }
    setGroupFormData({
      name: "",
      description: "",
      members: selectedLeads,
    });
    setShowAddGroupModal(true);
  };

  // Handle change group (placeholder)
  const handleChangeGroup = () => {
    alert("Change Group functionality triggered!");
  };

  // Handle delete selected items
  const handleDeleteSelected = () => {
    if (window.confirm("Are you sure you want to delete the selected items?")) {
      if (activeTab === "personal") {
        setLeads(leads.filter((lead) => !selectedLeads.includes(lead._id)));
        setSelectedLeads([]);
      } else {
        setGroups(
          groups.filter((group) => !selectedGroups.includes(group._id))
        );
        setSelectedGroups([]);
      }
    }
  };

  // Set editing lead
  const setEditingLead = async (leadId) => {
    try {
      const lead = await getLeadById(leadId);
      const address = lead.addresses?.[0] || {};
      setFormData({
        firstName: lead.firstName || "",
        lastName: lead.lastName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        dates: {
          birthDate: lead.dates?.birthDate || "",
          joinDate: lead.dates?.joinDate || "",
        },
        address: {
          line1: address.line1 || "",
          line2: address.line2 || "",
          line3: address.line3 || "",
          pincode: address.pincode || "",
          city: address.city || "",
          state: address.state || "",
          county: address.county || "",
          country: address.country || "",
        },
        userPreferences: {
          policy: lead.userPreferences?.policy || "active",
          whatsappMessageReceive:
            lead.userPreferences?.whatsappMessageReceive || false,
          browserNotifications:
            lead.userPreferences?.browserNotifications || false,
          emailReceive: lead.userPreferences?.emailReceive || false,
        },
      });
      setEditingLeadState(lead);
      setShowEditLeadModal(true);
    } catch (err) {
      setError("Failed to load lead data for editing");
    }
  };

  // Filter and paginate leads
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

  // Filter and paginate groups
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalGroupPages = Math.ceil(filteredGroups.length / groupsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentGroupPage - 1) * groupsPerPage,
    currentGroupPage * groupsPerPage
  );

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
              (
              {activeTab === "personal"
                ? filteredLeads.length
                : filteredGroups.length}{" "}
              Records Found)
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
                setCurrentGroupPage(1);
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

        {/* Action Bar */}
        {showActionBar && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg">
            <span>
              {activeTab === "personal"
                ? `${selectedLeads.length} Leads Selected`
                : `${selectedGroups.length} Groups Selected`}
            </span>
            <div>
              <button
                className="px-4 py-2 bg-blue-500 rounded mr-2"
                onClick={handleCreateGroup}
              >
                Create Group
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 rounded mr-2"
                onClick={handleChangeGroup}
              >
                Change Group
              </button>
              <button
                className="px-4 py-2 bg-red-500 rounded"
                onClick={handleDeleteSelected}
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {activeTab === "personal" && (
          <>
            <LeadsControlsComponent
              fileInputRef={fileInputRef}
              handleExport={handleExport}
              handleImport={handleImport}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              setCurrentPage={setCurrentPage}
              setShowAddModal={handleOpenAddLeadModal}
            />
            {loading ? (
              <div className="text-center py-10 text-gray-600">Loading...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <LeadsTableComponent
                paginatedLeads={paginatedLeads}
                selectedLeads={selectedLeads}
                handleSelectAll={handleSelectAllLeads}
                handleSelectLead={handleSelectLead}
                setEditingLead={setEditingLead}
                setFormData={setFormData}
                setShowEditModal={setShowEditLeadModal}
                handleDelete={handleDeleteLead}
              />
            )}
            <PaginationSection
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
            {showAddLeadModal && !selectedGroup && (
              <AddLeadModal
                groupOptions={groupOptions}
                handleAddSubmit={handleAddLeadSubmit}
                handleChange={handleLeadChange}
                formData={formData}
                formErrors={formErrors}
                setShowAddModal={setShowAddLeadModal}
              />
            )}
            {showEditLeadModal && (
              <EditLeadModal
                formData={formData}
                formErrors={formErrors}
                handleChange={handleLeadChange}
                handleEditSubmit={handleEditLeadSubmit}
                setShowEditModal={setShowEditLeadModal}
              />
            )}
          </>
        )}

        {activeTab === "groups" && (
          <ErrorBoundary>
            <GroupsControlsComponent
              rowsPerPage={groupsPerPage}
              setRowsPerPage={setGroupsPerPage}
              setCurrentPage={setCurrentGroupPage}
              setShowAddGroupModal={setShowAddGroupModal}
            />
            {loading ? (
              <div className="text-center py-10 text-gray-600">Loading...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <GroupTable
                paginatedGroups={paginatedGroups}
                selectedGroups={selectedGroups}
                handleSelectAll={handleSelectAllGroups}
                handleSelectGroup={handleSelectGroup}
                setSelectedGroup={setSelectedGroup}
                setShowAddLeadModal={setShowAddLeadModal}
                setEditingGroup={setEditingGroup}
                setGroupFormData={setGroupFormData}
                setShowEditModal={setShowAddGroupModal}
                handleDelete={handleDeleteGroup}
              />
            )}
            <PaginationSection
              currentPage={currentGroupPage}
              totalPages={totalGroupPages}
              setCurrentPage={setCurrentGroupPage}
            />
            {showAddGroupModal && (
              <AddGroupModel
                formData={groupFormData}
                formErrors={groupFormErrors}
                showAddGroupModal={showAddGroupModal}
                handleChange={handleGroupChange}
                handleAddSubmit={handleGroupSubmit}
                setShowAddGroupModal={setShowAddGroupModal}
              />
            )}
            {showAddLeadModal && selectedGroup && (
              <AddLeadToGroupModal
                showAddLeadModal={showAddLeadModal}
                setShowAddLeadModal={setShowAddLeadModal}
                selectedUserId={selectedUserId}
                handleUserChange={handleUserChange}
                handleAddLeadToGroupSubmit={handleAddLeadToGroupSubmit}
                selectedGroup={selectedGroup}
              />
            )}
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default LeadsTable;
