/**
 * JWT Authentication Module
 * 
 * This module implements JWT-based authentication as a replacement for the session-based
 * authentication system. The JWT tokens are stored in HTTP-only cookies for security.
 */

import express, { Express, Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

// Secret for JWT signing - fallback to a more robust fixed secret if not in production
const isProduction = process.env.NODE_ENV === 'production';
const fixedSecret = 'advisoroffers-development-jwt-secret-' + (process.env.REPL_ID || Math.random().toString(36).substring(2, 8));

// In production, warn but don't crash if JWT_SECRET is missing
if (isProduction && !process.env.JWT_SECRET) {
  console.warn('WARNING: Using fallback JWT secret in production - this is not recommended.  Consider setting JWT_SECRET environment variable.');
}

// Use environment variable if available, otherwise use fixed secret
const jwtSecret = process.env.JWT_SECRET || fixedSecret;

// Debugging helper to track secret changes
let jwtSecretDebugId = Math.random().toString(36).substring(2, 8);

// Use environment variable if available, otherwise use our fixed secret
export const JWT_SECRET = process.env.EXPLICIT_JWT_SECRET || process.env.JWT_SECRET || fixedSecret;

// Debug global scope to help diagnose JWT issues
console.log(`JWT module loaded with secret instance: ${jwtSecretDebugId}`);
console.log(`JWT_SECRET first 8 chars: ${JWT_SECRET.substring(0, 8)}...`);
console.log(`Secret source: ${process.env.EXPLICIT_JWT_SECRET ? 'EXPLICIT_JWT_SECRET' : (process.env.JWT_SECRET ? 'JWT_SECRET' : 'fixed constant')}`);

// Export the secret for debugging
export const getJwtSecretInfo = () => ({
  secretInstance: jwtSecretDebugId,
  secretFirstChars: JWT_SECRET.substring(0, 8) + '...',
  secretSource: process.env.EXPLICIT_JWT_SECRET ? 'EXPLICIT_JWT_SECRET' : (process.env.JWT_SECRET ? 'JWT_SECRET' : 'fixed constant'),
  secretLength: JWT_SECRET.length
});
export const TOKEN_EXPIRY = '7d'; // Token expires in 7 days

/**
 * Hash password using bcrypt
 */
export async function hashPasswordJwt(password: string): Promise<string> {
  // Generate a salt
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the salt
  return bcrypt.hash(password, salt);
}

/**
 * Compare supplied password with stored hash using bcrypt or scrypt
 * Always tries bcrypt first, then falls back to scrypt for legacy passwords
 */
export async function comparePasswordsJwt(supplied: string, stored: string): Promise<boolean> {
  try {
    // Check if we have a valid stored password
    if (!stored) {
      console.warn('Empty password hash provided for comparison');
      return false;
    }

    // Log password format info for debugging (with limited info for security)
    const isBcryptFormat = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
    const hasDot = stored.includes('.');
    const hasColon = stored.includes(':');
    console.log(`Password format hints - bcrypt: ${isBcryptFormat}, dot: ${hasDot}, colon: ${hasColon}`);

    // STEP 1: Always try bcrypt first for all password formats (primary method)
    if (isBcryptFormat) {
      try {
        console.log('Using bcrypt comparison - modern format');
        const result = await bcrypt.compare(supplied, stored);
        if (result) {
          console.log('Bcrypt comparison successful');
          return true;
        }
        console.log('Bcrypt comparison failed, will try fallback methods');
      } catch (bcryptError) {
        console.error('Bcrypt comparison error:', bcryptError);
        // Continue to fallback methods
      }
    } else {
      // For non-bcrypt formats, still try bcrypt first in case of future migration
      try {
        console.log('Trying bcrypt speculatively on non-bcrypt format');
        const result = await bcrypt.compare(supplied, stored);
        if (result) {
          console.log('Speculative bcrypt comparison successful');
          return true;
        }
      } catch (err) {
        // Expected to fail for non-bcrypt formats, just continue
      }
    }

    // STEP 2: Try dot-format scrypt (most common legacy format)
    if (hasDot) {
      try {
        console.log('Using scrypt comparison - legacy dot format');
        const [hashed, salt] = stored.split('.');
        if (hashed && salt) {
          const hashedBuf = Buffer.from(hashed, 'hex');
          const scryptAsync = promisify(scrypt);
          const suppliedBuf = await scryptAsync(supplied, salt, 64) as Buffer;
          const result = timingSafeEqual(hashedBuf, suppliedBuf);
          console.log(`Scrypt dot format comparison result: ${result}`);
          if (result) return true;
        }
      } catch (err) {
        console.error('Dot-format scrypt comparison error:', err);
        // Continue to next method
      }
    }

    // STEP 3: Try colon-format scrypt
    if (hasColon) {
      try {
        console.log('Using scrypt comparison - colon format');
        const [salt, key] = stored.split(':');
        if (salt && key) {
          const scryptAsync = promisify(scrypt);
          const derivedKey = await scryptAsync(supplied, salt, 64) as Buffer;
          const derivedKeyHex = derivedKey.toString('hex');
          const result = timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKeyHex, 'hex'));
          console.log(`Scrypt colon format comparison result: ${result}`);
          if (result) return true;
        }
      } catch (err) {
        console.error('Colon-format scrypt comparison error:', err);
        // Continue to final fallback
      }
    }

    // STEP 4: Last resort - try any other method that might work
    console.log('All standard methods failed, attempting final fallback comparison');
    try {
      // Final desperate attempt - for any custom format we might have missed
      if (hasDot) {
        const [hashed, salt] = stored.split('.');
        const hashedBuf = Buffer.from(hashed, 'hex');
        const scryptAsync = promisify(scrypt);
        const suppliedBuf = await scryptAsync(supplied, salt, 64) as Buffer;
        return timingSafeEqual(hashedBuf, suppliedBuf);
      }
    } catch (err) {
      console.error('Final fallback comparison failed:', err);
    }

    // If we've exhausted all methods, authentication fails
    console.warn('All password comparison methods failed');
    return false;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      isAdmin: !!user.isAdmin,
      isPremium: !!user.isPremium,
      emailVerified: !!user.emailVerified
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Middleware to authenticate requests using JWT tokens
 * Supports both cookie-based and Authorization header-based authentication
 */
export async function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  console.log('==== JWT Authentication Middleware ====');
  console.log('Cookies:', req.cookies ? JSON.stringify(req.cookies) : 'none');
  console.log('Authorization Header:', req.headers.authorization || 'none');

  // Try to get token from multiple sources for maximum compatibility
  // Order of precedence: Authorization header, auth_token cookie
  let token: string | null = null;

  // Check Authorization header first (highest priority)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('Using token from Authorization header');
  }

  // If no valid token in header, check cookies
  if (!token && req.cookies) {
    if (req.cookies.auth_token) {
      token = req.cookies.auth_token;
      console.log('Using token from auth_token cookie');
    }
  }

  // Debug tokens found
  console.log('Auth-Token cookie:', req.cookies?.auth_token ? 'present' : 'not present');
  console.log('Debug cookie:', req.cookies?.auth_token_debug ? 'present' : 'not present');
  console.log('Final token used:', token ? 'token found' : 'no token');

  if (!token) {
    console.log('No JWT token found in cookie or header');
    res.status(401).json({ 
      message: 'Authentication required',
      detail: 'No token found in cookie or Authorization header'
    });
    return;
  }

  try {
    // Verify the token
    console.log('Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('JWT verification successful:', typeof decoded);

    if (!decoded || typeof decoded !== 'object') {
      throw new Error('Invalid token structure');
    }

    // Check if token has required user data
    if (!(decoded as any).id) {
      console.error('Token missing user ID:', decoded);
      throw new Error('Token missing user ID');
    }

    // Attach user data to request
    (req as any).user = decoded;
    console.log('User ID attached to request:', (req as any).user.id);

    // Return a refreshed token in the response for token renewal
    const headerToken = token; // Save for comparison

    // Continue with the request
    next();
  } catch (error: any) {
    console.error('JWT verification failed:', error.message);

    // Clear the invalid cookie with type-safe options
    const isProduction = process.env.NODE_ENV === 'production';
    const clearCookieOptions = {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax'
    };

    console.log('Clearing invalid token cookie');
    res.clearCookie('auth_token', clearCookieOptions);
    res.clearCookie('auth_token_debug', { 
      path: '/',
      httpOnly: false
    });

    res.status(401).json({ 
      message: 'Authentication failed: ' + error.message,
      error: error.message,
      code: 'token_invalid'
    });
    return;
  }
}

/**
 * Middleware to require admin privileges
 */
export function requireAdminJwt(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !(req.user as any).isAdmin) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
}

// Create a router for JWT routes that can be exported
export const jwtRouter = express.Router();

/**
 * Set up JWT auth routes
 */
export function setupJwtAuth(app: Express) {

  // Define secure cookie settings
  const isProduction = process.env.NODE_ENV === 'production';
  const secureCookieSettings: {
    httpOnly: boolean;
    maxAge: number;
    path: string;
    sameSite: 'lax' | 'strict' | 'none' | boolean;
    secure: boolean;
  } = {
    httpOnly: true, // Prevents JavaScript access to the cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    sameSite: isProduction ? 'none' : 'lax', // Use 'none' in production to allow cross-site requests, 'lax' for development
    secure: isProduction, // HTTPS only in production
  };

  /**
   * Register a new user
   */
  jwtRouter.post('/register', async (req, res) => {
    try {
      const { username, password, firstName, lastName } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);

      // If user already exists (possibly from session auth), just generate a JWT for them
      if (existingUser) {
        console.log(`User ${username} already exists, generating JWT for existing user`);

        // First verify the password to ensure security
        const validPassword = await comparePasswordsJwt(password, existingUser.password);
        if (!validPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token for existing user
        const token = generateToken(existingUser);

        // Set token in cookie with secure settings
        // Use simpler settings for cookie to avoid Safari/Chrome issues
        const simpleCookieSettings = {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
          sameSite: 'lax' as 'lax', // Type assertion to fix TypeScript error
          secure: false // Set to false in all environments to debug the cookie issue
        };

        console.log('Setting auth_token cookie with settings on register:', JSON.stringify(simpleCookieSettings));
        res.cookie('auth_token', token, simpleCookieSettings);

        // Also set a non-httpOnly cookie for debugging purposes
        res.cookie('auth_token_debug', 'present', { 
          httpOnly: false,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/'
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = existingUser;

        // Return user data and token - status 200 for existing user
        return res.status(200).json({
          user: userWithoutPassword,
          token,
          message: 'JWT token generated for existing user'
        });
      }

      // If user doesn't exist, create a new one
      // Hash password
      const hashedPassword = await hashPasswordJwt(password);

      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null
      });

      // Generate JWT token
      const token = generateToken(user);

      // Set token in cookie with secure settings
      // Use same simplified cookie settings as in login
      const simpleCookieSettings = {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax' as 'lax',
        secure: false
      };

      console.log('Setting auth_token cookie for new user:', JSON.stringify(simpleCookieSettings));
      res.cookie('auth_token', token, simpleCookieSettings);

      // Also set a non-httpOnly cookie for debugging purposes
      res.cookie('auth_token_debug', 'present', { 
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Return user data and token
      return res.status(201).json({
        user: userWithoutPassword,
        token,
        message: 'User registered successfully'
      });

      // Log successful registration
      console.log(`User registered successfully: ${username} (ID: ${user.id})`);
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Server error during registration' });
    }
  });

  /**
   * Login user
   */
  /**
   * Debug endpoint that returns JWT information for diagnostics
   */
  jwtRouter.get('/debug-secret', (req, res) => {
    const secretInfo = getJwtSecretInfo();
    res.json({
      ...secretInfo,
      nowTimestamp: Date.now(),
      currentTime: new Date().toISOString()
    });
  });

  jwtRouter.post('/login', async (req, res) => {
    try {
      // Clear any existing tokens first for a fresh login
      console.log('Login: Clearing any existing token cookies for clean login');
      res.clearCookie('auth_token', { path: '/' });
      res.clearCookie('auth_token_debug', { path: '/' });

      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      console.log(`Login attempt for user ${username} - Password format: ${user.password.substring(0, 10)}...`);
      const validPassword = await comparePasswordsJwt(password, user.password);
      if (!validPassword) {
        console.log(`Password validation failed for user ${username}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      console.log(`Password validation successful for user ${username}`);

      // Auto-upgrade passwords from scrypt to bcrypt on successful login
      // This ensures a smooth migration to the more secure format
      if (!user.password.startsWith('$2')) {  // Not a bcrypt hash
        try {
          console.log(`Upgrading password format for user ${username} from legacy to bcrypt`);
          const bcryptHash = await hashPasswordJwt(password);
          await storage.updateUser(user.id, { password: bcryptHash });
          console.log(`Successfully upgraded password format for user ${username}`);
        } catch (upgradeError) {
          // Still allow login even if upgrade fails
          console.error(`Password format upgrade failed for user ${username}:`, upgradeError);
        }
      }

      // Debugging: Log JWT secret instance being used for login
      console.log(`LOGIN: Using JWT secret instance ${jwtSecretDebugId} for token creation`);

      // Generate JWT token
      const token = generateToken(user);

      // Verify the token we just created to ensure it's valid
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('TOKEN SELF-TEST: Successful verification with same secret instance');
      } catch (verifyError) {
        console.error('TOKEN SELF-TEST ERROR: Failed to verify with same secret instance:', verifyError);
        // Continue anyway to help diagnose the issue
      }

      // Set token in cookie with secure settings
      // Use simpler settings for cookie to avoid Safari/Chrome issues
      const simpleCookieSettings = {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        // Using lax sameSite for better cookie preservation
        sameSite: 'lax' as 'lax', // Type assertion to fix TypeScript error
        secure: false // Set to false in all environments to debug the cookie issue
      };

      console.log('Setting auth_token cookie with settings:', JSON.stringify(simpleCookieSettings));
      res.cookie('auth_token', token, simpleCookieSettings);

      // Also set a non-httpOnly cookie for debugging purposes
      res.cookie('auth_token_debug', 'present', { 
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Return user data and token with debug info
      return res.json({
        user: userWithoutPassword,
        token,
        message: 'Login successful',
        debug: {
          secretInstance: jwtSecretDebugId,
          tokenPrefix: token.substring(0, 20) + '...',
          key: 'login-direct'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error during login' });
    }
  });

  /**
   * Logout user
   */
  jwtRouter.post('/logout', (req, res) => {
    // Clear auth cookie using same path and settings to ensure proper removal
    console.log('Clearing auth_token cookie on logout');

    // Use same settings as when setting the cookie to ensure proper removal
    const simpleCookieSettings = {
      httpOnly: true,
      path: '/',
      sameSite: 'lax' as 'lax', // Type assertion to fix TypeScript error
      secure: false
    };

    res.clearCookie('auth_token', simpleCookieSettings);
    res.clearCookie('auth_token_debug', { httpOnly: false, path: '/' });

    // For debugging - use both clearCookie and direct cookie clearing with expires
    res.cookie('auth_token', '', { 
      ...simpleCookieSettings, 
      expires: new Date(0) 
    });

    return res.json({ message: 'Logout successful' });
  });

  /**
   * Get current user
   */
  jwtRouter.get('/me', authenticateJwt, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      console.log(`Fetching user data for ID ${userId} from /me endpoint`);

      // Get up-to-date user data
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User with ID ${userId} not found in database`);

        // Clear cookies with type-safe options
        const clearCookieOptions = {
          path: '/',
          httpOnly: true,
          secure: isProduction,
          sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax'
        };

        res.clearCookie('auth_token', clearCookieOptions);
        res.clearCookie('auth_token_debug', { 
          path: '/',
          httpOnly: false
        });

        return res.status(401).json({ 
          message: 'User not found', 
          code: 'user_not_found' 
        });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Generate a fresh token to extend the session
      const newToken = generateToken(user);

      // Set token in cookie with secure settings
      const simpleCookieSettings = {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax' as 'lax',
        secure: false
      };

      // Set cookie for browsers that support it
      res.cookie('auth_token', newToken, simpleCookieSettings);

      // Return user data along with a fresh token
      return res.json({
        ...userWithoutPassword,
        token: newToken, // Include token in the response for client storage
        authenticated: true
      });
    } catch (error) {
      console.error('Error getting user data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ 
        message: 'Server error', 
        error: errorMessage,
        code: 'server_error'
      });
    }
  });

  /**
   * Route that acts as a compatibility layer between old session auth and new JWT auth
   * This can be used to help migrate users smoothly
   */
  jwtRouter.get('/auth-bridge', async (req, res) => {
    // Check if user is authenticated with session
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      try {
        // Log the user attempting to bridge authentication
        console.log('Bridging auth for user:', req.user.username);

        // Generate JWT token for session-authenticated user
        const token = generateToken(req.user as User);

        // Set token in cookie with secure settings
        // Use simpler consistent cookie settings
        const simpleCookieSettings = {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
          sameSite: 'lax' as 'lax',
          secure: false
        };

        console.log('Setting auth_token cookie in auth-bridge:', JSON.stringify(simpleCookieSettings));
        res.cookie('auth_token', token, simpleCookieSettings);

        // Also set a non-httpOnly cookie for debugging purposes
        res.cookie('auth_token_debug', 'present', { 
          httpOnly: false,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/'
        });

        // Return success
        return res.json({ 
          message: 'Session authentication bridged to JWT',
          user: req.user
        });
      } catch (error) {
        console.error('Auth bridge error:', error);
        return res.status(500).json({ message: 'Server error during auth bridge' });
      }
    } else {
      // Check if JWT is already present in cookies or Authorization header
      const token = req.cookies?.auth_token
        || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
      if (token) {
        try {
          // Verify the token
          const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
          if (decoded && decoded.id) {
            // Get the user by ID
            const user = await storage.getUser(decoded.id);
            if (user) {
              console.log('User already has valid JWT token:', user.username);
              return res.json({
                message: 'Already authenticated with JWT',
                user
              });
            }
          }
        } catch (err) {
          console.error('Invalid token in auth-bridge:', err);
        }
      }

      return res.status(401).json({ message: 'Not authenticated with session' });
    }
  });

  // Register the router with a prefix
  app.use('/jwt', jwtRouter);

  // Add a test endpoint for JWT auth that also returns a fresh token
  app.get('/api/jwt-test', authenticateJwt, async (req, res) => {
    try {
      const userId = (req.user as any).id;

      // Get full user data if available (optional enhancement)
      let userData = null;
      try {
        userData = await storage.getUser(userId);
      } catch (error) {
        console.warn(`Could not fetch user data for ID ${userId} in jwt-test endpoint:`, error);
        // Continue with the operation even if we can't get user data
      }

      // Generate a fresh token to keep session active
      // Make sure we have a valid user object to generate token
      const userForToken = userData || (req.user as any);
      const freshToken = generateToken(userForToken);

      // Set the token in cookie to refresh expiration
      const simpleCookieSettings = {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax' as 'lax',
        secure: false
      };

      res.cookie('auth_token', freshToken, simpleCookieSettings);

      // Return test response with the token for client-side storage
      return res.json({
        message: 'JWT Authentication working!',
        user: userData || req.user,
        authCookiePresent: true,
        token: freshToken, // Include token in response for client-side storage
        authenticated: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in JWT test endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ 
        message: 'JWT test error',
        error: errorMessage
      });
    }
  });
}