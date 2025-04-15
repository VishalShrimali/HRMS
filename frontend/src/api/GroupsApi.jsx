// frontend/src/api/GroupsApi.js
import { API_BASE_URL } from "./BASEURL";

<<<<<<< HEAD
export const fetchGroups = async () => {
  try {
    const token = localStorage.getItem("token");
    const url = `${API_BASE_URL}/groups`;
    console.log("Fetching from:", url);
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Response:", response.status, response.headers.get("content-type"));
    if (!response.ok) {
      throw new Error(`Failed to fetch groups: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text.slice(0, 100));
      throw new Error("Received non-JSON response");
    }
    return await response.json();
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
};

export const deleteGroup = async (groupId) => {
  const token = localStorage.getItem("token");
  const url = `${API_BASE_URL}/groups/${groupId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to delete group: ${response.status}`);
  }
  return await response.json();
};

export const updateGroup = async (groupId, updateData) => {
  const token = localStorage.getItem("token");
  const url = `${API_BASE_URL}/groups/${groupId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update group: ${response.status}`);
  }
  return await response.json();
};

export const createGroup = async (groupData) => {
  const token = localStorage.getItem("token");
  const url = `${API_BASE_URL}/groups/creategroup`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(groupData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create group: ${response.status}`);
  }
  return await response.json();
};
=======
const api = API();
const fetchGroups = async () => {
  try {
    const response = await api.get("/groups");
    return response.data;
  } catch (error) {
    return error;
  }
};

const getAllUsers = async () => {
  const response = await api.get("/user/list/all");

  console.log("Data : ", response);

  return response;
};

const handleAddSubmit = async (
  e,
  fetchData,
  groupFormData,
  setFormErrors,
  setShowAddGroupModal,
  setGroupFormData
) => {
  e.preventDefault();
  setFormErrors({});

  try {
    const response = await api.post("/groups/create", groupFormData);

    const data = response;

    if (!response.ok) {
      setFormErrors(data.errors || { general: "Something went wrong." });
    } else {
      setShowAddGroupModal(false);
      setGroupFormData({ name: "", description: "" });
      fetchData(); // Refresh group list
    }
  } catch (err) {
    console.error("Error submitting group:", err);
    setFormErrors({ general: "Server error" });
  }
};

const handleAddLeadtoGroup = async (e, selectedGroupId, selectedUserId, setShowAddLeadModal, setSelectedUserId ) => {
  e.preventDefault();
  if (!selectedUserId || !selectedGroupId) return;

  try {
    const res = await api.put(`/groups/${selectedGroupId}/${selectedUserId}`);

    const data = res

    if (res.statusText == 'OK') {
      setShowAddLeadModal(false);
      setSelectedUserId("");
      // Refresh group list if needed
    } else {
      console.error(data || "Error adding lead");
    }
  } catch (err) {
    alert(err.response?.data?.message)
  }
};

export { fetchGroups, handleAddSubmit, getAllUsers, handleAddLeadtoGroup };
