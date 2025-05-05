import axios from "axios";

// Base URL for API
const API_BASE_URL = "http://localhost:8000/api/v1";

// Helper to get token
const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  return token;
};

// Fetch all groups


export const fetchGroups = async () => {
  const response = await axios.get("/api/v1/groups");
  return response.data;
};

export const fetchLeadsByGroup = async (groupId) => {
  const response = await axios.get(`/api/v1/groups/${groupId}/leads`, {
    params: {
      fields: "firstName,lastName,email,phone,country,addresses,userPreferences,dates.joinDate", // Explicitly select fields
    },
  });
  return response.data;
};

export const handleAddSubmit = async (groupData) => {
  const response = await axios.post("/api/v1/groups/create", groupData);
  return response.data;
};

export const handleAddLeadtoGroup = async (
  event,
  groupId,
  leadId,
  setShowAddLeadModal,
  setSelectedUserId
) => {
  event.preventDefault();
  try {
    await axios.put(`/api/v1/groups/${groupId}/members`, { leadIds: [leadId] });
    setShowAddLeadModal(false);
    setSelectedUserId("");
  } catch (error) {
    console.error("Error adding lead to group:", error);
    throw error;
  }
};

export const deleteGroup = async (groupId) => {
  const response = await axios.delete(`/api/v1/groups/${groupId}`);
  return response.data;
};

// Add a new group
export const addGroup = async (groupData) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/groups/create`, groupData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Add group error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to create group");
  }
};

// Update a group
export const updateGroup = async (groupId, groupData) => {
  try {
    const token = getToken();
    const response = await axios.put(`${API_BASE_URL}/groups/${groupId}`, groupData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update group error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to update group");
  }
};

// // Delete a group
// export const deleteGroup = async (groupId) => {
//   try {
//     const token = getToken();
//     const response = await axios.delete(`${API_BASE_URL}/groups/${groupId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Delete group error:", error.response?.data || error.message);
//     throw new Error(error.response?.data?.message || error.message || "Failed to delete group");
//   }
// };

// // Fetch leads by group
// export const fetchLeadsByGroup = async (groupId) => {
//   try {
//     const token = getToken();
//     const response = await axios.get(`${API_BASE_URL}/groups/${groupId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data; // Expect group with populated leads
//   } catch (error) {
//     console.error("Fetch leads error:", error.response?.data || error.message);
//     throw new Error(error.response?.data?.message || error.message || "Failed to fetch leads");
//   }
// };

// Add multiple leads to a group
export const addMembersToGroup = async (groupId, leadIds) => {
  try {
    const token = getToken();
    const response = await axios.put(
      `${API_BASE_URL}/groups/${groupId}/members`,
      { leadIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Add members to group error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to add leads to group");
  }
};

// Add a single lead to a group
export const addLeadToGroup = async (groupId, leadId) => {
  try {
    const token = getToken();
    const response = await axios.put(`${API_BASE_URL}/groups/${groupId}/${leadId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Add lead to group error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to add lead to group");
  }
};

// Fetch all users
export const getAllUsers = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/user/list/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fetch users error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch users");
  }
};
