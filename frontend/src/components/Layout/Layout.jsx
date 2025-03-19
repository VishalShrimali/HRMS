import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

const Layout = ({ children, setIsAuthenticated }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with toggle option */}
      <div className={`${isSidebarOpen ? "w-64" : "w-20"} transition-all duration-300`}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 transition-all duration-300">
        {/* Pass setIsAuthenticated to Navbar */}
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} setIsAuthenticated={setIsAuthenticated} />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
