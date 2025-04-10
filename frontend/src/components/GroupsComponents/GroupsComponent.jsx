// Installed dependencies:
// ===============================================================
import React, { useEffect, useState } from "react";
import { fetchGroups } from "../../api/GroupsApi";
import GroupsControlsComponent from "./GroupsComponents/GroupsControlsComponent";
import AddGroupModel from "./GroupsComponents/AddGroupModel";

// Project Files
// ===============================================================

const GroupsComponent = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [formErrors,setFormErrors] = useState("");
  const [groupFormData, setGroupFormData] = useState({
    });

  const fetchData = React.useCallback(async () => {
    await fetchGroups()
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching groups:", error);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = () => {}

  const handleAddSubmit = () => {}

  return (
    <>
      <GroupsControlsComponent
      rowsPerPage={rowsPerPage}
      setRowsPerPage={setRowsPerPage}
      setCurrentPage={setCurrentPage}
      setShowAddGroupModal={setShowAddGroupModal}
      />

      {showAddGroupModal && (
        <AddGroupModel 
          formData={groupFormData}
          formErrors={formErrors}
          showAddGroupModal={showAddGroupModal}
          handleChange={handleChange}
          handleAddSubmit={handleAddSubmit}
          setShowAddGroupModal={handleAddSubmit}
        />
      )}

    </>
  );
};

export default GroupsComponent;
