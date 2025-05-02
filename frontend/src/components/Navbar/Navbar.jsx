import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

const Navbar = ({ toggleSidebar, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState(localStorage.getItem("adminName") || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setAdminName(localStorage.getItem("adminName") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    window.dispatchEvent(new Event("storage")); 
    setIsAuthenticated(false);
    navigate("/auth/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white px-4 py-3 z-10 flex items-center justify-between shadow-md">
      {/* Left side */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-white transition-colors"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center" ref={dropdownRef}>
        {adminName ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2"
            >
              <span className="text-sm font-light tracking-wide">
                Hello, {adminName}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-gray-700 rounded-md shadow-lg py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-600"
                >
                  <FaSignOutAlt className="mr-2" size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/user/login")}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;