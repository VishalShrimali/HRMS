import React from 'react';
import { X } from 'lucide-react';

const EditLeadModal = ({
  formData,
  formErrors,
  handleChange,
  handleEditSubmit,
  setShowEditModal,
}) => {
  return (
    <dialog
      open
      className="fixed w-full h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-full max-w-3xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h5 className="text-xl font-semibold text-gray-800">Edit Lead</h5>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowEditModal(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
          {/* Basic Info */}
          <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={formErrors.firstName} />
          <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={formErrors.lastName} />
          <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={formErrors.email} />
          <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={formErrors.phone} />

          {/* Dates */}
          <InputField label="Birth Date" name="dates.birthDate" type="date" value={formData.dates?.birthDate || ""} onChange={handleChange} error={formErrors.birthDate} />
          <InputField label="Join Date" name="dates.joinDate" type="date" value={formData.dates?.joinDate || ""} onChange={handleChange} error={formErrors.joinDate} />

          {/* Address */}
          <InputField label="Address Line 1" name="address.line1" value={formData.address?.line1 || ""} onChange={handleChange} error={formErrors.line1} />
          <InputField label="Address Line 2" name="address.line2" value={formData.address?.line2 || ""} onChange={handleChange} />
          <InputField label="Address Line 3" name="address.line3" value={formData.address?.line3 || ""} onChange={handleChange} />
          <InputField label="Pincode" name="address.pincode" value={formData.address?.pincode || ""} onChange={handleChange} error={formErrors.pincode} />
          <InputField label="City" name="address.city" value={formData.address?.city || ""} onChange={handleChange} error={formErrors.city} />
          <InputField label="State" name="address.state" value={formData.address?.state || ""} onChange={handleChange} error={formErrors.state} />
        
          <InputField label="Country" name="address.country" value={formData.address?.country || ""} onChange={handleChange} error={formErrors.country} />

          {/* Submit */}
          <div className="col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

// Reusable InputField component
const InputField = ({ label, name, type = "text", value, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

export default EditLeadModal;
