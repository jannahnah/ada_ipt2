const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// simple in-memory "users"
const users = [
  { id: 1, username: 'admin', password: 'admin', name: 'Administrator', role: 'admin' },
  { id: 2, username: 'user', password: 'user', name: 'Regular User', role: 'user' }
];

// create a simple mock token
function makeToken(username) {
  const payload = `${username}:${Date.now()}`;
  return `mock-${Buffer.from(payload).toString('base64')}`;
}

// decode mock token to get username
function parseToken(token) {
  if (!token || !token.startsWith('mock-')) return null;
  try {
    const payload = Buffer.from(token.slice(5), 'base64').toString('utf8');
    const [username] = payload.split(':');
    return username;
  } catch (e) {
    return null;
  }
}

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password required' });
  }
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = makeToken(user.username);
  // do not return password in response
  const { password: _p, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

// GET /api/auth/verify - checks token and returns user
app.get('/api/auth/verify', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : (req.query.token || null);
  const username = parseToken(token);
  if (!username) return res.status(401).json({ message: 'Invalid token' });
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Invalid token' });
  const { password: _p, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// health
app.get('/health', (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth API listening on http://localhost:${port}`);
});
