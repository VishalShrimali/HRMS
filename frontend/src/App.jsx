import React, { Component, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassward";
import ResetPassword from "./pages/ResetPassword"; // Import ResetPassword
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LeadTable from "./components/LeadsTable/LeadsTable";
import Home from "./pages/Home";
import RolesManager from "./components/RolesManager/RolesManager";
import EmailDesigner from "./pages/EmailDesigner";
import CustomEmailEditor from "./pages/EmailEditor";

const Protected = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Protected isAuthenticated={isAuthenticated}>
              <Home />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} /> {/* Default route */}
          <Route
            path="leads"
            element={
              <Protected isAuthenticated={isAuthenticated}>
                <LeadTable />
              </Protected>
            }
          />
          <Route path="roles" element={<RolesManager />} />
          <Route path="email">
            <Route index path="designer" element={<EmailDesigner />} />
            <Route path="editor" element={<CustomEmailEditor />} />
          </Route>
          <Route path="employees" element={<div>Employees Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Route>
        <Route path="auth">
          <Route path="register" element={<Register />} />
          <Route
            path="login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="password">
            <Route path="forgot" element={<ForgotPassword />} />
            <Route path="reset" element={<ResetPassword />} />{" "}
          </Route>
        </Route>
        {/* Add Reset Password route */}
      </Routes>
    </Router>
  );
}

export default App;
