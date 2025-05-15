import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

const EditLeadModel = ({
  groupOptions,
  formData,
  formErrors,
  handleChange,
  handleEditSubmit,
  setShowEditModal,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    address: false,
    dates: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <dialog
      open
      className="fixed w-full m-0 h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h5 className="text-lg font-medium text-gray-800">Edit Lead</h5>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowEditModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-6">
              {/* Required Fields */}
              <div className="space-y-4">
                <h6 className="text-sm font-medium text-gray-700">Required Information</h6>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Select Group Lead
                    </label>
                    <select
                      name="groupIds"
                      id="groupLead"
                      className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.groupIds}
                      onChange={handleChange}
                    >
                      <option value="">None</option>
                      {groupOptions?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`mt-1 p-2 w-full border rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`mt-1 p-2 w-full border rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className={`mt-1 p-2 w-full border rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4">
                <h6 className="text-sm font-medium text-gray-700">Optional Information</h6>
                
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 p-2 w-full border rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Address Section */}
                <div className="border rounded-lg p-4">
                  <button
                    type="button"
                    onClick={() => toggleSection('address')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">Address Information</span>
                    {expandedSections.address ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSections.address && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          name="address.line1"
                          value={formData.address?.line1 || ''}
                          onChange={handleChange}
                          className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          name="address.line2"
                          value={formData.address?.line2 || ''}
                          onChange={handleChange}
                          className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address?.city || ''}
                          onChange={handleChange}
                          className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address?.state || ''}
                          onChange={handleChange}
                          className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Country
                        </label>
                        <input
                          type="text"
                          name="address.country"
                          value={formData.address?.country || ''}
                          onChange={handleChange}
                          className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="address.pincode"
                          value={formData.address?.pincode || ''}
                          onChange={handleChange}
                          className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dates Section */}
                <div className="border rounded-lg p-4">
                  <button
                    type="button"
                    onClick={() => toggleSection('dates')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">Dates</span>
                    {expandedSections.dates ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSections.dates && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Birth Date
                        </label>
                        <input
                          type="date"
                          name="dates.birthDate"
                          value={formData.dates?.birthDate || ''}
                          onChange={handleChange}
                          className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Join Date
                        </label>
                        <input
                          type="date"
                          name="dates.joinDate"
                          value={formData.dates?.joinDate || ''}
                          onChange={handleChange}
                          className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Lead
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default EditLeadModel;
