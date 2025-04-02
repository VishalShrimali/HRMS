import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1"; // Matches your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fetch all leads
export const getLeads = async (config = {}) => {
  try {
    const response = await api.get("admin/leads", config); // Matches GetAllLeads
    return response.data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

// Add a new lead
export const addLead = async (leadData, config = {}) => {
  try {
    const response = await api.post("admin/addlead", leadData, config); // Matches AddLead
    return response.data;
  } catch (error) {
    console.error("Error adding lead:", error);
    throw error;
  }
};

// Delete a lead
export const deleteLead = async (leadId, config = {}) => {
  try {
    await api.delete(`admin/leads/${leadId}`, config); // Matches DeleteLead
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

// Update a lead
export const updateLead = async (leadId, updatedData, config = {}) => {
  try {
    const response = await api.put(`/leads/${leadId}`, updatedData, config); // Matches UpdateLead
    return response.data;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
};

export default api;