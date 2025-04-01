import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

const Layout = ({ children, setIsAuthenticated }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        setIsAuthenticated={setIsAuthenticated}
      />
      <div className="flex flex-1">
        <div
          className={`${
            isSidebarOpen ? "w-56" : "w-16"
          } transition-all duration-300`}
        >
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        </div>
        <main
          className={`flex-1 bg-[#F9FAFB] p-6 transition-all duration-300 ${
            isSidebarOpen ? "ml-56" : "ml-16"
          } mt-16`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;