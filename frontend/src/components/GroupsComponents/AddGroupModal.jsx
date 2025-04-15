import React, { useState, useEffect } from "react";

const AddGroupModal = ({ showGroupModal, setShowGroupModal, handleSaveGroup, editingGroup }) => {
  const [groupFormData, setGroupFormData] = useState({
    groupName: "",
    description: "",
  });

  useEffect(() => {
    if (editingGroup) {
      setGroupFormData({
        groupName: editingGroup.name,
        description: editingGroup.description,
      });
    } else {
      setGroupFormData({
        groupName: "",
        description: "",
      });
    }
  }, [editingGroup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveGroup(groupFormData); // Pass the form data to the parent component
  };

  return (
    <>
      {showGroupModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {editingGroup ? "Edit Group" : "Create Group"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Group Name</label>
                <input
                  type="text"
                  name="groupName"
                  value={groupFormData.groupName}
                  onChange={(e) =>
                    setGroupFormData({ ...groupFormData, groupName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={groupFormData.description}
                  onChange={(e) =>
                    setGroupFormData({ ...groupFormData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
                  onClick={() => setShowGroupModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const AddLeadModel = ({ setShowAddModal, onAddLead }) => {
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form submitted successfully:", formData);
      onAddLead(formData); // Call the callback with the form data
      setShowAddModal(false); // Close the modal
    } else {
      console.log("Form validation failed:", formErrors);
    }
  };

  return (
    <dialog open>
      {/* Form content */}
      <form onSubmit={handleAddSubmit}>
        {/* Form fields */}
        <button type="submit">Save</button>
      </form>
    </dialog>
  );
};

export default AddGroupModal;
export { AddLeadModel };