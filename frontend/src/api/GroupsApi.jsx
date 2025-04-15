import { API } from "./BASEURL";

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
