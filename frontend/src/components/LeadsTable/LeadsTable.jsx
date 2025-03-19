import React from "react";
import { Table, Button, Container } from "react-bootstrap";

const LeadsTable = () => {
  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Leads</h2>
        <Button variant="primary">+ Add Lead</Button>
      </div>
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td>+123456789</td>
            <td>
              <Button variant="info" size="sm" className="me-2">
                Details
              </Button>
              <Button variant="warning" size="sm" className="me-2">
                Edit
              </Button>
              <Button variant="danger" size="sm">
                Delete
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

export default LeadsTable;
