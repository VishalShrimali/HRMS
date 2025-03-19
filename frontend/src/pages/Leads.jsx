import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import LeadsTable from "../components/LeadsTable/LeadsTable";  // ✅ Fix import

const Leads = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-5">
          <LeadsTable />
        </div>
      </div>
    </div>
  );
};

export default Leads;
