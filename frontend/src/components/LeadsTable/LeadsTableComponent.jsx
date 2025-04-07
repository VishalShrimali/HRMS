import React from 'react';
import { Edit, Trash } from 'lucide-react';

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
                    selectedLeads.length === paginatedLeads.length &&
                    paginatedLeads.length > 0
                  }
                />
              </th>
              <th className="p-4 text-left text-sm font-semibold">Name & Email</th>
              <th className="p-4 text-left text-sm font-semibold">Country</th>
              <th className="p-4 text-left text-sm font-semibold">Phone</th>
              <th className="p-4 text-left text-sm font-semibold">Date</th>
              <th className="p-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLeads.map((lead) => (
              <tr
                key={lead._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => handleSelectLead(lead._id)}
                  />
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">
                    {lead.firstName} {lead.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </td>
                <td className="p-4 text-gray-700">{lead.country || 'N/A'}</td>
                <td className="p-4 text-gray-700">{lead.phone || 'N/A'}</td>
                <td className="p-4 text-gray-700">
                  {lead.dates.joinDate
                    ? new Date(lead.dates.joinDate).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="p-4 flex space-x-2">
                  <button
                    className="bg-gray-500 text-white px-3 py-1 rounded-lg flex items-center hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setEditingLead(lead);
                      setFormData({
                        firstName: lead.firstName || '',
                        lastName: lead.lastName || '',
                        email: lead.email || '',
                        country: lead.country || 'USA (+1)',
                        phoneNumber: lead.phoneNumber || '',
                        secondPhoneNumber: lead.secondPhoneNumber || '',
                        birthDate: lead.birthDate || '',
                        joinDate: lead.dates.joinDate || '',
                        address: {
                          line1: lead.address?.line1 || '',
                          line2: lead.address?.line2 || '',
                          line3: lead.address?.line3 || '',
                          pincode: lead.address?.pincode || '',
                          city: lead.address?.city || '',
                          state: lead.address?.state || '',
                          county: lead.address?.county || '',
                          country: lead.address?.country || 'USA',
                        },
                        phone: lead.phone || '',
                      });
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={14} className="mr-1" /> Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-red-700 transition-colors"
                    onClick={() => handleDelete(lead._id)}
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

export default LeadsTableComponent;