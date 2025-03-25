import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import LeadsTable from "../components/LeadsTable/LeadsTable";

const Leads = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow">
        <Navbar />
        <LeadsTable />
      </div>
    </div>
  );
};

export default Leads;
