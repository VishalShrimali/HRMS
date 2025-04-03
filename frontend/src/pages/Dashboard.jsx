import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome</h2>
          <p className="text-gray-600">This is your dashboard. Manage your leads and more from here.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <Link
            to="/leads"
            className="block bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-200 text-center"
          >
            View Leads
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;