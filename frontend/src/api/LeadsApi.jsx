import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getLeads = async (config = {}) => {
  try {
    const response = await api.get("user/leads", config);
    return response.data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

export const addLead = async (leadData, config = {}) => {
  try {
    const response = await api.post("user/addlead", leadData, config);
    return response.data;
  } catch (error) {
    console.error("Error adding lead:", error);
    throw error;
  }
};

export const deleteLead = async (leadId, config = {}) => {
  try {
    await api.delete(`user/leads/${leadId}`, config);
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

export const updateLead = async (leadId, updatedData, config = {}) => {
  try {
    const response = await api.put(`user/leads/${leadId}`, updatedData, config);
    return response.data;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
};

export default api;