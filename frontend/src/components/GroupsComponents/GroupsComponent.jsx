import React, { useEffect, useState } from "react";
import {
  fetchGroups,
  handleAddSubmit,
  handleAddLeadtoGroup,
  fetchLeadsByGroup,
} from "../../api/GroupsApi";
import GroupsControlsComponent from "./GroupsControlsComponent";
import AddGroupModel from "./AddGroupModel";
import { GroupTable } from "./GroupTable";
import AddLeadToGroupModal from "./AddLeadToGroupModal";
import LeadsTable from "../Leads/LeadsTable"; // Make sure this path is correct

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

  // New state for lead filtering
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
    
    // Check URL for direct navigation to a group's leads
    const checkUrlForGroupId = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const groupId = urlParams.get('groupId');
      
      if (groupId && groups.length > 0) {
        const group = groups.find(g => g._id === groupId);
        if (group) {
          handleViewLeads(groupId, group.name);
        }
      }
    };
    
    if (groups.length > 0) {
      checkUrlForGroupId();
    }
  }, [fetchData, groups]);

  // Function to handle viewing leads for a specific group
  const handleViewLeads = async (groupId, groupName) => {
    setIsLoading(true);
    try {
      const response = await fetchLeadsByGroup(groupId);
      setFilteredLeads(response.leads || []);
      setCurrentGroupName(groupName);
      setIsViewingLeads(true);
      
      // Update URL without page refresh
      window.history.pushState({}, "", `/groups?groupId=${groupId}`);
    } catch (error) {
      console.error("Error fetching leads for group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to go back to groups view
  const handleBackToGroups = () => {
    setIsViewingLeads(false);
    window.history.pushState({}, "", "/groups");
  };

  // Handle deleting a group
  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      setIsLoading(true);
      try {
        await deleteGroup(groupId); // Make sure to import this function
        await fetchData(); // Refresh groups after deletion
      } catch (error) {
        console.error("Error deleting group:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Paginate groups based on current page and rows per page
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
        // Groups View
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
            selectedGroups={[]} // Hook up if needed
            handleSelectAll={() => {}}
            handleSelectGroup={() => {}}
            setEditingGroup={() => {}}
            setGroupFormData={() => {}}
            setShowEditModal={() => {}}
            handleDelete={handleDeleteGroup}
            onViewLeads={handleViewLeads} // Add the new prop
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
              setFormData={setFormData}
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
                // Refresh data after adding a lead
                fetchData();
              })
            }
            selectedGroup={selectedGroup}
          />
        </>
      ) : (
        // Leads View for a specific group
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
          
          {/* Your LeadsTable component - make sure to pass any required props */}
          <LeadsTable 
            leads={filteredLeads} 
            // Additional props your LeadsTable might need
          />
        </>
      )}
    </div>
  );
};

export default GroupsComponent;
