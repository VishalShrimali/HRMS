import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPass";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LeadTable from "./components/LeadsTable/LeadsTable"; // Adjust path as needed
import Layout from "./components/Layout/Layout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/leads" element={<LeadTable />} />
                </Routes>
              </Layout>
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;