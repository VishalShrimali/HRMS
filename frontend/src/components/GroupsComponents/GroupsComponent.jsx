// Installed dependencies:
// ===============================================================
import React, { useEffect, useState } from "react";
import { fetchGroups, handleAddSubmit } from "../../api/GroupsApi";
import GroupsControlsComponent from "./GroupsControlsComponent";
import AddGroupModel from "./AddGroupModel";

// Project Files
// ===============================================================

const GroupsComponent = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [groups, setGroups] = useState([]);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: "",
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
          handleAddSubmit={(e) => handleAddSubmit(e, fetchData, groupFormData, setFormErrors, setShowAddGroupModal, setGroupFormData)}
          setShowAddGroupModal={setShowAddGroupModal}
        />
      )}
    </>
  );
};

export default GroupsComponent;
