import axios from "axios";

export const API_BASE_URL = "https://hrms-n8v4.onrender.com/api/v1";

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
