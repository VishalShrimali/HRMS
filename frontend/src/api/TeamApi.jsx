import axios from 'axios';
import { API_BASE_URL } from './BASEURL';

// Get the auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

// Configure axios with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Team Management APIs
export const TeamApi = {
  // Get team hierarchy
  getTeamHierarchy: async () => {
    try {
      const response = await api.get('/team/hierarchy');
      return response.data;
    } catch (error) {
      console.error('Error fetching team hierarchy:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get all team members
  getTeamMembers: async () => {
    try {
      const response = await api.get('/team/members');
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error.response?.data || error.message;
    }
  },

  // Create a new team member
  createTeamMember: async (memberData) => {
    try {
      // Remove password if present
      const { password, ...data } = memberData;
      const response = await api.post('/team/members', data);
      return response.data;
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update a team member
  updateTeamMember: async (memberId, memberData) => {
    try {
      const response = await api.put(`/team/members/${memberId}`, memberData);
      return response.data;
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error.response?.data || error.message;
    }
  },

  // Remove a team member
  removeTeamMember: async (memberId) => {
    try {
      const response = await api.delete(`/team/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get available roles for the current user
  getAvailableRoles: async () => {
    try {
      const response = await api.get('/roles/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available roles:', error);
      throw error.response?.data || error.message;
    }
  },

  // Set password for invited user
  setPassword: async (token, password) => {
    try {
      const response = await api.post('/users/set-password', { token, password });
      return response.data;
    } catch (error) {
      console.error('Error setting password:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default TeamApi; 