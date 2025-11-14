import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      // Use explicit API base if window.API_URL is set (useful when frontend and backend are on different origins)
      const apiBase = (window.API_URL && String(window.API_URL).trim()) ? String(window.API_URL).replace(/\/$/, '') : '';
      const endpoint = apiBase ? `${apiBase}/api/auth/login` : '/api/auth/login';

      console.info('Submitting login to', endpoint);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      console.info('Login response status:', res.status, res.statusText);

      // read raw text for debugging (we'll try to parse JSON when appropriate)
      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.toLowerCase().includes('application/json');
      let body = {};

      if (isJson) {
        try {
          body = await res.json();
          console.debug('Parsed JSON response:', body);
        } catch (parseErr) {
          console.error('Failed to parse JSON response:', parseErr);
          // as fallback, read text
          try {
            const txt = await res.text();
            console.warn('Response text fallback:', txt);
          } catch (tErr) {
            console.warn('Could not read response text', tErr);
          }
          body = {};
        }
      } else {
        // helpful debug for HTML error pages or empty responses
        try {
          const txt = await res.text();
          console.warn('Non-JSON response from login endpoint:', res.status, txt);
        } catch (tErr) {
          console.warn('Could not read non-JSON response text', tErr);
        }
      }

      if (!res.ok) {
        const errMsg = body?.message || res.statusText || `Login failed (${res.status})`;
        console.warn('Login failed:', errMsg);
        setError(errMsg);
        return;
      }

      // expect token in body.token
      if (body && body.token) {
        console.info('Received token:', body.token);
        localStorage.setItem('token', body.token);
        navigate('/app/dashboard', { replace: true });
      } else {
        // helpful debugging messages to show what's missing
        console.error('Login succeeded (2xx) but no token found in response body.', { body, headers: Array.from(res.headers.entries()) });
        setError('No token received from server');
      }
    } catch (e) {
      console.error('Network/login error:', e);
      setError('Network error');
    }
  }

  return (
    <div className="landing-page">
      <div className="landing-hero" aria-hidden="true">
        <div className="hero-content">
          <h1>Student Management</h1>
          <p className="hero-sub">Minimal, fast, and focused interface for managing students, faculty and reports.</p>
        </div>
      </div>

      <div className="landing-card">
        <div className="card-inner">
          <header className="card-header">
            <div className="brand">ADA IPT</div>
            <h2>Sign in</h2>
            <p className="muted">Enter your credentials to access the dashboard</p>
          </header>

          <form className="login-form" onSubmit={submit}>
            <label className="sr-only">Username</label>
            <input
              className="input"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />

            <label className="sr-only">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && <div className="form-error" role="alert">{error}</div>}

            <div className="actions">
              <button className="btn-primary" type="submit">Login</button>
            </div>
          </form>

          <footer className="card-foot">
            <small className="note">Use the seeded account: <strong>admin / admin</strong></small>
          </footer>
        </div>
      </div>
    </div>
  );
}
