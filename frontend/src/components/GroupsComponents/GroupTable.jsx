import React from "react";
import { Edit, Trash } from "lucide-react";

export const GroupTable = ({
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
  onViewLeads = null,
}) => {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-4 text-left">
              <input
                type="checkbox"
                className="h-5 w-5 text-blue-600 rounded"
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
            <th className="p-4 text-left text-sm font-semibold">Description</th>
            <th className="p-4 text-left text-sm font-semibold">No. of Contacts</th>
            <th className="p-4 text-left text-sm font-semibold">Created On</th>
            <th className="p-4 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paginatedGroups.map((group) => (
            <tr key={group._id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600"
                  checked={selectedGroups.includes(group._id)}
                  onChange={() => handleSelectGroup(group._id)}
                />
              </td>
              <td className="p-4 text-blue-600 font-medium cursor-pointer hover:underline"
                onClick={() =>
                  onViewLeads
                    ? onViewLeads(group._id, group.name)
                    : (window.location.href = `/leads?groupId=${group._id}`)
                }
              >
                {group.name}
              </td>
              <td className="p-4 text-gray-700 text-sm">
                {group.description || "No description"}
              </td>
              <td className="p-4 text-gray-700 text-sm">
                {(group.leads || []).length}
              </td>
              <td className="p-4 text-gray-700 text-sm">
                {new Date(group.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowAddLeadModal(true);
                  }}
                  className="bg-blue-600 px-3 py-1 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Add Lead
                </button>
                <button
                  onClick={() => {
                    setEditingGroup(group);
                    setGroupFormData({
                      name: group.name || "",
                      description: group.description || "",
                    });
                    setShowEditModal(true);
                  }}
                  className="bg-gray-500 px-3 py-1 text-white rounded flex items-center hover:bg-gray-600 text-sm"
                >
                  <Edit size={14} className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(group._id)}
                  className="bg-red-600 px-3 py-1 text-white rounded flex items-center hover:bg-red-700 text-sm"
                >
                  <Trash size={14} className="mr-1" /> Delete
                </button>
                <button
                  onClick={() =>
                    onViewLeads
                      ? onViewLeads(group._id, group.name)
                      : (window.location.href = `/leads?groupId=${group._id}`)
                  }
                  className="bg-green-600 px-3 py-1 text-white rounded hover:bg-green-700 text-sm"
                >
                  Leads
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
