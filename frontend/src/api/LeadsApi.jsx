import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getLeads = async (config = {}) => {
  try {
    const response = await api.get("/leads", config);
    return response.data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

export const addLead = async (leadData, config = {}) => {
  try {
    const response = await api.post("/leads/addlead", leadData, config);
    return response.data;
  } catch (error) {
    console.error("Error adding lead:", error);
    throw error;
  }
};

export const deleteLead = async (leadId, config = {}) => {
  try {
    await api.delete(`/leads/${leadId}`, config);
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

export const getGroups = async () => {
  const response = await axios.get("/groups"); // use your actual endpoint
  return response.data;
};

export const updateLead = async (leadId, updatedData, config = {}) => {
  try {
    const response = await api.put(`/leads/${leadId}`, updatedData, config);
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
    const res = await axios.post(
      `${API_BASE_URL}/leads/importleads`,
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


export default api;