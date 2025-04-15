import React from 'react';
import { Edit, Trash } from 'lucide-react';

const GroupTable = ({
  setSelectedGroup = () => {},
  setShowAddLeadModal = () => {},
  paginatedGroups = [],
  selectedGroups = [],
  handleSelectAll = () => {},
  handleSelectGroup = () => {},
  setEditingGroup = () => {},
  setGroupFormData = () => {},
  setShowEditModal = () => {},
  handleDelete = () => {},
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg divide-y divide-gray-200">
        <thead className="bg-blue-500 text-white">
          <tr>
            <th className="p-4 text-left">
              <input
                type="checkbox"
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                onChange={handleSelectAll}
                checked={
                  Array.isArray(selectedGroups) &&
                  Array.isArray(paginatedGroups) &&
                  selectedGroups.length === paginatedGroups.length &&
                  paginatedGroups.length > 0
                }
              />
            </th>
            <th className="p-4 text-left text-sm font-semibold">Name</th>
            <th className="p-4 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedGroups.map((group) => (
            <tr key={group._id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  checked={selectedGroups.includes(group._id)}
                  onChange={() => handleSelectGroup(group._id)}
                />
              </td>
              <td className="p-4 text-gray-900 font-medium">
                <div>{group.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {(group.leads || []).length} lead{(group.leads || []).length !== 1 ? 's' : ''} assigned
                </div>
              </td>
              <td className="p-4 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowAddLeadModal(true);
                  }}
                  className="bg-blue-600 px-3 py-1 text-white rounded hover:bg-blue-700"
                >
                  Add Lead
                </button>
                <button
                  onClick={() => {
                    setEditingGroup(group);
                    setGroupFormData({ name: group.name || '', description: group.description || '' });
                    setShowEditModal(true);
                  }}
                  className="bg-gray-500 px-3 py-1 text-white rounded flex items-center hover:bg-gray-600"
                >
                  <Edit size={14} className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(group._id)}
                  className="bg-red-600 px-3 py-1 text-white rounded flex items-center hover:bg-red-700"
                >
                  <Trash size={14} className="mr-1" /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupTable;