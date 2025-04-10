import { API } from "./BASEURL";
import axios from "axios";

const api = API();

export const getLeads = async () => {
  try {
    const response = await api.get("/leads");
    return response.data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

export const addLead = async (leadData) => {
  try {
    const response = await api.post("/leads/addlead", leadData);
    return response.data;
  } catch (error) {
    console.error("Error adding lead:", error);
    throw error;
  }
};

export const deleteLead = async (leadId) => {
  try {
    await api.delete(`/leads/${leadId}`);
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

export const getGroups = async () => {
  const response = await api.get("/groups"); // use your actual endpoint
  return response.data;
};

export const updateLead = async (leadId, updatedData) => {
  try {
    const response = await api.put(`/leads/${leadId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
};

export const importLeads = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const formData = new FormData();
  formData.append('file', file); // Matches server-side multer.single('file')

  try {
    const res = await api.post(
      `/leads/importleads`,
      formData
      // No need to set Content-Type; Axios handles it automatically with FormData
    );
    return res.data; // Should return { message: "Leads imported successfully", importedCount: X }
  } catch (error) {
    // Extract a meaningful error message
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to import leads';

    console.error('Error importing leads:', errorMessage, error);

    // Throw a new error with a user-friendly message
    throw new Error(errorMessage);
  }
};
export const exportLeads = async () => {
  try {
    const response = await api.get('/leads/export', {
      responseType: 'blob', // Important for file downloads
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_export.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting leads:", error);
    throw error;
  }
};

export const getLeadById = async (leadId) => {
  try {
    const response = await api.get(`/leads/${leadId}`); // ✅ use your baseURL instance
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching lead by ID:", error);
    throw error;
  }
};


export default api;