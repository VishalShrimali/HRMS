import { API } from "./BASEURL";

const api = API();
const fetchGroups = async () => {
    try {
        const response = await api.get("/groups");
        return response.data;
    } catch (error) {
        return error
    }
}

const handleAddSubmit = async (e , fetchData , groupFormData , setFormErrors , setShowAddGroupModal , setGroupFormData) => {
    e.preventDefault();
    setFormErrors({});

    try {
      const response = await api.post("/groups/create", groupFormData);

      const data = response

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

export {fetchGroups , handleAddSubmit}