import { API } from "./BASEURL";

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

export default api;