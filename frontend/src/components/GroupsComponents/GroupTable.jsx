import React from "react";
import { Users, Plus, Edit, Trash } from "lucide-react";

const GroupTable = ({
  paginatedGroups,
  selectedGroups,
  handleSelectAll,
  handleSelectGroup,
  setEditingGroup,
  setGroupFormData,
  setShowEditModal,
  handleDelete,
  onViewLeads,
  onAddLeadsToGroup,
}) => {
  const handleEditGroup = (group) => {
    setGroupFormData({
      name: group.name,
      description: group.description || "",
      members: group.leads?.map((lead) => lead._id) || [],
    });
    setEditingGroup(group);
    setShowEditModal(true);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={selectedGroups.length === paginatedGroups.length && paginatedGroups.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
            <th className="p-3 text-sm font-medium text-gray-700">Group Name</th>
            <th className="p-3 text-sm font-medium text-gray-700">Description</th>
            <th className="p-3 text-sm font-medium text-gray-700">Leads Count</th>
            <th className="p-3 text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedGroups.map((group) => (
            <tr key={group._id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group._id)}
                  onChange={() => handleSelectGroup(group._id)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </td>
              <td
                className="p-3 text-sm text-blue-600 cursor-pointer hover:underline"
                onClick={() => onViewLeads(group._id, group.name, group.leads || [])}
              >
                {group.name}
              </td>
              <td className="p-3 text-sm text-gray-900">{group.description || "N/A"}</td>
              <td className="p-3 text-sm text-gray-900">{group.leads?.length || 0}</td>
              <td className="p-3 text-sm">
                <div className="flex space-x-2">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => onViewLeads(group._id, group.name, group.leads || [])}
                    title="View Leads"
                  >
                    <Users size={16} />
                  </button>
                  <button
                    className="text-green-500 hover:text-green-700"
                    onClick={() => onAddLeadsToGroup(group._id, group.name)}
                    title="Add Leads"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    className="text-yellow-500 hover:text-yellow-700"
                    onClick={() => handleEditGroup(group)}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(group._id)}
                    title="Delete"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupTable;
