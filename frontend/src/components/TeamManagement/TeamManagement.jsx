import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash, ChevronDown, ChevronRight } from 'lucide-react';
import CreateTeamMemberModal from './CreateTeamMemberModal';
import EditTeamMemberModal from './EditTeamMemberModal';
import TeamApi from '../../api/TeamApi';

const TeamManagement = () => {
  const [teamHierarchy, setTeamHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [roles, setRoles] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Fetch team hierarchy
  const fetchTeamHierarchy = async () => {
    try {
      const response = await TeamApi.getTeamHierarchy();
      setTeamHierarchy(response.hierarchy);
      setError(null);
    } catch (err) {
      console.error('Error in fetchTeamHierarchy:', err);
      setError(err.message || 'Failed to fetch team hierarchy');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available roles
  const fetchRoles = async () => {
    try {
      const response = await TeamApi.getAvailableRoles();
      setRoles(response.roles || []);
    } catch (err) {
      console.error('Error in fetchRoles:', err);
      setError(err.message || 'Failed to fetch roles');
    }
  };

  useEffect(() => {
    fetchTeamHierarchy();
    fetchRoles();
  }, []);

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Handle create team member
  const handleCreateMember = async (memberData) => {
    try {
      await TeamApi.createTeamMember(memberData);
      setShowCreateModal(false);
      await fetchTeamHierarchy();
    } catch (err) {
      console.error('Error in handleCreateMember:', err);
      setError(err.message || 'Failed to create team member');
    }
  };

  // Handle update team member
  const handleUpdateMember = async (memberId, updateData) => {
    try {
      await TeamApi.updateTeamMember(memberId, updateData);
      setShowEditModal(false);
      setSelectedMember(null);
      await fetchTeamHierarchy();
    } catch (err) {
      console.error('Error in handleUpdateMember:', err);
      setError(err.message || 'Failed to update team member');
    }
  };

  // Handle remove team member
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }
    try {
      await TeamApi.removeTeamMember(memberId);
      await fetchTeamHierarchy();
    } catch (err) {
      console.error('Error in handleRemoveMember:', err);
      setError(err.message || 'Failed to remove team member');
    }
  };

  // Render team member node
  const renderTeamMember = (member) => {
    const hasChildren = member.team && member.team.length > 0;
    const isExpanded = expandedNodes.has(member._id);

    return (
      <div key={member._id} className="ml-4">
        <div className="flex items-center py-2 hover:bg-gray-50">
          {hasChildren && (
            <button
              onClick={() => toggleNode(member._id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <div className="flex-1 flex items-center">
            <Users size={16} className="mr-2 text-gray-500" />
            <span className="font-medium">{member.fullName}</span>
            <span className="ml-2 text-sm text-gray-500">({member.role?.name})</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedMember(member);
                setShowEditModal(true);
              }}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleRemoveMember(member._id)}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
              title="Remove"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-gray-200 ml-2">
            {member.team.map(child => renderTeamMember(child))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => {
            setError(null);
            fetchTeamHierarchy();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {teamHierarchy ? (
          <div className="p-4">
            {renderTeamMember(teamHierarchy)}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No team members found
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTeamMemberModal
          showModal={showCreateModal}
          setShowModal={setShowCreateModal}
          roles={roles}
          onSubmit={handleCreateMember}
        />
      )}

      {showEditModal && selectedMember && (
        <EditTeamMemberModal
          showModal={showEditModal}
          setShowModal={setShowEditModal}
          member={selectedMember}
          roles={roles}
          onSubmit={handleUpdateMember}
        />
      )}
    </div>
  );
};

export default TeamManagement; 