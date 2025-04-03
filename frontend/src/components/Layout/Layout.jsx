import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">CRM App</h2>
        <nav>
          <ul>
            <li className="mb-4">
              <Link to="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/leads" className="hover:text-gray-300">
                Leads
              </Link>
            </li>
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
};

export default Layout;