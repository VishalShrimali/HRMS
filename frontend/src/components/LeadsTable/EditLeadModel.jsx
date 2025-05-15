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
      open={true}
      className="fixed w-full m-0 h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h5 className="text-xl font-semibold text-gray-800">Edit Lead</h5>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowEditModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`mt-1 p-2 w-full border rounded ${
                  formErrors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {formErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`mt-1 p-2 w-full border rounded ${
                  formErrors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {formErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 p-2 w-full border rounded ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 p-2 w-full border rounded ${
                  formErrors.phone ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {formErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Client Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isExistingClient"
              name="isExistingClient"
              checked={formData.isExistingClient}
              onChange={(e) => handleChange({
                target: {
                  name: 'isExistingClient',
                  value: e.target.checked
                }
              })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isExistingClient" className="text-sm font-medium text-gray-700">
              This is an existing client
            </label>
          </div>

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
