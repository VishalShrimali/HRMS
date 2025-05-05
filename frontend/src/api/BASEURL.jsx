import axios from "axios";

// Get the API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Create axios instance with base URL
const API = () => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export { API, API_BASE_URL };
