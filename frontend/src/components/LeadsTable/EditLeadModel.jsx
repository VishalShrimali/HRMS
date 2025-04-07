import React from 'react';
import { X } from 'lucide-react';

const EditLeadModal = ({ formData, formErrors, handleChange, handleEditSubmit, setShowEditModal }) => {
  return (
    <dialog open className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h5 className="text-xl font-semibold text-gray-800">Edit Lead</h5>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowEditModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.firstName && <p className="text-red-500 text-sm">{formErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.lastName && <p className="text-red-500 text-sm">{formErrors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.birthDate && <p className="text-red-500 text-sm">{formErrors.birthDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Join Date</label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.joinDate && <p className="text-red-500 text-sm">{formErrors.joinDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input
                  type="text"
                  name="address.line1"
                  value={formData.address.line1}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.line1 && <p className="text-red-500 text-sm">{formErrors.line1}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.pincode && <p className="text-red-500 text-sm">{formErrors.pincode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.city && <p className="text-red-500 text-sm">{formErrors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.state && <p className="text-red-500 text-sm">{formErrors.state}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default EditLeadModal;