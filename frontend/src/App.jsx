import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Leads from "./pages/Leads";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import EmailEditor from "./pages/EmailEditor";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";

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

        {/* Public Routes */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (wrapped inside Layout) */}
        {isAuthenticated ? (
          <Route element={<Layout setIsAuthenticated={setIsAuthenticated} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/editor" element={<EmailEditor />} />
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
