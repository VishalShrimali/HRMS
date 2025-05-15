import axios from "axios";
import { API_BASE_URL } from './api/BASEURL';

// Helper function to get token
const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return token;
};

// Fetch all emails
export const getEmails = async (page = 1, search = "", userId = "") => {
  try {
    const token = getToken();
    const params = { page, search };
    if (userId) {
      console.log('Adding userId to request params:', userId);
      params.userId = userId;
    }
    console.log('Making API request with params:', params);
    const response = await axios.get(`${API_BASE_URL}/emails`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching emails:", error.response?.data || error.message);
    return [];
  }
};

// Create new email
export const createEmail = async (emailData) => {
    const token = getToken();
    return axios.post(`${API_BASE_URL}/emails`, emailData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Update email
export const updateEmail = async (id, emailData) => {
    const token = getToken();
    return axios.put(`${API_BASE_URL}/emails/${id}`, emailData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Delete email
export const deleteEmail = async (id) => {
    const token = getToken();
    return axios.delete(`${API_BASE_URL}/emails/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Add this to your api.js or a users API file
export const getUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return await response.json();
};
