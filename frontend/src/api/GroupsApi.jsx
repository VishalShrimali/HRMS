import axios from "axios";
import { API_BASE_URL } from './BASEURL';

// Helper to get token
const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  return token;
};

// Fetch all groups
export const fetchGroups = async (url = "/groups", token) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch groups");
  return await response.json();
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

// Delete a group
export const deleteGroup = async (groupId) => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_BASE_URL}/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Delete group error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to delete group");
  }
};

// Fetch leads by group
export const fetchLeadsByGroup = async (groupId) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Expect group with populated leads
  } catch (error) {
    console.error("Fetch leads error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch leads");
  }
};

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
