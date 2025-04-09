import React from 'react';
import { X } from 'lucide-react';

const AddGroupModel = ({ formData, formErrors, showAddGroupModal, handleChange, handleAddSubmit, setShowAddGroupModal }) => {
  return (
    <dialog open={showAddGroupModal} className="fixed w-full m-0 h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h5 className="text-xl font-semibold text-gray-800">Add Group</h5>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
                console.log("Clicked CLose")
                setShowAddGroupModal(false)}}
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleAddSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Group Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}
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
  );
};

export default AddGroupModel;