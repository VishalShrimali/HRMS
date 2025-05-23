import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import axios from "axios";
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
  const [userInfo, setUserInfo] = useState({ name: "", role: "" });
  const [isAdmin, setIsAdmin] = useState(false);
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
    // Get user info from localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { fullName, roleName, permissions } = JSON.parse(userData);
      setUserInfo({
        name: fullName,
        role: roleName || "User"
      });
      setPermissions(permissions || []);
      setIsAdmin(roleName === "ADMIN");
    } else {
      // If no user data in localStorage, redirect to login
      navigate("/auth/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-md transition-colors duration-200 shadow-lg ${
          isAdmin 
            ? "bg-blue-900 text-white hover:bg-blue-800" 
            : "bg-gray-800 text-white hover:bg-gray-700"
        }`}
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
        className={`fixed top-0 left-0 h-full shadow-xl transition-all duration-300 ease-in-out z-40 ${
          isOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0 md:w-16"
        } ${
          isAdmin
            ? "bg-gradient-to-b from-blue-900 to-blue-800 text-gray-100"
            : "bg-gray-800 text-gray-100"
        }`}
      >
        <div className={`flex items-center justify-between p-4 border-b ${
          isAdmin ? "border-blue-700/50" : "border-gray-700"
        }`}>
          <h3
            className={`text-xl font-semibold tracking-wide ${
              isOpen ? "block" : "hidden md:block md:text-center"
            }`}
          >
            {isOpen ? "HRMS Dashboard" : ""}
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`transition-colors md:block hidden ${
              isAdmin ? "text-blue-200 hover:text-white" : "text-gray-300 hover:text-white"
            }`}
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
              isAdmin={isAdmin}
            />
            {permissions.includes("*****") && (
              <SidebarItem
                to="/roles"
                icon={<FaUsers size={18} />}
                text="Roles"
                isOpen={isOpen}
                isActive={isActive("/roles")}
                isAdmin={isAdmin}
              />
            )}
            <SidebarItem
              to="/leads"
              icon={<FaClipboardList size={18} />}
              text="Leads"
              isOpen={isOpen}
              isActive={isActive("/leads")}
              isAdmin={isAdmin}
            />
            <SidebarItem
              to="/email/designer"
              icon={<FaEnvelope size={18} />}
              text="Email Editor"
              isOpen={isOpen}
              isActive={isActive("/email/designer")}
              isAdmin={isAdmin}
            />

              <SidebarItem
              to="/team"
              icon={<FaEnvelope size={18} />}
              text="Team Management"
              isOpen={isOpen}
              isActive={isActive("/team")}
              isAdmin={isAdmin}
            />
            
            <SidebarItem
              to="/settings"
              icon={<FaCog size={18} />}
              text="Settings"
              isOpen={isOpen}
              isActive={isActive("/settings")}
              isAdmin={isAdmin}
            />

            <div className={`my-2 border-t mx-2 ${
              isAdmin ? "border-blue-700/50" : "border-gray-700"
            }`}></div>
            <li>
              <button
                onClick={handleLogout}
                className={`flex items-center w-full p-3 rounded-md text-left transition-colors duration-200 ${
                  isOpen ? "px-4" : "justify-center md:px-0"
                } ${
                  isAdmin
                    ? "hover:bg-red-500/20 hover:text-red-300"
                    : "hover:bg-red-700/30 hover:text-red-300"
                }`}
              >
                <FaSignOutAlt size={18} />
                {isOpen && <span className="ml-3 text-sm">Logout</span>}
              </button>
            </li>
          </ul>
        </nav>

        {isOpen && (
          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
            isAdmin ? "border-blue-700/50" : "border-gray-700"
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isAdmin ? "bg-blue-600" : "bg-gray-600"
              }`}>
                <span className="text-xs font-medium">
                  {userInfo.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{userInfo.name}</p>
                <p className={`text-xs ${
                  isAdmin ? "text-blue-200/70" : "text-gray-400"
                }`}>{userInfo.role}</p>
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
        <Outlet />
      </div>
    </>
  );
};

const SidebarItem = ({ to, icon, text, isOpen, isActive, isAdmin }) => {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center p-3 rounded-md transition-colors duration-200 ${
          isOpen ? "px-4" : "justify-center md:px-0"
        } ${
          isActive
            ? isAdmin
              ? "bg-blue-600/30 text-blue-100"
              : "bg-blue-700/30 text-blue-200"
            : isAdmin
              ? "hover:bg-blue-700/30 text-blue-100/80 hover:text-white"
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
