import React from "react";
import { Edit, Trash } from "lucide-react";

const GroupTable = ({
  setSelectedGroup,
  setShowAddLeadModal,
  paginatedGroups,
  selectedGroups,
  handleSelectAll,
  handleSelectGroup,
  setEditingGroup,
  setGroupFormData,
  setShowEditModal,
  handleDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-full bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  onChange={handleSelectAll}
                  checked={
                    selectedGroups.length === paginatedGroups.length &&
                    paginatedGroups.length > 0
                  }
                />
              </th>
              <th className="p-4 text-left text-sm font-semibold">Name</th>
              <th className="p-4 text-left text-sm font-semibold">
                Description
              </th>
              <th className="p-4 text-left text-sm font-semibold">
                Created On
              </th>
              <th className="p-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedGroups.map((group) => (
              <tr
                key={group._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedGroups.includes(group._id)}
                    onChange={() => handleSelectGroup(group._id)}
                  />
                </td>
                <td className="p-4 text-gray-900 font-medium">{group.name}</td>
                <td className="p-4 text-gray-700">{group.description}</td>
                <td className="p-4 text-gray-700">
                  {new Date(group.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowAddLeadModal(true);
                    }}
                    className="bg-blue-600 px-3 py-1 text-white rounded"
                  >
                    Add Lead
                  </button>
                  <button
                    className="bg-gray-500 text-white px-3 py-1 rounded-lg flex items-center hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setEditingGroup(group);
                      setGroupFormData({
                        name: group.name || "",
                        description: group.description || "",
                      });
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={14} className="mr-1" /> Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-red-700 transition-colors"
                    onClick={() => handleDelete(group._id)}
                  >
                    <Trash size={14} className="mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupTable;
