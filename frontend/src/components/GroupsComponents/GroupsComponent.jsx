// Installed dependencies:
// ===============================================================
import React, { useEffect, useState } from "react";
import {
  fetchGroups,
  handleAddSubmit,
  handleAddLeadtoGroup,
} from "../../api/GroupsApi";
import GroupsControlsComponent from "./GroupsControlsComponent";
import AddGroupModel from "./AddGroupModel";
import GroupTable from "./GroupTable";
import AddLeadToGroupModal from "./AddLeadToGroupModal";

// Project Files
// ===============================================================

const GroupsComponent = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ setCurrentPage] = useState(1);
  const [groups, setGroups] = useState([]);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    leads: [],
    createdBy: "",
    createdDate: "",
  });

  const fetchData = React.useCallback(async () => {
    await fetchGroups()
      .then((data) => {
        console.log(data);
        setGroups(data.groups || []);
      })
      .catch((error) => {
        console.error("Error fetching groups:", error);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value);
  };

  return (
    <>
      <GroupsControlsComponent
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setCurrentPage={setCurrentPage}
        setShowAddGroupModal={setShowAddGroupModal}
      />

      <GroupTable
        paginatedGroups={groups}
        setShowAddLeadModal={setShowAddLeadModal}
        setSelectedGroup={setSelectedGroup}
        selectedGroups={[]} // hook up if needed
        handleSelectAll={() => {}}
        handleSelectGroup={() => {}}
        setEditingGroup={() => {}}
        setGroupFormData={() => {}}
        setShowEditModal={() => {}}
        handleDelete={(id) => {
          console.log("Delete group with id:", id);
        }}
      />

      {showAddGroupModal && (
        <AddGroupModel
          formData={groupFormData}
          formErrors={formErrors}
          showAddGroupModal={showAddGroupModal}
          handleChange={handleChange}
          handleAddSubmit={(e) =>
            handleAddSubmit(
              e,
              fetchData,
              groupFormData,
              setFormErrors,
              setShowAddGroupModal,
              setGroupFormData
            )
          }
          setShowAddGroupModal={setShowAddGroupModal}
        />
      )}

      <AddLeadToGroupModal
        showAddLeadModal={showAddLeadModal}
        setShowAddLeadModal={setShowAddLeadModal}
        selectedUserId={selectedUserId}
        handleUserChange={handleUserChange}
        handleAddLeadToGroupSubmit={(e) =>
          handleAddLeadtoGroup(
            e,
            selectedGroup._id,
            selectedUserId,
            setShowAddLeadModal,
            selectedUserId
          )
        }
        selectedGroup={selectedGroup}
      />
    </>
  );
};

export default GroupsComponent;
