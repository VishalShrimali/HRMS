import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Menu, X, Users, Home, Settings } from "lucide-react";
import LeadsTable from "../src/components/LeadsTable/LeadsTable"
import Sidebar from "../src/components/Sidebar/Sidebar"
import Navbar from "../src/components/Navbar/Navbar"

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="p-5 flex-grow overflow-auto">
            <Routes>
              <Route path="/leads" element={<LeadsTable />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
