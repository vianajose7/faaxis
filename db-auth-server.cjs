/**
 * Database-First Authentication Server
 * 
 * This server prioritizes PostgreSQL database persistence for users
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

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection and setup schema
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    
    // Just verify that users table exists - don't try to create it
    // as it already exists with established schema
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table already exists, using existing schema');
    } else {
      console.log('⚠️ Users table does not exist, this is unexpected');
    }
    console.log('✅ Users table schema verified');
    
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
    firstname: 'Admin',
    lastname: 'User',
    isadmin: true
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

// Serve static files
app.use(express.static('dist'));

// API Routes
// Me endpoint - Check authentication
app.get('/api/me', (req, res) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Extract user ID from token
  const parts = token.split('-');
  const userId = parseInt(parts[1]);
  
  // Find user by ID in memory
  const memoryUser = users.find(u => u.id === userId);
  
  if (memoryUser) {
    return res.json({
      id: memoryUser.id,
      username: memoryUser.username,
      email: memoryUser.username,
      firstName: memoryUser.firstname,
      lastName: memoryUser.lastname,
      isAdmin: memoryUser.isadmin
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
            
            return res.json({
              id: dbUser.id,
              username: dbUser.username,
              email: dbUser.username,
              firstName: dbUser.firstname, 
              lastName: dbUser.lastname,
              isAdmin: dbUser.isadmin
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
            'INSERT INTO users (username, password, firstname, lastname, isadmin) VALUES ($1, $2, $3, $4, $5) RETURNING id',
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
          firstname: firstName || 'New',
          lastname: lastName || 'User',
          isadmin: userEmail.includes('admin')
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
    
    // Return response
    return res.json({ 
      token,
      user: {
        id: userId,
        username: userEmail,
        email: userEmail,
        firstName: firstName || 'New',
        lastName: lastName || 'User'
      },
      success: true,
      message: existingUser ? 'User already exists, login successful' : 'Registration successful!'
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
            'INSERT INTO users (username, password, firstname, lastname, isadmin) VALUES ($1, $2, $3, $4, $5) RETURNING *',
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
        
        return res.json({ 
          token,
          user: {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.username,
            firstName: dbUser.firstname,
            lastName: dbUser.lastname,
            isAdmin: dbUser.isadmin
          },
          success: true,
          message: 'Login successful!'
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
        
        return res.json({ 
          token,
          user: {
            id: memUser.id,
            username: memUser.username,
            email: memUser.username,
            firstName: memUser.firstname,
            lastName: memUser.lastname,
            isAdmin: memUser.isadmin
          },
          success: true,
          message: 'Login successful!'
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
        firstname: 'Admin',
        lastname: 'User',
        isadmin: true
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
      
      return res.json({ 
        token,
        user: {
          id: adminId,
          username: userEmail,
          email: userEmail,
          firstName: 'Admin',
          lastName: 'User',
          isAdmin: true
        },
        success: true,
        message: 'Admin login successful!'
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

// Auth redirection middleware
app.use('/dashboard', (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    console.log('🔄 Redirecting unauthenticated user from /dashboard to /auth');
    return res.redirect('/auth');
  }
  
  next();
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Database-first authentication server running on port ${PORT}`);
});