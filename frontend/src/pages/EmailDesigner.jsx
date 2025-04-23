import { useEffect, useState, useCallback, Fragment } from "react";
import { getEmails, createEmail, updateEmail, deleteEmail } from "../api";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const EmailDesigner = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [newEmail, setNewEmail] = useState({ title: "", description: "" });
  const navigate = useNavigate();

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmails(page, search);
      setEmails(data);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleCreate = async () => {
    if (!newEmail.title) return;
    try {
      if (editingEmail) {
        await updateEmail(editingEmail._id, newEmail);
      } else {
        await createEmail(newEmail);
      }
      setShowModal(false);
      setEditingEmail(null);
      setNewEmail({ title: "", description: "" });
      fetchEmails();
    } catch (error) {
      console.error("Error creating/updating email:", error);
    }
  };

  const handleEdit = (email) => {
    setEditingEmail(email);
    setNewEmail({ title: email.title || "", description: email.description || "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this email and its template?")) return;

    try {
      await deleteEmail(id);
      await fetch(`http://localhost:8000/api/v1/templates/email/${id}`, {
        method: "DELETE",
      });
      fetchEmails();
    } catch (error) {
      console.error("❌ Error deleting email or template:", error);
      alert("❌ Failed to delete email or template.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmail(null);
    setNewEmail({ title: "", description: "" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">📧 Email Designer</h2>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search emails..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add New
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Created On</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : emails.length > 0 ? (
              emails.map((email, index) => (
                <tr key={email._id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{email.title}</td>
                  <td className="px-4 py-2 break-words max-w-md">{email.description}</td>
                  <td className="px-4 py-2">
                    {new Date(email.createdOn).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/email/editor?title=${encodeURIComponent(email.title)}&emailId=${email._id}`)
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                    >
                      📝 Builder
                    </button>
                    <button
                      onClick={() => handleEdit(email)}
                      className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(email._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No emails found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="self-center">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    {editingEmail ? "Edit Email" : "Add New Email"}
                  </Dialog.Title>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newEmail.title}
                      onChange={(e) =>
                        setNewEmail({ ...newEmail, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      value={newEmail.description}
                      onChange={(e) =>
                        setNewEmail({ ...newEmail, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      onClick={handleCreate}
                    >
                      {editingEmail ? "Update" : "Add"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default EmailDesigner;
