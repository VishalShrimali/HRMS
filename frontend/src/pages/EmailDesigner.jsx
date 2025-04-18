import { useEffect, useState, useCallback } from "react";
import { getEmails, createEmail, updateEmail, deleteEmail } from "../api";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Ensure Bootstrap CSS is imported in index.js or App.js
// import "bootstrap/dist/css/bootstrap.min.css";

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
      console.log("Fetched emails:", data);
      setEmails(data);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  useEffect(() => {
    console.log("showModal state:", showModal);
  }, [showModal]);

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
    console.log("handleEdit called with:", email);
    setEditingEmail(email);
    setNewEmail({ title: email.title || "", description: email.description || "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this email and its template?")) return;

    try {
        // Delete the email record
        await deleteEmail(id);

        // Delete the associated template
        await fetch(`http://localhost:8000/api/v1/templates/email/${id}`, {
            method: "DELETE",
        });

        fetchEmails(); // Refresh email list
    } catch (error) {
        console.error("❌ Error deleting email or template:", error);
        alert("❌ Failed to delete email or template.");
    }
};


  const handleCloseModal = () => {
    console.log("handleCloseModal called");
    setShowModal(false);
    setEditingEmail(null);
    setNewEmail({ title: "", description: "" });
  };

  // Debug modal styles when it enters the DOM
  useEffect(() => {
    if (showModal) {
      const modal = document.querySelector(".modal");
      if (modal) {
        const computedStyles = window.getComputedStyle(modal);
        console.log("Modal computed styles:", {
          display: computedStyles.display,
          opacity: computedStyles.opacity,
          visibility: computedStyles.visibility,
          zIndex: computedStyles.zIndex,
          position: computedStyles.position,
          transform: computedStyles.transform,
        });
      } else {
        console.log("Modal element not found in DOM");
      }
    }
  }, [showModal]);

  return (
    <div className="container py-3">
      <h2 className="mb-2">📧 Email Designer</h2>
      <div className="d-flex justify-content-between mb-2">
        <input
          type="text"
          placeholder="Search emails..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control w-25"
        />
        <Button
          variant="primary"
          onClick={() => {
            console.log("Add New button clicked");
            setShowModal(true);
          }}
        >
          + Add New
        </Button>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-sm">
          <thead className="table-light">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Title</th>
              <th scope="col" style={{ maxWidth: "400px" }}>
                Description
              </th>
              <th scope="col">Created On</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : emails.length > 0 ? (
              emails.map((email, index) => (
                <tr key={email._id}>
                  <td>{index + 1}</td>
                  <td>{email.title}</td>
                  <td style={{ maxWidth: "400px", wordBreak: "break-word" }}>
                    {email.description}
                  </td>
                  <td>{new Date(email.createdOn).toLocaleString()}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-1"
                      onClick={() =>
                        navigate(
                          `/email/editor?title=${encodeURIComponent(
                            email.title
                          )}&emailId=${encodeURIComponent(email._id)}`
                        )
                      }
                    >
                      📝 Builder
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-1"
                      onClick={() => {
                        console.log("Edit button clicked for:", email);
                        handleEdit(email);
                      }}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(email._id)}
                    >
                      🗑️ Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No emails found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between mt-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button variant="secondary" size="sm" onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
      {/* Inline CSS to force modal visibility with high specificity */}
      <style>
        {`
          body .modal {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            z-index: 1050 !important;
            position: fixed !important;
          }
          body .modal-backdrop {
            z-index: 1040 !important;
            opacity: 0.5 !important;
            position: fixed !important;
          }
          body .modal-dialog {
            transform: none !important;
          }
        `}
      </style>
      {/* Modal with Original Form Content */}
      {console.log("Rendering Modal with showModal:", showModal)}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        centered
        style={{ zIndex: 1050, display: "block", opacity: 1 }}
        onEntered={() => console.log("Modal entered DOM")}
        onExited={() => console.log("Modal exited DOM")}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEmail ? "Edit Email" : "Add New Email"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter email title"
                value={newEmail.title || ""}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, title: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter email description"
                value={newEmail.description || ""}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, description: e.target.value })
                }
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            {editingEmail ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmailDesigner;