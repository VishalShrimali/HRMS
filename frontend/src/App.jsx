import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPass";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LeadTable from "./components/LeadsTable/LeadsTable";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./pages/Home";
import RolesManager from "./components/RolesManager/RolesManager";

const Protected = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
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
          <Route path="email-editor" element={<div>Email Editor Page</div>} />
          <Route path="employees" element={<div>Employees Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Route>
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
