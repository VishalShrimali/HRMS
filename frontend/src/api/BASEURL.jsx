import axios from "axios";

export const API_BASE_URL = "http://localhost:8000/api/v1";

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
