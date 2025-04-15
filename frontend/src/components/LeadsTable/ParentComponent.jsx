import React, { useState } from "react";
import LeadsTable from "./LeadsTable";
import AddLeadModel from "./AddLeadModel";
import GroupTable from "./GroupTable";

const ParentComponent = () => {
  const [leads, setLeads] = useState([]); // Initialize as an empty array
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddLead = (newLead) => {
    setLeads((prevLeads) => [...prevLeads, newLead]); // Add the new lead to the list
  };

  const handleAddGroup = () => {
    // Logic to open the Add Group modal
    console.log("Add Group button clicked");
  };

  return (
    <div>
      <button onClick={() => setShowAddModal(true)}>Add Lead</button>
      <LeadsTable leads={leads} />
      {showAddModal && (
        <AddLeadModel
          setShowAddModal={setShowAddModal}
          onAddLead={handleAddLead} // Pass the callback
        />
      )}
      <GroupTable onAddGroup={handleAddGroup} />
    </div>
  );
};

export default ParentComponent;