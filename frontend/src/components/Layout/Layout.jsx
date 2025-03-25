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
      </div>
    </div>
  );
};

export default Layout;