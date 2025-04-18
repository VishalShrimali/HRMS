import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getAllUsers } from '../../api/GroupsApi';

const AddLeadToGroupModal = ({
  showAddLeadModal,
  setShowAddLeadModal,
  selectedUserId,
  handleUserChange,
  handleAddLeadToGroupSubmit,
  selectedGroup,
}) => {
  const [users, setUsers] = useState([]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error.message);
    }
  }, []);

  useEffect(() => {
    if (showAddLeadModal) {
      fetchAllUsers();
    }
  }, [showAddLeadModal, fetchAllUsers]);

  const handleClose = () => {
    setShowAddLeadModal(false);
  };

  return (
    <>
      {showAddLeadModal && (
        <dialog
          open
          aria-modal="true"
          role="dialog"
          aria-labelledby="addLeadModalTitle"
          className="fixed w-full m-0 h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h5 id="addLeadModalTitle" className="text-xl font-semibold text-gray-800">
                Add Lead to Group: <span className="text-blue-600">{selectedGroup?.name}</span>
              </h5>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleClose}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddLeadToGroupSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User to Add as Lead
                </label>
                <select
                  value={selectedUserId}
                  onChange={handleUserChange}
                  className="p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select User --</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedUserId}
                  className={`px-4 py-2 text-white rounded ${
                    selectedUserId
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-blue-300 cursor-not-allowed'
                  }`}
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
};

export default AddLeadToGroupModal;
