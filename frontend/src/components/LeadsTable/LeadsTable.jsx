<<<<<<< HEAD
import React, { useState, useEffect } from "react";

const LeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", position: "" });
  const [editId, setEditId] = useState(null);

  // Fetch Leads (Simulated API)
  useEffect(() => {
    const storedLeads = JSON.parse(localStorage.getItem("leads")) || [];
    setLeads(storedLeads);
  }, []);

  // Save to Local Storage
  const saveToLocalStorage = (updatedLeads) => {
    localStorage.setItem("leads", JSON.stringify(updatedLeads));
    setLeads(updatedLeads);
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add Lead
  const handleAddLead = () => {
    if (!formData.name || !formData.email || !formData.position) return;

    const newLead = { id: Date.now(), ...formData };
    const updatedLeads = [...leads, newLead];

    saveToLocalStorage(updatedLeads);
    setFormData({ name: "", email: "", position: "" });
  };

  // Edit Lead
  const handleEditLead = (id) => {
    const leadToEdit = leads.find((lead) => lead.id === id);
    setFormData(leadToEdit);
    setEditId(id);
  };

  // Update Lead
  const handleUpdateLead = () => {
    const updatedLeads = leads.map((lead) =>
      lead.id === editId ? { ...lead, ...formData } : lead
    );

    saveToLocalStorage(updatedLeads);
    setEditId(null);
    setFormData({ name: "", email: "", position: "" });
  };

  // Delete Lead
  const handleDeleteLead = (id) => {
    const updatedLeads = leads.filter((lead) => lead.id !== id);
    saveToLocalStorage(updatedLeads);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Leads Management</h2>

      {/* Form to Add/Edit Leads */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          name="name"
          placeholder="Employee Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="email"
          name="email"
          placeholder="Employee Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="text"
          name="position"
          placeholder="Position"
          value={formData.position}
          onChange={handleChange}
          className="border p-2 rounded w-1/4"
        />
        {editId ? (
          <button onClick={handleUpdateLead} className="bg-blue-500 text-white px-4 py-2 rounded">
            Update
          </button>
        ) : (
          <button onClick={handleAddLead} className="bg-green-500 text-white px-4 py-2 rounded">
            Add
          </button>
        )}
      </div>

      {/* Leads Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Position</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="text-center">
              <td className="border p-2">{lead.name}</td>
              <td className="border p-2">{lead.email}</td>
              <td className="border p-2">{lead.position}</td>
              <td className="border p-2">
                <button onClick={() => handleEditLead(lead.id)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteLead(lead.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
=======
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Tabs, Tab, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { 
  FaSearch, FaFilter, FaPlus, FaEllipsisV, FaEdit, FaTrash, FaUsers, FaUpload, FaDownload 
} from 'react-icons/fa';

const LeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal-leads');
  const [newGroup, setNewGroup] = useState({ name: '', description: '', members: [] });
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [newLead, setNewLead] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    status: 'New',
  });
  const [editLead, setEditLead] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('token') || '';
  const API_BASE_URL = 'http://localhost:8000/api/v1';

  useEffect(() => {
    if (!token) {
      setError('No authentication token found. Please log in.');
      return;
    }
    loadData();
  }, [token, currentPage, selectedLimit]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchLeads(), fetchGroups()]);
      setError(null);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/leads?page=${currentPage}&limit=${selectedLimit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch leads: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      const data = await response.json();
      setLeads(data.leads || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
      throw error;
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch groups: ${response.status} - ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
      throw error;
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const groupData = { ...newGroup, leads: selectedLeads };
      const response = await fetch(`${API_BASE_URL}/admin/groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create group: ${errorData.message || 'Unknown error'}`);
      }
      await Promise.all([fetchGroups(), fetchLeads()]);
      setShowGroupModal(false);
      setNewGroup({ name: '', description: '', members: [] });
      setSelectedLeads([]);
      setError(null);
    } catch (error) {
      console.error('Error creating group:', error);
      setError(`Failed to create group: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!token) throw new Error('No authentication token found. Please log in.');
      const response = await fetch(`${API_BASE_URL}/admin/leads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLead),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add lead: ${errorData.message || 'Unknown error'}`);
      }
      await fetchLeads();
      setNewLead({ fullName: '', email: '', phone: '', country: '', status: 'New' });
      setShowNewLeadModal(false);
      setError(null);
    } catch (error) {
      console.error('Error adding new lead:', error);
      setError(`Failed to add lead: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLead = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/leads/${editLead._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editLead),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update lead: ${errorData.message || 'Unknown error'}`);
      }
      await fetchLeads();
      setShowEditModal(false);
      setError(null);
    } catch (error) {
      console.error('Error updating lead:', error);
      setError(`Failed to update lead: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLead = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/leads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete lead: ${errorData.message || 'Unknown error'}`);
      }
      await fetchLeads();
      setError(null);
    } catch (error) {
      console.error('Error deleting lead:', error);
      setError(`Failed to delete lead: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSelection = (leadId) => {
    setSelectedLeads(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const handleSelectAll = (e) => {
    setSelectedLeads(e.target.checked ? leads.map(lead => lead._id) : []);
  };

  const filteredLeads = leads.filter(lead =>
    lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-5 relative mt-16 ml-52 w-[calc(100%-200px)]">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="mb-0 text-xl font-semibold">
            <FaUsers className="inline mr-2" /> Leads ({leads.length} Record{leads.length !== 1 ? 's' : ''} Found)
          </h4>
          <nav aria-label="breadcrumb">
            <ol className="flex space-x-2 text-sm text-gray-500">
              <li><a href="#" className="hover:underline">Dashboard</a></li>
              <li>/</li>
              <li>{activeTab === 'personal-leads' ? 'Personal Leads' : 'Groups'}</li>
            </ol>
          </nav>
        </div>
        <div className="flex items-center">
          <div className="relative mr-2">
            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="pl-10 pr-4 py-1 border rounded-md"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline-dark" className="mr-2">
            <FaFilter className="mr-1" /> Filter
          </Button>
          <Form action="/import" method="POST" encType="multipart/form-data" className="d-flex mr-2">
            <Form.Control type="file" name="file" accept=".csv" required className="me-2" />
            <Button type="submit" variant="dark">
              <FaUpload className="mr-1" /> Import
            </Button>
          </Form>
          <Button variant="dark" href="/export" className="mr-2">
            <FaDownload className="mr-1" /> Export
          </Button>
          <Button variant="dark" onClick={() => setShowNewLeadModal(true)} disabled={isLoading}>
            <FaPlus className="mr-1" /> {isLoading ? 'Loading...' : 'Add New'}
          </Button>
          <Dropdown className="ml-2">
            <Dropdown.Toggle variant="dark" id="dropdown-actions">
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item><FaTrash className="mr-1" /> Remove Test Leads</Dropdown.Item>
              <Dropdown.Item><FaEdit className="mr-1" /> Duplicate Lead</Dropdown.Item>
              <Dropdown.Item><FaUsers className="mr-1" /> Setup Tags</Dropdown.Item>
              <Dropdown.Item><FaEllipsisV className="mr-1" /> Split Full Names</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="personal-leads" title="Personal Leads">
          <div className="flex justify-between items-center mb-3">
            <div>
              <Button 
                variant="primary" 
                onClick={() => setShowGroupModal(true)}
                disabled={selectedLeads.length === 0 || isLoading}
              >
                <FaUsers className="mr-1" /> 
                Create Group from Selected ({selectedLeads.length})
              </Button>
            </div>
            <div>
              <span className="mr-3">
                Selected: {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={selectedLeads.length === leads.length && leads.length > 0} 
                    />
                  </th>
                  <th className="p-2 text-left">Name & Email</th>
                  <th className="p-2 text-left">Country</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Tags</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map(lead => (
                    <tr key={lead._id} className="border-b">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead._id)}
                          onChange={() => handleLeadSelection(lead._id)}
                        />
                      </td>
                      <td className="p-2">{lead.fullName} <br /> <span className="text-xs text-gray-500">{lead.email}</span></td>
                      <td className="p-2">
                        <img
                          src={`https://flagcdn.com/16x12/${lead.country?.toLowerCase() || 'us'}.png`}
                          alt="Country Flag"
                          className="inline mr-1"
                        />
                        {lead.country || '-'}
                      </td>
                      <td className="p-2">{lead.phone || '-'}</td>
                      <td className="p-2">{lead.tags || '-'}</td>
                      <td className="p-2">{lead.joiningDate ? new Date(lead.joiningDate).toLocaleString() : '-'}</td>
                      <td className="p-2">
                        <Button
                          variant="dark"
                          size="sm"
                          className="mr-2"
                          onClick={() => { setEditLead(lead); setShowEditModal(true); }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteLead(lead._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-2 text-center text-gray-500">No leads found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-3">
            <Form.Select value={selectedLimit} onChange={(e) => setSelectedLimit(Number(e.target.value))} style={{ width: 'auto' }}>
              {[10, 20, 50, 100, 200, 500].map(limit => (
                <option key={limit} value={limit}>{limit}</option>
              ))}
            </Form.Select>
            <div>
              {currentPage > 1 && (
                <Button variant="link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant="link"
                  onClick={() => setCurrentPage(page)}
                  style={page === currentPage ? { fontWeight: 'bold' } : {}}
                >
                  {page}
                </Button>
              ))}
              {currentPage < totalPages && (
                <Button variant="link" onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
              )}
            </div>
          </div>
        </Tab>

        <Tab eventKey="groups" title="Groups">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Group Name</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Members</th>
                  <th className="p-2 text-left">Date Created</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.length > 0 ? (
                  groups.map(group => (
                    <tr key={group._id} className="border-b">
                      <td className="p-2">{group.name}</td>
                      <td className="p-2">{group.description || '-'}</td>
                      <td className="p-2">{group.leads?.length || 0} leads</td>
                      <td className="p-2">
                        {group.createdDate 
                          ? new Date(group.createdDate).toLocaleDateString() 
                          : '-'}
                      </td>
                      <td className="p-2">
                        <Button variant="dark" size="sm" className="mr-2">
                          <FaEdit />
                        </Button>
                        <Button variant="danger" size="sm">
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-2 text-center text-gray-500">No groups found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Tab>
      </Tabs>

      {/* Add New Lead Modal */}
      <Modal show={showNewLeadModal} onHide={() => setShowNewLeadModal(false)} centered style={{ zIndex: 1050 }}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Lead</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddLead}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={newLead.fullName}
                onChange={(e) => setNewLead({ ...newLead, fullName: e.target.value })}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                value={newLead.country}
                onChange={(e) => setNewLead({ ...newLead, country: e.target.value })}
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={newLead.status}
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                disabled={isLoading}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Lead'}
            </Button>
            <Button variant="secondary" onClick={() => setShowNewLeadModal(false)} className="ml-2" disabled={isLoading}>
              Cancel
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered style={{ zIndex: 1050 }}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Lead</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditLead}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={editLead.fullName || ''}
                onChange={(e) => setEditLead({ ...editLead, fullName: e.target.value })}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editLead.email || ''}
                onChange={(e) => setEditLead({ ...editLead, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={editLead.phone || ''}
                onChange={(e) => setEditLead({ ...editLead, phone: e.target.value })}
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                value={editLead.country || ''}
                onChange={(e) => setEditLead({ ...editLead, country: e.target.value })}
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Other Information</Form.Label>
              <Form.Control
                as="textarea"
                value={editLead.otherInfo || ''}
                onChange={(e) => setEditLead({ ...editLead, otherInfo: e.target.value })}
                disabled={isLoading}
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="secondary" onClick={() => setShowEditModal(false)} className="ml-2" disabled={isLoading}>
              Cancel
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Create Group Modal */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered style={{ zIndex: 1050 }}>
        <Modal.Header closeButton>
          <Modal.Title>Create Lead Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddGroup}>
            <Form.Group className="mb-3">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Selected Leads ({selectedLeads.length})</Form.Label>
              <div className="border p-2 rounded max-h-40 overflow-y-auto">
                {selectedLeads.length > 0 ? (
                  leads.filter(lead => selectedLeads.includes(lead._id))
                    .map(lead => (
                      <div key={lead._id} className="mb-1">
                        {lead.fullName} - {lead.email}
                      </div>
                    ))
                ) : (
                  <div className="text-gray-500">No leads selected</div>
                )}
              </div>
            </Form.Group>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={selectedLeads.length === 0 || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Group'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowGroupModal(false)} 
              className="ml-2" 
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
    </div>
  );
};

<<<<<<< HEAD
export default LeadsTable;
=======
export default LeadsTable;
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
