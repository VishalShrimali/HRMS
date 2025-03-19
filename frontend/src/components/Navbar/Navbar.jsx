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
    setIsAuthenticated(false); // ✅ Update Auth Status
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 fixed w-full top-0 left-0 z-10 shadow-md flex justify-between items-center">
      <button onClick={toggleSidebar} className="text-white text-2xl">
        ☰
      </button>

      <div className="flex items-center space-x-4">
        {adminName ? (
          <>
            <span className="text-lg font-semibold">Welcome, {adminName}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition duration-200"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
