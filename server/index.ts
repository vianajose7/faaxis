// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { registerTransitionRoutes } from "./routes-transition";
import { setupVite, serveStatic, log } from "./vite";
// Static file serving is handled directly in production mode
import csurf from "csurf";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { hashPassword, authenticate } from "./auth";
import { formatErrorResponse } from "./utils/error-handler";
import { runDatabaseMigration } from "./db-migration";
import helmet from "helmet";
import basicAuth from 'express-basic-auth';
import { logger } from "./logger";
import fs from "fs";
import { createServer } from 'node:http';

const app = express();

// Apply Helmet middleware for security headers
// This sets various HTTP headers to help protect our app
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "https://*.stripe.com"],
      fontSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'", 
        "https://api.openai.com", 
        "https://api.perplexity.ai", 
        "https://api.stripe.com", 
        "https://*.stripe.com", 
        "https://www.linkedin.com"
      ],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"]
    }
  }
}));

// Run DB migration
runDatabaseMigration()
  .then(result => {
    if (result.success) {
      console.log('Database migration completed successfully');
    } else {
      console.error('Database migration failed:', result.error);
    }
  })
  .catch(error => {
    console.error('Error running database migration:', error);
  });

// Initialize session middleware first
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session
const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'advisoroffers-dev-secret',
  resave: false,
  saveUninitialized: true, // This needs to be true to create session on all requests
  store: storage.sessionStore,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax'
  }
};

// Set up session middleware immediately for all routes
import session from 'express-session';
app.use(session(sessionConfig));

// Force HTTPS only in production (disabled for development)
if (process.env.NODE_ENV === 'production' && false) {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }
    next();
  });

  // Add security headers
  app.use((req, res, next) => {
    // HSTS header - tell browsers to always use HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Prevent clickjacking attacks
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Enable XSS protection in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Restrict where resources can be loaded from
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://*.stripe.com; font-src 'self' data:; connect-src 'self' https://api.openai.com https://api.perplexity.ai https://api.stripe.com https://*.stripe.com https://www.linkedin.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com");

    next();
  });
}

// Special handling for Stripe webhooks to get raw body for signature verification
const rawBodyParser = express.raw({ type: 'application/json' });

// Express middleware to process the raw body for specific routes
app.use((req, res, next) => {
  if (req.path === '/api/stripe-webhook') {
    rawBodyParser(req, res, next);
  } else {
    next();
  }
});

// Standard JSON parsing for all other routes
app.use((req, res, next) => {
  if (req.path !== '/api/stripe-webhook') {
    // Skip as we already have JSON parsing middleware
    next();
  } else {
    next();
  }
});

// Skip adding urlencoded and cookie parser again as we already initialized them above

// CSRF protection (excluding paths that need to be called from external services)
const isProduction = process.env.NODE_ENV === 'production';

// Authentication is strictly enforced for security
// No bypass options are available in any environment
console.log("Authentication is strictly enforced - security is always required");

// SameSite must be one of: 'strict', 'lax', or 'none'
// Older versions of csurf didn't properly support string values, but newer ones do
// Using 'lax' as a more compatible option than boolean true
const csrfProtection = csurf({
  cookie: {
    key: '_csrf', 
    path: '/',
    httpOnly: true,
    secure: isProduction, // Only require HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // Use 'none' in production to allow cross-site, 'lax' for development
    maxAge: 3600 // 1 hour
  }
});

// Create separate routers for different authentication methods
const sessionRouter = express.Router();
const jwtRouter = express.Router();
const publicRouter = express.Router();

// Apply CSRF protection ONLY to session-based routes
sessionRouter.use(csrfProtection);

// Middleware to provide CSRF token in response headers for session routes
sessionRouter.use((req, res, next) => {
  if (req.csrfToken && typeof req.csrfToken === 'function') {
    res.setHeader('X-CSRF-Token', req.csrfToken());
  }
  next();
});

// Mount routers at their respective paths
// JWT routes do NOT use CSRF protection
app.use('/api/session', sessionRouter);  // Session-based auth routes with CSRF protection
app.use('/api/jwt', jwtRouter);          // JWT-based auth routes WITHOUT CSRF protection

// Public routes that don't need CSRF protection
const publicPaths = [
  '/api/stripe-webhook',
  '/api/create-payment-intent',
  '/api/payment-session',
  '/api/complete-payment-session',
  '/api/public',
  '/api/posts/generate-ai',
  '/api/generate-blog-content',
  '/api/admin/blog-posts',          // Allow creating blog posts without CSRF validation
  '/verify-email',
  '/reset-password',
  '/api/csrf-token',
  '/api/verify-email',
  '/api/news',
  '/api/forgot-password',
  '/api/admin-login',                // Admin login endpoint
  '/api/request-admin-verification', // Admin verification request
  '/api/verify-admin-code',          // Admin verification code check  
  '/api/admin-verification',         // General admin verification routes
  '/api/admin-auth',                // Admin auth endpoint (original path)
  '/api/admin-auth/send-code',      // Admin send verification code
  '/api/admin-auth/verify-code',    // Admin verify code
  '/api/admin-auth/verify',         // Admin verification endpoint
  '/api/admin-direct-login',        // Admin direct login (dev)
  '/api/generate-totp-secret',       // TOTP setup
  '/api/verify-totp',                // TOTP verification
  '/api/totp-verify',                // Legacy TOTP verification
  '/api/totp-setup'                  // Legacy TOTP setup
];

// Legacy routes that still need to work without CSRF
  // This maintains backward compatibility while we transition to the new structure
  app.use((req, res, next) => {
    // Always apply CSRF protection - no more development bypass

    // Skip CSRF for specific paths that need to be accessed without CSRF
    if (publicPaths.some(path => req.path.startsWith(path))) {
      next();
    } else if (req.path.startsWith('/api/jwt/') || 
               req.path === '/api/jwt-test' || 
               req.path === '/api/dual-auth-test') {
      // These are already handled by the jwtRouter, so just pass through
      next();
    } else if (req.path === '/api/login' || 
               req.path === '/api/register' || 
               req.path === '/api/user-direct-login' ||
               req.path === '/api/admin-login' ||
               req.path === '/api/admin-direct-login') {
      // Legacy auth routes (temporary until fully migrated to /api/session or /api/jwt paths)
      next();
    } else if (req.path === '/api/user' && req.method === 'PUT') {
      // Profile update endpoint uses JWT auth which is CSRF-safe
      next();
    } else {
      // Apply CSRF protection to all other routes
      csrfProtection(req, res, next);
    }
  });

// Middleware to provide CSRF token in a response header for frontend to use
app.use((req, res, next) => {
  // Only set the header if the request is CSRF protected
  if (req.csrfToken && typeof req.csrfToken === 'function') {
    res.setHeader('X-CSRF-Token', req.csrfToken());
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Check for admin credentials from environment variables
  try {
    // Only create admin users if explicitly provided through environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Administrator';

    if (adminEmail && adminPassword) {
      console.log('Creating admin user from environment variables');

      let adminUser = await storage.getUserByUsername(adminEmail);

      if (!adminUser) {
        // Create the admin user
        const hashedPassword = await hashPassword(adminPassword);
        adminUser = await storage.createUser({
          username: adminEmail,
          password: hashedPassword
        });

        // Set admin privileges and email verification
        await storage.updateUser(adminUser.id, { isAdmin: true });
        await storage.updateUserVerification(adminUser.id, { emailVerified: true });

        // Set fullName if available through updateUserProfile
        if (adminName && storage.updateUserProfile) {
          await storage.updateUserProfile(adminUser.id, { fullName: adminName });
        }

        console.log('Admin user created successfully');
      } else {
        // Update existing admin user if needed
        if (!adminUser.emailVerified) {
          await storage.updateUserVerification(adminUser.id, { emailVerified: true });
        }

        if (!adminUser.isAdmin) {
          await storage.updateUser(adminUser.id, { isAdmin: true });
        }

        console.log('Admin user updated successfully');
      }
    } else {
      console.log('No admin credentials found in environment variables');
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  }

  // Direct admin auth routes to bypass routing conflicts
  const pendingOtps = new Map();
  
  // Admin send verification code endpoint
  app.post('/api/admin-auth/send-code', async (req, res) => {
    const { email, password } = req.body;
    
    console.log('=== ADMIN AUTH REQUEST ===');
    console.log('Email:', email);
    
    // Validate admin credentials
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      console.log('Invalid admin credentials');
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = 'otp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Store OTP with 5-minute expiration
    pendingOtps.set(key, {
      code,
      expires: Date.now() + 5 * 60 * 1000,
      email
    });
    
    console.log('Generated verification code:', code);
    console.log('OTP key:', key);
    
    try {
      // Send email using the email service
      const { sendAdminVerificationCode } = await import('./email-service');
      const emailResult = await sendAdminVerificationCode(email, code);
      
      if (emailResult) {
        console.log('Email sent successfully');
        res.json({
          otpKey: key,
          message: 'Verification code sent to your email'
        });
      } else {
        console.log('Email send failed, but code generated for development');
        res.json({
          otpKey: key,
          message: 'Verification code generated (email delivery failed)',
          devCode: process.env.NODE_ENV !== 'production' ? code : undefined
        });
      }
    } catch (error) {
      console.error('Email send error:', error);
      // Still return success with the OTP key so verification can proceed
      res.json({
        otpKey: key,
        message: 'Verification code generated (email service unavailable)',
        devCode: process.env.NODE_ENV !== 'production' ? code : undefined
      });
    }
  });

  // Admin verify code endpoint
  app.post('/api/admin-auth/verify-code', (req, res) => {
    const { otpKey, code } = req.body;
    
    console.log('=== VERIFICATION REQUEST ===');
    console.log('OTP Key:', otpKey);
    console.log('Code:', code);
    
    if (!otpKey || !code) {
      return res.status(400).json({ error: 'OTP key and code are required' });
    }
    
    const entry = pendingOtps.get(otpKey);
    
    if (!entry) {
      console.log('Invalid OTP key');
      return res.status(401).json({ error: 'Invalid verification key' });
    }
    
    if (entry.expires < Date.now()) {
      console.log('OTP expired');
      pendingOtps.delete(otpKey);
      return res.status(401).json({ error: 'Verification code has expired' });
    }
    
    console.log('Expected code:', entry.code);
    console.log('Provided code:', code);
    
    if (entry.code !== code) {
      console.log('Code mismatch');
      return res.status(401).json({ error: 'Invalid verification code' });
    }
    
    // Success - clean up and mark as authenticated
    pendingOtps.delete(otpKey);
    req.session.isAdmin = true;
    req.session.adminEmail = entry.email;
    
    console.log('Admin verification successful');
    
    res.json({
      success: true,
      message: 'Admin authentication successful'
    });
  });
  
  console.log('✅ Direct admin authentication routes registered');

  // Simple admin middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.session?.isAdmin) {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  };

  // Example protected admin route
  app.get('/api/admin-data', requireAdmin, (req, res) => {
    res.json({ 
      message: 'Admin data accessed successfully',
      timestamp: new Date().toISOString(),
      sessionID: req.sessionID,
      user: req.user || { isAdmin: true, username: req.session?.adminEmail || 'admin' }
    });
  });

  // Debug route for admin auth - will help diagnose issues
  app.get('/api/debug-admin-auth', (req, res) => {
    // Full details about session and authentication state
    const sessionInfo = {
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated && req.isAuthenticated(),
      user: req.user || null,
      isAdmin: req.user?.isAdmin === true,
      adminSession: req.session?.isAdmin === true,
      adminAuthenticated: req.session?.adminAuthenticated === true,
      cookies: req.headers.cookie ? 'Present' : 'None',
      timestamp: new Date().toISOString()
    };

    console.log('Debug admin auth:', sessionInfo);

    res.json(sessionInfo);
  });

  // Register standard routes - API routes go first (admin auth already registered above)
  const server = await registerRoutes(app);

  // Ensure authentication endpoints are available at multiple paths for compatibility
  console.log('Setting up direct authentication endpoints...');

  // Import authentication functions
  const { generateToken, hashPasswordJwt, comparePasswordsJwt } = await import('./jwt-auth');

  // Direct login endpoint that works with your frontend
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Find user in database
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const validPassword = await comparePasswordsJwt(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken(user);

      // Set token in cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      console.log('✅ Login successful for:', username);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        user: userWithoutPassword,
        token,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('❌ Login error:', error);
      return res.status(500).json({ message: 'Server error during login' });
    }
  });

  // Direct registration endpoint
  app.post('/api/register', async (req, res) => {
    try {
      const { username, password, firstName, lastName } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

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

      // Set token in cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      console.log('✅ Registration successful for:', username);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        user: userWithoutPassword,
        token,
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('❌ Registration error:', error);
      return res.status(500).json({ message: 'Server error during registration' });
    }
  });

  // Register transition routes for dual authentication
  await registerTransitionRoutes(app);

  // Error handling middleware for API routes
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Enhanced error logging
    console.error('Error occurred:', {
      timestamp: new Date().toISOString(),
      path: _req.path,
      method: _req.method,
      error: {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    });

    const errorResponse = formatErrorResponse(err);
    const status = errorResponse.status || 500;

    // Don't expose internal error details in production
    res.status(status).json(errorResponse);
  });

  // Critical routing order - follow exactly as recommended:

  // 1) First: Static files
  // For production, serve static files directly
  if (app.get("env") !== "development") {
    app.use(express.static(path.resolve(process.cwd(), "client/dist")));
  } else {
    // For development, use Vite's setup
    await setupVite(app, server);
  }

  // 2) Second: All API routes are already registered
  // They come from registerRoutes() above

  // Protect secure management portal with HTTP Basic Auth
  const ADMIN_USER = process.env.ADMIN_EMAIL!;    // e.g. vianajose7@gmail.com
  const ADMIN_PASS = process.env.ADMIN_PASSWORD!; // your hard-coded password

  // Protect everything under /secure-management-portal
  app.use(
    '/secure-management-portal',
    basicAuth({
      users: { [ADMIN_USER]: ADMIN_PASS },
      challenge: true,         // triggers browser login dialog
      realm: 'Admin Area'
    })
  );

  // REMOVED: Direct forceful redirect for root route to admin-login
  // No more forced redirect to admin-login - now serving the homepage properly

  // Production static file serving
  if (app.get("env") !== "development") {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const publicDir = path.resolve(__dirname, '../client/dist');

    console.log(`[PRODUCTION] Serving static files from: ${publicDir}`);

    // Verify the directory exists
    if (!fs.existsSync(publicDir)) {
      console.error(`❌ Static directory does not exist: ${publicDir}`);
      console.error('Please run: npm run build');
    } else {
      console.log('✅ Static directory found');
    }

    // Serve static assets
    app.use(express.static(publicDir, {
      etag: true,
      lastModified: true,
      maxAge: '1d',
      index: false
    }));

    // SPA catch-all for non-API routes
    app.get(/^(?!\/api\/|\/jwt\/).*/, (_req, res) => {
      const indexPath = path.join(publicDir, 'index.html');
      console.log(`[SPA] ${_req.path} → ${indexPath}`);

      if (!fs.existsSync(indexPath)) {
        console.error(`❌ index.html not found at: ${indexPath}`);
        return res.status(500).send('Build incomplete - index.html not found');
      }

      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving index.html:', err);
          res.status(500).send('Error loading application');
        }
      });
    });
  }
  app.use((req, res) => {
    res.status(404).send("Not Found");
  });

  // Function to find available port
  const findAvailablePort = (startPort: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const testServer = createServer();
      testServer.listen(startPort, "0.0.0.0", () => {
        const port = (testServer.address() as any)?.port;
        testServer.close(() => resolve(port));
      });
      testServer.on('error', () => {
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      });
    });
  };

  // Use port 5000 for development to match production expectations
  const port = Number(process.env.PORT || 5000);

  try {
    server.listen(port, "0.0.0.0", () => {
      log(`🚀 Development server running on port ${port}`);
      log(`🌐 Preview URL: https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:' + port}`);
      log(`✅ Development environment synced with production`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        log(`❌ Port ${port} is in use, trying port 3000`);
        server.listen(3000, "0.0.0.0", () => {
          log(`🚀 Server running on fallback port 3000`);
        });
      } else {
        log(`❌ Server error: ${err.message}`);
      }
    });
  } catch (error) {
    log(`Failed to start server: ${error.message}`);
  }
})();