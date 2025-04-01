import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaSignOutAlt,
  FaUsers,
  FaEnvelope,
  FaTachometerAlt,
  FaClipboardList,
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
      localStorage.removeItem("token"); // Updated to match Login component
      navigate("/login");
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
      >
        <FaBars size={20} />
      </button>

      {/* Sidebar Container */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-gray-800 text-gray-100 transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3
            className={`text-lg font-light tracking-wide ${
              isOpen ? "block" : "hidden"
            }`}
          >
            HRMS
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <FaBars size={18} />
          </button>
        </div>

        {/* Sidebar Links */}
        <ul className="p-4 space-y-3">
          <li>
            <Link
              to="/"
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition-colors"

            >
              <FaTachometerAlt size={18} />
              <span className={`${isOpen ? "block" : "hidden"} text-sm`}>
                Dashboard
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/leads"
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <FaClipboardList size={18} />
              <span className={`${isOpen ? "block" : "hidden"} text-sm`}>
                Leads
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/employees"
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <FaUsers size={18} />
              <span className={`${isOpen ? "block" : "hidden"} text-sm`}>
                Email-Editor
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <FaCog size={18} />
              <span className={`${isOpen ? "block" : "hidden"} text-sm`}>
                Settings
              </span>
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-2 w-full text-left rounded-md hover:bg-gray-700 hover:text-red-400 transition-colors"
            >
              <FaSignOutAlt size={18} />
              <span className={`${isOpen ? "block" : "hidden"} text-sm`}>
                Logout
              </span>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;