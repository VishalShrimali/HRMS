import React from "react";
import { Edit, Trash } from "lucide-react";

const LeadsTableComponent = ({
  paginatedLeads,
  selectedLeads,
  handleSelectAll,
  handleSelectLead,
  setEditingLead,
  setFormData,
  setShowEditModal,
  handleDelete,
}) => {
  const handleEditLead = (lead) => {
    setFormData({
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      country: lead.country || "USA (+1)",
      dates: {
        birthDate: lead.dates?.birthDate || "",
        joinDate: lead.dates?.joinDate || "",
      },
      address: {
        line1: lead.addresses?.[0]?.line1 || "",
        line2: lead.addresses?.[0]?.line2 || "",
        line3: lead.addresses?.[0]?.line3 || "",
        pincode: lead.addresses?.[0]?.pincode || "",
        city: lead.addresses?.[0]?.city || "",
        state: lead.addresses?.[0]?.state || "",
        country: lead.addresses?.[0]?.country || "USA",
      },
      userPreferences: {
        policy: lead.userPreferences?.policy || "active",
        whatsappMessageReceive: lead.userPreferences?.whatsappMessageReceive || false,
        browserNotifications: lead.userPreferences?.browserNotifications || false,
        emailReceive: lead.userPreferences?.emailReceive || false,
      },
    });
    setEditingLead(lead);
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
                checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
            <th className="p-3 text-sm font-medium text-gray-700">Full Name</th>
            <th className="p-3 text-sm font-medium text-gray-700">Email</th>
            <th className="p-3 text-sm font-medium text-gray-700">Phone</th>
            <th className="p-3 text-sm font-medium text-gray-700">Country</th>
            <th className="p-3 text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedLeads.map((lead) => (
            <tr key={lead._id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selectedLeads.includes(lead._id)}
                  onChange={() => {
                    console.log("Checkbox changed for lead ID:", lead._id); // Add logging
                    handleSelectLead(lead._id);
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </td>
              <td className="p-3 text-sm text-gray-900">{lead.fullName}</td>
              <td className="p-3 text-sm text-gray-900">{lead.email}</td>
              <td className="p-3 text-sm text-gray-900">{lead.phone}</td>
              <td className="p-3 text-sm text-gray-900">{lead.country}</td>
              <td className="p-3 text-sm flex space-x-2">
                <button
                  className="text-yellow-500 hover:text-yellow-700"
                  onClick={() => handleEditLead(lead)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(lead._id)}
                  title="Delete"
                >
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTableComponent;