import { API } from "./BASEURL";
import Papa from "papaparse"; // Install this library using `npm install papaparse`

const api = API();

export const getLeads = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    let url = "/leads";
    if (userId) {
      url += `?userId=${userId}`;
    }

    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Ensure we're getting the correct data structure
    if (response.data && response.data.leads) {
      return response.data;
    }
    return { leads: response.data || [] };
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

export const addLead = async (leadData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.post("/leads", leadData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding lead:", error);
    throw error;
  }
};

export const deleteLead = async (leadId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    await api.delete(`/leads/${leadId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

export const getGroups = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.get("/groups", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};

export const updateLead = async (leadId, updatedData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.put(`/leads/${leadId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Parse the CSV file into JSON
    const jsonData = await new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error),
      });
    });

    console.log('Parsed JSON data:', jsonData);

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error('The uploaded CSV file is empty or invalid.');
    }

    // 🔄 Map camelCase keys to the backend's expected headers
    const convertKeys = (row) => ({
      'First Name': row.firstName || '',
      'Last Name': row.lastName || '',
      'Email': row.email || '',
      'Phone Number': row.phone || '',
      'Second Phone Number': row.secondPhoneNumber || '',
      'Birth Date': row.birthDate || '',
      'Join Date': row.joinDate || '',
      'Address Line 1': row.addressLine1 || '',
      'Pincode': row.pincode || '',
      'City': row.city || '',
      'State': row.state || '',
      'Country': row.country || '',
      'Address Country': row.addressCountry || '',
    });

    const formattedData = jsonData.map(convertKeys);

    // ✅ Send formatted data to backend
    const response = await api.post('/leads/importleads', formattedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to import leads';

    console.error('Error importing leads:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

export const exportLeads = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.get('/leads/export', {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_export.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting leads:', error);
    throw error;
  }
};

export const getLeadById = async (leadId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.get(`/leads/${leadId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching lead by ID:", error);
    throw error;
  }
};

export default api;