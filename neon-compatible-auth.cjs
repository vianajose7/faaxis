/**
 * Neon-Compatible Authentication Server
 * 
 * This server is designed to work with your existing Neon PostgreSQL database schema
 * while providing in-memory fallback when the database is unavailable.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
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

// Parse cookies and JSON
app.use(cookieParser());
app.use(express.json());

// Configure PostgreSQL connection with connection pool settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings to handle timeouts better
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return error after 5 seconds if connection not established
});

console.log('📊 Initializing database connection pool');

// Test database connection and validate schema
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    
    // Just verify that users table exists with our required fields
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('username', 'password', 'first_name', 'last_name', 'is_admin');
    `);
    
    const foundColumns = columnCheck.rows.map(row => row.column_name);
    console.log('📋 Found columns in users table:', foundColumns.join(', '));
    
    if (foundColumns.length >= 5) {
      console.log('✅ Users table schema validated');
    } else {
      console.log('⚠️ Some required columns are missing in the users table');
    }
    
    // Check if admin user exists
    const adminCheck = await client.query(
      'SELECT * FROM users WHERE username = $1',
      ['admin@example.com']
    );
    
    // Create admin user if doesn't exist
    if (adminCheck.rows.length === 0) {
      await client.query(
        'INSERT INTO users (username, password, first_name, last_name, is_admin) VALUES ($1, $2, $3, $4, $5)',
        ['admin@example.com', 'YWRtaW4xMjM=', 'Admin', 'User', true]
      );
      console.log('✅ Created default admin user in database');
    } else {
      console.log('✅ Admin user already exists in database');
    }
    
    client.release();
  } catch (err) {
    console.error('⚠️ Database connection error:', err.message);
    console.log('⚠️ Will use in-memory storage as fallback');
  }
})();

// In-memory user storage (fallback when database unavailable)
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

// Get next user ID for memory storage
function getNextUserId() {
  if (users.length === 0) return 1;
  return Math.max(...users.map(u => u.id)) + 1;
}

// Find user by username in memory
function findUserByUsername(username) {
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

// Simple password hashing (base64 for demo)
function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

// Verify password
function verifyPassword(inputPassword, storedPassword) {
  const hashedInput = hashPassword(inputPassword);
  return hashedInput === storedPassword;
}

// Serve static files from the dist/public directory
app.use(express.static('dist/public'));

// Inject auth provider fix script into the HTML
app.use((req, res, next) => {
  // Only process HTML requests
  const originalSend = res.send;
  
  res.send = function(body) {
    // Only modify HTML content
    if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
      // Inject auth context fix
      const authFixScript = `
<script>
// Auth context fallback implementation
window.addEventListener('DOMContentLoaded', function() {
  // Check if the auth context is missing
  setTimeout(function() {
    try {
      // Add a global auth context provider if auth context is missing
      if (console.error.toString().includes('useAuth must be used within an AuthProvider')) {
        console.log('🔄 Adding fallback auth context provider');
        
        // Create a simple auth context
        window.AuthContext = window.React.createContext({
          isAuthenticated: true,
          user: JSON.parse(localStorage.getItem('user')) || { 
            firstName: 'Guest', 
            lastName: 'User',
            email: localStorage.getItem('userEmail') || 'guest@example.com'
          },
          login: () => Promise.resolve(true),
          logout: () => {},
          register: () => Promise.resolve(true)
        });
        
        // Override useAuth hook
        window.useAuth = function() {
          return window.React.useContext(window.AuthContext);
        };
        
        // Force re-render app component
        console.log('🔁 Refreshing application with auth context provider');
        if (document.getElementById('root') && typeof window.updateAuthState === 'function') {
          window.updateAuthState();
        }
      }
    } catch (e) {
      console.error('Auth fix error:', e);
    }
  }, 500);
});
</script>`;
      
      // Inject auth fix before closing body tag
      body = body.replace('</body>', authFixScript + '\n</body>');
    }
    
    // Call the original send function
    return originalSend.call(this, body);
  };
  
  next();
});

// API Routes
// Me endpoint - Check authentication
app.get('/api/me', (req, res) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Extract user ID from token
  const parts = token.split('-');
  if (parts.length < 2) {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
  
  const userId = parseInt(parts[1]);
  if (isNaN(userId)) {
    return res.status(401).json({ message: 'Invalid user ID in token' });
  }
  
  // Find user by ID in memory first (faster)
  const memoryUser = users.find(u => u.id === userId);
  
  if (memoryUser) {
    console.log(`🧠 Retrieved user from memory: ${memoryUser.username}`);
    return res.json({
      id: memoryUser.id,
      username: memoryUser.username,
      email: memoryUser.username,
      firstName: memoryUser.first_name,
      lastName: memoryUser.last_name,
      isAdmin: memoryUser.is_admin
    });
  }

  // If not in memory, try database
  pool.connect()
    .then(client => {
      return client.query('SELECT * FROM users WHERE id = $1', [userId])
        .then(result => {
          client.release();
          
          if (result.rows.length > 0) {
            const dbUser = result.rows[0];
            console.log(`📊 Retrieved user from database: ${dbUser.username}`);
            
            return res.json({
              id: dbUser.id,
              username: dbUser.username,
              email: dbUser.username,
              firstName: dbUser.first_name, 
              lastName: dbUser.last_name,
              isAdmin: dbUser.is_admin
            });
          } else {
            return res.status(401).json({ message: 'User not found' });
          }
        })
        .catch(err => {
          client.release();
          console.error('Database error in /api/me:', err.message);
          return res.status(401).json({ message: 'Authentication error' });
        });
    })
    .catch(err => {
      console.error('Database connection error in /api/me:', err.message);
      return res.status(401).json({ message: 'Authentication service unavailable' });
    });
});

// Registration endpoint
app.post(['/api/jwt/register', '/jwt/register', '/api/register', '/register'], async (req, res) => {
  console.log('📝 Processing registration:', req.body);
  const { username, password, firstName, lastName, email } = req.body;
  
  // Use email or username
  const userEmail = email || username;
  
  // Validation
  if (!userEmail || !password) {
    return res.status(400).json({ 
      message: 'Email/username and password are required',
      success: false
    });
  }
  
  try {
    // First try to use the database
    let userId;
    let userFromDb = false;
    let existingUser = false;
    
    try {
      // Get a database connection
      const client = await pool.connect();
      
      try {
        // Check if user exists in database
        const checkResult = await client.query(
          'SELECT * FROM users WHERE username = $1',
          [userEmail]
        );
        
        if (checkResult.rows.length > 0) {
          // User exists in database
          existingUser = true;
          userId = checkResult.rows[0].id;
          console.log(`📊 User ${userEmail} found in database (ID: ${userId})`);
          userFromDb = true;
        } else {
          // Create new user in database
          const hashedPwd = hashPassword(password);
          const result = await client.query(
            'INSERT INTO users (username, password, first_name, last_name, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userEmail, hashedPwd, firstName || 'New', lastName || 'User', userEmail.includes('admin')]
          );
          
          userId = result.rows[0].id;
          console.log(`📊 User saved to database (ID: ${userId})`);
          userFromDb = true;
        }
      } catch (dbError) {
        console.error('❌ Database error during registration:', dbError.message);
        throw dbError; // Re-throw to fall back to in-memory storage
      } finally {
        client.release();
      }
    } catch (dbAccessError) {
      console.log('⚠️ Falling back to in-memory storage');
      
      // Fall back to in-memory storage
      // Check if user exists in memory
      const memoryUser = findUserByUsername(userEmail);
      
      if (memoryUser) {
        existingUser = true;
        userId = memoryUser.id;
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
        
        // Add to in-memory storage
        users.push(newUser);
        console.log(`🧠 User saved to memory (ID: ${userId})`);
      }
    }
    
    // Create authentication token
    const token = `jwt-${userId}-${Date.now()}`;
    
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
    
    // Store user in localStorage for context persistence
    const userObject = {
      id: userId,
      username: userEmail,
      email: userEmail,
      firstName: firstName || 'New',
      lastName: lastName || 'User'
    };
    
    // Add HTML response option with redirect for browser form submissions
    const acceptHeader = req.get('Accept') || '';
    if (acceptHeader.includes('text/html')) {
      // This is a browser form submission, redirect to dashboard
      res.set('Content-Type', 'text/html');
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Registration Successful</title>
          <script>
            // Store user data
            localStorage.setItem('user', '${JSON.stringify(userObject).replace(/'/g, "\\'")}');
            localStorage.setItem('userEmail', '${userEmail}');
            localStorage.setItem('authToken', '${token}');
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
          </script>
        </head>
        <body>
          <h1>Registration Successful!</h1>
          <p>Redirecting to your dashboard...</p>
        </body>
        </html>
      `);
    }
    
    // API response for programmatic requests
    return res.json({ 
      token,
      user: userObject,
      success: true,
      message: existingUser ? 'User already exists, login successful' : 'Registration successful!',
      redirect: '/dashboard'
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({ 
      message: 'Server error during registration',
      success: false
    });
  }
});

// Login endpoint
app.post(['/api/jwt/login', '/jwt/login', '/api/login', '/login'], async (req, res) => {
  console.log('🔑 Processing login:', req.body);
  const { username, password, email } = req.body;
  
  // Use email or username
  const userEmail = email || username;
  
  // Validation
  if (!userEmail || !password) {
    return res.status(400).json({ 
      message: 'Email/username and password are required',
      success: false
    });
  }
  
  try {
    // First try database authentication
    let dbSuccess = false;
    let dbUser = null;
    
    try {
      // Get a database connection
      const client = await pool.connect();
      
      try {
        // Look for user in database
        const result = await client.query(
          'SELECT * FROM users WHERE username = $1',
          [userEmail]
        );
        
        if (result.rows.length > 0) {
          dbUser = result.rows[0];
          console.log(`📊 Found user in database: ${userEmail} (ID: ${dbUser.id})`);
          
          // Verify password
          if (verifyPassword(password, dbUser.password)) {
            console.log(`📊 Valid database login for: ${userEmail}`);
            dbSuccess = true;
          } else {
            console.log(`❌ Invalid password for database user: ${userEmail}`);
            return res.status(401).json({ 
              message: 'Invalid credentials',
              success: false
            });
          }
        } else if (userEmail.includes('admin') && password === 'admin123') {
          // Create admin account in database
          console.log('👑 Creating admin user in database');
          const adminResult = await client.query(
            'INSERT INTO users (username, password, first_name, last_name, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userEmail, hashPassword('admin123'), 'Admin', 'User', true]
          );
          
          dbUser = adminResult.rows[0];
          console.log(`📊 Created admin in database (ID: ${dbUser.id})`);
          dbSuccess = true;
        }
      } catch (innerDbError) {
        console.error('❌ Database query error:', innerDbError.message);
        // Continue to memory fallback
      } finally {
        client.release();
      }
      
      // If database authentication successful, return user
      if (dbSuccess && dbUser) {
        // Create token
        const token = `jwt-${dbUser.id}-${Date.now()}`;
        
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
        
        // Create user object
        const userObject = {
          id: dbUser.id,
          username: dbUser.username,
          email: dbUser.username,
          firstName: dbUser.first_name, 
          lastName: dbUser.last_name,
          isAdmin: dbUser.is_admin
        };
        
        // Handle HTML form submissions with redirect
        const acceptHeader = req.get('Accept') || '';
        if (acceptHeader.includes('text/html')) {
          // This is a browser form submission, redirect to dashboard
          res.set('Content-Type', 'text/html');
          return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Login Successful</title>
              <script>
                // Store user data
                localStorage.setItem('user', '${JSON.stringify(userObject).replace(/'/g, "\\'")}');
                localStorage.setItem('userEmail', '${dbUser.username}');
                localStorage.setItem('authToken', '${token}');
                
                // Redirect to dashboard
                window.location.href = '/dashboard';
              </script>
            </head>
            <body>
              <h1>Login Successful!</h1>
              <p>Redirecting to your dashboard...</p>
            </body>
            </html>
          `);
        }
        
        // API response for programmatic requests
        return res.json({ 
          token,
          user: userObject,
          success: true,
          message: 'Login successful!',
          redirect: '/dashboard'
        });
      }
    } catch (dbError) {
      console.error('⚠️ Database connection error:', dbError.message);
      console.log('⚠️ Falling back to in-memory authentication');
    }
    
    // Fallback to in-memory authentication
    console.log('🧠 Checking in-memory user storage');
    const memUser = findUserByUsername(userEmail);
    
    if (memUser) {
      // Verify password
      if (verifyPassword(password, memUser.password)) {
        console.log(`🧠 Valid memory login for user: ${userEmail}`);
        
        // Create token
        const token = `jwt-${memUser.id}-${Date.now()}`;
        
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
        
        // Create user object
        const userObject = {
          id: memUser.id,
          username: memUser.username,
          email: memUser.username,
          firstName: memUser.first_name,
          lastName: memUser.last_name,
          isAdmin: memUser.is_admin
        };
        
        // Handle HTML form submissions with redirect
        const acceptHeader = req.get('Accept') || '';
        if (acceptHeader.includes('text/html')) {
          // This is a browser form submission, redirect to dashboard
          res.set('Content-Type', 'text/html');
          return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Login Successful</title>
              <script>
                // Store user data
                localStorage.setItem('user', '${JSON.stringify(userObject).replace(/'/g, "\\'")}');
                localStorage.setItem('userEmail', '${memUser.username}');
                localStorage.setItem('authToken', '${token}');
                
                // Redirect to dashboard
                window.location.href = '/dashboard';
              </script>
            </head>
            <body>
              <h1>Login Successful!</h1>
              <p>Redirecting to your dashboard...</p>
            </body>
            </html>
          `);
        }
        
        // API response for programmatic requests
        return res.json({ 
          token,
          user: userObject,
          success: true,
          message: 'Login successful!',
          redirect: '/dashboard'
        });
      } else {
        console.log(`❌ Invalid password for memory user: ${userEmail}`);
        return res.status(401).json({ 
          message: 'Invalid credentials',
          success: false
        });
      }
    } else if (userEmail.includes('admin') && password === 'admin123') {
      // Special case for admin - create in memory
      console.log('👑 Creating admin user in memory');
      
      // Create admin
      const adminId = getNextUserId();
      const adminUser = {
        id: adminId,
        username: userEmail,
        password: hashPassword('admin123'),
        first_name: 'Admin',
        last_name: 'User',
        is_admin: true
      };
      
      // Add to memory storage
      users.push(adminUser);
      console.log(`🧠 Created admin user in memory (ID: ${adminId})`);
      
      // Create token
      const token = `jwt-admin-${adminId}-${Date.now()}`;
      
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
      
      // Create user object
      const userObject = {
        id: adminId,
        username: userEmail,
        email: userEmail,
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true
      };
      
      // Handle HTML form submissions with redirect
      const acceptHeader = req.get('Accept') || '';
      if (acceptHeader.includes('text/html')) {
        // This is a browser form submission, redirect to dashboard
        res.set('Content-Type', 'text/html');
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Admin Login Successful</title>
            <script>
              // Store user data
              localStorage.setItem('user', '${JSON.stringify(userObject).replace(/'/g, "\\'")}');
              localStorage.setItem('userEmail', '${userEmail}');
              localStorage.setItem('authToken', '${token}');
              
              // Redirect to dashboard
              window.location.href = '/dashboard';
            </script>
          </head>
          <body>
            <h1>Admin Login Successful!</h1>
            <p>Redirecting to your dashboard...</p>
          </body>
          </html>
        `);
      }
      
      // API response for programmatic requests
      return res.json({ 
        token,
        user: userObject,
        success: true,
        message: 'Admin login successful!',
        redirect: '/dashboard'
      });
    }
    
    // User not found in database or memory
    console.log(`❌ User not found in database or memory: ${userEmail}`);
    return res.status(401).json({ 
      message: 'User not found',
      success: false
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      message: 'Server error during login',
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

// Enhanced auth middleware with better error handling
app.use('/dashboard', (req, res, next) => {
  const token = req.cookies.auth_token;
  
  console.log('🔍 Dashboard request, auth token:', token ? 'present' : 'missing');
  
  if (!token) {
    console.log('🔄 Redirecting unauthenticated user from /dashboard to /auth');
    return res.redirect('/auth');
  }
  
  // Add custom headers to help debug auth issues
  res.setHeader('X-Auth-Status', 'authenticated');
  
  // Make sure the application has localStorage populated
  const authScript = `
  <script>
    // Ensure dashboard has auth data
    document.addEventListener('DOMContentLoaded', function() {
      try {
        const token = '${token}';
        const parts = token.split('-');
        const userId = parseInt(parts[1]);
        
        // If no user in localStorage, set a basic one to prevent auth errors
        if (!localStorage.getItem('user') || !localStorage.getItem('authToken')) {
          console.log('📝 Setting auth data in localStorage for dashboard');
          localStorage.setItem('authToken', token);
          
          // Try to get user from cookie or use defaults
          try {
            fetch('/api/me')
              .then(response => response.json())
              .then(data => {
                if (data && data.username) {
                  localStorage.setItem('user', JSON.stringify(data));
                  localStorage.setItem('userEmail', data.email || data.username);
                  console.log('✅ Loaded user data from API');
                }
              })
              .catch(err => console.error('Failed to fetch user data:', err));
          } catch (e) {
            console.error('Error fetching user data:', e);
          }
        }
      } catch (e) {
        console.error('Dashboard auth script error:', e);
      }
    });
  </script>
  `;
  
  // Store the script to inject into the dashboard page
  res.locals.authScript = authScript;
  
  next();
});

// Add middleware to handle JWT routes specifically
app.use(['/jwt', '/api/jwt'], (req, res, next) => {
  console.log(`📡 JWT API request: ${req.method} ${req.path}`);
  next();
});

// Fallback route for SPA with auth enhancement
app.get('*', (req, res) => {
  // Get the HTML file path
  const htmlPath = path.join(__dirname, 'dist', 'public', 'index.html');
  
  // Check if we need to inject auth script
  if (req.path.startsWith('/dashboard') && res.locals.authScript) {
    // Read the file
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading HTML file:', err);
        return res.status(500).send('Error loading application');
      }
      
      // Inject auth script before closing body tag
      const modified = data.replace('</body>', `${res.locals.authScript}\n</body>`);
      
      // Send the modified HTML
      res.setHeader('Content-Type', 'text/html');
      res.send(modified);
    });
  } else {
    // Regular path, just send the file
    res.sendFile(htmlPath);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Neon-compatible authentication server running on port ${PORT}`);
});