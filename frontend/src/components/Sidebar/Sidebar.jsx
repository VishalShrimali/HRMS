import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaSignOutAlt,
  FaClipboardList,
  FaEnvelope,
  FaTachometerAlt,
  FaCog,
} from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (!isOpen) return;
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Logout Function
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      // Clear auth token (Assuming you're storing it in localStorage)
      localStorage.removeItem("token");
      navigate("/login"); // Redirect to login page
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-3 bg-gray-900 text-white fixed top-4 left-4 z-50 rounded-md"
      >
        <FaBars />
      </button>

      {/* Sidebar Container */}
      <div
        ref={sidebarRef}
        className={`h-screen bg-gray-900 text-white fixed top-0 left-0 transition-all duration-300 z-40 shadow-lg ${
          isOpen ? "w-64" : "w-20"
        } md:block hidden`}
      >
        <div className="flex justify-between items-center p-4">
          <h3 className={`text-lg font-bold ${isOpen ? "block" : "hidden"}`}>
            HRMS Admin
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white md:block hidden"
          >
            <FaBars />
          </button>
        </div>

        {/* Sidebar Links */}
        <ul className="space-y-4 p-4">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 hover:text-gray-300"
            >
              <FaTachometerAlt />
              <span className={`${isOpen ? "block" : "hidden"}`}>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/leads"
              className="flex items-center space-x-2 hover:text-gray-300"
            >
              <FaClipboardList />
              <span className={`${isOpen ? "block" : "hidden"}`}>Leads</span>
            </Link>
          </li>
          <li>
            <Link
              to="/editor"
              className="flex items-center space-x-2 hover:text-gray-300"
            >
              <FaEnvelope />
              <span className={`${isOpen ? "block" : "hidden"}`}>EmailEditor</span>
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className="flex items-center space-x-2 hover:text-gray-300"
            >
              <FaCog />
              <span className={`${isOpen ? "block" : "hidden"}`}>Settings</span>
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:text-red-400 w-full"
            >
              <FaSignOutAlt />
              <span className={`${isOpen ? "block" : "hidden"}`}>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
