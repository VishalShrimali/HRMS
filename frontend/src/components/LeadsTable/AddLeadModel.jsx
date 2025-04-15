// Installed dependencies:
// ===============================================================
import React, { useState } from 'react';
import { X } from 'lucide-react'

// Project Files 
// ===============================================================

const AddLeadModel = ({ setShowAddModal }) => {
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = React.useState({
    dates: {
      birthDate: "",
      joinDate: "",
    },
    address: {
      line1: "",
      line2: "",
      line3: "",
      pincode: "",
      city: "",
      state: "",
      county: "",
      country: "",
    },
    userPreferences: {
      policy: "active",
      whatsappMessageReceive: false,
      browserNotifications: false,
      emailReceive: false,
    },
    // other fields...
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name.includes(".")) {
      // Handle nested fields like dates.birthDate
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate Birth Date
    if (!formData.dates?.birthDate) {
      errors.birthDate = "Birth Date is required";
    }

    // Validate Join Date
    if (!formData.dates?.joinDate) {
      errors.joinDate = "Join Date is required";
    }

    // Add other validations as needed...

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleAddSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (validateForm()) {
      // Proceed with form submission logic
      console.log("Form submitted successfully:", formData);
      setShowAddModal(false); // Close the modal if needed
    } else {
      console.log("Form validation failed:", formErrors);
    }
  };

  console.log("Birth Date:", formData.dates?.birthDate);
  console.log("Join Date:", formData.dates?.joinDate);

  return (
    <>
      <dialog open className="fixed w-full m-0 h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h5 className="text-lg font-medium text-gray-800">Add Lead</h5>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddModal(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[80vh]">
            <form onSubmit={handleAddSubmit}>
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
                    name="dates.birthDate"
                    value={formData.dates?.birthDate}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.birthDate && <p className="text-red-500 text-sm">{formErrors.birthDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Join Date</label>
                  <input
                    type="date"
                    name="dates.joinDate"
                    value={formData.dates?.joinDate}
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
                  <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                  <input
                    type="text"
                    name="address.line2"
                    value={formData.address.line2}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Line 3</label>
                  <input
                    type="text"
                    name="address.line3"
                    value={formData.address.line3}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">County</label>
                  <input
                    type="text"
                    name="address.county"
                    value={formData.address.county}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.country && <p className="text-red-500 text-sm">{formErrors.country}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Policy</label>
                  <select
                    name="userPreferences.policy"
                    value={formData.userPreferences?.policy}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="nonactive">Nonactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp Message Receive</label>
                  <input
                    type="checkbox"
                    name="userPreferences.whatsappMessageReceive"
                    checked={formData.userPreferences?.whatsappMessageReceive}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Browser Notifications</label>
                  <input
                    type="checkbox"
                    name="userPreferences.browserNotifications"
                    checked={formData.userPreferences?.browserNotifications}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Receive</label>
                  <input
                    type="checkbox"
                    name="userPreferences.emailReceive"
                    checked={formData.userPreferences?.emailReceive}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default AddLeadModel;