import React, { useEffect, useState } from "react";
import {
  fetchGroups,
  handleAddSubmit,
  handleAddLeadtoGroup,
  fetchLeadsByGroup,
  deleteGroup,
} from "../../api/GroupsApi";
import GroupsControlsComponent from "./GroupsControlsComponent";
import AddGroupModel from "./AddGroupModel";
import { GroupTable } from "./GroupTable";
import AddLeadToGroupModal from "./AddLeadToGroupModal";
import LeadsTable from "../Leads/LeadsTable";

const GroupsComponent = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isViewingLeads, setIsViewingLeads] = useState(false);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [currentGroupName, setCurrentGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchGroups();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const checkUrlForGroupId = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const groupId = urlParams.get("groupId");

      if (groupId && groups.length > 0) {
        const group = groups.find((g) => g._id === groupId);
        if (group) {
          handleViewLeads(groupId, group.name);
        }
      }
    };

    if (groups.length > 0) {
      checkUrlForGroupId();
    }
  }, [fetchData, groups]);

  const handleViewLeads = async (groupId, groupName) => {
    setIsLoading(true);
    try {
      const response = await fetchLeadsByGroup(groupId);
      // Compute fullName for each lead
      const leadsWithFullName = (response.leads || []).map((lead) => ({
        ...lead,
        fullName: `${lead.firstName || ""} ${lead.lastName || ""}`.trim(),
      }));
      setFilteredLeads(leadsWithFullName);
      setCurrentGroupName(groupName);
      setIsViewingLeads(true);
      window.history.pushState({}, "", `/groups?groupId=${groupId}`);
    } catch (error) {
      console.error("Error fetching leads for group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToGroups = () => {
    setIsViewingLeads(false);
    setFilteredLeads([]);
    setCurrentGroupName("");
    window.history.pushState({}, "", "/groups");
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      setIsLoading(true);
      try {
        await deleteGroup(groupId);
        await fetchData();
      } catch (error) {
        console.error("Error deleting group:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value);
  };

  const paginatedGroups = groups.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="container mx-auto p-4">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!isViewingLeads ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Groups Management</h1>

          <GroupsControlsComponent
            rowsPerPage={rowsPerPage}
            setRowsPerPage={handleRowsPerPageChange}
            setCurrentPage={handlePageChange}
            setShowAddGroupModal={setShowAddGroupModal}
          />

          <GroupTable
            paginatedGroups={paginatedGroups}
            setShowAddLeadModal={setShowAddLeadModal}
            setSelectedGroup={setSelectedGroup}
            selectedGroups={[]}
            handleSelectAll={() => {}}
            handleSelectGroup={() => {}}
            setEditingGroup={() => {}}
            setGroupFormData={() => {}}
            setShowEditModal={() => {}}
            handleDelete={handleDeleteGroup}
            onViewLeads={handleViewLeads}
          />

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-500 px-3 py-2 text-white rounded hover:bg-gray-600"
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage * rowsPerPage >= groups.length}
              className="bg-gray-500 px-3 py-2 text-white rounded hover:bg-gray-600"
            >
              Next
            </button>
          </div>

          {showAddGroupModal && (
            <AddGroupModel
              groupFormData={groupFormData}
              formErrors={formErrors}
              showAddGroupModal={showAddGroupModal}
              handleChange={(e) =>
                setFormData({ ...formData, [e.target.name]: e.target.value })
              }
              handleAddSubmit={handleAddSubmit}
              setShowAddGroupModal={setShowAddGroupModal}
              setFormData={setGroupFormData} // Updated to use groupFormData
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
                selectedGroup?._id,
                selectedUserId,
                setShowAddLeadModal,
                setSelectedUserId
              ).then(() => {
                fetchData();
              })
            }
            selectedGroup={selectedGroup}
          />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              Leads in Group: {currentGroupName}
            </h2>
            <button
              onClick={handleBackToGroups}
              className="bg-gray-500 px-3 py-2 text-white rounded hover:bg-gray-600"
            >
              Back to Groups
            </button>
          </div>

          <LeadsTable
            leads={filteredLeads}
            showGroupFilter={false} // Hide group filter when viewing group-specific leads
            groupName={currentGroupName} // Pass group name for context
          />
        </>
      )}
    </div>
  );
};

export default GroupsComponent;