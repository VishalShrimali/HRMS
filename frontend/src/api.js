import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1"; // Adjust if needed

// Fetch all emails
export const getEmails = async (page = 1, search = "") => {
    try {
        const response = await axios.get(`${API_BASE_URL}/emails`, {
            params: { page, search }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching emails:", error);
        return [];
    }
};

// Create, Update, and Delete functions remain the same
export const createEmail = async (emailData) => axios.post(`${API_BASE_URL}/emails`, emailData);
export const updateEmail = async (id, emailData) => axios.put(`${API_BASE_URL}/emails/${id}`, emailData);
export const deleteEmail = async (id) => axios.delete(`${API_BASE_URL}/emails/${id}`);
