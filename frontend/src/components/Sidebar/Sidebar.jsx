import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  FaBars,
  FaSignOutAlt,
  FaUsers,
  FaEnvelope,
  FaTachometerAlt,
  FaClipboardList,
  FaCog,
  FaTimes,
} from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const [permissions, setPermissions] = useState([]);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth < 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/v1/roles/user/permissions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions);
        } else {
          console.error("Failed to fetch permissions");
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      navigate("/auth/login");
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 shadow-lg"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-800 text-gray-100 shadow-xl transition-all duration-300 ease-in-out z-40 ${
          isOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0 md:w-16"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3
            className={`text-xl font-semibold tracking-wide ${
              isOpen ? "block" : "hidden md:block md:text-center"
            }`}
          >
            {isOpen ? "HRMS Dashboard" : ""}
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300 hover:text-white transition-colors md:block hidden"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <FaBars size={18} />
          </button>
        </div>

        <nav>
          <ul className="p-2 space-y-1">
            <SidebarItem
              to="/"
              icon={<FaTachometerAlt size={18} />}
              text="Dashboard"
              isOpen={isOpen}
              isActive={isActive("/")}
            />
            {permissions.includes("*****") && (
              <SidebarItem
                to="/roles"
                icon={<FaUsers size={18} />}
                text="Roles"
                isOpen={isOpen}
                isActive={isActive("/roles")}
              />
            )}
            <SidebarItem
              to="/leads"
              icon={<FaClipboardList size={18} />}
              text="Leads"
              isOpen={isOpen}
              isActive={isActive("/leads")}
            />
            <SidebarItem
              to="/email/designer"
              icon={<FaEnvelope size={18} />}
              text="Email Editor"
              isOpen={isOpen}
              isActive={isActive("/email/designer")}
            />
            <SidebarItem
              to="/employees"
              icon={<FaUsers size={18} />}
              text="Employees"
              isOpen={isOpen}
              isActive={isActive("/employees")}
            />
            <SidebarItem
              to="/settings"
              icon={<FaCog size={18} />}
              text="Settings"
              isOpen={isOpen}
              isActive={isActive("/settings")}
            />

            <div className="my-2 border-t border-gray-700 mx-2"></div>
            <li>
              <button
                onClick={handleLogout}
                className={`flex items-center w-full p-3 rounded-md text-left hover:bg-red-700/30 hover:text-red-300 transition-colors duration-200 ${
                  isOpen ? "px-4" : "justify-center md:px-0"
                }`}
              >
                <FaSignOutAlt size={18} />
                {isOpen && <span className="ml-3 text-sm">Logout</span>}
              </button>
            </li>
          </ul>
        </nav>

        {isOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-xs font-medium">VS</span>
              </div>
              <div>
                <p className="text-sm font-medium">ADMIN</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 p-6 bg-gray-100 min-h-screen ${
          isOpen ? "md:ml-64" : "md:ml-16"
        }`}
      >
        <Outlet /> {/* Render nested routes here */}
      </div>
    </>
  );
};

const SidebarItem = ({ to, icon, text, isOpen, isActive }) => {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center p-3 rounded-md transition-colors duration-200 ${
          isOpen ? "px-4" : "justify-center md:px-0"
        } ${
          isActive
            ? "bg-blue-700/30 text-blue-200"
            : "hover:bg-gray-700 text-gray-300 hover:text-white"
        }`}
      >
        {icon}
        {isOpen && <span className="ml-3 text-sm">{text}</span>}
      </Link>
    </li>
  );
};

export default Sidebar;
