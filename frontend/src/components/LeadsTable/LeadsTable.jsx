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
import axios from "axios";
import { API_BASE_URL } from "../../api/BASEURL";
import AnnualReviewModal from './AnnualReviewModal';
import TeamApi from "../../api/TeamApi";

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
                <th className="p-3 text-sm font-medium text-gray-700">
                  Full Name
                </th>
                <th className="p-3 text-sm font-medium text-gray-700">Email</th>
                <th className="p-3 text-sm font-medium text-gray-700">Phone</th>
                <th className="p-3 text-sm font-medium text-gray-700">
                  Country
                </th>
                <th className="p-3 text-sm font-medium text-gray-700">
                  Address
                </th>
                <th className="p-3 text-sm font-medium text-gray-700">
                  Preferences
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-900">{`${lead.firstName} ${lead.lastName}`}</td>
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
          Are you sure you want to add {selectedLeads.length} selected leads to
          the group "{groupName}"?
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

const LeadsTable = ({ setRefreshMeetingsFlag }) => {
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
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [teamMembersError, setTeamMembersError] = useState(null);
  const [showNewClientsOnly, setShowNewClientsOnly] = useState(false);
  const [showAnnualReviewModal, setShowAnnualReviewModal] = useState(false);
  const [selectedLeadForReview, setSelectedLeadForReview] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [policiesLoading, setPoliciesLoading] = useState(true);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "USA (+1)",
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
    userPreferences: {
      policy: "active",
      whatsappMessageReceive: false,
      browserNotifications: false,
      emailReceive: false,
    },
    isExistingClient: false,
    leadStatus: "new",
  });

  // Determine if the user is an admin
  const userData = JSON.parse(localStorage.getItem("userData") || '{}');
  const isAdmin = userData.roleName === "ADMIN" || userData.roleName === "Super Admin";
  const isTeamLeader = userData.roleName === "Team Leader";

  useEffect(() => {
    const fetchUsers = async () => {
      // Only fetch all users if the user is an admin
      if (!isAdmin) return;
      
      setUsersLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/user/list/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(response.data.users || []);
        setUsersError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsersError(err.message || "Failed to fetch users");
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      // Only fetch team members if the user is a team leader
      if (!isTeamLeader) return;
      
      setTeamMembersLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/team/members`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTeamMembers(response.data.teamMembers || []);
        setTeamMembersError(null);
      } catch (err) {
        console.error("Error fetching team members:", err);
        setTeamMembersError(err.message || "Failed to fetch team members");
      } finally {
        setTeamMembersLoading(false);
      }
    };

    fetchTeamMembers();
  }, [isTeamLeader]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLeads([]); // Clear leads when no token
        return;
      }

      const data = await getLeads();
      // Ensure we're working with the correct data structure
      const leadsArray = Array.isArray(data.leads) ? data.leads : [];
      const sanitizedLeads = leadsArray.filter(
        (lead) =>
          lead && typeof lead === "object" && lead.firstName && lead.lastName
      );

      // Clear existing leads before setting new ones
      setLeads([]);
      setLeads(sanitizedLeads);
      console.log("Fetched leads:", sanitizedLeads);
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err.response?.data?.message || "Failed to fetch leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add useEffect to fetch leads on component mount and when token changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Clear existing leads before fetching new ones
      setLeads([]);
      fetchLeads();
    } else {
      setLeads([]); // Clear leads when no token
    }
  }, [fetchLeads]);

  // Add a listener for token changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        if (e.newValue) {
          fetchLeads();
        } else {
          setLeads([]);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchLeads]);

  // Fetch groups
  const fetchData = useCallback(async (userId) => {
    try {
      // Pass userId as query param if selected and user is admin
      let url = "/groups";
      if (userId) {
        url += `?userId=${userId}`;
      }
      const token = localStorage.getItem("token");
      const response = await fetchGroups(url, token); // You may need to update fetchGroups to accept url/token
      setGroups(response.groups || []);
      setGroupOptions(
        (response.groups || []).map((g) => ({ label: g.name, value: g._id }))
      );
      console.log("Fetched groups:", response.groups);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch groups");
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchData(selectedUserId); // Pass selectedUserId
  }, [fetchLeads, fetchData, selectedUserId]);

  // Handle view leads for a group
  const handleViewLeads = (groupId, groupName, leads) => {
    console.log("handleViewLeads called with:", { groupId, groupName, leads });
    setViewLeadsGroup({ name: groupName, leads });
    setShowViewLeadsModal(true);
  };

  // Handle add leads to group redirect
  const handleAddLeadsToGroupRedirect = (groupId, groupName) => {
    console.log("handleAddLeadsToGroupRedirect called with:", {
      groupId,
      groupName,
    });
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
    console.log("handleAddLeadsToGroupSubmit called with:", {
      groupId: groupToAddLeads._id,
      selectedLeads,
    }); // Add logging
    try {
      // Filter valid ObjectId strings (24-character hex strings)
      const validLeadIds = selectedLeads.filter((id) =>
        /^[0-9a-fA-F]{24}$/.test(id)
      );
      if (validLeadIds.length === 0) {
        setError("No valid lead IDs selected");
        return;
      }
      if (validLeadIds.length !== selectedLeads.length) {
        console.warn(
          "Invalid lead IDs filtered out:",
          selectedLeads.filter((id) => !validLeadIds.includes(id))
        );
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
    console.log("handleChangeGroupSubmit called with:", {
      newGroupId,
      selectedLeads,
    });
    try {
      // Add members to the new group
      await addMembersToGroup(newGroupId, selectedLeads);
      setShowChangeGroupModal(false);
      setSelectedLeads([]);
      setError(null);
      await fetchLeads(); // Refresh the leads list
      await fetchData(); // Refresh groups data
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

  // Handle group selections
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
    console.log(
      "Opening AddGroupModel with selected leads:",
      selectedLeads,
      "activeTab:",
      activeTab
    );
  };

  // Handle change group
  const handleChangeGroup = () => {
    if (selectedLeads.length === 0) {
      alert("Please select at least one lead to change group.");
      return;
    }
    setShowChangeGroupModal(true);
    console.log(
      "Opening ChangeGroupModal for leads:",
      selectedLeads,
      "activeTab:",
      activeTab
    );
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
  const setEditingLead = async (lead) => {
    try {
      const address = lead.addresses?.[0] || {};
      // Format dates for display
      const formatDate = (date) => {
        if (!date) return "";
        try {
          // If date is a timestamp, convert to Date object
          const dateObj =
            typeof date === "number" ? new Date(date) : new Date(date);
          // Format as YYYY-MM-DD for date input
          return dateObj.toISOString().split("T")[0];
        } catch (error) {
          console.error("Error formatting date:", error);
          return "";
        }
      };
      setFormData({
        firstName: lead.firstName || "",
        lastName: lead.lastName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        country: lead.country || "USA (+1)",
        dates: {
          birthDate: formatDate(lead.dates?.birthDate),
          joinDate: formatDate(lead.dates?.joinDate),
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
          whatsappMessageReceive:
            lead.userPreferences?.whatsappMessageReceive || false,
          browserNotifications:
            lead.userPreferences?.browserNotifications || false,
          emailReceive: lead.userPreferences?.emailReceive || false,
        },
        isExistingClient: lead.isExistingClient || false,
        leadStatus: lead.leadStatus || "new",
      });
      setEditingLeadState(lead);
      setShowEditLeadModal(true);
      setError(null);
    } catch (err) {
      console.error("Error setting editing lead:", err);
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

    const matchesUser = selectedUserId
      ? lead.userId && lead.userId.toString() === selectedUserId
      : true;

    const matchesClientFilter = showNewClientsOnly
      ? lead.leadStatus === "new"
      : true;

    return matchesSearch && matchesGroup && matchesUser && matchesClientFilter;
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
      const token = localStorage.getItem("token");
      const response = await axios.get('/leads/export', {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
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

  // Update validateLeadForm to use 'phone' consistently
  const validateLeadForm = () => {
    const errors = {};

    // Only validate required fields
    if (!formData.firstName?.trim()) {
      errors.firstName = "First Name is required";
    }
    if (!formData.lastName?.trim()) {
      errors.lastName = "Last Name is required";
    }

    // Phone validation
    if (!formData.phone) {
      errors.phone = "Phone Number is required";
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      errors.phone = "Phone number must be between 10 and 15 digits";
    }

    // Email validation only if provided
    if (formData.email?.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

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
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    // Update form data
    setFormData((prev) => {
      const newFormData = { ...prev };
      if (name.includes(".")) {
        const [section, field] = name.split(".");
        newFormData[section] = { ...newFormData[section], [field]: fieldValue };
      } else {
        newFormData[name] = fieldValue;
      }
      return newFormData;
    });

    // Real-time validation
    let error = "";
    const fieldName = name.split(".").pop(); // Get the last part of the field name for nested fields
    switch (fieldName) {
      case "line1":
        if (!fieldValue) error = "Address Line 1 is required";
        break;
      case "pincode":
        if (!fieldValue) error = "Pincode is required";
        break;
      case "city":
        if (!fieldValue) error = "City is required";
        break;
      case "state":
        if (!fieldValue) error = "State is required";
        break;
      case "phone":
        if (!fieldValue) {
          error = "Phone number is required";
        } else if (!/^\d{10}$/.test(fieldValue)) {
          error = "Phone number must be 10 digits";
        }
        break;
      case "email":
        if (fieldValue && !/\S+@\S+\.\S+/.test(fieldValue)) {
          error = "Invalid email format";
        }
        break;
      default:
        break;
    }

    // Update form errors
    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
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

  // Update handleAddLeadSubmit to use consistent phone field
  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (!validateLeadForm()) return;

    try {
      // Start with only the required fields
      const leadData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone,
      };

      // Only add optional fields if they have values
      if (formData.groupId?.trim()) {
        leadData.groupId = formData.groupId.trim();
      }
      if (formData.leadStatus) {
        leadData.leadStatus = formData.leadStatus;
      }
      if (formData.email?.trim()) {
        leadData.email = formData.email.trim();
      }
      if (formData.address?.line1?.trim()) {
        leadData.addresses = [{
          line1: formData.address.line1.trim(),
          ...(formData.address.line2?.trim() && { line2: formData.address.line2.trim() }),
          ...(formData.address.pincode?.trim() && { pincode: formData.address.pincode.trim() }),
          ...(formData.address.city?.trim() && { city: formData.address.city.trim() }),
          ...(formData.address.state?.trim() && { state: formData.address.state.trim() }),
          ...(formData.address.country?.trim() && { country: formData.address.country.trim() }),
        }];
      }
      if (formData.dates?.birthDate) {
        leadData.dates = { ...leadData.dates, birthDate: formData.dates.birthDate };
      }
      if (formData.dates?.joinDate) {
        leadData.dates = { ...leadData.dates, joinDate: formData.dates.joinDate };
      }
      if (formData.userPreferences) {
        leadData.userPreferences = {
          policy: formData.userPreferences.policy || "active",
          whatsappMessageReceive: !!formData.userPreferences.whatsappMessageReceive,
          browserNotifications: !!formData.userPreferences.browserNotifications,
          emailReceive: !!formData.userPreferences.emailReceive,
        };
      }

      const response = await addLead(leadData);
      setLeads([...leads, response.lead].filter((lead) => lead && lead.firstName));
      setShowAddLeadModal(false);
      resetLeadForm();
      setError(null);
      fetchLeads();
    } catch (err) {
      console.error("Error adding lead:", err);
      const errorMessage = err.response?.data?.message || "Failed to add lead";

      // Handle phone validation error
      if (errorMessage.includes("phone")) {
        setFormErrors((prev) => ({
          ...prev,
          phone: "Phone number must be between 10 and 15 digits",
        }));
      } else if (errorMessage === "Email already exists") {
        setFormErrors((prev) => ({
          ...prev,
          email: "Email already exists",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }));
      }
    }
  };

  // Update handleEditLeadSubmit
  const handleEditLeadSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (!validateLeadForm()) return;

    try {
      // Prepare the update data, only including non-empty values
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        leadStatus: formData.leadStatus || "new",
      };

      // Only add optional fields if they have values
      if (formData.email?.trim()) {
        updateData.email = formData.email.trim();
      }
      if (formData.country?.trim()) {
        updateData.country = formData.country.trim();
      }

      // Handle address if any field is filled
      if (formData.address?.line1?.trim() || 
          formData.address?.city?.trim() || 
          formData.address?.state?.trim() || 
          formData.address?.pincode?.trim()) {
        updateData.addresses = [{
          ...(formData.address.line1?.trim() && { line1: formData.address.line1.trim() }),
          ...(formData.address.line2?.trim() && { line2: formData.address.line2.trim() }),
          ...(formData.address.line3?.trim() && { line3: formData.address.line3.trim() }),
          ...(formData.address.pincode?.trim() && { pincode: formData.address.pincode.trim() }),
          ...(formData.address.city?.trim() && { city: formData.address.city.trim() }),
          ...(formData.address.state?.trim() && { state: formData.address.state.trim() }),
          ...(formData.address.county?.trim() && { county: formData.address.county.trim() }),
          ...(formData.address.country?.trim() && { country: formData.address.country.trim() }),
        }];
      }

      // Handle dates only if they are provided
      if (formData.dates?.birthDate || formData.dates?.joinDate) {
        updateData.dates = {
          ...(formData.dates.birthDate && { 
            birthDate: new Date(formData.dates.birthDate).getTime() 
          }),
          ...(formData.dates.joinDate && { 
            joinDate: new Date(formData.dates.joinDate).getTime() 
          })
        };

        // Only try to preserve existing dates if editingLead exists and has dates
        if (editingLead && editingLead.dates) {
          updateData.dates = {
            ...updateData.dates,
            ...(editingLead.dates.lastLogin && { lastLogin: editingLead.dates.lastLogin }),
            ...(editingLead.dates.passwordChangedAt && { passwordChangedAt: editingLead.dates.passwordChangedAt })
          };
        }
      }

      // Handle user preferences if any are set
      if (formData.userPreferences) {
        updateData.userPreferences = {
          ...(formData.userPreferences.policy && { policy: formData.userPreferences.policy }),
          whatsappMessageReceive: !!formData.userPreferences.whatsappMessageReceive,
          browserNotifications: !!formData.userPreferences.browserNotifications,
          emailReceive: !!formData.userPreferences.emailReceive,
        };
      }

      console.log('Sending update data:', updateData); // Debug log
      const response = await updateLead(editingLead._id, updateData);
      console.log('Update response:', response); // Debug log

      // Update the leads state with the new data
      const updatedLeads = leads.map((lead) => {
        if (lead._id === editingLead._id) {
          const updatedLead = {
            ...lead,
            ...(response?.lead || {}),
            dates: {
              ...(lead.dates || {}),
              ...(response?.lead?.dates || {})
            },
            addresses: response?.lead?.addresses || lead.addresses || [],
            userPreferences: {
              ...(lead.userPreferences || {}),
              ...(response?.lead?.userPreferences || {})
            }
          };
          return updatedLead;
        }
        return lead;
      });

      setLeads(updatedLeads);
      setShowEditLeadModal(false);
      resetLeadForm();
      setError(null);
      // Refresh the leads list to ensure we have the latest data
      await fetchLeads();
    } catch (err) {
      console.error("Error updating lead:", err);
      const errorMessage = err.response?.data?.message || "Failed to update lead";
      setError(errorMessage);
      // Log the full error for debugging
      console.error("Full error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    }
  };

  // Handle add/edit group
  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    if (!validateGroupForm()) return;
    try {
      console.log(
        "handleGroupSubmit called with groupFormData:",
        groupFormData
      );
      let response;
      if (editingGroup) {
        response = await updateGroup(editingGroup._id, groupFormData);
        console.log("updateGroup response:", response);
        setGroups(
          groups.map((group) =>
            group._id === editingGroup._id
              ? { ...group, ...response.group }
              : group
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
      // Clear selected leads and reset view after group creation
      setSelectedLeads([]);
      setActiveTab("personal");
      // Refresh data
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
          setGroups(
            groups.filter((group) => !selectedGroups.includes(group._id))
          );
          setSelectedGroups([]);
        }
        setError(null);
        fetchLeads();
        fetchData();
        console.log("Selected items deleted, activeTab:", activeTab);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to delete selected items"
        );
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
      phone: "",
      country: "USA (+1)",
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
      userPreferences: {
        policy: "active",
        whatsappMessageReceive: false,
        browserNotifications: false,
        emailReceive: false,
      },
      isExistingClient: false,
      leadStatus: "new",
    });
    setEditingLeadState(null);
    setFormErrors({});
    setFormSubmitted(false);
  };

  // Reset group form
  const resetGroupForm = () => {
    setGroupFormData({ name: "", description: "", members: [] });
    setEditingGroup(null);
    setGroupFormErrors({});
    setFormSubmitted(false);
  };

  // Handle annual review
  const handleAnnualReview = (lead) => {
    setShowAnnualReviewModal(true);
    setSelectedLeadForReview(lead);
  };

  // Handle meeting scheduled
  const handleMeetingScheduled = () => {
    if (setRefreshMeetingsFlag) {
      setRefreshMeetingsFlag(prev => !prev);
    }
    // Optionally, also refresh the current lead's meetings in this modal
    // This might be redundant if AnnualReviewModal already refetches its own meetings
    // but ensures consistency.
  };

  // Fetch policies for this lead
  useEffect(() => {
    if (!selectedLeadForReview || !selectedLeadForReview._id) return;
    setPoliciesLoading(true);
    axios.get(`${API_BASE_URL}/leads/${selectedLeadForReview._id}/policies`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setPolicies(res.data.policies || []))
      .catch(() => setPolicies([]))
      .finally(() => setPoliciesLoading(false));
  }, [selectedLeadForReview && selectedLeadForReview._id]);

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
                (
                {activeTab === "personal"
                  ? filteredLeads.length
                  : filteredGroups.length}{" "}
                Records Found)
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === "personal" && (
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={showNewClientsOnly}
                      onChange={(e) => setShowNewClientsOnly(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Show New Leads Only
                    </span>
                  </label>
                </div>
              )}
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
                console.log(
                  "Switched to Personal Leads, reset selectedGroupId"
                );
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
              {isAdmin && (
                <div className="mb-4">
                  <label
                    htmlFor="userFilter"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Filter by User
                  </label>
                  {usersLoading ? (
                    <div>Loading users...</div>
                  ) : usersError ? (
                    <div className="text-red-500">{usersError}</div>
                  ) : users.length === 0 ? (
                    <div>No users available</div>
                  ) : (
                    <select
                      id="userFilter"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Users</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              {!isAdmin && userData.roleName === "Team Leader" && (
                <div className="mb-4">
                  <label
                    htmlFor="teamMemberFilter"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Filter by Team Member
                  </label>
                  {teamMembersLoading ? (
                    <div>Loading team members...</div>
                  ) : teamMembersError ? (
                    <div className="text-red-500">{teamMembersError}</div>
                  ) : teamMembers.length === 0 ? (
                    <div>No team members available</div>
                  ) : (
                    <select
                      id="teamMemberFilter"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Team Members</option>
                      {teamMembers.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.firstName} {member.lastName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              {loading ? (
                <div className="text-center py-10 text-gray-600">
                  Loading...
                </div>
              ) : error && isAdmin ? (
                <div className="text-center py-10 text-red-500">{error}</div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-10 text-gray-600">
                  No leads found.
                </div>
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
                  onAnnualReview={handleAnnualReview}
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
                  formErrors={formSubmitted ? formErrors : {}}
                  setShowAddModal={setShowAddLeadModal}
                />
              )}
              {showEditLeadModal && (
                <EditLeadModal
                  formData={formData}
                  formErrors={formSubmitted ? formErrors : {}} // Only show errors if form was submitted
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
              {/* Annual Review Modal */}
              {showAnnualReviewModal && selectedLeadForReview && (
                <AnnualReviewModal
                  showModal={showAnnualReviewModal}
                  setShowModal={setShowAnnualReviewModal}
                  lead={selectedLeadForReview}
                  onMeetingScheduled={handleMeetingScheduled}
                >
                  <div className="mt-8">
                    <h6 className="font-medium text-gray-700 mb-2">Policies Sold</h6>
                    {policiesLoading ? (
                      <div>Loading policies...</div>
                    ) : (
                      <div>
                        <div className="font-bold mb-2">Total: {(policies || []).length}</div>
                        {(policies || []).length === 0 ? (
                          <div>No policies sold yet.</div>
                        ) : (
                          <ul className="list-disc ml-6">
                            {(policies || []).map(policy => (
                              <li key={policy._id}>
                                {policy.policyType} - {policy.amount} - {new Date(policy.soldAt).toLocaleDateString()}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </AnnualReviewModal>
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
                <div className="text-center py-10 text-gray-600">
                  Loading...
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">{error}</div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-10 text-gray-600">
                  No groups found.
                </div>
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
