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
import { Search, Users, X, Plus } from "lucide-react";
import AddLeadModal from "./AddLeadModel";
import EditLeadModal from "./EditLeadModel";
import PaginationSection from "./PaginationSection";
import LeadsControlsComponent from "./LeadsControlsComponent";
import LeadsTableComponent from "./LeadsTableComponent";
import {
  fetchGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  addMembersToGroup,
  fetchLeadsByGroup,
} from "../../api/GroupsApi";
import GroupTable from "../GroupsComponents/GroupTable";
import AddGroupModel from "../GroupsComponents/AddGroupModel";
import GroupsControlsComponent from "../GroupsComponents/GroupsControlsComponent";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 p-4">
          <h3>Something went wrong with the component.</h3>
          <p>{this.state.error?.message || "Unknown error"}</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Change Group Modal Component
const ChangeGroupModal = ({
  showChangeGroupModal,
  setShowChangeGroupModal,
  groupOptions,
  handleChangeGroupSubmit,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  return (
    <dialog
      open={showChangeGroupModal}
      className="fixed w-full m-0 h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h5 className="text-xl font-semibold text-gray-800">Change Group</h5>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowChangeGroupModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleChangeGroupSubmit(selectedGroupId);
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Group
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a group</option>
              {groupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              onClick={() => setShowChangeGroupModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

// View Leads Modal Component
const ViewLeadsModal = ({
  showViewLeadsModal,
  setShowViewLeadsModal,
  groupName,
  leads,
}) => {
  return (
    <dialog
      open={showViewLeadsModal}
      className="fixed w-full m-0 h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h5 className="text-xl font-semibold text-gray-800">
            Leads in {groupName}
          </h5>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowViewLeadsModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        {leads.length === 0 ? (
          <p className="text-gray-600">No leads found in this group.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-sm font-medium text-gray-700">Full Name</th>
                <th className="p-3 text-sm font-medium text-gray-700">Email</th>
                <th className="p-3 text-sm font-medium text-gray-700">Phone</th>
                <th className="p-3 text-sm font-medium text-gray-700">Country</th>
                <th className="p-3 text-sm font-medium text-gray-700">Address</th>
                <th className="p-3 text-sm font-medium text-gray-700">Preferences</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-900">{lead.fullName}</td>
                  <td className="p-3 text-sm text-gray-900">{lead.email}</td>
                  <td className="p-3 text-sm text-gray-900">{lead.phone}</td>
                  <td className="p-3 text-sm text-gray-900">{lead.country}</td>
                  <td className="p-3 text-sm text-gray-900">
                    {lead.addresses?.[0]
                      ? `${lead.addresses[0].line1}, ${lead.addresses[0].city}, ${lead.addresses[0].state}`
                      : "N/A"}
                  </td>
                  <td className="p-3 text-sm text-gray-900">
                    {lead.userPreferences?.policy || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </dialog>
  );
};

// Add Selected Leads to Group Modal
const AddSelectedLeadsToGroupModal = ({
  showAddLeadsModal,
  setShowAddLeadsModal,
  selectedLeads,
  groupName,
  handleAddLeadsToGroupSubmit,
}) => {
  return (
    <dialog
      open={showAddLeadsModal}
      className="fixed w-full m-0 h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h5 className="text-xl font-semibold text-gray-800">
            Add {selectedLeads.length} Leads to {groupName}
          </h5>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowAddLeadsModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Are you sure you want to add {selectedLeads.length} selected leads to the group "{groupName}"?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={() => setShowAddLeadsModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAddLeadsToGroupSubmit}
          >
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
};

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
  const [showChangeGroupModal, setShowChangeGroupModal] = useState(false);
  const [showViewLeadsModal, setShowViewLeadsModal] = useState(false);
  const [showAddLeadsModal, setShowAddLeadsModal] = useState(false);
  const [viewLeadsGroup, setViewLeadsGroup] = useState({ name: "", leads: [] });
  const [groupToAddLeads, setGroupToAddLeads] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: "",
    members: [],
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
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    groupId: "",
    firstName: "",
    lastName: "",
    email: "",
    country: "USA (+1)",
    phoneNumber: "",
    secondPhoneNumber: "",
    dates: { birthDate: "", joinDate: "" },
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
        (lead) => lead && typeof lead === "object" && lead.firstName && lead.lastName
      );
      setLeads(sanitizedLeads);
      console.log("Fetched leads:", sanitizedLeads);
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
      console.log("Fetched groups:", data.groups);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch groups");
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchData();
  }, [fetchLeads, fetchData]);

  // Handle view leads for a group
  const handleViewLeads = (groupId, groupName, leads) => {
    console.log("handleViewLeads called with:", { groupId, groupName, leads });
    setViewLeadsGroup({ name: groupName, leads });
    setShowViewLeadsModal(true);
  };

  // Handle add leads to group redirect
  const handleAddLeadsToGroupRedirect = (groupId, groupName) => {
    console.log("handleAddLeadsToGroupRedirect called with:", { groupId, groupName });
    setGroupToAddLeads({ _id: groupId, name: groupName });
    setActiveTab("personal");
    setSelectedLeads([]);
    setSelectedGroupId(null);
  };

  // Handle add selected leads to group
  const handleAddLeadsToGroupSubmit = async () => {
    if (!groupToAddLeads || selectedLeads.length === 0) {
      setError("No group or leads selected");
      return;
    }
    console.log("handleAddLeadsToGroupSubmit called with:", { groupId: groupToAddLeads._id, selectedLeads }); // Add logging
    try {
      // Filter valid ObjectId strings (24-character hex strings)
      const validLeadIds = selectedLeads.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
      if (validLeadIds.length === 0) {
        setError("No valid lead IDs selected");
        return;
      }
      if (validLeadIds.length !== selectedLeads.length) {
        console.warn("Invalid lead IDs filtered out:", selectedLeads.filter((id) => !validLeadIds.includes(id)));
      }
      await addMembersToGroup(groupToAddLeads._id, validLeadIds);
      setShowAddLeadsModal(false);
      setGroupToAddLeads(null);
      setSelectedLeads([]);
      setError(null);
      await fetchLeads();
      await fetchData();
      console.log("Leads added to group:", groupToAddLeads._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add leads to group");
      console.error("Add leads error:", err);
    }
  };

  // Handle change group for selected leads
  const handleChangeGroupSubmit = async (newGroupId) => {
    if (!newGroupId) {
      setError("Please select a group");
      return;
    }
    console.log("handleChangeGroupSubmit called with:", { newGroupId, selectedLeads });
    try {
      // Update each selected lead's group
      for (const leadId of selectedLeads) {
        const lead = leads.find(l => l._id === leadId);
        if (lead) {
          await updateLead(leadId, {
            ...lead,
            groupId: newGroupId
          });
        }
      }
      
      setShowChangeGroupModal(false);
      setSelectedLeads([]);
      setError(null);
      fetchLeads(); // Refresh the leads list
      console.log("Leads reassigned to group:", newGroupId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change group");
      console.error("Change group error:", err);
    }
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
    console.log("Opening AddGroupModel with selected leads:", selectedLeads, "activeTab:", activeTab);
  };

  // Handle change group
  const handleChangeGroup = () => {
    if (selectedLeads.length === 0) {
      alert("Please select at least one lead to change group.");
      return;
    }
    setShowChangeGroupModal(true);
    console.log("Opening ChangeGroupModal for leads:", selectedLeads, "activeTab:", activeTab);
  };

  // Handle add selected leads to group (action bar)
  const handleAddToGroup = () => {
    if (selectedLeads.length === 0) {
      alert("Please select at least one lead to add to the group.");
      return;
    }
    setShowAddLeadsModal(true);
    console.log(
      "Opening AddSelectedLeadsToGroupModal for group:",
      groupToAddLeads,
      "leads:",
      selectedLeads
    );
  };

  // Update action bar visibility
  useEffect(() => {
    setShowActionBar(selectedLeads.length > 0 || selectedGroups.length > 0);
  }, [selectedLeads, selectedGroups]);

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
        country: lead.country || "USA (+1)",
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
          country: address.country || "USA",
        },
        userPreferences: {
          policy: lead.userPreferences?.policy || "active",
          whatsappMessageReceive: lead.userPreferences?.whatsappMessageReceive || false,
          browserNotifications: lead.userPreferences?.browserNotifications || false,
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
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead && lead.firstName && lead.lastName
        ? (lead.firstName + " " + lead.lastName)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : false;

    const matchesGroup = selectedGroupId
      ? lead.groupId && lead.groupId.toString() === selectedGroupId
      : true;

    return matchesSearch && matchesGroup;
  });

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

  // Handle export leads
  const handleExport = async () => {
    try {
      await exportLeads();
      setError(null);
      console.log("Leads exported successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to export leads");
      console.error("Export error:", err);
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
      console.log("Leads imported successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to import leads");
      console.error("Import error:", err);
    }
  };

  // Validate lead form
  const validateLeadForm = () => {
    console.log('Validating form...');
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = "First Name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last Name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone Number is required";
    }
    if (!formData.country.trim()) {
      errors.country = "Country is required";
    }
    
    console.log('Form validation errors:', errors);
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

  // Handle add lead
  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted, validating...');
    
    if (!validateLeadForm()) {
      console.log('Form validation failed');
      return;
    }
    
    try {
      console.log('Form data:', formData);
      
      // Format the data before sending
      const leadData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phoneNumber.trim(), // Use phoneNumber as the phone field
        country: formData.country.trim(),
        groupId: formData.groupId || null,
        date: new Date().toISOString(),
        addresses: [{
          line1: formData.address.line1.trim(),
          line2: formData.address.line2.trim(),
          line3: formData.address.line3.trim(),
          pincode: formData.address.pincode.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          county: formData.address.county.trim(),
          country: formData.address.country.trim()
        }],
        dates: {
          birthDate: formData.dates.birthDate,
          joinDate: formData.dates.joinDate
        },
        userPreferences: {
          policy: formData.userPreferences.policy,
          whatsappMessageReceive: formData.userPreferences.whatsappMessageReceive,
          browserNotifications: formData.userPreferences.browserNotifications,
          emailReceive: formData.userPreferences.emailReceive
        }
      };

      console.log('Formatted lead data:', leadData);

      // Validate required fields
      if (!leadData.firstName || !leadData.lastName || !leadData.email || !leadData.phone || !leadData.country) {
        const errorMessage = "Please fill in all required fields";
        console.log('Validation error:', errorMessage);
        setError(errorMessage);
        return;
      }

      console.log('Sending request to add lead...');
      const response = await addLead(leadData);
      console.log('Lead added successfully:', response);

      setLeads([...leads, response.lead].filter((lead) => lead && lead.firstName));
      setShowAddLeadModal(false);
      resetLeadForm();
      setError(null);
      fetchLeads();
    } catch (err) {
      console.error('Error adding lead:', err);
      const errorMessage = err.response?.data?.message || "Failed to add lead";
      setError(errorMessage);
      // Show error in UI
      alert(errorMessage);
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
      console.log("handleGroupSubmit called with groupFormData:", groupFormData);
      let response;
      if (editingGroup) {
        response = await updateGroup(editingGroup._id, groupFormData);
        console.log("updateGroup response:", response);
        setGroups(
          groups.map((group) =>
            group._id === editingGroup._id ? { ...group, ...response.group } : group
          )
        );
      } else {
        // Only create the group with the leads, don't call addMembersToGroup again
        response = await addGroup({
          ...groupFormData,
          leads: groupFormData.members,
        });
        console.log("addGroup response:", response);
        setGroups([...groups, response.group]);
      }

      setShowAddGroupModal(false);
      resetGroupForm();
      setError(null);
      fetchData();
      fetchLeads();
      console.log("Group saved, activeTab:", activeTab);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save group");
      console.error("Group save error:", err);
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

  // Handle delete selected items
  const handleDeleteSelected = async () => {
    if (window.confirm("Are you sure you want to delete the selected items?")) {
      try {
        if (activeTab === "personal") {
          for (const leadId of selectedLeads) {
            await deleteLead(leadId);
          }
          setLeads(leads.filter((lead) => !selectedLeads.includes(lead._id)));
          setSelectedLeads([]);
        } else {
          for (const groupId of selectedGroups) {
            await deleteGroup(groupId);
          }
          setGroups(groups.filter((group) => !selectedGroups.includes(group._id)));
          setSelectedGroups([]);
        }
        setError(null);
        fetchLeads();
        fetchData();
        console.log("Selected items deleted, activeTab:", activeTab);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete selected items");
        console.error("Delete error:", err);
      }
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
      dates: { birthDate: "", joinDate: "" },
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
    setFormErrors({});
  };

  // Reset group form
  const resetGroupForm = () => {
    setGroupFormData({ name: "", description: "", members: [] });
    setEditingGroup(null);
    setGroupFormErrors({});
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen">
        <div className="flex-1 p-6 overflow-auto bg-white">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Users className="mr-2" size={20} />
              <h2 className="text-2xl font-semibold text-gray-800">
                {activeTab === "personal" ? "Leads" : "Groups"}
              </h2>
              <span className="ml-2 text-gray-500">
                ({activeTab === "personal" ? filteredLeads.length : filteredGroups.length} Records Found)
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
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
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
              onClick={() => {
                setActiveTab("personal");
                setSelectedGroupId(null);
                setGroupToAddLeads(null);
                console.log("Switched to Personal Leads, reset selectedGroupId");
              }}
            >
              Personal Leads
            </button>
            <button
              className={`px-6 py-2 -mb-px ${
                activeTab === "groups"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              } font-medium focus:outline-none ml-2`}
              onClick={() => {
                setActiveTab("groups");
                setGroupToAddLeads(null);
                console.log("Switched to Groups, reset groupToAddLeads");
              }}
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
              <div className="space-x-2">
                {activeTab === "personal" && (
                  <>
                    <button
                      className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                      onClick={handleCreateGroup}
                    >
                      Create Group
                    </button>
                    <button
                      className="px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-600"
                      onClick={handleChangeGroup}
                    >
                      Change Group
                    </button>
                    {groupToAddLeads && (
                      <button
                        className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
                        onClick={handleAddToGroup}
                      >
                        Add to {groupToAddLeads.name}
                      </button>
                    )}
                    <button
                      className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
                      onClick={handleDeleteSelected}
                    >
                      Delete
                    </button>
                  </>
                )}
                {activeTab === "groups" && (
                  <button
                    className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
                    onClick={handleDeleteSelected}
                  >
                    Delete
                  </button>
                )}
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
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-10 text-gray-600">No leads found.</div>
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
              {showAddLeadModal && (
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
              {showAddGroupModal && (
                <AddGroupModel
                  formData={groupFormData}
                  formErrors={groupFormErrors}
                  showAddGroupModal={showAddGroupModal}
                  handleChange={handleGroupChange}
                  handleAddSubmit={handleGroupSubmit}
                  setShowAddGroupModal={setShowAddGroupModal}
                  setFormData={setGroupFormData}
                />
              )}
              {showChangeGroupModal && (
                <ChangeGroupModal
                  showChangeGroupModal={showChangeGroupModal}
                  setShowChangeGroupModal={setShowChangeGroupModal}
                  groupOptions={groupOptions}
                  handleChangeGroupSubmit={handleChangeGroupSubmit}
                />
              )}
              {showAddLeadsModal && (
                <AddSelectedLeadsToGroupModal
                  showAddLeadsModal={showAddLeadsModal}
                  setShowAddLeadsModal={setShowAddLeadsModal}
                  selectedLeads={selectedLeads}
                  groupName={groupToAddLeads?.name || ""}
                  handleAddLeadsToGroupSubmit={handleAddLeadsToGroupSubmit}
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
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-10 text-gray-600">No groups found.</div>
              ) : (
                <GroupTable
                  paginatedGroups={paginatedGroups}
                  selectedGroups={selectedGroups}
                  handleSelectAll={handleSelectAllGroups}
                  handleSelectGroup={handleSelectGroup}
                  setEditingGroup={setEditingGroup}
                  setGroupFormData={setGroupFormData}
                  setShowEditModal={setShowAddGroupModal}
                  handleDelete={handleDeleteGroup}
                  onViewLeads={handleViewLeads}
                  onAddLeadsToGroup={handleAddLeadsToGroupRedirect}
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
                  setFormData={setGroupFormData}
                />
              )}
              {showViewLeadsModal && (
                <ViewLeadsModal
                  showViewLeadsModal={showViewLeadsModal}
                  setShowViewLeadsModal={setShowViewLeadsModal}
                  groupName={viewLeadsGroup.name}
                  leads={viewLeadsGroup.leads}
                />
              )}
            </ErrorBoundary>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LeadsTable;