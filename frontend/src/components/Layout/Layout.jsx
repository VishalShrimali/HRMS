<<<<<<< HEAD
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
=======
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

const Layout = ({ setIsAuthenticated }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar
          setIsAuthenticated={setIsAuthenticated}
          className="navbar bg-gray-900 text-white p-4 flex justify-between items-center"
        />
        {/* Nested Routes */}
        <div className="flex-1 overflow-y-auto bg-white">
          <Outlet /> {/* This will render the page content like Dashboard, Leads, etc. */}
        </div>
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Layout;
=======
export default Layout;
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
