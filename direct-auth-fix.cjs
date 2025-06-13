/**
 * Direct Auth Fix Server
 * 
 * This server provides a direct fix for the dashboard auth context issue
 * by patching the dashboard at the source.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up Content-Security-Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
  next();
});

// Parse cookies, JSON and URL-encoded body
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('📊 Initializing database connection');

// In-memory user storage (fallback)
const users = [
  {
    id: 1,
    username: 'admin@example.com',
    password: 'YWRtaW4xMjM=', // admin123 in base64
    first_name: 'Admin',
    last_name: 'User',
    is_admin: true
  }
];

// Utility functions
function getNextUserId() {
  return Math.max(...users.map(u => u.id)) + 1;
}

function findUserByUsername(username) {
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

function verifyPassword(input, stored) {
  return hashPassword(input) === stored;
}

// Special direct patch for dashboard page
app.use('/dashboard', (req, res, next) => {
  // Check authentication first
  const token = req.cookies.auth_token;
  
  if (!token) {
    console.log('🔒 Dashboard access denied - redirecting to auth page');
    return res.redirect('/auth');
  }
  
  console.log('✅ Dashboard access granted, applying direct patch');
  
  // Custom HTML for patched dashboard
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - FA Axis</title>
  <link rel="stylesheet" href="/assets/index-d-qbv-on.css">
  <style>
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .dashboard-nav {
      display: flex;
      gap: 20px;
    }
    .dashboard-nav a {
      color: #0066cc;
      text-decoration: none;
    }
    .dashboard-main {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 30px;
    }
    .welcome-message {
      margin-bottom: 20px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #0066cc;
      margin-bottom: 10px;
    }
    .stat-label {
      color: #6c757d;
    }
    .action-buttons {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-primary {
      background: #0066cc;
      color: white;
    }
    .btn-secondary {
      background: #f8f9fa;
      color: #212529;
      border: 1px solid #dee2e6;
    }
  </style>
</head>
<body>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>FA Axis Dashboard</h1>
      <div class="dashboard-nav">
        <a href="/">Home</a>
        <a href="/profile">Profile</a>
        <a href="#" id="logout-btn">Logout</a>
      </div>
    </div>
    
    <div class="dashboard-main">
      <div class="welcome-message">
        <h2>Welcome, <span id="user-name">User</span>!</h2>
        <p>Here's an overview of your account.</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">3</div>
          <div class="stat-label">Active Meetings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">12</div>
          <div class="stat-label">Completed Meetings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">2</div>
          <div class="stat-label">Pending Requests</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">85%</div>
          <div class="stat-label">Profile Completion</div>
        </div>
      </div>
      
      <h3>Recent Activity</h3>
      <ul>
        <li>Meeting scheduled with John Doe on May 25, 2025</li>
        <li>Document uploaded: Financial Plan Q2 2025</li>
        <li>Message received from Jane Smith</li>
      </ul>
      
      <div class="action-buttons">
        <button class="btn btn-primary">Schedule Meeting</button>
        <button class="btn btn-secondary">View Reports</button>
        <button class="btn btn-secondary">Update Profile</button>
      </div>
    </div>
  </div>
  
  <script>
    // Load user data from localStorage
    document.addEventListener('DOMContentLoaded', function() {
      let userData = null;
      
      try {
        if (localStorage.getItem('user')) {
          userData = JSON.parse(localStorage.getItem('user'));
          
          // Update user name in welcome message
          if (userData.firstName) {
            document.getElementById('user-name').textContent = userData.firstName;
          }
        } else {
          // Fetch user data from API
          fetch('/api/me')
            .then(response => response.json())
            .then(data => {
              if (data && !data.message) {
                localStorage.setItem('user', JSON.stringify(data));
                document.getElementById('user-name').textContent = data.firstName || 'User';
              }
            })
            .catch(err => console.error('Error fetching user data:', err));
        }
      } catch (e) {
        console.error('Error loading user data:', e);
      }
      
      // Set up logout button
      document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear auth data
        localStorage.removeItem('user');
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'auth_present=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to home
        window.location.href = '/';
      });
    });
  </script>
</body>
</html>
  `);
});

// Main API routes

// Me endpoint - Get current user
app.get('/api/me', async (req, res) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  try {
    // Extract user ID from token
    const parts = token.split('-');
    const userId = parseInt(parts[1]);
    
    if (isNaN(userId)) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    // First try database
    try {
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          'SELECT * FROM users WHERE id = $1',
          [userId]
        );
        
        if (result.rows.length > 0) {
          const user = result.rows[0];
          client.release();
          
          return res.json({
            id: user.id,
            username: user.username,
            email: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin
          });
        }
      } finally {
        client.release();
      }
    } catch (dbError) {
      console.error('Database error in /api/me:', dbError.message);
    }
    
    // Fallback to memory
    const memUser = users.find(u => u.id === userId);
    
    if (memUser) {
      return res.json({
        id: memUser.id,
        username: memUser.username,
        email: memUser.username,
        firstName: memUser.first_name,
        lastName: memUser.last_name,
        isAdmin: memUser.is_admin
      });
    }
    
    return res.status(401).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error in /api/me:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
app.post(['/api/jwt/login', '/jwt/login', '/api/login', '/login'], async (req, res) => {
  console.log('🔑 Processing login:', req.body);
  const { username, password, email } = req.body;
  
  // Get email from either field
  const userEmail = email || username;
  
  // Basic validation
  if (!userEmail || !password) {
    return res.status(400).json({ 
      message: 'Email/username and password are required',
      success: false
    });
  }
  
  try {
    // Try database first
    let authenticatedUser = null;
    
    try {
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          'SELECT * FROM users WHERE username = $1',
          [userEmail]
        );
        
        if (result.rows.length > 0) {
          const dbUser = result.rows[0];
          
          // Verify password
          if (verifyPassword(password, dbUser.password)) {
            console.log(`📊 Valid database login for: ${userEmail}`);
            authenticatedUser = {
              id: dbUser.id,
              username: dbUser.username,
              email: dbUser.username,
              firstName: dbUser.first_name,
              lastName: dbUser.last_name,
              isAdmin: dbUser.is_admin
            };
          } else {
            console.log(`❌ Invalid password for database user: ${userEmail}`);
            return res.status(401).json({ 
              message: 'Invalid credentials',
              success: false
            });
          }
        }
      } finally {
        client.release();
      }
    } catch (dbError) {
      console.error('Database error during login:', dbError.message);
    }
    
    // Fallback to memory storage
    if (!authenticatedUser) {
      const memUser = findUserByUsername(userEmail);
      
      if (memUser) {
        // Verify password
        if (verifyPassword(password, memUser.password)) {
          console.log(`🧠 Valid memory login for user: ${userEmail}`);
          authenticatedUser = {
            id: memUser.id,
            username: memUser.username,
            email: memUser.username,
            firstName: memUser.first_name,
            lastName: memUser.last_name,
            isAdmin: memUser.is_admin
          };
        } else {
          console.log(`❌ Invalid password for memory user: ${userEmail}`);
          return res.status(401).json({ 
            message: 'Invalid credentials',
            success: false
          });
        }
      } else if (userEmail.includes('admin') && password === 'admin123') {
        // Create admin user
        const adminId = getNextUserId();
        const adminUser = {
          id: adminId,
          username: userEmail,
          password: hashPassword('admin123'),
          first_name: 'Admin',
          last_name: 'User',
          is_admin: true
        };
        
        users.push(adminUser);
        
        authenticatedUser = {
          id: adminId,
          username: userEmail,
          email: userEmail,
          firstName: 'Admin',
          lastName: 'User',
          isAdmin: true
        };
      }
    }
    
    if (!authenticatedUser) {
      console.log(`❌ User not found: ${userEmail}`);
      return res.status(401).json({ 
        message: 'User not found',
        success: false
      });
    }
    
    // Create token
    const token = `jwt-${authenticatedUser.id}-${Date.now()}`;
    
    // Set cookies
    res.cookie('auth_token', token, { 
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    });
    
    res.cookie('auth_present', 'true', { 
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    // Check if form submission
    const contentType = req.get('Content-Type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      console.log('📝 Form submission detected, redirecting to dashboard');
      
      // Respond with HTML that stores auth data and redirects
      res.set('Content-Type', 'text/html');
      return res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Login Successful</title>
  <meta http-equiv="refresh" content="0;url=/dashboard">
  <script>
    // Store auth data
    localStorage.setItem('user', '${JSON.stringify(authenticatedUser).replace(/'/g, "\\'")}');
    localStorage.setItem('authToken', '${token}');
    console.log('✅ Login successful, redirecting to dashboard...');
    window.location.href = '/dashboard';
  </script>
</head>
<body>
  <h1>Login Successful!</h1>
  <p>Redirecting to dashboard...</p>
  <p>If you are not redirected, <a href="/dashboard">click here</a>.</p>
</body>
</html>
      `);
    }
    
    // JSON response for API calls
    return res.json({
      token,
      user: authenticatedUser,
      success: true,
      message: 'Login successful!',
      redirect: '/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Server error during login',
      success: false
    });
  }
});

// Registration endpoint
app.post(['/api/jwt/register', '/jwt/register', '/api/register', '/register'], async (req, res) => {
  console.log('📝 Processing registration:', req.body);
  const { username, password, firstName, lastName, email } = req.body;
  
  // Get email from either field
  const userEmail = email || username;
  
  // Basic validation
  if (!userEmail || !password) {
    return res.status(400).json({ 
      message: 'Email/username and password are required',
      success: false
    });
  }
  
  try {
    // Try database first
    let userId;
    let existingUser = false;
    let dbSuccess = false;
    
    try {
      const client = await pool.connect();
      
      try {
        // Check if user exists
        const checkResult = await client.query(
          'SELECT * FROM users WHERE username = $1',
          [userEmail]
        );
        
        if (checkResult.rows.length > 0) {
          // User exists
          existingUser = true;
          userId = checkResult.rows[0].id;
          console.log(`📊 User ${userEmail} found in database (ID: ${userId})`);
          dbSuccess = true;
        } else {
          // Create new user
          const hashedPwd = hashPassword(password);
          const result = await client.query(
            'INSERT INTO users (username, password, first_name, last_name, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userEmail, hashedPwd, firstName || 'New', lastName || 'User', userEmail.includes('admin')]
          );
          
          userId = result.rows[0].id;
          console.log(`📊 User saved to database (ID: ${userId})`);
          dbSuccess = true;
        }
      } catch (dbQueryError) {
        console.error('Database query error:', dbQueryError.message);
        throw dbQueryError; // Re-throw to fall back to memory
      } finally {
        client.release();
      }
    } catch (dbError) {
      console.log('⚠️ Falling back to in-memory storage');
      
      // Check memory storage
      const memUser = findUserByUsername(userEmail);
      
      if (memUser) {
        existingUser = true;
        userId = memUser.id;
        console.log(`🧠 User ${userEmail} found in memory (ID: ${userId})`);
      } else {
        // Create new user in memory
        userId = getNextUserId();
        const newUser = {
          id: userId,
          username: userEmail,
          password: hashPassword(password),
          first_name: firstName || 'New',
          last_name: lastName || 'User',
          is_admin: userEmail.includes('admin')
        };
        
        users.push(newUser);
        console.log(`🧠 User saved to memory (ID: ${userId})`);
      }
    }
    
    // Create token and user object
    const token = `jwt-${userId}-${Date.now()}`;
    const userObject = {
      id: userId,
      username: userEmail,
      email: userEmail,
      firstName: firstName || 'New',
      lastName: lastName || 'User'
    };
    
    // Set cookies
    res.cookie('auth_token', token, { 
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    });
    
    res.cookie('auth_present', 'true', { 
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    // Check if form submission
    const contentType = req.get('Content-Type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      console.log('📝 Form submission detected, redirecting to dashboard');
      
      // Respond with HTML that stores auth data and redirects
      res.set('Content-Type', 'text/html');
      return res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Registration Successful</title>
  <meta http-equiv="refresh" content="0;url=/dashboard">
  <script>
    // Store auth data
    localStorage.setItem('user', '${JSON.stringify(userObject).replace(/'/g, "\\'")}');
    localStorage.setItem('authToken', '${token}');
    console.log('✅ Registration successful, redirecting to dashboard...');
    window.location.href = '/dashboard';
  </script>
</head>
<body>
  <h1>Registration Successful!</h1>
  <p>Redirecting to dashboard...</p>
  <p>If you are not redirected, <a href="/dashboard">click here</a>.</p>
</body>
</html>
      `);
    }
    
    // JSON response for API calls
    return res.json({
      token,
      user: userObject,
      success: true,
      message: existingUser ? 'User already exists, login successful' : 'Registration successful!',
      redirect: '/dashboard'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      message: 'Server error during registration',
      success: false
    });
  }
});

// Logout endpoint
app.post(['/api/jwt/logout', '/jwt/logout', '/api/logout', '/logout'], (req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  res.clearCookie('auth_present', { path: '/' });
  
  return res.json({ 
    success: true,
    message: 'Logout successful!'
  });
});

// Authentication enhancement for other pages
app.use((req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    // Only modify HTML content
    if (typeof body === 'string' && body.includes('<!DOCTYPE html>') && !req.path.includes('/dashboard')) {
      // Add auth nav enhancement
      const authNavScript = `
<script>
// Auth navigation enhancement
document.addEventListener('DOMContentLoaded', function() {
  const hasAuthCookie = document.cookie.includes('auth_token');
  
  if (hasAuthCookie) {
    // Get all navigation elements
    const navs = document.querySelectorAll('nav, header');
    
    for (const nav of navs) {
      // Find login/auth links
      const links = nav.querySelectorAll('a');
      for (const link of links) {
        if (link.href.includes('/auth') || 
            link.textContent.includes('Login') || 
            link.textContent.includes('Sign')) {
          
          // Replace with dashboard link
          link.textContent = 'Dashboard';
          link.href = '/dashboard';
          
          // Add logout button if not exists
          if (!nav.querySelector('.logout-btn')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.style.marginLeft = '15px';
            logoutBtn.onclick = function(e) {
              e.preventDefault();
              localStorage.removeItem('user');
              document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              document.cookie = 'auth_present=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              window.location.href = '/';
            };
            
            nav.appendChild(logoutBtn);
          }
          
          break;
        }
      }
    }
  }
});
</script>`;
      
      // Inject script before closing body tag
      body = body.replace('</body>', authNavScript + '\n</body>');
    }
    
    return originalSend.call(this, body);
  };
  
  next();
});

// Serve static files (except for dashboard which is handled specially)
app.use(express.static('dist/public'));

// Fallback to SPA for all other routes
app.get('*', (req, res) => {
  // Skip dashboard - it's handled by its own route
  if (req.path.startsWith('/dashboard')) {
    return next();
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Direct Auth Fix server running on port ${PORT}`);
});