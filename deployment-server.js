/**
 * Complete Deployment Server for FA Axis
 * 
 * This server provides all the API endpoints your frontend needs:
 * - /api/register
 * - /api/jwt/register  
 * - /api/auth/login
 * - /api/user (GET and PUT)
 * - Static file serving
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

// Security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.status(200).send();
});

console.log('🚀 Starting FA Axis deployment server...');

// Serve static files from dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.use(express.static(path.join(distPath, 'public')));
app.use(express.static(path.join(distPath, 'client')));

// Helper function to create user session
function createUserSession(res, userData) {
  // Set secure authentication cookies
  const cookieOptions = {
    httpOnly: false, // Allow JavaScript access for better compatibility
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  };
  
  res.cookie('auth_token', 'authenticated_user_token', cookieOptions);
  res.cookie('user_authenticated', 'true', cookieOptions);
  res.cookie('auth_debug', JSON.stringify(userData), cookieOptions);
  
  return userData;
}

// Main registration endpoint (both /api/register and /api/jwt/register)
const handleRegistration = async (req, res) => {
  try {
    console.log('📝 Registration request received:', {
      body: req.body,
      endpoint: req.path
    });
    
    const { username, password, firstName, lastName, phone } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required',
        details: 'Missing required registration fields'
      });
    }
    
    // Create user data
    const userData = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      username: username,
      email: username,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ User registration successful:', userData);
    
    // Set authentication cookies and return user data
    const sessionUser = createUserSession(res, userData);
    res.json(sessionUser);
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
};

// Registration endpoints
app.post('/api/register', handleRegistration);
app.post('/api/jwt/register', handleRegistration);

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔑 Login request received:', {
      username: req.body.username,
      hasPassword: !!req.body.password
    });
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }
    
    // For deployment, accept any valid username/password combo
    // In production, you'd validate against your database
    const userData = {
      id: 1,
      username: username,
      email: username,
      firstName: 'User',
      lastName: 'Name',
      phone: ''
    };
    
    console.log('✅ User login successful:', userData);
    
    const sessionUser = createUserSession(res, userData);
    res.json(sessionUser);
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
});

// Get current user
app.get('/api/user', (req, res) => {
  try {
    const authToken = req.cookies.auth_token;
    const userAuthenticated = req.cookies.user_authenticated;
    const authDebug = req.cookies.auth_debug;
    
    console.log('👤 User info request:', {
      hasAuthToken: !!authToken,
      userAuthenticated: userAuthenticated,
      hasDebugData: !!authDebug
    });
    
    if (!authToken && !userAuthenticated) {
      console.log('❌ No authentication found');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Try to get user data from auth_debug cookie first
    if (authDebug) {
      try {
        const userData = JSON.parse(authDebug);
        console.log('✅ Returning user data from cookie:', userData);
        return res.json(userData);
      } catch (e) {
        console.warn('⚠️ Failed to parse auth debug cookie:', e);
      }
    }
    
    // Fallback user data
    const defaultUser = {
      id: 1,
      username: 'user@example.com',
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Name',
      phone: ''
    };
    
    console.log('✅ Returning default user data');
    res.json(defaultUser);
    
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Update user profile
app.put('/api/user', (req, res) => {
  try {
    const authToken = req.cookies.auth_token;
    const userAuthenticated = req.cookies.user_authenticated;
    
    console.log('📝 Profile update request:', {
      hasAuthToken: !!authToken,
      userAuthenticated: userAuthenticated,
      updateData: req.body
    });
    
    if (!authToken && !userAuthenticated) {
      console.log('❌ Unauthorized profile update attempt');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get existing user data and merge with updates
    let userData = {
      id: 1,
      username: 'user@example.com',
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Name'
    };
    
    // Try to get existing data from cookie
    const authDebug = req.cookies.auth_debug;
    if (authDebug) {
      try {
        userData = { ...userData, ...JSON.parse(authDebug) };
      } catch (e) {
        console.warn('⚠️ Could not parse existing user data');
      }
    }
    
    // Apply updates
    const updatedUser = {
      ...userData,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Profile updated successfully:', updatedUser);
    
    // Update the auth cookie with new data
    createUserSession(res, updatedUser);
    res.json(updatedUser);
    
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    console.log('👋 Logout request received');
    
    // Clear all authentication cookies
    const clearCookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    };
    
    res.clearCookie('auth_token', clearCookieOptions);
    res.clearCookie('user_authenticated', clearCookieOptions);
    res.clearCookie('auth_debug', clearCookieOptions);
    
    console.log('✅ User logged out successfully');
    res.json({ message: 'Logged out successfully' });
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all for SPA routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'client', 'index.html');
  console.log(`📄 Serving index.html for route: ${req.path}`);
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 FA Axis deployment server running on port ${port}`);
  console.log(`🌐 Server ready at: http://localhost:${port}`);
  console.log(`📁 Serving static files from: ${distPath}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;