// Installed dependencies:
// ===============================================================
import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

// Project Files 
// ===============================================================

const Home = () => {
  return (
    <>
      <Sidebar />
      <Outlet /> {/* Render nested routes */}
    </>
  );
};

export default Home;