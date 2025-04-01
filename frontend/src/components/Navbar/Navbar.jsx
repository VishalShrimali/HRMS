import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState(localStorage.getItem("adminName") || "");

  useEffect(() => {
    const handleStorageChange = () => {
      setAdminName(localStorage.getItem("adminName") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage")); // Triggers auth state update
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 text-gray-100 p-4 z-10 flex items-center justify-between shadow-sm">
      {/* Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className="text-gray-300 hover:text-white transition-colors"
      >
        <span className="text-2xl">☰</span>
      </button>

      {/* Right Side (Admin Name & Buttons) */}
      <div className="flex items-center space-x-6">
        {adminName ? (
          <>
            <span className="text-sm font-light tracking-wide">
              Hello, {adminName}
            </span>
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
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