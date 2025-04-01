import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LeadTable = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [countries, setCountries] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  // Fetch leads from backend
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/admin/leads`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setLeads(data.leads || []);
          setTotalPages(data.totalPages || 1);
        } else {
          console.error("Error fetching leads:", data.message);
        }
      } catch (error) {
        console.error("Fetch Leads Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [currentPage, limit]);

  // Fetch countries for dropdown
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data) => {
        const sortedCountries = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  // Search filter
  const filteredLeads = leads.filter((lead) =>
    `${lead.name} ${lead.email} ${lead.phone} ${lead.countryCode} ${lead.tags || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(filteredLeads.map((lead) => lead._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]
    );
  };

  // Action handlers
  const handleImport = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch("http://localhost:8000/api/v1/leads/import", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        alert("Leads imported successfully!");
        window.location.reload(); // Refresh to show new leads
      } else {
        alert("Error importing leads.");
      }
    } catch (error) {
      console.error("Import Error:", error);
      alert("Something went wrong.");
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/leads/export", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "leads.csv";
      a.click();
    } catch (error) {
      console.error("Export Error:", error);
      alert("Error exporting leads.");
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const leadData = Object.fromEntries(formData);
    try {
      const response = await fetch("http://localhost:8000/api/v1/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(leadData),
      });
      if (response.ok) {
        alert("Lead added successfully!");
        window.location.reload();
      } else {
        alert("Error adding lead.");
      }
    } catch (error) {
      console.error("Add Lead Error:", error);
      alert("Something went wrong.");
    }
  };

  const handleEditLead = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const leadData = Object.fromEntries(formData);
    const leadId = e.target.action.split("/").pop().split("?")[0];
    try {
      const response = await fetch(`http://localhost:8000/api/v1/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(leadData),
      });
      if (response.ok) {
        alert("Lead updated successfully!");
        window.location.reload();
      } else {
        alert("Error updating lead.");
      }
    } catch (error) {
      console.error("Edit Lead Error:", error);
      alert("Something went wrong.");
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/leads/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          setLeads(leads.filter((lead) => lead._id !== id));
        } else {
          alert("Error deleting lead.");
        }
      } catch (error) {
        console.error("Delete Lead Error:", error);
        alert("Something went wrong.");
      }
    }
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      {loading && <div className="text-center">Loading...</div>}
      <div className="row" style={{ padding: "20px" }}>
        {/* Header */}
        <div className="col-md-6 mb-3">
          <div className="d-flex align-items-center">
            <h2 className="me-2" style={{ color: "#1F2937" }}>
              <i className="fas fa-users me-2"></i> Leads
            </h2>
            <small style={{ color: "#6B7280" }}>
              ({leads.length} Record{leads.length !== 1 ? "s" : ""} Found)
            </small>
          </div>
        </div>
        <div className="col-md-6 mb-3 d-flex justify-content-end">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "200px" }}
          />
          <button className="btn" style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}>
            <i className="fas fa-filter"></i> Filter
          </button>
        </div>

        {/* Actions */}
        <div className="col-md-12 mb-4">
          <div className="row">
            <div className="col-md-6 d-flex mb-3 mb-md-0">
              <form onSubmit={handleImport} encType="multipart/form-data" className="d-flex me-2">
                <input type="file" name="file" accept=".csv" required className="form-control me-2" />
                <button type="submit" className="btn" style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}>
                  <i className="fas fa-upload me-1"></i> Import
                </button>
              </form>
              <button onClick={handleExport} className="btn" style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}>
                <i className="fas fa-download me-1"></i> Export
              </button>
            </div>
            <div className="col-md-6 d-flex justify-content-end">
              <button
                className="btn me-2"
                data-bs-toggle="modal"
                data-bs-target="#addLeadsModal"
                style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}
              >
                <i className="fas fa-plus me-1"></i> Add New
              </button>
              <div className="dropdown">
                <button
                  className="btn dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}
                >
                  <i className="fas fa-ellipsis-v"></i>
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item">
                      <i className="fas fa-trash me-1"></i> Remove Test Leads
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item">
                      <i className="fas fa-copy me-1"></i> Duplicate Lead
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item">
                      <i className="fas fa-tags me-1"></i> Setup Tags
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item">
                      <i className="fas fa-random me-1"></i> Split Full Names
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Add Lead Modal */}
        <div className="modal fade" id="addLeadsModal" tabIndex="-1" aria-labelledby="addLeadsModalLabel">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleAddLead}>
                <div className="modal-header" style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}>
                  <h5 className="modal-title" id="addLeadsModalLabel">Add Leads</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" style={{ filter: "invert(1)" }}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="contactGroup" className="form-label">Contact Group</label>
                      <select id="contactGroup" className="form-select">
                        <option>Select Group</option>
                        {/* Add dynamic options here */}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="shareLead" className="form-label">Share Lead</label>
                      <input type="text" id="shareLead" className="form-control" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input type="text" id="name" name="name" required className="form-control" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input type="email" id="email" name="email" required className="form-control" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">Phone Number</label>
                      <input type="tel" id="phone" name="phone" required className="form-control" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="country" className="form-label">Country</label>
                      <select id="country" name="countryCode" className="form-select">
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.cca2} value={country.cca2.toLowerCase()}>
                            {`🇦🇶 ${country.name.common}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-12 mb-3">
                      <label htmlFor="otherInfo" className="form-label">Other Information</label>
                      <textarea id="otherInfo" name="otherInfo" className="form-control"></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" className="btn" style={{ backgroundColor: "#2DD4BF", color: "#F9FAFB" }}>Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="col-md-12">
          <div className="table-responsive">
            <table className="table table-bordered" style={{ backgroundColor: "#fff" }}>
              <thead style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}>
                <tr>
                  <th><input type="checkbox" id="selectAll" onChange={handleSelectAll} /></th>
                  <th>Name & Email</th>
                  <th>Country</th>
                  <th>Phone</th>
                  <th>Tags</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead._id)}
                        onChange={() => handleSelectRow(lead._id)}
                      />
                    </td>
                    <td>
                      {lead.name} <br /> ({lead.email})
                    </td>
                    <td>
                      <img
                        src={`https://flagcdn.com/w40/${lead.countryCode.toLowerCase()}.png`}
                        alt={`${lead.countryCode} flag`}
                        style={{ width: "24px", height: "16px" }}
                      />
                    </td>
                    <td>{lead.phone}</td>
                    <td>{lead.tags || "N/A"}</td>
                    <td>{new Date(lead.date).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-sm me-1"
                        data-bs-toggle="modal"
                        data-bs-target="#editLeadsModal"
                        onClick={() => {
                          document.getElementById("edit-name").value = lead.name;
                          document.getElementById("edit-email").value = lead.email;
                          document.getElementById("edit-phone").value = lead.phone;
                          document.getElementById("edit-country").value = lead.countryCode;
                          document.getElementById("edit-otherInfo").value = lead.otherInfo || "";
                          document.getElementById("editLeadForm").action = `/leads/${lead._id}`;
                        }}
                        style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDeleteLead(lead._id)}
                        style={{ backgroundColor: "#EF4444", color: "#F9FAFB" }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Bar */}
        {selectedLeads.length > 0 && (
          <div className="col-md-12 mt-3">
            <div className="d-flex flex-wrap gap-2 p-3 bg-white border rounded">
              <span>{selectedLeads.length} Selected</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedLeads([])}>
                Clear
              </button>
              <button className="btn btn-sm" style={{ backgroundColor: "#2DD4BF", color: "#F9FAFB" }}>
                Send Message
              </button>
              <button className="btn btn-sm" style={{ backgroundColor: "#EF4444", color: "#F9FAFB" }}>
                Delete
              </button>
              <button className="btn btn-sm" style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}>
                Share
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="col-md-12 mt-4 d-flex justify-content-between align-items-center">
          <form className="d-flex align-items-center">
            <select
              name="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="form-select me-2"
              style={{ width: "auto" }}
            >
              {[10, 20, 50, 100, 200, 500].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </form>
          <div className="d-flex gap-2">
            {currentPage > 1 && (
              <button
                className="btn btn-sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}
              >
                Previous
              </button>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn btn-sm ${page === currentPage ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setCurrentPage(page)}
                style={page === currentPage ? { backgroundColor: "#2DD4BF", color: "#F9FAFB" } : {}}
              >
                {page}
              </button>
            ))}
            {currentPage < totalPages && (
              <button
                className="btn btn-sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Edit Lead Modal */}
        <div className="modal fade" id="editLeadsModal" tabIndex="-1" aria-labelledby="editLeadsModalLabel">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form id="editLeadForm" onSubmit={handleEditLead}>
                <div className="modal-header" style={{ backgroundColor: "#1E3A8A", color: "#F9FAFB" }}>
                  <h5 className="modal-title" id="editLeadsModalLabel">Edit Leads</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" style={{ filter: "invert(1)" }}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="edit-name" className="form-label">Name</label>
                      <input type="text" id="edit-name" name="name" required className="form-control" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="edit-email" className="form-label">Email</label>
                      <input type="email" id="edit-email" name="email" required className="form-control" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="edit-phone" className="form-label">Phone Number</label>
                      <input type="tel" id="edit-phone" name="phone" required className="form-control" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="edit-country" className="form-label">Country</label>
                      <select id="edit-country" name="countryCode" className="form-select">
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.cca2} value={country.cca2.toLowerCase()}>
                            {`🇦🇶 ${country.name.common}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-12 mb-3">
                      <label htmlFor="edit-otherInfo" className="form-label">Other Information</label>
                      <textarea id="edit-otherInfo" name="otherInfo" className="form-control"></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" className="btn" style={{ backgroundColor: "#2DD4BF", color: "#F9FAFB" }}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadTable;