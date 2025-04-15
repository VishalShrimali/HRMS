// GroupTable.jsx
import React, { useState, useEffect } from "react";
import { fetchGroups, deleteGroup, updateGroup, createGroup } from "../../api/GroupsApi";
import AddGroupModal from "./AddGroupModal";

const GroupTable = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null); // For editing a group

  const fetchGroupsData = async () => {
    setLoading(true);
    try {
      const data = await fetchGroups();
      setGroups(data.groups); // Access groups array
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await deleteGroup(groupId);
        setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
        alert("Group deleted successfully");
      } catch (err) {
        alert(`Failed to delete group: ${err.message}`);
      }
    }
  };

  const handleSaveGroup = async (groupData) => {
    if (editingGroup) {
      // Update group
      try {
        const updatedGroup = await updateGroup(editingGroup.id, groupData);
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group.id === editingGroup.id ? { ...group, ...updatedGroup.group } : group
          )
        );
        alert("Group updated successfully");
      } catch (err) {
        alert(`Failed to update group: ${err.message}`);
      }
    } else {
      // Add new group
      try {
        const newGroup = await createGroup(groupData); // Call the API to create a new group
        setGroups((prevGroups) => [...prevGroups, newGroup.group]); // Add the new group to the state
        alert("Group created successfully");
      } catch (err) {
        alert(`Failed to create group: ${err.message}`);
      }
    }
    setShowGroupModal(false);
    setEditingGroup(null);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setShowGroupModal(true);
  };

  useEffect(() => {
    fetchGroupsData();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingGroup(null); // Clear editing state
            setShowGroupModal(true); // Open modal for adding a new group
          }}
        >
          + Add Group
        </button>
      </div>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>No. of Contacts</th>
                <th>Created On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>{group.description || "-"}</td>
                  <td>{group.contacts}</td>
                  <td>{group.createdOn}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => handleEdit(group)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(group.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showGroupModal && (
        <AddGroupModal
          showGroupModal={showGroupModal}
          setShowGroupModal={setShowGroupModal}
          handleSaveGroup={handleSaveGroup}
          editingGroup={editingGroup} // Pass the group being edited
        />
      )}
    </div>
  );
};

export default GroupTable;