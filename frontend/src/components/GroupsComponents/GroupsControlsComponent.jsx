import React from 'react';
import { Plus } from 'lucide-react';

const GroupsControlsComponent = ({
  rowsPerPage,
  setRowsPerPage,
  setCurrentPage,
  setShowAddGroupModal,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex"></div>
      <div className="flex space-x-4 items-center">
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 w-20 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
          onClick={() => setShowAddGroupModal(true)}
        >
          <Plus className="mr-2" size={16} /> Add Group
        </button>
      </div>
    </div>
  );
};

export default GroupsControlsComponent;