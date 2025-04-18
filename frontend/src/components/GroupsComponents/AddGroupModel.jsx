import React from "react";
import { X } from "lucide-react";

const AddGroupModel = ({
  formData,
  formErrors,
  showAddGroupModal,
  handleChange,
  handleAddSubmit,
  setShowAddGroupModal,
  setFormData,
}) => {
  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setShowAddGroupModal(false);
  };

  return (
    <dialog
      open={showAddGroupModal}
      aria-modal="true"
      role="dialog"
      aria-labelledby="groupModalTitle"
      className="fixed w-full m-0 h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h5 id="groupModalTitle" className="text-xl font-semibold text-gray-800">
            {formData._id ? "Edit Group" : "Add Group"}
          </h5>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Group Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 p-2 w-full border ${
                formErrors.name ? "border-red-500" : "border-gray-300"
              } rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className={`px-4 py-2 text-white rounded ${
                formData.name.trim()
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddGroupModel;
