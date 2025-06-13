// New approach using simple JWT tokens instead of complex session management
const express = require('express');
const jwt = require('jsonwebtoken');
const { scrypt, randomBytes, timingSafeEqual } = require('crypto');
const { promisify } = require('util');
const { pool } = require('./db');
const { db } = require('./db');
const { eq } = require('drizzle-orm');
const { users } = require('../shared/schema');

// Convert scrypt to a promise-based function
const scryptAsync = promisify(scrypt);

// Secret for JWT signing - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // Token expires in 7 days

// Hash password with salt
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Compare supplied password with stored hash
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Create an auth router
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const [user] = await db.insert(users).values({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerified: true, // Auto-verify for simplicity
      isPremium: false,
    }).returning();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: !!user.isAdmin },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Set httpOnly cookie with the token
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Return user data and token
    res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await comparePasswords(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: !!user.isAdmin },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Set httpOnly cookie with the token
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Return user data and token
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  // Clear auth cookie
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      // Verify and decode token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user data
      const [user] = await db.select().from(users).where(eq(users.id, decoded.id));
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Return user data
      res.json(userWithoutPassword);
    } catch (tokenError) {
      // Token is invalid or expired
      res.clearCookie('auth_token');
      return res.status(401).json({ message: 'Session expired, please login again' });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Server error during authentication check' });
  }
});

// Middleware to verify authentication
function authenticate(req, res, next) {
  // Get token from cookies
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    
    // Continue to the protected route
    next();
  } catch (error) {
    // Token is invalid or expired
    res.clearCookie('auth_token');
    return res.status(401).json({ message: 'Session expired, please login again' });
  }
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
}

module.exports = {
  router,
  authenticate,
  requireAdmin,
  hashPassword,
  comparePasswords
};