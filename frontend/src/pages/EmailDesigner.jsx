import { useEffect, useState, useCallback } from "react";
import { getEmails, createEmail, updateEmail, deleteEmail } from "../api";
import { Modal, Button, Form } from "react-bootstrap";
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
        const data = await getEmails(page, search);
        setEmails(data);
        setLoading(false);
    }, [page, search]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    const handleCreate = async () => {
        if (!newEmail.title) return; // Basic validation for title
        if (editingEmail) {
            await updateEmail(editingEmail._id, newEmail);
        } else {
            await createEmail(newEmail);
        }
        setShowModal(false);
        setEditingEmail(null);
        setNewEmail({ title: "", description: "" });
        fetchEmails();
    };

    const handleEdit = (email) => {
        setEditingEmail(email);
        setNewEmail({ title: email.title, description: email.description });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        await deleteEmail(id);
        fetchEmails();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEmail(null);
        setNewEmail({ title: "", description: "" });
    };

    return (
        <div className="container py-3"> {/* Reduced margin with py-3 */}
            <h2 className="mb-2">📧 Email Designer</h2>
            <div className="d-flex justify-content-between mb-2">
                <input
                    type="text"
                    placeholder="Search emails..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-control w-25"
                />
                <Button variant="primary"  onClick={() => setShowModal(true)}>
                    + Add New
                </Button>
            </div>

            <div className="table-responsive"> {/* Makes table responsive */}
                <table className="table table-bordered table-sm"> {/* table-sm reduces padding */}
                    <thead className="table-light">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Title</th>
                            <th scope="col" style={{ maxWidth: "400px" }}>Description</th> {/* Controlled width */}
                            <th scope="col">Created On</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center">Loading...</td>
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
                                            onClick={() => navigate(`/emaileditor?title=${encodeURIComponent(email.title)}`)}
                                        >
                                            📝 Builder
                                        </Button>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="me-1"
                                            onClick={() => handleEdit(email)}
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
                                <td colSpan="5" className="text-center">No emails found</td>
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
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </Button>
            </div>
            
            {/* Bootstrap Modal */}
            <Modal show={showModal} onHide={handleCloseModal} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingEmail ? "Edit Email" : "Add New Email"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter email title"
                                value={newEmail.title}
                                onChange={(e) => setNewEmail({ ...newEmail, title: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter email description"
                                value={newEmail.description}
                                onChange={(e) => setNewEmail({ ...newEmail, description: e.target.value })}
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