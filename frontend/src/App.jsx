<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Leads from "./pages/Leads";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employee";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login"; 
import Register from "./pages/Register"; 
=======
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Leads from "./pages/Leads";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import EmailEditor from "./pages/EmailEditor";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Redirect users based on authentication */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
<<<<<<< HEAD
        
=======

>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
        {/* Public Routes */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />

<<<<<<< HEAD
        {/* Protected Routes */}
=======
        {/* Protected Routes (wrapped inside Layout) */}
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
        {isAuthenticated ? (
          <Route element={<Layout setIsAuthenticated={setIsAuthenticated} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
<<<<<<< HEAD
            <Route path="/employees" element={<Employees />} />
            <Route path="/reports" element={<Reports />} />
=======
            <Route path="/editor" element={<EmailEditor />} />
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
            <Route path="/settings" element={<Settings />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
