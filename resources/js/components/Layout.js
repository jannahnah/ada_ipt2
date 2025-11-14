import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiBook, FiBarChart2, FiSettings, FiUser, FiMenu, FiSearch, FiBell } from 'react-icons/fi';

export default function Layout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  function logout() {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-inner">
          <div className="brand">ADA IPT</div>
          <nav className="sidebar-nav">
            <Link className={location.pathname.includes('/app/dashboard') ? 'active' : ''} to="/app/dashboard">
              <FiHome className="icon" />
              <span className="label">Dashboard</span>
            </Link>
            <Link className={location.pathname.includes('/app/students') ? 'active' : ''} to="/app/students">
              <FiUsers className="icon" />
              <span className="label">Students</span>
            </Link>
            <Link className={location.pathname.includes('/app/faculty') ? 'active' : ''} to="/app/faculty">
              <FiBook className="icon" />
              <span className="label">Faculty</span>
            </Link>
            <Link className={location.pathname.includes('/app/reports') ? 'active' : ''} to="/app/reports">
              <FiBarChart2 className="icon" />
              <span className="label">Reports</span>
            </Link>
            <Link className={location.pathname.includes('/app/settings') ? 'active' : ''} to="/app/settings">
              <FiSettings className="icon" />
              <span className="label">Settings</span>
            </Link>
            <Link className={location.pathname.includes('/app/profile') ? 'active' : ''} to="/app/profile">
              <FiUser className="icon" />
              <span className="label">Profile</span>
            </Link>
          </nav>
          
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button className="topbar-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu"><FiMenu /></button>
          <div className="topbar-search">
            <FiSearch className="search-icon" />
            <input placeholder="Search..." />
          </div>
          <div className="topbar-actions">
            <button className="icon-btn"><FiBell /></button>
            <div className="avatar">AD</div>
          </div>
        </header>

        <div className="content-grid">
          <main className="content">
            <Outlet />
          </main>

          
        </div>
      </div>
    </div>
  );
}
