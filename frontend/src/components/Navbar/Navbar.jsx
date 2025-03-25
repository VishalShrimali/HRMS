import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState(localStorage.getItem("adminName") || "");

<<<<<<< HEAD
=======
  // Sync the admin name whenever it's updated in localStorage
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
  useEffect(() => {
    const handleStorageChange = () => {
      setAdminName(localStorage.getItem("adminName") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

<<<<<<< HEAD
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage")); // Triggers auth state update
    setIsAuthenticated(false); // ✅ Update Auth Status
=======
  // Logout function to remove token and reset auth state
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    window.dispatchEvent(new Event("storage"));
    setIsAuthenticated(false);
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
    navigate("/login");
  };

  return (
<<<<<<< HEAD
    <nav className="bg-gray-900 text-white p-4 fixed w-full top-0 left-0 z-10 shadow-md flex justify-between items-center">
=======
    <nav className="navbar bg-gray-900 text-white p-4 fixed w-full top-0 left-0 z-10 shadow-md flex justify-between items-center">
      {/* Sidebar Toggle Button */}
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
      <button onClick={toggleSidebar} className="text-white text-2xl">
        ☰
      </button>

<<<<<<< HEAD
=======
      {/* Admin Name and Logout or Login Button */}
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
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

<<<<<<< HEAD
export default Navbar;
=======
export default Navbar;
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
