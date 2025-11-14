import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link, useNavigate } from 'react-router-dom';

import Landing from "./Landing";
import Example from "./Example";
import Student from "./student"; // keep original lowercase if file is student.js
import Faculty from "./Faculty";
import Report from "./Report";
import Layout from "./Layout";

// Use the real Settings and Profile components so the routes render full pages
import Settings from "./Settings";
import Profile from "./Profile";
import Dashboard from "./Dashboard";

// Use the shared `Layout` component from `components/Layout.js` (sidebar + topbar)

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function Routers() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Landing/>} />
            <Route path="/example" element={<Example/>} />
            <Route path="/app" element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Student />} />
              <Route path="faculty" element={<Faculty />} />
              <Route path="reports" element={<Report />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </Router>
  )
}

if(document.getElementById("root")) {
    ReactDOM.render(<Routers />, document.getElementById("root"));
}