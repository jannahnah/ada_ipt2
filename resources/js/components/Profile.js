import React, { useState } from 'react';
import { FiLogOut, FiSave } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PROFILE = {
  name: 'Administrator',
  email: 'admin@ada-ipt.local',
  role: 'Admin'
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    setStatusMessage('Profile updated successfully.');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="module-profile profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          <span>{profile.name.split(' ').map((part) => part[0]).join('').toUpperCase()}</span>
        </div>
        <div className="profile-content">
          <div className="profile-heading">
            <h1>My profile</h1>
            <p className="subtext">Manage your signed-in account and stay signed in.</p>
          </div>
          <form className="profile-form" onSubmit={handleSave}>
            <label>
              Full name
              <input name="name" value={profile.name} onChange={handleChange} placeholder="Full name" />
            </label>
            <label>
              Email
              <input name="email" type="email" value={profile.email} onChange={handleChange} placeholder="name@company.com" />
            </label>
            <label>
              Role
              <input name="role" value={profile.role} readOnly />
            </label>
            <div className="profile-actions">
              <button type="submit" className="profile-primary-btn">
                <FiSave /> Save profile
              </button>
              <button type="button" className="profile-ghost-btn" onClick={handleLogout}>
                <FiLogOut /> Log out
              </button>
            </div>
          </form>
          {statusMessage && <p className="status-text">{statusMessage}</p>}
        </div>
      </div>
    </div>
  );
}
