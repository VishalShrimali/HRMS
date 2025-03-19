import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1"; // ✅ Replace with your actual backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Fetch all leads
export const getLeads = async () => {
  try {
    const response = await api.get("/leads"); 
    return response.data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

// ✅ Add a new lead
export const addLead = async (leadData) => {
  try {
    const response = await api.post("/leads", leadData);
    return response.data;
  } catch (error) {
    console.error("Error adding lead:", error);
    throw error;
  }
};

// ✅ Delete a lead
export const deleteLead = async (leadId) => {
  try {
    await api.delete(`/leads/${leadId}`);
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

export default api;
