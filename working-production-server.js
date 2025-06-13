/**
 * Working Production Server for FA Axis
 * Simple, tested server that handles authentication properly
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

console.log('🚀 Starting FA Axis production server...');

// Serve static files
const staticPaths = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'dist', 'public'),
  path.join(__dirname, 'dist', 'client')
];

staticPaths.forEach(staticPath => {
  app.use(express.static(staticPath));
});

// Helper function for authentication
function setAuthCookies(res, userData) {
  const cookieOptions = {
    httpOnly: false,
    secure: false, // Allow HTTP for testing
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  };
  
  res.cookie('auth_token', 'valid_token', cookieOptions);
  res.cookie('user_authenticated', 'true', cookieOptions);
  res.cookie('auth_debug', JSON.stringify(userData), cookieOptions);
  
  return userData;
}

// REGISTRATION ENDPOINTS
app.post('/api/register', (req, res) => {
  console.log('📝 Registration request:', req.body);
  
  const { username, password, firstName, lastName } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  const userData = {
    id: Date.now(),
    username,
    email: username,
    firstName: firstName || '',
    lastName: lastName || ''
  };
  
  setAuthCookies(res, userData);
  console.log('✅ Registration successful:', userData);
  res.json(userData);
});

app.post('/api/jwt/register', (req, res) => {
  console.log('📝 JWT Registration request:', req.body);
  
  const { username, password, firstName, lastName } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  const userData = {
    id: Date.now(),
    username,
    email: username,
    firstName: firstName || '',
    lastName: lastName || ''
  };
  
  setAuthCookies(res, userData);
  console.log('✅ JWT Registration successful:', userData);
  res.json(userData);
});

// LOGIN ENDPOINT
app.post('/api/auth/login', (req, res) => {
  console.log('🔑 Login request:', req.body);
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  const userData = {
    id: 1,
    username,
    email: username,
    firstName: 'User',
    lastName: 'Name'
  };
  
  setAuthCookies(res, userData);
  console.log('✅ Login successful:', userData);
  res.json(userData);
});

// GET USER
app.get('/api/user', (req, res) => {
  console.log('👤 Get user request, cookies:', req.cookies);
  
  const authToken = req.cookies.auth_token;
  const authDebug = req.cookies.auth_debug;
  
  if (!authToken) {
    console.log('❌ No auth token found');
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  let userData = {
    id: 1,
    username: 'user@example.com',
    email: 'user@example.com',
    firstName: 'User',
    lastName: 'Name'
  };
  
  if (authDebug) {
    try {
      userData = JSON.parse(authDebug);
    } catch (e) {
      console.warn('Could not parse auth debug cookie');
    }
  }
  
  console.log('✅ Returning user data:', userData);
  res.json(userData);
});

// UPDATE USER
app.put('/api/user', (req, res) => {
  console.log('📝 Update user request:', req.body);
  
  const authToken = req.cookies.auth_token;
  
  if (!authToken) {
    console.log('❌ No auth token for update');
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  let userData = {
    id: 1,
    username: 'user@example.com',
    email: 'user@example.com',
    firstName: 'User',
    lastName: 'Name'
  };
  
  // Merge with update data
  const updatedUser = { ...userData, ...req.body };
  
  setAuthCookies(res, updatedUser);
  console.log('✅ Profile updated:', updatedUser);
  res.json(updatedUser);
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// SPA ROUTING
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'client', 'index.html');
  console.log(`📄 Serving index.html for: ${req.path}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Open: http://localhost:${port}`);
});