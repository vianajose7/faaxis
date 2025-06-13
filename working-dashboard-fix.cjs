/**
 * Working Dashboard Fix
 * 
 * Fixed version that properly handles database connections and response headers
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

// Serve static files first
app.use(express.static('dist/public'));

// API Routes

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
    
    // First check memory for faster response
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
    
    // If not in memory, check database
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        
        // Don't forget to release the client!
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
      
      // Make sure to release the client
      client.release();
      
      // No user found
      return res.status(401).json({ message: 'User not found' });
    } catch (dbError) {
      // Make sure to release the client even on error
      if (client) client.release();
      
      console.error('Database error in /api/me:', dbError.message);
      return res.status(500).json({ message: 'Database error' });
    }
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
    
    let client;
    try {
      client = await pool.connect();
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
          client.release();
          console.log(`❌ Invalid password for database user: ${userEmail}`);
          return res.status(401).json({ 
            message: 'Invalid credentials',
            success: false
          });
        }
      } else if (userEmail.includes('admin') && password === 'admin123') {
        // Create admin user in database
        try {
          const adminResult = await client.query(
            'INSERT INTO users (username, password, first_name, last_name, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userEmail, hashPassword('admin123'), 'Admin', 'User', true]
          );
          
          const dbUser = adminResult.rows[0];
          console.log(`📊 Created admin in database (ID: ${dbUser.id})`);
          
          authenticatedUser = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.username,
            firstName: dbUser.first_name,
            lastName: dbUser.last_name,
            isAdmin: dbUser.is_admin
          };
        } catch (insertError) {
          console.error('Error creating admin user:', insertError.message);
        }
      }
      
      // Always release the client
      client.release();
    } catch (dbError) {
      // Release client on error
      if (client) client.release();
      
      console.error('Database error during login:', dbError.message);
    }
    
    // Fallback to memory storage if database auth failed
    if (!authenticatedUser) {
      console.log('🧠 Trying memory authentication');
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
        // Create admin user in memory
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
    
    let client;
    try {
      client = await pool.connect();
      
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
        try {
          const hashedPwd = hashPassword(password);
          const result = await client.query(
            'INSERT INTO users (username, password, first_name, last_name, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userEmail, hashedPwd, firstName || 'New', lastName || 'User', userEmail.includes('admin')]
          );
          
          userId = result.rows[0].id;
          console.log(`📊 User saved to database (ID: ${userId})`);
          dbSuccess = true;
        } catch (insertError) {
          console.error('Error inserting user:', insertError.message);
          throw insertError; // Re-throw for fallback
        }
      }
      
      // Always release the client
      client.release();
    } catch (dbError) {
      // Release client on error
      if (client) client.release();
      
      console.log('⚠️ Database error, falling back to in-memory storage:', dbError.message);
      
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

// Special route for dashboard
app.get('/dashboard', (req, res, next) => {
  // Check authentication
  const token = req.cookies.auth_token;
  
  if (!token) {
    console.log('🔒 Dashboard access denied - redirecting to login');
    return res.redirect('/auth');
  }
  
  // Continue to normal route - this sends the static index.html
  // which will then be enhanced with our auth fix scripts
  next();
});

// Authentication enhancement script for all pages
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // We'll intercept the response to inject our scripts
  const originalSend = res.send;
  
  res.send = function(body) {
    // Only modify HTML responses
    if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
      // Check if user is authenticated
      const isAuthenticated = !!req.cookies.auth_token;
      
      // Auth context fix script
      const authScript = `
<script>
// Handle auth context and React integration
(function() {
  console.log("🔧 Loading auth enhancements...");
  
  // Store auth state for easier access
  window.authState = {
    isAuthenticated: ${isAuthenticated},
    user: null
  };
  
  // Try to get user from localStorage
  try {
    if (localStorage.getItem('user')) {
      window.authState.user = JSON.parse(localStorage.getItem('user'));
    }
  } catch (e) {
    console.error("Failed to parse user data:", e);
  }
  
  // Wait for DOM to be loaded
  document.addEventListener('DOMContentLoaded', function() {
    // First, handle dashboard page
    const isDashboard = window.location.pathname.includes('/dashboard');
    
    if (isDashboard && !window.authState.isAuthenticated) {
      console.log("⚠️ Unauthenticated access to dashboard, redirecting...");
      window.location.href = '/auth';
      return;
    }
    
    // Fix React context if available
    setTimeout(function() {
      try {
        if (window.React) {
          console.log("🛠️ Setting up React auth context");
          
          // Create AuthContext
          window.AuthContext = window.React.createContext({});
          
          // Define useAuth hook
          window.useAuth = function() {
            return {
              isAuthenticated: window.authState.isAuthenticated,
              user: window.authState.user || { firstName: 'Guest', lastName: 'User' },
              login: () => Promise.resolve(true),
              logout: () => {
                localStorage.removeItem('user');
                document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'auth_present=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                window.location.href = '/';
              },
              register: () => Promise.resolve(true)
            };
          };
        }
      } catch (e) {
        console.error("Error setting up auth context:", e);
      }
      
      // Update navigation based on auth status
      try {
        const navbar = document.querySelector('nav') || document.querySelector('header');
        
        if (navbar && window.authState.isAuthenticated) {
          console.log("🧭 Updating navigation menu");
          
          // Find login/signup links
          const links = navbar.querySelectorAll('a');
          let loginLink = null;
          
          for (const link of links) {
            if (link.href.includes('/auth') || 
                link.textContent.toLowerCase().includes('login') || 
                link.textContent.toLowerCase().includes('sign')) {
              loginLink = link;
              break;
            }
          }
          
          if (loginLink) {
            // Replace with dashboard link
            loginLink.textContent = 'Dashboard';
            loginLink.href = '/dashboard';
            
            // Add logout button if not exists
            if (!navbar.querySelector('.logout-btn')) {
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
              
              navbar.appendChild(logoutBtn);
            }
          }
        }
      } catch (e) {
        console.error("Error updating navigation:", e);
      }
    }, 100);
  });
})();
</script>`;
      
      // Inject the script before closing body tag
      body = body.replace('</body>', authScript + '\n</body>');
    }
    
    // Call the original send
    return originalSend.call(this, body);
  };
  
  next();
});

// Fallback to original index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Working Dashboard Fix server running on port ${PORT}`);
});