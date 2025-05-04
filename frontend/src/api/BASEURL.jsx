import axios from "axios";

// Use environment variable or fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const API = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export { API_BASE_URL };
