<<<<<<< HEAD
import React, { useState, useEffect } from "react";
=======
import React, { Component, useState, useEffect } from "react";
>>>>>>> 13616b507af40f8bc71dd47589eff7281e6d7e3c
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassward";
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LeadTable from "./components/LeadsTable/LeadsTable";
import Home from "./pages/Home";
import RolesManager from "./components/RolesManager/RolesManager";
import EmailDesigner from "./pages/EmailDesigner";
import CustomEmailEditor from "./pages/EmailEditor";
import TeamManagement from './components/TeamManagement/TeamManagement';
import UpcomingMeetings from "./components/Meetings/UpcomingMeetings";
import MeetingsCalendar from "./components/Meetings/MeetingsCalendar";
import ScheduleMeeting from "./components/Meetings/ScheduleMeeting";

const Protected = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

function App() {
<<<<<<< HEAD
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);
=======
  console.log(token);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [refreshMeetingsFlag, setRefreshMeetingsFlag] = useState(false);
>>>>>>> 13616b507af40f8bc71dd47589eff7281e6d7e3c

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="leads"
            element={
<<<<<<< HEAD
              <Protected>
                <LeadTable />
=======
              <Protected isAuthenticated={isAuthenticated}>
                <LeadTable setRefreshMeetingsFlag={setRefreshMeetingsFlag} />
>>>>>>> 13616b507af40f8bc71dd47589eff7281e6d7e3c
              </Protected>
            }
          />
          <Route 
            path="roles" 
            element={
              <Protected>
                <RolesManager />
              </Protected>
            } 
          />
          <Route path="email">
            <Route 
              index 
              path="designer" 
              element={
                <Protected>
                  <EmailDesigner />
                </Protected>
              } 
            />
            <Route 
              path="editor" 
              element={
                <Protected>
                  <CustomEmailEditor />
                </Protected>
              } 
            />
          </Route>
<<<<<<< HEAD
          <Route 
            path="/team" 
            element={
              <Protected>
                <TeamManagement />
              </Protected>
            } 
          />
          <Route 
            path="employees" 
            element={
              <Protected>
                <div>Employees Page</div>
              </Protected>
            } 
          />
          <Route 
            path="settings" 
            element={
              <Protected>
                <div>Settings Page</div>
              </Protected>
            } 
          />
          <Route path="meetings">
            <Route 
              index 
              element={
                <Protected>
                  <UpcomingMeetings />
                </Protected>
              } 
            />
            <Route 
              path="schedule" 
              element={
                <Protected>
                  <ScheduleMeeting />
                </Protected>
              } 
            />
          </Route>
          <Route 
            path="calendar" 
            element={
              <Protected>
                <MeetingsCalendar />
              </Protected>
            } 
          />
=======
          <Route path="/team" element={<TeamManagement />} />
          <Route path="employees" element={<div>Employees Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
          <Route path="meetings" element={<Protected isAuthenticated={isAuthenticated}><UpcomingMeetings refreshMeetingsFlag={refreshMeetingsFlag} /></Protected>} />
          <Route path="calendar" element={<Protected isAuthenticated={isAuthenticated}><MeetingsCalendar /></Protected>} />
>>>>>>> 13616b507af40f8bc71dd47589eff7281e6d7e3c
        </Route>
        <Route path="auth">
          <Route path="register" element={<Register />} />
          <Route
            path="login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="forgot-passward" element={<ForgotPassword />} />
        </Route>
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="set-password" element={<SetPassword />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
