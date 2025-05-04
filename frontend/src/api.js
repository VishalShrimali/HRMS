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
export const getEmails = async (page = 1, search = "") => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/emails`, {
            params: { page, search },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching emails:", error);
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
