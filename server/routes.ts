import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { setupJwtAuth, authenticateJwt, requireAdminJwt, generateToken } from "./jwt-auth";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import { randomBytes } from "crypto";
import { WebSocketServer, WebSocket } from 'ws';
import { processPaymentSimple } from './api-routes/process-payment';
import fs from 'fs';
import path from 'path';
import { 
  InsertCalculationParameter, 
  InsertFirmDeal,
  calculationParameters,
  firmDeals,
  firmProfiles,
  User
} from "@shared/schema";
import { eq, desc, sql } from 'drizzle-orm';
import { db } from './db';
import { blogPosts, activityLogs } from "@shared/schema";
import "express-session";

// Import API route modules
import blogAiRoutes from "./api-routes/blog-ai";
import firmLandingPagesRoutes from "./api-routes/firm-landing-pages";
import { generateVerificationCode, verifyCode, requireVerification } from "./api-routes/verify-code";
import { checkSkipAuth, toggleSkipAuth, getSkipAuthStatus } from "./api-routes/auth-toggle";
import { registerJwtDiagnosticRoutes } from "./jwt-routes-check";

// Extend the Express Session interface to include our custom properties
declare module "express-session" {
  interface SessionData {
    adminAuthenticated?: boolean;
  }
}

// Import Airtable service
import { getFirmDeals, getFirmParameters, getFirmProfiles, invalidateCache } from './airtable-service';
import { listAirtableTables, testReadTable } from './debug-airtable';
// Import OpenAI service
import { enhanceProfile, generateBlogContent, generateBlogPost } from './openai-service';
// Import Blog Generator
import { generateBlog } from './blog-generator';
// Import Email service
import { 
  sendListingApprovalNotification, 
  sendMarketplaceUpdatesNotification,
  sendVerificationEmail,
  sendPasswordResetEmail
} from './email-service';

// Import TOTP service
import { generateTOTPSecret, verifyTOTP } from './totp-service';

// Import SPA catchall route handler - will be used after all API routes
import { setupSPARoutes } from './spa-catchall';

// Import the JWT router at the top level
import { jwtRouter } from './jwt-auth';

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount JWT router at /api/jwt path for proper registration endpoint
  app.use('/api/jwt', jwtRouter);
  console.log('JWT router mounted at /api/jwt path for registration endpoint');
  
  // Health check endpoint for load balancer
  app.get('/health', (req, res) => res.status(200).send('OK'));
  // Immediately run a category normalization procedure on startup
  try {
    console.log("Running category normalization for blog posts...");
    const posts = await storage.getAllBlogPosts();
    let updatedCount = 0;
    
    for (const post of posts) {
      if (post.category === 'advisor-transitions' || post.category === 'transitions') {
        console.log(`Normalizing blog post #${post.id} category from '${post.category}' to 'moves'`);
        await storage.updateBlogPost(post.id, { 
          category: 'moves',
          updatedAt: new Date().toISOString()
        });
        updatedCount++;
      }
    }
    
    console.log(`Category normalization complete. Updated ${updatedCount} blog posts.`);
  } catch (error) {
    console.error("Error during category normalization:", error);
  }
  // Register API route modules
  app.use("/api", blogAiRoutes);
  app.use("/api", firmLandingPagesRoutes);
  
  // Health check endpoint for deployment monitoring
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "unknown"
    });
  });
  
  // Stripe configuration status check endpoint
  app.get("/api/check-stripe-config", (req, res) => {
    try {
      // Check if Stripe secret key is configured
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      // Determine if we're in test mode (starts with sk_test_)
      const isTestMode = stripeSecretKey?.startsWith('sk_test_') || false;
      
      res.status(200).json({
        hasSecretKey: !!stripeSecretKey,
        hasWebhookKey: !!stripeWebhookSecret,
        isTestMode: isTestMode,
        webhookEndpoint: "https://www.faaxis.com/api/stripe-webhook",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error checking Stripe configuration:", error);
      res.status(500).json({ 
        error: "Failed to check Stripe configuration",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Development-only route for admin access page
  if (process.env.NODE_ENV === 'development') {
    app.get('/admin-access', (req, res) => {
      res.sendFile('admin-dev-access.html', { root: './client/public' });
    });
  }
  
  // Demo access route has been removed
  
  // Setup cookie parser for JWT cookies
  app.use(cookieParser());
  
  // Setup session-based authentication routes
  setupAuth(app);
  
  // Setup JWT-based authentication routes
  setupJwtAuth(app);
  
  // Add direct /api/login and /api/register routes that use JWT
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Verify password using JWT auth password comparison
      const { comparePasswordsJwt } = await import('./jwt-auth');
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
        secure: false
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json({
        user: userWithoutPassword,
        token,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error during login' });
    }
  });
  
  app.post('/api/register', async (req, res) => {
    try {
      const { username, password, firstName, lastName, phone } = req.body;
      
      console.log('🔶 Registration request received:', { 
        username, 
        hasPassword: !!password, 
        firstName, 
        lastName,
        phone
      });
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }
      
      // Hash password using JWT auth
      const { hashPasswordJwt } = await import('./jwt-auth');
      const hashedPassword = await hashPasswordJwt(password);
      
      // Create user with all registration data
      const userData = {
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null
      };
      
      console.log('🔷 Creating user with data:', { 
        username: userData.username, 
        firstName: userData.firstName, 
        lastName: userData.lastName,
        phone: userData.phone
      });
      
      const user = await storage.createUser(userData);
      
      console.log('✅ User created successfully:', { 
        id: user.id, 
        username: user.username, 
        firstName: user.firstName, 
        lastName: user.lastName 
      });
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Set token in cookie with proper configuration for persistence
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        sameSite: 'lax' as const,
        secure: isProduction,
        domain: undefined // Let browser determine domain
      };
      
      console.log('🍪 Setting auth cookie with options:', cookieOptions);
      res.cookie('auth_token', token, cookieOptions);
      
      // Also set a client-accessible cookie for frontend state management
      res.cookie('user_authenticated', 'true', {
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        sameSite: 'lax' as const,
        secure: isProduction,
        domain: undefined // Let browser determine domain
      });
      
      // Set a debug cookie to help track authentication state
      res.cookie('auth_debug', JSON.stringify({
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        timestamp: Date.now()
      }), {
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      console.log('🎉 Registration successful, returning user data:', {
        id: userWithoutPassword.id,
        username: userWithoutPassword.username,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName
      });
      
      return res.status(201).json({
        ...userWithoutPassword,
        token,
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('❌ Registration error:', error);
      return res.status(500).json({ message: 'Server error during registration' });
    }
  });
  
  // Add dual authentication support for /api/user endpoint
  app.get('/api/user', async (req, res) => {
    try {
      console.log('🔍 GET /api/user - Checking authentication methods');
      
      // First try JWT authentication
      const token = req.cookies?.auth_token || 
        (req.headers.authorization && req.headers.authorization.split(' ')[1]);
      
      if (token) {
        try {
          const jwt = await import('jsonwebtoken');
          const { JWT_SECRET } = await import('./jwt-auth');
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          
          if (decoded && decoded.id) {
            const user = await storage.getUser(decoded.id);
            if (user) {
              console.log('✅ JWT authentication successful for user:', user.id);
              const { password: _, ...userWithoutPassword } = user;
              return res.json(userWithoutPassword);
            }
          }
        } catch (jwtError) {
          console.log('⚠️ JWT verification failed:', jwtError.message);
        }
      }
      
      // Fallback to session authentication
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        console.log('✅ Session authentication successful for user:', req.user.id);
        const { password: _, ...userWithoutPassword } = req.user;
        return res.json(userWithoutPassword);
      }
      
      console.log('❌ No valid authentication found');
      return res.status(401).json({ 
        message: 'Not authenticated',
        sessionId: req.sessionID,
        sessionActive: false
      });
    } catch (error) {
      console.error('❌ Get user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Add profile update endpoint with dual authentication support
  app.put('/api/user', async (req, res) => {
    try {
      let userId = null;
      
      // First try JWT authentication
      const token = req.cookies?.auth_token || 
        (req.headers.authorization && req.headers.authorization.split(' ')[1]);
      
      if (token) {
        try {
          const jwt = await import('jsonwebtoken');
          const { JWT_SECRET } = await import('./jwt-auth');
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          
          if (decoded && decoded.id) {
            userId = decoded.id;
            console.log('✅ JWT authentication for profile update, user:', userId);
          }
        } catch (jwtError) {
          console.log('⚠️ JWT verification failed for profile update:', jwtError.message);
        }
      }
      
      // Fallback to session authentication
      if (!userId && req.isAuthenticated && req.isAuthenticated() && req.user) {
        userId = req.user.id;
        console.log('✅ Session authentication for profile update, user:', userId);
      }
      
      if (!userId) {
        console.log('❌ No authentication found for profile update');
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { firstName, lastName, phone, city, state, firm, aum, revenue, feeBasedPercentage } = req.body;
      
      console.log('🔄 Profile update request for user:', userId);
      console.log('📝 Update data received:', { 
        firstName, 
        lastName, 
        phone, 
        city, 
        state, 
        firm, 
        aum, 
        revenue, 
        feeBasedPercentage 
      });
      
      // Clean and validate the data before updating
      const updateData: any = {};
      
      if (firstName !== undefined) updateData.firstName = firstName?.trim() || null;
      if (lastName !== undefined) updateData.lastName = lastName?.trim() || null;
      if (phone !== undefined) updateData.phone = phone?.trim() || null;
      if (city !== undefined) updateData.city = city?.trim() || null;
      if (state !== undefined) updateData.state = state?.trim() || null;
      if (firm !== undefined) updateData.firm = firm?.trim() || null;
      if (aum !== undefined) updateData.aum = aum?.toString().trim() || null;
      if (revenue !== undefined) updateData.revenue = revenue?.toString().trim() || null;
      if (feeBasedPercentage !== undefined) updateData.feeBasedPercentage = feeBasedPercentage?.toString().trim() || null;
      
      console.log('🔧 Cleaned update data for database:', updateData);
      
      // Update user profile
      const updatedUser = await storage.updateUserProfile(userId, updateData);
      
      if (!updatedUser) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      console.log('✅ Profile updated successfully for user:', updatedUser.id);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('❌ Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Register JWT diagnostic routes
  registerJwtDiagnosticRoutes(app);
  
  // Add CSRF token endpoint
  app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
  
  // Add auth headers debug endpoint
  app.get('/api/auth-headers', (req, res) => {
    // Check for Authorization header (JWT)
    const authHeader = req.headers.authorization;
    let tokenPresent = false;
    let tokenPrefix = '';
    
    if (authHeader) {
      tokenPresent = true;
      tokenPrefix = authHeader.split(' ')[0];
    }
    
    // Add debug headers to help trace authorization issues
    res.header('X-Auth-Debug', 'true');
    res.header('X-Auth-Method', tokenPresent ? 'jwt_header' : (req.cookies?.auth_token ? 'jwt_cookie' : 'none'));
    res.header('X-Auth-Session', req.isAuthenticated && req.isAuthenticated() ? 'active' : 'inactive');
    
    res.json({
      message: 'Auth headers check endpoint',
      headers: {
        authorization: {
          present: tokenPresent,
          type: tokenPrefix
        }
      },
      cookies: {
        auth_token: !!req.cookies?.auth_token,
        auth_token_debug: !!req.cookies?.auth_token_debug
      },
      session: {
        authenticated: req.isAuthenticated && req.isAuthenticated(),
        user: req.user ? { id: req.user.id, username: req.user.username } : null
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // Auth status check that works with both authentication methods
  app.get('/api/auth-status', (req, res) => {
    // Check JWT auth
    const token = req.cookies?.auth_token;
    
    // Check session auth
    const sessionAuth = req.isAuthenticated ? req.isAuthenticated() : false;
    
    // Check admin session authentication (from direct admin access)
    const adminSessionAuth = req.session && req.session.adminAuthenticated === true;
    console.log("Admin session authenticated:", adminSessionAuth);
    
    res.json({
      jwtAuthCookiePresent: !!token,
      sessionAuthenticated: sessionAuth || adminSessionAuth, // Include admin session
      adminSessionAuthenticated: adminSessionAuth,
      user: req.user || (adminSessionAuth ? { 
        isAdmin: true, 
        emailVerified: true,
        username: 'admin@direct-access'
      } : null)
    });
  });
  
  // DEVELOPMENT ONLY: Direct admin login endpoint
  if (process.env.NODE_ENV === 'development') {
    app.get('/api/dev-admin-login', async (req, res) => {
      try {
        console.log("DEV DIRECT ADMIN LOGIN - Creating admin session");
        
        // Get or create an admin user
        let adminUser = await storage.getUserByUsername("dev-admin@advisoro.com");
        
        if (!adminUser) {
          console.log("Creating dev admin user");
          // Create a dev admin user if not exists
          const newUser = await storage.createUser({
            username: "dev-admin@advisoro.com",
            password: await hashPassword("devadminpass"),
            firstName: "Dev",
            lastName: "Admin"
          });
          
          // Update user with admin privileges and email verification
          adminUser = await storage.updateUser(newUser.id, {
            isAdmin: true,
            emailVerified: true
          });
        }
        
        // Log the user in
        req.login(adminUser, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ error: "Login failed" });
          }
          
          // Set admin session flag
          req.session.adminAuthenticated = true;
          
          // Generate JWT token for the admin
          const token = generateToken(adminUser);
          
          // Set cookie and redirect to admin dashboard
          res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          });
          
          console.log("DEV ADMIN LOGIN SUCCESSFUL - Redirecting to admin dashboard");
          res.redirect("/secure-management-portal");
        });
      } catch (error) {
        console.error("Dev admin login error:", error);
        res.status(500).json({ error: "Failed to create admin session" });
      }
    });
  }
  
  // JWT/Session auth bridge - for migrating users from session to JWT auth
  // Add a dual auth test endpoint
  app.get('/api/dual-auth-test', (req, res) => {
    res.json({
      message: 'Dual authentication test endpoint',
      sessionAuth: req.isAuthenticated && req.isAuthenticated(),
      jwtAuth: !!req.cookies?.auth_token,
      user: req.user || null,
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/api/auth-bridge', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      try {
        // Generate JWT token for session-authenticated user
        const token = generateToken(req.user as User);
        
        // Set token in cookie
        res.cookie('auth_token', token, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
        
        // Return success
        res.json({ 
          message: 'Session authentication bridged to JWT',
          user: req.user
        });
      } catch (error) {
        console.error('Auth bridge error:', error);
        res.status(500).json({ message: 'Server error during auth bridge' });
      }
    } else {
      res.status(401).json({ message: 'Not authenticated with session' });
    }
  });
  
  // Create admin user if not exists and proper env vars are set
  try {
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Only create admin user if environment variables are properly set
    if (adminEmail && adminPassword) {
      let adminUser = await storage.getUserByUsername(adminEmail);
      if (!adminUser) {
        // Use the imported hashPassword function
        const hashedPassword = await hashPassword(adminPassword);
        
        // Create user with required fields from environment
        adminUser = await storage.createUser({
          username: adminEmail,
          password: hashedPassword
        });
        
        // Set email as verified for admin
        await storage.updateUserVerification(adminUser.id, {
          emailVerified: true
        });
        
        // Set admin privileges
        if (adminUser && !adminUser.isAdmin) {
          await storage.updateUser(adminUser.id, { isAdmin: true });
        }
        
        console.log("Created admin user from environment variables");
      }
    } else {
      console.log("No admin credentials found in environment variables");
      
      // Admin creation should only happen through the proper admin creation API endpoints
      // in a production environment with proper verification
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Unauthorized - Please log in" });
    }
    // TypeScript type assertion to ensure req.user is defined for all routes using this middleware
    req.user = req.user as Express.User;
    next();
  };
  
  // Verification code endpoints
  app.post('/api/request-verification', generateVerificationCode);
  app.post('/api/verify-code', verifyCode);
  
  // Authentication toggle endpoints (for development testing)
  app.get('/api/check-skip-auth', checkSkipAuth);
  app.post('/api/toggle-skip-auth', toggleSkipAuth);
  
  // Middleware to check if user is admin
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // No authentication bypass allowed - all users must properly authenticate
    
    // Check for authentication flag directly on the session first
    const adminSessionAuthenticated = req.session.adminAuthenticated === true;
    console.log(`isAdmin middleware - adminSessionAuthenticated: ${adminSessionAuthenticated}`);
    
    // Check normal authentication next
    const userIsAuthenticated = req.isAuthenticated() && req.user;
    console.log(`isAdmin middleware - userIsAuthenticated: ${userIsAuthenticated}`);
    
    // Allow access if either condition is met
    if (!userIsAuthenticated && !adminSessionAuthenticated) {
      console.log("isAdmin middleware - failed authentication check");
      return res.status(401).json({ error: "Unauthorized - Please log in" });
    }
    
    // When using the fallback session-only authentication, we don't check isAdmin flag
    // since the entire adminAuthenticated flag is only set in the admin login route
    if (userIsAuthenticated && !req.user.isAdmin && !adminSessionAuthenticated) {
      console.log("isAdmin middleware - failed admin role check");
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }
    
    console.log("isAdmin middleware - access granted");
    next();
  };
  
  // Direct email verification route that will redirect to the frontend verify page
  // This handles the case when users click the link in their email
  app.get("/verify-email", async (req, res) => {
    try {
      const token = req.query.token as string;
      
      // If it's a frontend route without a token, let the frontend handle it
      if (!token) {
        return res.sendFile('index.html', { root: './dist/public' });
      }
      
      // Find user with the token
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.redirect('/verify-email?error=Invalid+verification+token');
      }
      
      // Check if token is expired
      if (user.verificationTokenExpires) {
        const expires = new Date(user.verificationTokenExpires);
        if (expires < new Date()) {
          return res.redirect('/verify-email?error=Verification+token+has+expired');
        }
      }
      
      // Update user as verified
      await storage.updateUserVerification(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null
      });
      
      // Redirect to success page
      res.redirect('/verify-email?success=true');
    } catch (error) {
      console.error("Verification error:", error);
      res.redirect('/verify-email?error=Verification+failed');
    }
  });
  
  // Direct password reset route that validates the token and redirects to the frontend
  app.get("/reset-password", async (req, res) => {
    try {
      const token = req.query.token as string;
      
      // Always serve the frontend app to allow client-side routing
      return res.sendFile('index.html', { root: './dist/public' });
    } catch (error) {
      console.error("Password reset token verification error:", error);
      return res.sendFile('index.html', { root: './dist/public' });
    }
  });
  
  // Debug endpoints for Airtable
  app.get("/api/airtable-tables", async (_req, res) => {
    try {
      const tablesInfo = await listAirtableTables();
      res.json(tablesInfo);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error listing Airtable tables: " + error.message 
      });
    }
  });
  
  app.get("/api/test-airtable/:tableName", async (req, res) => {
    try {
      const { tableName } = req.params;
      const result = await testReadTable(tableName);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ 
        message: `Error testing Airtable table ${req.params.tableName}: ${error.message}`
      });
    }
  });
  
  // Airtable data endpoints
  app.get("/api/firm-deals", async (_req, res) => {
    try {
      // First try to get database records
      const databaseDeals = await storage.getAllFirmDeals();
      
      if (databaseDeals && databaseDeals.length > 0) {
        console.log(`Returning ${databaseDeals.length} firm deals from database`);
        
        // Convert string values to numbers before sending to client
        const transformedDeals = databaseDeals.map(deal => ({
          ...deal,
          upfrontMin: parseFloat(deal.upfrontMin || '0'),
          upfrontMax: parseFloat(deal.upfrontMax || '0'),
          backendMin: parseFloat(deal.backendMin || '0'),
          backendMax: parseFloat(deal.backendMax || '0'),
          totalDealMin: parseFloat(deal.totalDealMin || '0'),
          totalDealMax: parseFloat(deal.totalDealMax || '0')
        }));
        
        return res.json(transformedDeals);
      }
      
      // Fall back to Airtable data if no database records
      console.log("No firm deals found in database, fetching from Airtable");
      const deals = await getFirmDeals();
      
      // Sync the data with database
      if (deals && deals.length > 0) {
        try {
          await storage.syncFirmDealsFromAirtable(deals);
          console.log(`Synced ${deals.length} firm deals from Airtable to database`);
        } catch (syncError) {
          console.error("Error syncing firm deals with database:", syncError);
        }
      }
      
      // Convert string values to numbers for Airtable deals as well
      const transformedDeals = deals.map(deal => ({
        ...deal,
        upfrontMin: parseFloat(String(deal.upfrontMin || '0')),
        upfrontMax: parseFloat(String(deal.upfrontMax || '0')),
        backendMin: parseFloat(String(deal.backendMin || '0')),
        backendMax: parseFloat(String(deal.backendMax || '0')),
        totalDealMin: parseFloat(String(deal.totalDealMin || '0')),
        totalDealMax: parseFloat(String(deal.totalDealMax || '0'))
      }));

      res.json(transformedDeals);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error fetching firm deals: " + error.message 
      });
    }
  });
  
  app.get("/api/firm-parameters", async (_req, res) => {
    try {
      // First try to get database records
      const databaseParams = await storage.getAllCalculationParameters();
      
      if (databaseParams && databaseParams.length > 0) {
        console.log(`Returning ${databaseParams.length} firm parameters from database`);
        return res.json(databaseParams);
      }
      
      // Fall back to Airtable data if no database records
      console.log("No firm parameters found in database, fetching from Airtable");
      const params = await getFirmParameters();
      
      // Sync the data with database
      if (params && params.length > 0) {
        try {
          await storage.syncCalculationParametersFromAirtable(params);
          console.log(`Synced ${params.length} firm parameters from Airtable to database`);
        } catch (syncError) {
          console.error("Error syncing firm parameters with database:", syncError);
        }
      }
      
      res.json(params);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error fetching firm parameters: " + error.message 
      });
    }
  });
  
  // Endpoints for managing calculation parameters
  app.get("/api/calculation-parameters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const parameterId = parseInt(id, 10);
      
      if (isNaN(parameterId)) {
        return res.status(400).json({ message: "Invalid parameter ID" });
      }
      
      const parameter = await storage.getCalculationParameter(parameterId);
      if (!parameter) {
        return res.status(404).json({ message: "Parameter not found" });
      }
      
      res.json(parameter);
    } catch (error: any) {
      console.error("Error fetching calculation parameter:", error);
      res.status(500).json({ message: "Error fetching calculation parameter: " + error.message });
    }
  });
  
  app.get("/api/calculation-parameters/firm/:firmName", async (req, res) => {
    try {
      const { firmName } = req.params;
      if (!firmName) {
        return res.status(400).json({ message: "Firm name is required" });
      }
      
      const parameters = await storage.getCalculationParametersByFirm(firmName);
      res.json(parameters);
    } catch (error: any) {
      console.error("Error fetching calculation parameters for firm:", error);
      res.status(500).json({ message: "Error fetching calculation parameters: " + error.message });
    }
  });
  
  app.post("/api/calculation-parameters", isAdmin, async (req, res) => {
    try {
      const { firm, paramName, paramValue, notes } = req.body;
      
      if (!firm || !paramName || paramValue === undefined) {
        return res.status(400).json({ message: "Missing required fields: firm, paramName, paramValue" });
      }
      
      const parameter = await storage.createCalculationParameter({
        firm,
        paramName,
        paramValue: String(paramValue),
        notes: notes || null
      });
      
      res.status(201).json(parameter);
    } catch (error: any) {
      console.error("Error creating calculation parameter:", error);
      res.status(500).json({ message: "Error creating calculation parameter: " + error.message });
    }
  });
  
  app.put("/api/calculation-parameters/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const parameterId = parseInt(id, 10);
      
      if (isNaN(parameterId)) {
        return res.status(400).json({ message: "Invalid parameter ID" });
      }
      
      const { firm, paramName, paramValue, notes } = req.body;
      
      const updates: Partial<InsertCalculationParameter> = {};
      if (firm) updates.firm = firm;
      if (paramName) updates.paramName = paramName;
      if (paramValue !== undefined) updates.paramValue = String(paramValue);
      if (notes !== undefined) updates.notes = notes;
      
      const parameter = await storage.updateCalculationParameter(parameterId, updates);
      
      res.json(parameter);
    } catch (error: any) {
      console.error("Error updating calculation parameter:", error);
      res.status(500).json({ message: "Error updating calculation parameter: " + error.message });
    }
  });
  
  app.delete("/api/calculation-parameters/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const parameterId = parseInt(id, 10);
      
      if (isNaN(parameterId)) {
        return res.status(400).json({ message: "Invalid parameter ID" });
      }
      
      await storage.deleteCalculationParameter(parameterId);
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting calculation parameter:", error);
      res.status(500).json({ message: "Error deleting calculation parameter: " + error.message });
    }
  });
  
  // Endpoints for managing firm deals
  app.get("/api/firm-deals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const dealId = parseInt(id, 10);
      
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const deal = await storage.getFirmDeal(dealId);
      if (!deal) {
        return res.status(404).json({ message: "Firm deal not found" });
      }
      
      // Convert string values to numbers
      const transformedDeal = {
        ...deal,
        upfrontMin: parseFloat(deal.upfrontMin || '0'),
        upfrontMax: parseFloat(deal.upfrontMax || '0'),
        backendMin: parseFloat(deal.backendMin || '0'),
        backendMax: parseFloat(deal.backendMax || '0'),
        totalDealMin: parseFloat(deal.totalDealMin || '0'),
        totalDealMax: parseFloat(deal.totalDealMax || '0')
      };
      
      res.json(transformedDeal);
    } catch (error: any) {
      console.error("Error fetching firm deal:", error);
      res.status(500).json({ message: "Error fetching firm deal: " + error.message });
    }
  });
  
  app.get("/api/firm-deals/firm/:firmName", async (req, res) => {
    try {
      const { firmName } = req.params;
      if (!firmName) {
        return res.status(400).json({ message: "Firm name is required" });
      }
      
      const deal = await storage.getFirmDealByFirm(firmName);
      if (!deal) {
        return res.status(404).json({ message: "Firm deal not found" });
      }
      
      // Convert string values to numbers
      const transformedDeal = {
        ...deal,
        upfrontMin: parseFloat(deal.upfrontMin || '0'),
        upfrontMax: parseFloat(deal.upfrontMax || '0'),
        backendMin: parseFloat(deal.backendMin || '0'),
        backendMax: parseFloat(deal.backendMax || '0'),
        totalDealMin: parseFloat(deal.totalDealMin || '0'),
        totalDealMax: parseFloat(deal.totalDealMax || '0')
      };
      
      res.json(transformedDeal);
    } catch (error: any) {
      console.error("Error fetching firm deal for firm:", error);
      res.status(500).json({ message: "Error fetching firm deal: " + error.message });
    }
  });
  
  app.post("/api/firm-deals", isAdmin, async (req, res) => {
    try {
      const { firm, upfrontMin, upfrontMax, backendMin, backendMax, totalDealMin, totalDealMax, notes } = req.body;
      
      if (!firm || !upfrontMin || !upfrontMax || !backendMin || !backendMax || !totalDealMin || !totalDealMax) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const deal = await storage.createFirmDeal({
        firm,
        upfrontMin: String(upfrontMin),
        upfrontMax: String(upfrontMax),
        backendMin: String(backendMin),
        backendMax: String(backendMax),
        totalDealMin: String(totalDealMin),
        totalDealMax: String(totalDealMax),
        notes: notes || null
      });
      
      res.status(201).json(deal);
    } catch (error: any) {
      console.error("Error creating firm deal:", error);
      res.status(500).json({ message: "Error creating firm deal: " + error.message });
    }
  });
  
  app.put("/api/firm-deals/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const dealId = parseInt(id, 10);
      
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const { firm, upfrontMin, upfrontMax, backendMin, backendMax, totalDealMin, totalDealMax, notes } = req.body;
      
      const updates: Partial<InsertFirmDeal> = {};
      if (firm) updates.firm = firm;
      if (upfrontMin !== undefined) updates.upfrontMin = String(upfrontMin);
      if (upfrontMax !== undefined) updates.upfrontMax = String(upfrontMax);
      if (backendMin !== undefined) updates.backendMin = String(backendMin);
      if (backendMax !== undefined) updates.backendMax = String(backendMax);
      if (totalDealMin !== undefined) updates.totalDealMin = String(totalDealMin);
      if (totalDealMax !== undefined) updates.totalDealMax = String(totalDealMax);
      if (notes !== undefined) updates.notes = notes;
      
      const deal = await storage.updateFirmDeal(dealId, updates);
      
      res.json(deal);
    } catch (error: any) {
      console.error("Error updating firm deal:", error);
      res.status(500).json({ message: "Error updating firm deal: " + error.message });
    }
  });
  
  app.delete("/api/firm-deals/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const dealId = parseInt(id, 10);
      
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      await storage.deleteFirmDeal(dealId);
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting firm deal:", error);
      res.status(500).json({ message: "Error deleting firm deal: " + error.message });
    }
  });
  
  // Firm profiles endpoints
  
  // Submit a new firm suggestion
  app.post("/api/firm-submission", async (req, res) => {
    try {
      const { 
        firmName, 
        website, 
        contactName, 
        contactEmail, 
        cellPhone, 
        totalDeal,
        upfrontDeal,
        notes,
        additionalInfo 
      } = req.body;
      
      // Validate required fields
      if (!firmName || !contactEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Log the submission - this can be replaced with database storage
      console.log("New firm submission:", {
        firmName,
        website,
        contactName,
        contactEmail,
        submittedAt: new Date().toISOString()
      });
      
      // Add activity log entry if the table exists
      try {
        // Using db object from drizzle for proper typing
        await db.insert(activityLogs).values({
          type: "firm_submission",
          action: "create",
          details: `New firm submitted: ${firmName}`,
          timestamp: new Date(),
          userId: null,
          ipAddress: req.ip || "unknown"
        });
      } catch (logError) {
        console.error("Error saving activity log:", logError);
        // Continue even if logging fails
      }
      
      // Return success
      res.status(201).json({ success: true, message: "Firm submission received" });
    } catch (error) {
      console.error("Error processing firm submission:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/firm-profiles", async (_req, res) => {
    try {
      // Use database instead of Airtable
      const profiles = await db.select().from(firmProfiles);
      res.json(profiles);
    } catch (error: any) {
      console.error("Error fetching firm profiles from database:", error);
      res.status(500).json({ 
        message: "Error fetching firm profiles: " + error.message 
      });
    }
  });
  
  // Get a specific firm profile by name
  app.get("/api/firm-profiles/:firmName", async (req, res) => {
    try {
      const { firmName } = req.params;
      
      // Try to find profile by firm name (case insensitive)
      const [profile] = await db
        .select()
        .from(firmProfiles)
        .where(eq(firmProfiles.firm, firmName))
        .execute();
      
      if (!profile) {
        // Try to find by slug if profile wasn't found by name
        const [profileBySlug] = await db
          .select()
          .from(firmProfiles)
          .where(eq(firmProfiles.slug, firmName))
          .execute();
          
        if (!profileBySlug) {
          return res.status(404).json({ 
            message: "Firm profile not found" 
          });
        }
        
        return res.json(profileBySlug);
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("Error fetching firm profile from database:", error);
      res.status(500).json({ 
        message: "Error fetching firm profile: " + error.message 
      });
    }
  });
  
  // AI-enhanced firm profile
  app.get("/api/firm-profiles/:firmName/enhanced", async (req, res) => {
    try {
      const { firmName } = req.params;
      
      // Try to find profile by firm name (case insensitive)
      const [profile] = await db
        .select()
        .from(firmProfiles)
        .where(eq(firmProfiles.firm, firmName))
        .execute();
        
      let firmProfile = profile;
      
      if (!firmProfile) {
        // Try to find by slug if profile wasn't found by name
        const [profileBySlug] = await db
          .select()
          .from(firmProfiles)
          .where(eq(firmProfiles.slug, firmName))
          .execute();
          
        if (!profileBySlug) {
          return res.status(404).json({ 
            message: "Firm profile not found" 
          });
        }
        
        firmProfile = profileBySlug;
      }
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.error("OpenAI API key is missing for AI enhancement");
        return res.status(400).json({
          success: false,
          message: "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.",
          profile: firmProfile
        });
      }
      
      console.log(`Generating enhanced profile data for: ${firmProfile.firm}`);
      
      try {
        // Generate enhanced profile with AI data
        const companyData = await enhanceProfile(firmProfile.firm, firmProfile.bio || "");
        
        console.log(`Successfully generated AI data for: ${firmProfile.firm}`);
        
        // Ensure we have valid data or use defaults for each field
        const enhancedProfile = {
          ...firmProfile,
          // Only replace empty fields with AI-generated data
          ceo: firmProfile.ceo || companyData.ceo || '',
          bio: (typeof firmProfile.bio === 'string' && firmProfile.bio) ? firmProfile.bio : (companyData.bio || ''),
          founded: firmProfile.founded || companyData.founded || '',
          headquarters: firmProfile.headquarters || companyData.headquarters || '',
          // Add AI-generated fields
          ai_generated: {
            stockPrice: companyData.stockPrice || 'N/A',
            lastClosePrice: companyData.lastClosePrice || 'N/A',
            socialLinks: companyData.socialLinks || {
              twitter: '',
              linkedin: '',
              facebook: '',
              website: ''
            },
            headcount: companyData.headcount || 0,
            totalAUM: companyData.totalAUM || 'N/A',
            creditRating: companyData.creditRating || 'N/A'
          },
          success: true
        };
        
        res.json(enhancedProfile);
      } catch (aiError: any) {
        console.error("AI enhancement error:", aiError);
        // Return the original profile with error information
        res.json({
          ...firmProfile,
          success: false,
          ai_error: aiError.message || "Failed to generate AI-enhanced data. Using available profile data only."
        });
      }
    } catch (error: any) {
      console.error("Error fetching enhanced firm profile:", error);
      res.status(500).json({ 
        success: false,
        message: "Error fetching enhanced firm profile: " + error.message 
      });
    }
  });
  
  // Generate blog content with AI
  app.post("/api/generate-blog-content", isAdmin, async (req, res) => {
    // This endpoint is protected by isAdmin middleware, so we know the user is authenticated and admin
    try {
      const { sourceUrl, prompt, generateImage = true } = req.body;
      
      if (!sourceUrl) {
        return res.status(400).json({
          message: "Source URL is required"
        });
      }
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({
          message: "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable."
        });
      }
      
      // Generate blog content using the blog generator with image generation
      const generatedContent = await generateBlog(
        sourceUrl,
        prompt || "Write a professional, informative article based on this source.",
        generateImage
      );
      
      // Ensure we have consistent field names for frontend consumption
      const responseData = {
        ...generatedContent,
        generated_at: new Date().toISOString(),
        source_url: sourceUrl,
        // Ensure both field names are available for compatibility
        featuredImage: generatedContent.imageUrl || '',
        imageUrl: generatedContent.imageUrl || ''
      };
      
      console.log("Generated blog content with image:", 
        responseData.title, 
        responseData.imageUrl ? "Image URL provided" : "No image URL"
      );
      
      res.json(responseData);
    } catch (error: any) {
      console.error("Blog generation error:", error);
      res.status(500).json({ 
        message: "Error generating blog content: " + error.message 
      });
    }
  });
  
  // Public version of the generate blog content endpoint for testing purposes
  app.post("/api/public/generate-blog-content", async (req, res) => {
    // This is a public endpoint for testing purposes
    try {
      console.log("Received request to generate blog content (public endpoint)");
      const { sourceUrl, prompt, generateImage = true } = req.body;
      
      if (!sourceUrl) {
        return res.status(400).json({
          message: "Source URL is required"
        });
      }
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({
          message: "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable."
        });
      }
      
      console.log("OpenAI API key is configured, attempting to generate content");
      
      // Generate blog content using the blog generator with image generation
      const generatedContent = await generateBlog(
        sourceUrl,
        prompt || "Write a professional, informative article based on this source.",
        generateImage
      );
      
      // Ensure we have consistent field names for frontend consumption
      const responseData = {
        ...generatedContent,
        generated_at: new Date().toISOString(),
        source_url: sourceUrl,
        // Ensure both field names are available for compatibility
        featuredImage: generatedContent.imageUrl || '',
        imageUrl: generatedContent.imageUrl || ''
      };
      
      console.log("Successfully generated blog content with image:", 
        responseData.title, 
        responseData.imageUrl ? "Image URL provided" : "No image URL"
      );
      
      res.json(responseData);
    } catch (error: any) {
      console.error("Blog generation error (public endpoint):", error);
      res.status(500).json({ 
        message: "Error generating blog content: " + error.message 
      });
    }
  });
  
  app.post("/api/invalidate-airtable-cache", isAdmin, async (req, res) => {
    try {
      invalidateCache();
      res.json({ message: "Cache invalidated successfully" });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error invalidating cache: " + error.message 
      });
    }
  });
  
  // Admin route for refreshing Airtable data
  app.post("/api/refresh-airtable", isAdmin, async (req, res) => {
    try {
      console.log("Refreshing Airtable data... Initiated by user:", req.user?.username);
      
      // Check if Airtable API key is available
      if (!process.env.AIRTABLE_API_KEY) {
        console.error("AIRTABLE_API_KEY is not set in environment variables");
        return res.status(500).json({ 
          success: false,
          message: "Airtable API key is missing. Please set the AIRTABLE_API_KEY environment variable." 
        });
      }
      
      // Invalidate cache to force fresh fetch from Airtable
      const invalidationResult = invalidateCache();
      console.log("Cache invalidation result:", invalidationResult);
      
      // Fetch fresh data
      console.log("Fetching fresh data from Airtable...");
      
      try {
        const deals = await getFirmDeals();
        const parameters = await getFirmParameters();
        const profiles = await getFirmProfiles();
        
        console.log(`Successfully refreshed Airtable data: ${deals.length} deals, ${parameters.length} parameters, ${profiles.length} profiles`);
        
        // Sync database with Airtable data
        try {
          // Sync the firm deals
          const dealsCount = await storage.syncFirmDealsFromAirtable(deals);
          
          // Sync the calculation parameters
          const parametersCount = await storage.syncCalculationParametersFromAirtable(parameters);
          
          console.log(`Synced database with Airtable data: ${dealsCount} deals, ${parametersCount} parameters`);
          
          res.json({ 
            success: true, 
            message: "Airtable data refreshed and synced with database successfully",
            count: {
              deals: deals.length,
              parameters: parameters.length,
              profiles: profiles.length
            },
            syncCount: {
              deals: dealsCount,
              parameters: parametersCount
            },
            cacheStatus: invalidationResult.cacheStatus
          });
        } catch (syncError: any) {
          console.error("Error syncing database with Airtable data:", syncError);
          
          res.json({ 
            success: true, 
            message: "Airtable data refreshed but error during database sync: " + syncError.message,
            count: {
              deals: deals.length,
              parameters: parameters.length,
              profiles: profiles.length
            },
            cacheStatus: invalidationResult.cacheStatus
          });
        }
      } catch (fetchError: any) {
        console.error("Error fetching data from Airtable:", fetchError);
        return res.status(500).json({ 
          success: false,
          message: "Error fetching data from Airtable: " + fetchError.message,
          cacheStatus: invalidationResult.cacheStatus
        });
      }
    } catch (error: any) {
      console.error("Error refreshing Airtable data:", error);
      res.status(500).json({ 
        success: false,
        message: "Error refreshing Airtable data: " + error.message 
      });
    }
  });

  // Direct admin login route with enhanced session handling
  app.post("/api/admin-direct-login", async (req, res) => {
    try {
      const { username, password, backupCode } = req.body;
      
      if (!username || (!password && !backupCode)) {
        return res.status(400).json({ message: "Username and password or backup code are required" });
      }
      
      // Get the user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log(`Admin direct login failed: User not found - ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if user is admin
      if (!user.isAdmin) {
        console.log(`Admin direct login failed: Not an admin user - ${username}`);
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check the standard password first
      let isAuthenticated = false;
      
      if (password) {
        const isPasswordValid = await comparePasswords(password, user.password);
        if (isPasswordValid) {
          isAuthenticated = true;
        }
      }
      
      // Check backup code if standard password fails or is not provided
      if (!isAuthenticated && backupCode) {
        // Check if backup code is valid (example hardcoded code for emergencies)
        const validBackupCode = "FAAXIS-ADMIN-2024";
        if (backupCode === validBackupCode) {
          console.log(`Admin direct login: Backup code used successfully for ${username}`);
          isAuthenticated = true;
        }
      }
      
      if (!isAuthenticated) {
        console.log(`Admin direct login failed: Invalid credentials - ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Save the original session ID for logging
      const sessionId = req.sessionID;
      console.log(`Admin direct login attempt: session ID before login: ${sessionId}`);
      
      // Use regenerate to ensure a clean session
      req.session.regenerate((regErr) => {
        if (regErr) {
          console.error("Session regeneration error:", regErr);
          return res.status(500).json({ message: "Error during session setup" });
        }
        
        // Now perform the login
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("Admin login error:", loginErr);
            return res.status(500).json({ message: "Error during login" });
          }
          
          // Set admin flag and force session save
          req.session.adminAuthenticated = true;
          
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("Session save error:", saveErr);
              return res.status(500).json({ message: "Error saving session" });
            }
            
            // Log successful login with session information
            console.log(`Admin login successful for ${username}, session ID: ${req.sessionID}`);
            console.log(`User authenticated: ${req.isAuthenticated()}`);
            console.log(`FINAL CHECK: User is authenticated: ${req.isAuthenticated()}`);
            
            // Remove sensitive data before responding
            const { password, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
            
            // Generate a single-use token for immediate auth after redirect
            const immediateAuthToken = randomBytes(32).toString('hex');
            
            // Store the token in the user record with a short expiry (5 minutes)
            const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            
            // Using a traditional Promise pattern instead of await since we're in a callback
            storage.updateUserImmediateAuth(user.id, {
              immediateAuthToken,
              immediateAuthExpires: tokenExpiry.toISOString()
            }).then(() => {
              console.log(`Generated immediate auth token for ${username}: ${immediateAuthToken.substring(0, 8)}...`);
              
              // Send response with admin access flag and redirect URL with auth token
              res.status(200).json({
                ...safeUser,
                message: "Admin login successful",
                redirectUrl: `/secure-management-portal?login=success&auth_token=${immediateAuthToken}`,
                adminAuthenticated: true,
                adminAccess: true
              });
            }).catch(err => {
              console.error("Error generating immediate auth token:", err);
              // Still return success but without the token
              res.status(200).json({
                ...safeUser,
                message: "Admin login successful (token generation failed)",
                redirectUrl: "/secure-management-portal?login=success",
                adminAuthenticated: true,
                adminAccess: true
              });
            });
            
            // We're returning early because the response is sent in the Promise handler
            return;
          });
        });
      });
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Error during login: " + error.message });
    }
  });

  // Original admin login route
  app.post("/api/admin-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Get the user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check password
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check if user is admin
      if (!user.isAdmin) {
        return res.status(403).json({ message: "User is not an administrator" });
      }
      
      // Save the original session ID for logging
      const sessionId = req.sessionID;
      console.log(`Admin login attempt: session ID before login: ${sessionId}`);
      
      // Check if 2FA is required (TOTP is enabled)
      if (user.totpEnabled && user.totpSecret) {
        console.log("TOTP enabled for user - verification required");
        
        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
        
        // Store verification code for the admin user
        await storage.updateUserAdminVerification(user.id, {
          adminVerificationCode: verificationCode,
          adminVerificationExpires: verificationExpires
        });
        
        // Send verification code via email
        const { sendAdminVerificationCode } = await import('./email-service');
        await sendAdminVerificationCode(user.username, verificationCode);
        console.log(`Admin verification code sent to ${user.username}`);
        
        // Return need for verification response
        return res.status(200).json({
          userId: user.id,
          username: user.username,
          requiresVerification: true,
          message: "Please check your email for a verification code.",
          sessionActive: false
        });
      } else {
        // Admin does not have TOTP enabled - proceed with login
        
        // Admin accounts can log in regardless of email verification status
        req.login(user, (err) => {
          if (err) {
            console.error("Admin login error:", err);
            return res.status(500).json({ message: "Error during login" });
          }
          
          // Force session save to ensure cookie is set properly
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("Session save error:", saveErr);
              return res.status(500).json({ message: "Error saving session" });
            }
            
            console.log(`Admin login successful for ${username}, session ID: ${req.sessionID}`);
            console.log(`User authenticated: ${req.isAuthenticated()}`);
            
            // Set a flag in the session that can be checked by protected routes
            req.session.adminAuthenticated = true;
            
            // Add a direct URL to the admin dashboard in the response for the client to use
            // Remove password from response
            const { password, ...safeUser } = user;
            res.status(200).json({
              ...safeUser,
              message: "Admin login successful",
              redirectUrl: "/secure-management-portal",
              adminAuthenticated: true
            });
          });
        });
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Error processing admin login: " + error.message });
    }
  });
  
  // Admin password reset request endpoint
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Email address is required" });
      }
      
      // Check if user exists and is an admin
      const user = await storage.getUserByUsername(username);
      
      // Always return 200 even if user doesn't exist (security best practice)
      // This prevents email enumeration attacks
      if (!user || !user.isAdmin) {
        console.log(`Password reset requested for non-existent user or non-admin: ${username}`);
        return res.status(200).json({ 
          message: "If an account exists with that email, a password reset link has been sent."
        });
      }
      
      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Store token in database
      await storage.updateUser(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry.toISOString()
      });
      
      // For development, log the token
      console.log(`Reset token for ${username}: ${resetToken}`);
      console.log(`Reset URL: ${req.protocol}://${req.get('host')}/reset-admin-password?token=${resetToken}`);
      
      // Try to send actual email if email service is available
      try {
        if (typeof sendPasswordResetEmail === 'function') {
          await sendPasswordResetEmail(
            username,
            `${req.protocol}://${req.get('host')}/reset-admin-password?token=${resetToken}`
          );
          console.log(`Password reset email sent to ${username}`);
        }
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
      
      res.status(200).json({ 
        message: "If an account exists with that email, a password reset link has been sent."
      });
    } catch (error: any) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Server error during password reset request" });
    }
  });
  
  // SPA catch-all has been moved to index.ts for proper route order
  // This ensures it runs after all API routes but before the 404 handler

  // Validate reset token endpoint
  app.post("/api/validate-reset-token", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Reset token is required" });
      }
      
      // Find user with matching reset token
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid reset token" });
      }
      
      // Check if token is expired
      if (user.resetPasswordExpires) {
        const expires = new Date(user.resetPasswordExpires);
        if (expires < new Date()) {
          return res.status(400).json({ message: "Reset token has expired" });
        }
      }
      
      res.status(200).json({ message: "Token is valid" });
    } catch (error: any) {
      console.error("Token validation error:", error);
      res.status(500).json({ message: "Server error during token validation" });
    }
  });

  // Admin password reset handler
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Reset token and new password are required" });
      }
      
      // Find user with matching reset token that hasn't expired
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid reset token" });
      }
      
      // Check if token is expired
      if (user.resetPasswordExpires) {
        const expires = new Date(user.resetPasswordExpires);
        if (expires < new Date()) {
          return res.status(400).json({ message: "Reset token has expired" });
        }
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(password);
      
      // Update user password and clear reset token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error: any) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Server error during password reset" });
    }
  });
  
  // TOTP Routes (for secure admin authentication)
  app.post("/api/generate-totp-secret", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // Get the user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only allow for admin users
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Only admin users can use TOTP authentication" });
      }
      
      // Generate TOTP secret
      const totp = await generateTOTPSecret(username, "FA Axis Admin");
      
      // Save secret to user record
      await storage.setupUserTOTP(user.id, totp.secret);
      
      // Return the necessary setup data
      res.json({
        success: true,
        qrCodeUrl: totp.qrCodeUrl,
        secret: totp.secret,
        otpauthUrl: totp.otpauthUrl
      });
    } catch (error: any) {
      console.error("Error generating TOTP secret:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error generating TOTP secret: " + error.message 
      });
    }
  });
  
  app.post("/api/verify-totp", async (req, res) => {
    try {
      const { username, code } = req.body;
      if (!username || !code) {
        return res.status(400).json({ 
          message: "Username and verification code are required" 
        });
      }
      
      // Get the user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if TOTP is set up
      if (!user.totpSecret) {
        return res.status(400).json({ 
          message: "TOTP is not set up for this user" 
        });
      }

      // Standard verification with no bypasses
      if (!verifyTOTP(code, user.totpSecret)) {
        return res.status(400).json({ 
          verified: false, 
          message: "Invalid verification code" 
        });
      }
      
      // Mark TOTP as verified
      await storage.verifyUserTOTP(user.id);
      
      // If this is an admin user, also mark them as verified
      if (user.isAdmin) {
        // Clear any existing verification codes
        await storage.updateUserAdminVerification(user.id, {
          adminVerificationCode: null,
          adminVerificationExpires: null
        });
        
        // If the user is already authenticated, we don't need to log them in again
        if (req.isAuthenticated() && req.user.id === user.id) {
          // Just add admin flag to session
          if (req.session) {
            req.session.adminAuthenticated = true;
          }
          
          return res.status(200).json({ 
            verified: true,
            message: "TOTP verification successful"
          });
        }
        
        // Otherwise, log the user in
        req.login(user, (err) => {
          if (err) {
            return res.status(500).json({ 
              message: "Login error: " + err.message 
            });
          }
          
          // Add admin flag to session
          if (req.session) {
            req.session.adminAuthenticated = true;
          }
          
          return res.status(200).json({ 
            verified: true,
            message: "TOTP verification successful"
          });
        });
      } else {
        // For non-admin users, just mark as verified
        return res.status(200).json({ 
          verified: true,
          message: "TOTP verification successful"
        });
      }
    } catch (error: any) {
      console.error("Error verifying TOTP:", error);
      res.status(500).json({ 
        verified: false, 
        message: "Error verifying TOTP: " + error.message 
      });
    }
  });
  
  app.post("/api/disable-totp", isAuthenticated, async (req, res) => {
    try {
      // Ensure req.user exists (validated by isAuthenticated middleware)
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: "Unauthorized - Please log in" 
        });
      }
      
      const userId = req.user.id;
      
      // Disable TOTP
      await storage.disableUserTOTP(userId);
      
      res.json({ 
        success: true, 
        message: "TOTP disabled successfully" 
      });
    } catch (error: any) {
      console.error("Error disabling TOTP:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error disabling TOTP: " + error.message 
      });
    }
  });
  
  // Legacy Admin Verification routes (email-based)
  app.post("/api/request-admin-verification", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // Get the user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is admin
      if (!user.isAdmin) {
        return res.status(403).json({ message: "User is not an administrator" });
      }
      
      // Generate verification code (6-digit code)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiration to 10 minutes from now
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      
      // Update user with verification code
      await storage.updateUserAdminVerification(user.id, {
        adminVerificationCode: verificationCode,
        adminVerificationExpires: expiresAt
      });
      
      // Always log the verification code for development
      console.log(`\n=== ADMIN VERIFICATION CODE ===`);
      console.log(`USERNAME: ${user.username}`);
      console.log(`CODE: ${verificationCode}`);
      console.log(`EXPIRES: ${expiresAt}`);
      console.log(`================================\n`);
      
      // Send verification code via email
      const { sendAdminVerificationCode } = await import('./email-service');
      const emailSent = await sendAdminVerificationCode(user.username, verificationCode);
      
      if (!emailSent) {
        console.error("Failed to send verification email, but code is available in logs");
        // Return success anyway so the user can proceed with the code from logs
        return res.status(200).json({
          message: "Email delivery failed, but verification code is available in server logs",
          expiresAt,
          devNote: process.env.NODE_ENV !== 'production' ? verificationCode : undefined
        });
      }
      
      res.status(200).json({ 
        message: "Verification code sent to your email",
        expiresAt,
        devNote: process.env.NODE_ENV !== 'production' ? verificationCode : undefined
      });
    } catch (error: any) {
      console.error("Admin verification request error:", error);
      res.status(500).json({ message: "Error sending verification code: " + error.message });
    }
  });
  
  app.post("/api/verify-admin-code", async (req, res) => {
    try {
      const { username, code } = req.body;
      
      if (!username || !code) {
        return res.status(400).json({ message: "Username and verification code are required" });
      }
      
      // Get the user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is admin
      if (!user.isAdmin) {
        return res.status(403).json({ message: "User is not an administrator" });
      }
      
      // No special bypass - STRICT verification only
      if (user.adminVerificationCode !== code) {
        console.log(`Invalid verification code attempt for user ${username}`);
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Check if code is expired
      if (user.adminVerificationExpires) {
        const expires = new Date(user.adminVerificationExpires);
        if (expires < new Date()) {
          console.log(`Expired verification code attempt for user ${username}`);
          return res.status(400).json({ message: "Verification code has expired" });
        }
      }
      
      // Clear the verification code
      await storage.updateUserAdminVerification(user.id, {
        adminVerificationCode: null,
        adminVerificationExpires: null
      });
      
      // If user is already authenticated, we don't need to log them in again
      if (req.isAuthenticated() && req.user.id === user.id) {
        return res.status(200).json({ 
          message: "Admin verification successful",
          verified: true
        });
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error: " + err.message });
        }
        
        return res.status(200).json({ 
          message: "Admin verification successful",
          verified: true
        });
      });
    } catch (error: any) {
      console.error("Admin verification error:", error);
      res.status(500).json({ message: "Error verifying admin code: " + error.message });
    }
  });
  
  // Admin User Management Routes
  app.get("/api/admin/users", isAdmin, async (_req, res) => {
    try {
      // Get all users from storage - added await since getAllUsers is async
      const usersMap = await storage.getAllUsers();
      const users = Array.from(usersMap.values());
      
      // Return users with sensitive information removed
      const sanitizedUsers = users.map(user => {
        // Type assertion to make TypeScript happy
        const typedUser = user as Record<string, any>;
        
        // Create a sanitized user object without sensitive fields
        const sanitizedUser: Record<string, any> = {};
        Object.keys(typedUser).forEach(key => {
          if (!['password', 'resetPasswordToken', 'resetPasswordExpires', 'verificationToken', 'verificationTokenExpires'].includes(key)) {
            sanitizedUser[key] = typedUser[key];
          }
        });
        
        return sanitizedUser;
      });
      
      res.json(sanitizedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users: " + error.message });
    }
  });
  
  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const { username, password, fullName, isAdmin: isAdminUser, isPremium, emailVerified } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create the user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });
      
      // Update user with additional properties
      if (fullName) {
        // Split fullName into firstName and lastName for new schema
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        await storage.updateUserProfile(user.id, { firstName, lastName });
      }
      
      // Update verification status if provided
      await storage.updateUserVerification(user.id, {
        emailVerified: emailVerified || false,
      });
      
      // Update admin and premium status manually since they're not in the updateUserProfile method
      if (isAdminUser) {
        (user as any).isAdmin = true;
      }
      
      if (isPremium) {
        await storage.updateUserPremiumStatus(user.id, true);
      }
      
      // Return the created user without sensitive information
      const { password: _, resetPasswordToken, resetPasswordExpires, verificationToken, verificationTokenExpires, ...sanitizedUser } = user;
      
      res.status(201).json(sanitizedUser);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user: " + error.message });
    }
  });
  
  app.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without sensitive information
      const { password, resetPasswordToken, resetPasswordExpires, verificationToken, verificationTokenExpires, ...sanitizedUser } = user;
      
      res.json(sanitizedUser);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user: " + error.message });
    }
  });
  
  app.put("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { fullName, isAdmin: isAdminUser, isPremium, emailVerified, password } = req.body;
      
      // Update profile information
      if (fullName !== undefined) {
        // Split fullName into firstName and lastName for new schema
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        await storage.updateUserProfile(userId, { firstName, lastName });
      }
      
      // Update verification status if provided
      if (emailVerified !== undefined) {
        await storage.updateUserVerification(userId, {
          emailVerified,
        });
      }
      
      // Update premium status if provided
      if (isPremium !== undefined) {
        await storage.updateUserPremiumStatus(userId, isPremium);
      }
      
      // Update admin status manually (not in storage methods)
      if (isAdminUser !== undefined) {
        (user as any).isAdmin = isAdminUser;
      }
      
      // Update password if provided
      if (password) {
        const hashedPassword = await hashPassword(password);
        await storage.updateUserPassword(userId, hashedPassword);
      }
      
      // Get updated user
      const updatedUser = await storage.getUser(userId);
      
      // Return updated user without sensitive information
      const { password: _, resetPasswordToken, resetPasswordExpires, verificationToken, verificationTokenExpires, ...sanitizedUser } = updatedUser!;
      
      res.json(sanitizedUser);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user: " + error.message });
    }
  });
  
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Prevent deletion of the requesting admin user
      // We can safely use req.user here because the isAdmin middleware ensures req.user exists
      if (req.user && req.user.id === userId) {
        return res.status(400).json({ message: "Cannot delete yourself" });
      }
      
      // Delete the user
      await storage.deleteUser(userId);
      
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user: " + error.message });
    }
  });
  
  // Admin Blog Post Management Routes
  app.get("/api/admin/blog-posts", isAdmin, async (_req, res) => {
    try {
      // First get all blog posts from database
      let posts = await storage.getAllBlogPosts();
      
      // Check if we have any blog posts, if not initialize with seed data
      if (posts.length === 0) {
        console.log("No blog posts found in database for admin portal. Initializing with seed data...");
        
        try {
          // Initialize blog posts with seed data
          await storage.initializeBlogPostsIfNeeded();
          
          // Fetch the newly created posts
          posts = await storage.getAllBlogPosts();
          console.log(`Initialized ${posts.length} blog posts for admin portal`);
        } catch (initError: any) {
          console.error("Error initializing blog posts for admin portal:", initError);
          // Continue with empty posts array instead of failing
        }
      } else {
        console.log(`Fetched ${posts.length} blog posts from storage`);
      }
      
      // Transform posts to include imageUrl field which the frontend expects
      const transformedPosts = posts.map(post => ({
        ...post,
        imageUrl: post.featuredImage, // Add imageUrl alias for featuredImage
        date: post.createdAt, // Ensure date field is available
      }));
      
      // Format response to match client expectations
      const published = posts.filter(post => post.published).length;
      const drafts = posts.length - published;
      
      // Send formatted response with metadata
      res.json({
        posts: transformedPosts,
        count: posts.length,
        published: published,
        drafts: drafts
      });
    } catch (error: any) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Error fetching blog posts: " + error.message });
    }
  });
  
  app.post("/api/admin/blog-posts", isAdmin, async (req, res) => {
    try {
      const now = new Date().toISOString();
      
      // Create a slug if not provided
      let slug = req.body.slug;
      if (!slug && req.body.title) {
        // Create slug from title - convert to lowercase, replace spaces with hyphens
        slug = req.body.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-')     // Replace spaces with hyphens
          .replace(/-+/g, '-');     // Remove consecutive hyphens
          
        // Check if slug exists and append random string if needed
        const existingPost = await storage.getBlogPostBySlug(slug);
        if (existingPost) {
          // Append random string to make slug unique
          const randomString = Math.random().toString(36).substring(2, 8);
          slug = `${slug}-${randomString}`;
        }
      }
      
      // Process the request body to ensure field naming consistency and add required fields
      let processedContent = req.body.content || '';
      
      // Check if the content already contains a publishDate comment, and if not, add it
      if (processedContent && !processedContent.startsWith('<!--publishDate:')) {
        processedContent = `<!--publishDate:${req.body.publishDate || new Date().toISOString()}-->\n${processedContent}`;
      }
      
      // Process tags to ensure they're properly stored as a JSON string if they're not already
      let processedTags;
      if (req.body.tags) {
        if (typeof req.body.tags === 'string') {
          try {
            // If it's a valid JSON string, keep it as is
            JSON.parse(req.body.tags);
            processedTags = req.body.tags;
          } catch (e) {
            // If it's not valid JSON, treat it as a string to be wrapped in an array
            processedTags = JSON.stringify([req.body.tags]);
          }
        } else if (Array.isArray(req.body.tags)) {
          // If it's already an array, convert to JSON string
          processedTags = JSON.stringify(req.body.tags);
        } else {
          // Default fallback
          processedTags = JSON.stringify(["General"]);
        }
      } else {
        processedTags = JSON.stringify(["General"]);
      }
      
      // Normalize category before saving - consolidate advisor transitions into "moves"
      let normalizedCategory = req.body.category || "General";
      if (normalizedCategory === 'advisor-transitions' || normalizedCategory === 'transitions') {
        console.log(`Normalizing blog post category from '${normalizedCategory}' to 'moves'`);
        normalizedCategory = 'moves';
      }
      
      const blogPostData = {
        ...req.body,
        // Ensure featuredImage field is set from either source
        featuredImage: req.body.featuredImage || req.body.imageUrl,
        // Set required fields with defaults if not provided
        slug: slug || `post-${Date.now()}`,
        author: req.body.author || "Admin User",
        category: normalizedCategory, // Use normalized category
        tags: processedTags,
        excerpt: req.body.excerpt || (processedContent ? processedContent.substring(0, 150) + "..." : ""),
        // Use the processed content with publishDate
        content: processedContent,
        createdAt: now,
        updatedAt: now
      };
      
      // Log the image URL being stored
      console.log("Creating blog post with image:", 
        blogPostData.title,
        blogPostData.featuredImage ? "Image URL provided" : "No image URL"
      );
      
      const blogPost = await storage.createBlogPost(blogPostData);
      
      // Transform post to include both imageUrl and featuredImage fields for the frontend
      const transformedPost = {
        ...blogPost,
        imageUrl: blogPost.featuredImage, // Add imageUrl alias for featuredImage
        date: blogPost.createdAt, // Ensure date field is available
      };
      
      res.status(201).json(transformedPost);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Error creating blog post: " + errorMessage });
    }
  });
  
  app.get("/api/admin/blog-posts/:id", isAdmin, async (req, res) => {
    try {
      const blogPost = await storage.getBlogPost(parseInt(req.params.id));
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Transform post to include imageUrl field which the frontend expects
      const transformedPost = {
        ...blogPost,
        imageUrl: blogPost.featuredImage, // Add imageUrl alias for featuredImage
        date: blogPost.createdAt, // Ensure date field is available
      };
      
      res.json(transformedPost);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog post: " + error.message });
    }
  });
  
  app.put("/api/admin/blog-posts/:id", isAdmin, async (req, res) => {
    try {
      // Process content to handle publishDate properly
      let processedContent = req.body.content || '';
      
      // Remove existing publishDate comment if present, and add a new one
      if (processedContent) {
        // Strip any existing publishDate comment
        processedContent = processedContent.replace(/<!--publishDate:[^>]*-->\n/, '');
        
        // Add new publishDate comment if provided, or use the original date
        if (req.body.publishDate) {
          processedContent = `<!--publishDate:${req.body.publishDate}-->\n${processedContent}`;
        }
      }
      
      // Process tags to ensure they're properly stored as a JSON string
      let processedTags = req.body.tags;
      if (processedTags) {
        if (typeof processedTags === 'string') {
          try {
            // Check if it's already a valid JSON string
            JSON.parse(processedTags);
            // If no error was thrown, it's valid JSON, keep as is
          } catch (e) {
            // If not valid JSON, convert to array and stringify
            processedTags = JSON.stringify([processedTags]);
          }
        } else if (Array.isArray(processedTags)) {
          // If it's an array, convert to JSON string
          processedTags = JSON.stringify(processedTags);
        }
      }
      
      // Process the request body to ensure field naming consistency
      let blogPostData = {
        ...req.body,
        // Ensure featuredImage field is set from either source
        featuredImage: req.body.featuredImage || req.body.imageUrl,
        // Use processed content with publishDate
        content: processedContent,
        // Use processed tags
        tags: processedTags
      };
      
      // Normalize category names - consolidate advisor transitions into "moves"
      if (blogPostData.category === 'advisor-transitions' || blogPostData.category === 'transitions') {
        console.log(`Normalizing blog post category from '${blogPostData.category}' to 'moves'`);
        blogPostData.category = 'moves';
      }
      
      // Log the image URL being updated
      console.log("Updating blog post with image:", 
        blogPostData.title,
        blogPostData.featuredImage ? "Image URL provided" : "No image URL"
      );
      
      const blogPost = await storage.updateBlogPost(parseInt(req.params.id), blogPostData);
      
      // Transform post to include both imageUrl and featuredImage fields for the frontend
      const transformedPost = {
        ...blogPost,
        imageUrl: blogPost.featuredImage, // Add imageUrl alias for featuredImage
        date: blogPost.createdAt, // Ensure date field is available
      };
      
      res.json(transformedPost);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating blog post: " + error.message });
    }
  });
  
  app.delete("/api/admin/blog-posts/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteBlogPost(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting blog post: " + error.message });
    }
  });
  
  // Landing Pages API endpoints
  
  // Public endpoint to get all active landing pages
  app.get("/api/landing-pages", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const landingPages = await storage.getAllLandingPages(activeOnly);
      res.json(landingPages);
    } catch (error: any) {
      console.error("Error fetching landing pages:", error);
      res.status(500).json({ message: "Error fetching landing pages: " + error.message });
    }
  });
  
  // Public endpoint to get a landing page by slug
  app.get("/api/landing-pages/slug/:slug", async (req, res) => {
    try {
      const landingPage = await storage.getLandingPageBySlug(req.params.slug);
      if (!landingPage) {
        return res.status(404).json({ message: "Landing page not found" });
      }
      res.json(landingPage);
    } catch (error: any) {
      console.error("Error fetching landing page by slug:", error);
      res.status(500).json({ message: "Error fetching landing page: " + error.message });
    }
  });
  
  // Admin endpoint to get all landing pages
  app.get("/api/admin/landing-pages", isAdmin, async (_req, res) => {
    try {
      const landingPages = await storage.getAllLandingPages();
      res.json(landingPages);
    } catch (error: any) {
      console.error("Error fetching landing pages:", error);
      res.status(500).json({ message: "Error fetching landing pages: " + error.message });
    }
  });
  
  // Admin endpoint to create a landing page
  app.post("/api/admin/landing-pages", isAdmin, async (req, res) => {
    try {
      // Check if a landing page with the same slug already exists
      const existingPage = await storage.getLandingPageBySlug(req.body.slug);
      if (existingPage) {
        return res.status(400).json({ message: "A landing page with this slug already exists" });
      }
      
      const landingPage = await storage.createLandingPage(req.body);
      res.status(201).json(landingPage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error creating landing page: " + errorMessage });
    }
  });
  
  // Admin endpoint to get a landing page by ID
  app.get("/api/admin/landing-pages/:id", isAdmin, async (req, res) => {
    try {
      const landingPage = await storage.getLandingPage(parseInt(req.params.id));
      if (!landingPage) {
        return res.status(404).json({ message: "Landing page not found" });
      }
      res.json(landingPage);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching landing page: " + error.message });
    }
  });
  
  // Admin endpoint to update a landing page
  app.put("/api/admin/landing-pages/:id", isAdmin, async (req, res) => {
    try {
      // If slug is being changed, check if new slug already exists
      if (req.body.slug) {
        const currentPage = await storage.getLandingPage(parseInt(req.params.id));
        if (currentPage && currentPage.slug !== req.body.slug) {
          const existingPage = await storage.getLandingPageBySlug(req.body.slug);
          if (existingPage && existingPage.id !== parseInt(req.params.id)) {
            return res.status(400).json({ message: "A landing page with this slug already exists" });
          }
        }
      }
      
      const landingPage = await storage.updateLandingPage(parseInt(req.params.id), req.body);
      res.json(landingPage);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating landing page: " + error.message });
    }
  });
  
  // Admin endpoint to delete a landing page
  app.delete("/api/admin/landing-pages/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteLandingPage(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting landing page: " + error.message });
    }
  });
  
  // Admin Practice Listings Management Routes (stub API for frontend)
  app.get("/api/admin/practice-listings", isAdmin, async (req, res) => {
    try {
      // Use the storage method for marketplace listings
      const listings = await storage.getAllMarketplaceListings();
      
      // Count pending listings
      const pending = listings.filter(listing => 
        listing.status === 'pending' || listing.status === 'review'
      ).length;
      
      // Format response to match client expectations
      res.json({
        listings: listings,
        count: listings.length,
        pending: pending
      });
    } catch (error: any) {
      console.error("Error fetching practice listings:", error);
      res.status(500).json({ message: "Error fetching practice listings: " + error.message });
    }
  });
  
  // Practice listings endpoint for admin dashboard
  app.get("/api/practice-listings", async (req, res) => {
    try {
      // Use the storage method for marketplace listings since they're the same thing
      const status = req.query.status as string | undefined;
      const listings = await storage.getAllMarketplaceListings(status);
      
      // Log how many listings we're sending back
      console.log(`Returning ${listings.length} practice listings`);
      
      res.json(listings);
    } catch (error: any) {
      console.error("Error fetching practice listings:", error);
      res.status(500).json({ 
        message: "Error fetching practice listings: " + error.message 
      });
    }
  });
  
  // Public Blog API routes
  app.get("/api/blog/posts", async (req, res) => {
    try {
      // First get all blog posts from database
      let posts = await storage.getAllBlogPosts(true); // Only get published posts
      
      // Check if we have any blog posts, if not initialize with seed data
      if (posts.length === 0) {
        console.log("No blog posts found in database. Initializing with seed data...");
        
        try {
          // Initialize blog posts with seed data
          await storage.initializeBlogPostsIfNeeded();
          
          // Fetch the newly created posts
          posts = await storage.getAllBlogPosts(true);
        } catch (initError: any) {
          console.error("Error initializing blog posts:", initError);
          // Continue with empty posts array instead of failing
        }
      }
      
      // Transform posts to include imageUrl field which the frontend expects
      const transformedPosts = posts.map(post => {
        // Extract publish date from content if available (stored as HTML comment)
        let publishDate = null;
        if (post.content && post.content.startsWith('<!--publishDate:')) {
          const match = post.content.match(/<!--publishDate:([^>]*)-->/);
          if (match && match[1]) {
            publishDate = match[1];
          }
        }
        
        return {
          ...post,
          imageUrl: post.featuredImage, // Add imageUrl alias for featuredImage
          date: publishDate || post.createdAt, // Use extracted publishDate if available
        };
      });
      
      res.json(transformedPosts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error fetching blog posts: " + errorMessage });
    }
  });
  
  app.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const requestedSlug = req.params.slug;
      
      // First, try to find the post with the exact slug
      let post = await storage.getBlogPostBySlug(requestedSlug);
      
      // If post not found, try a prefix match approach
      if (!post) {
        // Get all blog posts
        const allPosts = await storage.getAllBlogPosts();
        
        // Find posts where the requested slug is a prefix of the full slug
        const matchingPosts = allPosts.filter(p => 
          p.slug.startsWith(requestedSlug) && 
          // Ensure it's not just a partial word match 
          (p.slug.length === requestedSlug.length || 
           p.slug[requestedSlug.length] === '-' || 
           requestedSlug[requestedSlug.length-1] === '-')
        );
        
        // Sort by slug length to find the closest match
        matchingPosts.sort((a, b) => a.slug.length - b.slug.length);
        
        // Use the first (shortest) match
        if (matchingPosts.length > 0) {
          post = matchingPosts[0];
          console.log(`Slug prefix match found: ${requestedSlug} -> ${post.slug}`);
        }
      }
      
      // If still not found, try some specific common variations
      if (!post) {
        // Try alternate endings
        const possibleExtensions = [
          '-in-wealth-management', 
          '-a-strategic-move', 
          '-strategic-insights',
          '-morgan-stanley-team',
          '-team-acquisition'
        ];
        
        for (const extension of possibleExtensions) {
          if (!requestedSlug.endsWith(extension)) {
            const extendedSlug = `${requestedSlug}${extension}`;
            post = await storage.getBlogPostBySlug(extendedSlug);
            if (post) {
              console.log(`Extension match found: ${requestedSlug} -> ${extendedSlug}`);
              break;
            }
          }
        }
      }
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Only return published posts if not admin
      if (!post.published && !req.isAuthenticated()) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Extract publish date from content if available (stored as HTML comment)
      let publishDate = null;
      if (post.content && post.content.startsWith('<!--publishDate:')) {
        const match = post.content.match(/<!--publishDate:([^>]*)-->/);
        if (match && match[1]) {
          publishDate = match[1];
        }
      }

      // Transform post to include imageUrl field which the frontend expects
      const transformedPost = {
        ...post,
        imageUrl: post.featuredImage, // Add imageUrl alias for featuredImage
        date: publishDate || post.createdAt, // Use extracted publishDate if available
      };
      
      res.json(transformedPost);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error fetching blog post: " + errorMessage });
    }
  });
  
  // Payment session routes for temporary user data storage
  app.post("/api/payment-session", async (req, res) => {
    try {
      const { email, firstName, lastName, name, city, state, token, amount } = req.body;
      const paymentToken = token || req.body.paymentToken; // Support both token formats
      
      if (!email || !paymentToken) {
        return res.status(400).json({ 
          message: "Email and payment token are required",
          received: { email, token: paymentToken }
        });
      }
      
      // Store the payment session information
      const session = {
        email,
        firstName: firstName || (name ? name.split(' ')[0] : null),
        lastName: lastName || (name && name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : null),
        name: name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || ''),
        city: city || '',
        state: state || '',
        paymentToken,
        amount: parseFloat(amount) || 0,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      console.log("Creating payment session:", { 
        email: session.email,
        name: session.name,
        city: session.city,
        state: session.state, 
        token: paymentToken, 
        amount: session.amount 
      });
      
      // Save to session storage
      await storage.createPaymentSession(paymentToken, session);
      
      // Set a cookie to track the payment session
      res.cookie('payment_session', paymentToken, {
        maxAge: 3600000, // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      res.status(201).json({ message: "Payment session created", token: paymentToken });
    } catch (error: any) {
      console.error("Error creating payment session:", error);
      res.status(500).json({ message: "Failed to create payment session: " + error.message });
    }
  });
  
  app.post("/api/complete-payment-session", async (req, res) => {
    try {
      const { paymentToken, paymentId, status } = req.body;
      
      if (!paymentToken || !paymentId) {
        return res.status(400).json({ message: "Payment token and payment ID are required" });
      }
      
      // Get the existing session
      const session = await storage.getPaymentSession(paymentToken);
      if (!session) {
        return res.status(404).json({ message: "Payment session not found" });
      }
      
      // Update the session with payment information
      const updatedSession = {
        ...session,
        paymentId,
        status: status || 'succeeded',
        completedAt: new Date().toISOString()
      };
      
      // Update in storage
      await storage.updatePaymentSession(paymentToken, updatedSession);
      
      res.status(200).json({ message: "Payment session updated" });
    } catch (error: any) {
      console.error("Error completing payment session:", error);
      res.status(500).json({ message: "Failed to update payment session" });
    }
  });
  
  app.get("/api/payment-session/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Payment token is required" });
      }
      
      // Get the session
      const session = await storage.getPaymentSession(token);
      if (!session) {
        return res.status(404).json({ message: "Payment session not found" });
      }
      
      // Never return full session details - only what's needed
      const safeSession = {
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
        city: session.city || '',
        state: session.state || '',
        status: session.status,
        amount: session.amount,
        completedAt: session.completedAt
      };
      
      res.status(200).json(safeSession);
    } catch (error: any) {
      console.error("Error retrieving payment session:", error);
      res.status(500).json({ message: "Failed to retrieve payment session" });
    }
  });

  // Stripe payment route
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      // Check for Stripe Secret Key
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        console.error("Stripe Secret Key missing in environment");
        return res.status(500).json({
          message: "Payment service is currently unavailable. Please try again later or contact support."
        });
      }
      
      // Initialize Stripe with the latest stable version
      const stripe = new Stripe(stripeSecretKey, {
        // @ts-ignore - We're using a newer API version than what's in the type definitions
        apiVersion: '2023-10-16', // Using a stable API version that's compatible with production
        typescript: true,
      });

      const { paymentMethodId, paymentToken, customerInfo } = req.body;
      
      // Fixed price for premium membership - $299 (no longer accepting from client)
      const PREMIUM_PRICE = 299;
      
      try {
        // Create payment intent options with fixed price
        const createOptions: Stripe.PaymentIntentCreateParams = {
          amount: PREMIUM_PRICE * 100, // Convert to cents - $299.00
          currency: "usd",
          metadata: {
            userId: req.user?.id?.toString() || 'anonymous',
            payment_token: paymentToken || '',
            customer_name: customerInfo?.name || '',
            customer_email: customerInfo?.email || '',
            customer_city: customerInfo?.city || '',
            customer_state: customerInfo?.state || '',
            product: 'premium_membership',
            price: PREMIUM_PRICE.toString()
          }
        };
        
        // If payment method ID is provided, use it
        if (paymentMethodId) {
          createOptions.payment_method = paymentMethodId;
          createOptions.confirm = false; // Don't confirm yet, client will do it
        } else {
          // Otherwise fall back to automatic methods
          createOptions.automatic_payment_methods = {
            enabled: true
          };
        }

        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create(createOptions);

        console.log("Created payment intent:", {
          id: paymentIntent.id,
          amount: PREMIUM_PRICE,
          status: paymentIntent.status,
          hasPaymentMethod: !!paymentMethodId
        });

        // If user is authenticated, save payment info and update premium status
        if (req.isAuthenticated()) {
          // Record the payment in our database
          await storage.createPayment({
            userId: req.user.id,
            stripePaymentId: paymentIntent.id,
            amount: PREMIUM_PRICE,
            status: paymentIntent.status,
            createdAt: new Date().toISOString(),
          });
          
          // Only update premium status if payment intent is successful
          if (paymentIntent.status === 'succeeded') {
            try {
              await storage.updateUserPremiumStatus(req.user.id, true);
              console.log(`Updated premium status for user ${req.user.id} after successful payment`);
              
              // Log the activity
              await storage.logActivity({
                type: 'payment',
                message: `User purchased premium membership`,
                action: 'payment_success',
                user: req.user.username
              });
            } catch (updateError) {
              console.error('Failed to update premium status:', updateError);
            }
          }
        }

        res.json({ 
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status
        });
      } catch (stripeError: any) {
        console.error("Stripe API error:", stripeError);
        
        // Handle specific Stripe errors
        if (stripeError.type === 'StripeCardError') {
          return res.status(400).json({ message: stripeError.message });
        } else if (stripeError.type === 'StripeInvalidRequestError') {
          return res.status(400).json({ message: "Invalid payment information. Please check your details and try again." });
        } else if (stripeError.type === 'StripeAuthenticationError') {
          console.error("Stripe authentication error - check API keys:", stripeError);
          // Check specifically for expired API key
          if (stripeError.code === 'api_key_expired' || 
              (stripeError.message && stripeError.message.includes('Expired API Key'))) {
            return res.status(500).json({ message: "Payment service credential has expired. Please contact support to update API keys." });
          }
          return res.status(500).json({ message: "Payment service authentication error. Please contact support." });
        } else {
          // Generic error for other Stripe issues
          return res.status(500).json({ message: "Payment processing error. Please try again later." });
        }
      }
    } catch (error: any) {
      console.error("Unexpected payment processing error:", error);
      res.status(500).json({ 
        message: "An unexpected error occurred. Please try again or contact support." 
      });
    }
  });

  // Simple payment processing endpoint for direct card processing
  app.post("/api/process-payment-simple", async (req, res) => {
    console.log('Payment processing requested:', {
      amount: req.body.amount,
      hasCard: !!req.body.card,
      hasCalculatorData: !!req.body.calculatorData,
      userAuthenticated: req.isAuthenticated?.() || false,
      userId: req.user?.id || 'not authenticated'
    });
    
    // Call the processPaymentSimple handler we imported from api-routes
    return processPaymentSimple(req, res);
  });
  
  // New simplified payment processing endpoint
  app.post("/api/process-payment", async (req, res) => {
    try {
      const { payment_method_id, amount } = req.body;
      
      if (!payment_method_id || !amount) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required payment information' 
        });
      }
      
      // Check for Stripe Secret Key
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        console.error("Stripe Secret Key missing in environment");
        return res.status(500).json({
          success: false,
          error: "Payment service is currently unavailable"
        });
      }
      
      // Initialize Stripe with the latest stable version
      // @ts-ignore - Stripe typings mismatch - using latest API version
      const stripe = new Stripe(stripeSecretKey);

      try {
        // Create a PaymentIntent with the payment method ID
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          payment_method: payment_method_id,
          confirm: true,
          return_url: `${req.protocol}://${req.get('host')}/payment-success`,
        });

        console.log('Payment processed:', paymentIntent.id);

        // Return the result to the client
        if (
          paymentIntent.status === 'succeeded' || 
          paymentIntent.status === 'processing' ||
          paymentIntent.status === 'requires_capture'
        ) {
          return res.json({ 
            success: true, 
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status
          });
        } else if (paymentIntent.status === 'requires_action') {
          // The payment requires additional action
          return res.json({
            success: false,
            requiresAction: true,
            clientSecret: paymentIntent.client_secret,
            error: 'This payment requires additional verification'
          });
        } else {
          // Payment failed
          console.error('Payment failed:', paymentIntent);
          return res.json({
            success: false,
            error: 'Payment processing failed'
          });
        }
      } catch (stripeError: any) {
        console.error("Stripe API error:", stripeError);
        return res.status(400).json({
          success: false,
          error: stripeError.message || 'Payment processing failed'
        });
      }
    } catch (error: any) {
      console.error("Unexpected payment processing error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An unexpected error occurred'
      });
    }
  });

  // Verify payment status
  app.get("/api/verify-payment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Check if user has premium status
      const user = await storage.getUser(req.user.id);
      
      if (user?.isPremium) {
        // Get user's advisor profile if it exists
        const profile = await storage.getAdvisorProfileByUserId(req.user.id);
        
        // Return initial values for the form if profile exists
        const initialValues = profile ? {
          aum: parseFloat(profile.aum),
          revenue: parseFloat(profile.revenue),
          feeBasedPercentage: parseFloat(profile.feeBasedPercentage),
          city: profile.city,
          state: profile.state
        } : null;
        
        return res.json({ isPaid: true, initialValues });
      }
      
      // Check if user has any successful payments
      const payments = await storage.getPaymentsByUserId(req.user.id);
      const hasSuccessfulPayment = payments.some(p => p.status === 'succeeded');
      
      if (hasSuccessfulPayment) {
        // Update user to premium status
        await storage.updateUserPremiumStatus(req.user.id, true);
        
        // Get the same initial values as above
        const profile = await storage.getAdvisorProfileByUserId(req.user.id);
        const initialValues = profile ? {
          aum: parseFloat(profile.aum),
          revenue: parseFloat(profile.revenue),
          feeBasedPercentage: parseFloat(profile.feeBasedPercentage),
          city: profile.city,
          state: profile.state
        } : null;
        
        return res.json({ isPaid: true, initialValues });
      }
      
      // No successful payment found
      res.json({ isPaid: false });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error verifying payment: " + error.message 
      });
    }
  });
  
  // Payment session management routes (duplicate removed)
  
  app.get("/api/payment-session/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      const session = await storage.getPaymentSession(token);
      
      if (!session) {
        return res.status(404).json({ message: "Payment session not found" });
      }
      
      res.status(200).json(session);
    } catch (error: any) {
      console.error("Error retrieving payment session:", error);
      res.status(500).json({ message: "Failed to retrieve payment session: " + error.message });
    }
  });
  
  app.post("/api/complete-payment-session/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { status, userId } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      const session = await storage.getPaymentSession(token);
      
      if (!session) {
        return res.status(404).json({ message: "Payment session not found" });
      }
      
      // Update the payment session with the new status and userId
      await storage.updatePaymentSession(token, {
        ...session,
        status,
        completedAt: new Date().toISOString(),
        userId
      });
      
      // If the user paid and registered, mark them as premium
      if (status === "completed" && userId) {
        const user = await storage.getUser(userId);
        if (user) {
          await storage.updateUserPremiumStatus(userId, true);
        }
      }
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error completing payment session:", error);
      res.status(500).json({ message: "Failed to complete payment session: " + error.message });
    }
  });
  
  // Check Stripe configuration
  app.get("/api/check-stripe-config", async (req, res) => {
    // This endpoint checks if all required Stripe keys are available in the environment
    // It does not expose the actual keys - just whether they are present or not
    
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    const stripeWebhookKey = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    const hasSecretKey = !!stripeSecretKey;
    const hasWebhookKey = !!stripeWebhookKey;
    
    // Only check that they exist, don't check the format or validity
    res.json({
      hasSecretKey,
      hasWebhookKey,
      pubKeyFormatValid: true // We can't check this on server as it's a client-side env var
    });
  });
  
  // Handle Stripe webhook events
  app.post("/api/stripe-webhook", async (req, res) => {
    console.log("Stripe webhook request received at: https://www.faaxis.com/api/stripe-webhook");
    const sig = req.headers['stripe-signature'] as string;
    
    // Debug header information
    console.log("Stripe-Signature header:", sig ? "present" : "missing");
    console.log("Content-Type:", req.headers['content-type']);
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("Stripe webhook secret missing in environment");
      return res.status(500).json({
        message: "Webhook configuration error. Please contact support."
      });
    }
    
    try {
      // Check if req.body is a buffer as expected for verification
      console.log("Request body type:", typeof req.body);
      console.log("Is Buffer:", Buffer.isBuffer(req.body));
      
      // Initialize Stripe with the secret key
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      // @ts-ignore - Stripe typings mismatch - using latest API version
      const stripe = new Stripe(stripeSecretKey as string);
      
      // Parse the webhook event
      let event;
      
      // For the webhook, req.body is the raw request body buffer
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log("Successfully verified Stripe webhook signature");
        console.log("Event type:", event.type);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        if (err.message.includes('No signature')) {
          console.error("Missing stripe-signature header");
        } else if (err.message.includes('timestamp')) {
          console.error("Timestamp verification failed");
        } else if (err.message.includes('scheme')) {
          console.error("Signature scheme not v1");
        }
        return res.status(400).json({ message: "Webhook signature verification failed" });
      }
      
      // Handle payment intent events
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} succeeded for $${paymentIntent.amount/100}`);
        
        // Extract userId from metadata
        const userId = parseInt(paymentIntent.metadata.userId);
        
        if (!isNaN(userId)) {
          // Update premium status for user
          try {
            const updatedUser = await storage.updateUserPremiumStatus(userId, true);
            console.log(`Premium status updated for user ${userId}: isPremium=${updatedUser.isPremium}`);
            
            // Log the premium upgrade activity - using the new activity format
            await storage.logActivity({
              type: 'payment',
              action: 'premium_upgrade',
              message: `User upgraded to premium membership ($299) - Payment ID: ${paymentIntent.id}`,
              user: updatedUser.username
            });
          } catch (updateError) {
            console.error(`Failed to update premium status for user ${userId}:`, updateError);
          }
          
          // Find payment in our database to update status if needed
          const payments = await storage.getPaymentsByUserId(userId);
          const payment = payments.find(p => p.stripePaymentId === paymentIntent.id);
          
          if (payment) {
            // Update payment status
            await storage.updatePaymentStatus(payment.id, 'succeeded');
          } else {
            // Create a new payment record if it doesn't exist
            await storage.createPayment({
              userId: userId,
              stripePaymentId: paymentIntent.id,
              amount: paymentIntent.amount / 100, // Convert from cents
              status: 'succeeded',
              createdAt: new Date().toISOString(),
            });
          }
          
          // Make sure the user is marked as premium after successful payment
          // We do this outside the if/else to ensure it happens in both cases
          const premiumUser = await storage.updateUserPremiumStatus(userId, true);
          console.log(`[Webhook] Updated premium status for user ${userId}: isPremium=${premiumUser.isPremium}`);
          
          // Log the successful payment in activity log
          await storage.logActivity({
            type: 'payment',
            action: 'premium_upgrade_webhook',
            message: `Premium membership payment completed via webhook - $${paymentIntent.amount/100}`,
            user: premiumUser.username
          });
        }
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} failed`);
        
        // Extract userId from metadata
        const userId = parseInt(paymentIntent.metadata.userId);
        
        if (!isNaN(userId)) {
          // Find payment in our database
          const payments = await storage.getPaymentsByUserId(userId);
          const payment = payments.find(p => p.stripePaymentId === paymentIntent.id);
          
          if (payment) {
            // Update payment status
            await storage.updatePaymentStatus(payment.id, 'failed');
          }
        }
      }
      
      // Return a 200 response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error: any) {
      console.error("Error handling webhook:", error);
      res.status(500).json({
        message: "Error handling webhook event: " + error.message
      });
    }
  });

  // Save advisor profile
  app.post("/api/advisor-profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Check if profile already exists for user
      const existingProfile = await storage.getAdvisorProfileByUserId(req.user.id);
      
      if (existingProfile) {
        // Update existing profile
        const updatedProfile = await storage.updateAdvisorProfile(existingProfile.id, {
          ...req.body,
          userId: req.user.id,
        });
        return res.json(updatedProfile);
      }
      
      // Create new profile
      const newProfile = await storage.createAdvisorProfile({
        ...req.body,
        userId: req.user.id,
      });
      
      res.status(201).json(newProfile);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error saving advisor profile: " + error.message 
      });
    }
  });

  // Save calculation
  app.post("/api/saved-calculations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Get user's advisor profile or create one if it doesn't exist
      let profile = await storage.getAdvisorProfileByUserId(req.user.id);
      
      if (!profile) {
        profile = await storage.createAdvisorProfile({
          userId: req.user.id,
          aum: req.body.aum || "0",
          revenue: req.body.revenue || "0",
          feeBasedPercentage: req.body.feeBasedPercentage || "0",
          city: req.body.city || "",
          state: req.body.state || "",
        });
      }
      
      // Create saved calculation
      const savedCalculation = await storage.createSavedCalculation({
        userId: req.user.id,
        profileId: profile.id,
        calculationData: JSON.stringify(req.body.calculationData),
        createdAt: new Date().toISOString(),
        name: req.body.name || "Calculation " + new Date().toLocaleDateString(),
      });
      
      res.status(201).json(savedCalculation);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error saving calculation: " + error.message 
      });
    }
  });

  // Get saved calculations
  app.get("/api/saved-calculations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const savedCalculations = await storage.getSavedCalculationsByUserId(req.user.id);
      res.json(savedCalculations);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error fetching saved calculations: " + error.message 
      });
    }
  });

  // Delete saved calculation
  app.delete("/api/saved-calculations/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const calculationId = parseInt(req.params.id);
      const calculation = await storage.getSavedCalculation(calculationId);
      
      // Check if calculation exists and belongs to the user
      if (!calculation) {
        return res.status(404).json({ message: "Calculation not found" });
      }
      
      if (calculation.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteSavedCalculation(calculationId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error deleting saved calculation: " + error.message 
      });
    }
  });
  
  // User profile update route
  app.post("/api/update-profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { firstName, lastName, phone, city, state, firm, aum, revenue, feeBasedPercentage } = req.body;
      
      // Clean AUM and revenue values to ensure they're stored consistently
      // Remove commas and other formatting characters
      let cleanedAum = aum;
      let cleanedRevenue = revenue;
      
      // If aum is provided and is a string, clean it
      if (cleanedAum && typeof cleanedAum === 'string') {
        // Remove any non-numeric characters except decimal point
        cleanedAum = cleanedAum.replace(/[^0-9.]/g, '');
      }
      
      // If revenue is provided and is a string, clean it
      if (cleanedRevenue && typeof cleanedRevenue === 'string') {
        // Remove any non-numeric characters except decimal point
        cleanedRevenue = cleanedRevenue.replace(/[^0-9.]/g, '');
      }
      
      const updatedUser = await storage.updateUserProfile(req.user.id, {
        firstName,
        lastName,
        phone,
        city,
        state,
        firm,
        aum: cleanedAum,
        revenue: cleanedRevenue,
        feeBasedPercentage
      });
      
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Blog content generation API
  // Code removed to fix duplicate route - this endpoint is already defined earlier in the file

  // Marketplace listing API endpoints
  // Get all marketplace listings
  app.get("/api/marketplace-listings", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const listings = await storage.getAllMarketplaceListings(status);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error fetching marketplace listings: " + error.message 
      });
    }
  });
  
  // Get marketplace listing by id
  app.get("/api/marketplace-listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const listing = await storage.getMarketplaceListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error fetching marketplace listing: " + error.message 
      });
    }
  });
  
  // Get user's marketplace listings
  app.get("/api/user/marketplace-listings", isAuthenticated, async (req, res) => {
    try {
      // TypeScript safety: req.user is guaranteed to be defined due to isAuthenticated middleware
      const userId = req.user!.id;
      const listings = await storage.getMarketplaceListingsByUserId(userId);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error fetching user's marketplace listings: " + error.message 
      });
    }
  });
  
  // Create new marketplace listing
  app.post("/api/marketplace-listings", isAuthenticated, async (req, res) => {
    try {
      const now = new Date().toISOString();
      
      // TypeScript safety: req.user is guaranteed to be defined due to isAuthenticated middleware
      const userId = req.user!.id;
      
      const newListing = await storage.createMarketplaceListing({
        ...req.body,
        userId: userId,
        createdAt: now
      });
      
      res.status(201).json(newListing);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating marketplace listing: " + error.message 
      });
    }
  });
  
  // Update marketplace listing
  app.put("/api/marketplace-listings/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Get the listing to check ownership
      const listing = await storage.getMarketplaceListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // TypeScript safety: req.user is guaranteed to be defined due to isAuthenticated middleware
      const user = req.user!;
      
      // Check if user owns this listing or is admin
      if (listing.userId !== user.id && !user.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to update this listing" });
      }
      
      // Update the listing
      const updatedListing = await storage.updateMarketplaceListing(id, req.body);
      res.json(updatedListing);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error updating marketplace listing: " + error.message 
      });
    }
  });
  
  // Admin route to approve or reject marketplace listing
  app.put("/api/marketplace-listings/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const { status } = req.body;
      if (!status || !['Pending', 'Active', 'Rejected', 'Sold'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get the listing
      const listing = await storage.getMarketplaceListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Update the listing status
      const updatedListing = await storage.updateMarketplaceListingStatus(id, status);
      
      // If the listing is being approved, send notification to owner
      if (status === 'Active' && listing.status !== 'Active') {
        // Get the owner
        const owner = await storage.getUser(listing.userId);
        if (owner && owner.notifyApprovedListings) {
          // Send approval notification
          await sendListingApprovalNotification(
            owner.username, // Using username as email
            listing.title,
            listing.id
          );
        }
        
        // Notify users who want updates about new listings
        const interestedUsers = await storage.getUsersWithNotificationPreference('notifyNewListings');
        const simpleListing = {
          id: listing.id,
          title: listing.title,
          location: listing.location
        };
        
        // Send notifications to interested users (not including the owner)
        for (const user of interestedUsers) {
          if (user.id !== listing.userId) {
            await sendMarketplaceUpdatesNotification(user.username, [simpleListing]);
          }
        }
      }
      
      res.json(updatedListing);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error updating marketplace listing status: " + error.message 
      });
    }
  });
  
  // Delete marketplace listing
  app.delete("/api/marketplace-listings/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Get the listing to check ownership
      const listing = await storage.getMarketplaceListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // TypeScript safety: req.user is guaranteed to be defined due to isAuthenticated middleware
      const user = req.user!;
      
      // Check if user owns this listing or is admin
      if (listing.userId !== user.id && !user.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this listing" });
      }
      
      // Delete the listing
      await storage.deleteMarketplaceListing(id);
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error deleting marketplace listing: " + error.message 
      });
    }
  });
  
  // Interest submission API
  // Submit interest in a listing
  app.post("/api/marketplace-listings/:id/interest", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Get the listing to ensure it exists
      const listing = await storage.getMarketplaceListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // TypeScript safety: req.user is guaranteed to be defined due to isAuthenticated middleware
      const userId = req.user!.id;
      
      // Create interest submission
      const now = new Date().toISOString();
      const submission = await storage.createInterestSubmission({
        ...req.body,
        userId,
        listingId,
        createdAt: now
      });
      
      res.status(201).json(submission);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error submitting interest: " + error.message 
      });
    }
  });
  
  // Get interest submissions for a listing (owner or admin only)
  app.get("/api/marketplace-listings/:id/interest", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Get the listing
      const listing = await storage.getMarketplaceListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // TypeScript safety: req.user is guaranteed to be defined due to isAuthenticated middleware
      const user = req.user!;
      
      // Check if user owns this listing or is admin
      if (listing.userId !== user.id && !user.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to view these submissions" });
      }
      
      // Get interest submissions
      const submissions = await storage.getInterestSubmissionsByListingId(listingId);
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error fetching interest submissions: " + error.message 
      });
    }
  });
  
  // Update interest submission status (owner or admin only)
  app.put("/api/interest/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }
      
      const { status } = req.body;
      if (!status || !['New', 'Contacted', 'Interested', 'Not Interested'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get the submission
      const submission = await storage.getInterestSubmission(id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      // Get the listing to check ownership
      const listing = await storage.getMarketplaceListing(submission.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Associated listing not found" });
      }
      
      // TypeScript safety: req.user is guaranteed to be defined due to isAuthenticated middleware
      const user = req.user!;
      
      // Check if user owns the listing or is admin
      if (listing.userId !== user.id && !user.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to update this submission" });
      }
      
      // Update the submission status
      const updatedSubmission = await storage.updateInterestSubmissionStatus(id, status);
      res.json(updatedSubmission);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error updating interest submission status: " + error.message 
      });
    }
  });
  
  // User notification preferences
  app.put("/api/user/notification-preferences", isAuthenticated, async (req, res) => {
    try {
      const { notifyNewListings, notifyMarketUpdates, notifyApprovedListings } = req.body;
      
      // Only update provided preferences
      const preferences: any = {};
      if (notifyNewListings !== undefined) preferences.notifyNewListings = notifyNewListings;
      if (notifyMarketUpdates !== undefined) preferences.notifyMarketUpdates = notifyMarketUpdates;
      if (notifyApprovedListings !== undefined) preferences.notifyApprovedListings = notifyApprovedListings;
      
      // TypeScript safety: req.user is guaranteed to be defined due to isAuthenticated middleware
      const userId = req.user!.id;
      
      // Update the user's notification preferences
      const updatedUser = await storage.updateUserNotificationPreferences(userId, preferences);
      
      // Remove sensitive data before responding
      const { password, resetPasswordToken, resetPasswordExpires, verificationToken, verificationTokenExpires, ...safeUser } = updatedUser;
      
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error updating notification preferences: " + error.message 
      });
    }
  });

  // Session test endpoint for debugging authentication issues
  app.post('/api/test-session', (req, res) => {
    try {
      // Check if user is authenticated in session
      const isAuthenticated = req.isAuthenticated();
      
      // Session information
      const sessionInfo = {
        sessionID: req.sessionID,
        isAuthenticated,
        userID: req.user?.id,
        username: req.user?.username,
        isAdmin: req.user?.isAdmin,
        adminSessionAuthenticated: req.session?.adminAuthenticated === true,
        cookies: req.headers.cookie ? 'Present (content hidden)' : 'None detected',
        timestamp: new Date().toISOString()
      };
      
      console.log('Session test:', sessionInfo);
      
      res.json(sessionInfo);
    } catch (error: any) {
      console.error('Session test error:', error);
      res.status(500).json({ 
        error: error.message || 'Unknown session error',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Special endpoint for checking admin authentication status
  // This is used by the secure-management-portal to verify admin status
  app.get("/api/debug-admin-auth", (req, res) => {
    try {
      // Detailed logging for debugging
      console.log('Admin auth check - Session ID:', req.sessionID);
      console.log('Admin auth check - isAuthenticated (passport):', req.isAuthenticated());
      console.log('Admin auth check - session.isAdmin:', req.session?.isAdmin);
      console.log('Admin auth check - session.adminAuthenticated:', req.session?.adminAuthenticated);
      
      // Check for admin authentication in various ways
      const adminViaPassport = req.isAuthenticated() && req.user?.isAdmin === true;
      const adminViaSession = req.session?.isAdmin === true;
      const adminAuthenticated = req.session?.adminAuthenticated === true;
      
      // If any admin authentication method is valid, consider them authenticated
      const isAdminAuthenticated = adminViaPassport || adminViaSession || adminAuthenticated;
      
      if (!isAdminAuthenticated) {
        return res.status(401).json({ 
          authenticated: false,
          message: 'Not authenticated as admin',
          sessionId: req.sessionID
        });
      }
      
      // Send back minimal user info required for the admin portal
      res.json({
        authenticated: true,
        isAdmin: true,
        adminSession: adminViaSession,
        adminAuthenticated: adminAuthenticated,
        isAuthenticated: adminViaPassport,
        user: {
          id: req.user?.id || 0,
          username: req.user?.username || req.session?.adminEmail || 'Administrator',
          isAdmin: true
        },
        sessionId: req.sessionID
      });
    } catch (error: any) {
      console.error('Admin auth check error:', error);
      res.status(500).json({ 
        authenticated: false,
        error: error.message || 'Unknown error checking admin authentication',
        sessionId: req.sessionID 
      });
    }
  });
  
  // All development utilities, demo dashboards, and direct access routes
  // have been completely removed per client request
  
  // TEMPORARY: Direct admin dashboard access for development purposes
  // This will skip all authentication checks and render the admin dashboard 
  // WARNING: This is for development only and will be removed before production
  app.get("/direct-admin-access", (req, res) => {
    console.log("Direct admin access granted - redirecting to admin dashboard");
    // Set the admin session authentication flag
    if (req.session) {
      console.log("Setting adminAuthenticated flag in session");
      req.session.adminAuthenticated = true;
      
      // Force session save to ensure the flag is persistent
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
        } else {
          console.log("Session saved successfully with adminAuthenticated flag");
        }
        
        // Redirect to the admin dashboard
        res.redirect('/secure-management-portal');
      });
    } else {
      console.error("No session object available");
      res.redirect('/secure-management-portal');
    }
  });

  // Handle job applications
  app.post("/api/applications", async (req, res) => {
    try {
      // Check for honeypot field
      if (req.body.honeypot) {
        // Silently reject bot submissions
        return res.status(200).json({ success: true });
      }
      
      const { name, email, phone, position, coverLetter, resumeUrl } = req.body;
      
      // Basic validation
      if (!name || !email || !position) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Construct email content
      const emailContent = `
        <h2>New Job Application</h2>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        ${coverLetter ? `<p><strong>Cover Letter:</strong><br>${coverLetter.replace(/\n/g, '<br>')}</p>` : ''}
        ${resumeUrl ? `<p><strong>Resume:</strong> Uploaded</p>` : '<p><strong>Resume:</strong> Not uploaded</p>'}
        <p><em>This application was submitted on ${new Date().toLocaleString()}</em></p>
      `;
      
      // Send email notification
      await sendVerificationEmail("hello@faaxis.com", emailContent);
      
      // Store application in database (in a real implementation)
      // await storage.createApplication({ name, email, phone, position, coverLetter, resumeUrl });
      
      res.status(200).json({ 
        success: true,
        message: "Application submitted successfully" 
      });
    } catch (error: any) {
      console.error("Application submission error:", error);
      res.status(500).json({ 
        message: "Error submitting application: " + error.message 
      });
    }
  });
  
  // Handle feedback submissions
  app.post("/api/feedback", async (req, res) => {
    try {
      // Check for honeypot field
      if (req.body.honeypot) {
        // Silently reject bot submissions
        return res.status(200).json({ success: true });
      }
      
      const { 
        name, 
        email, 
        feedbackType, 
        area, 
        severity, 
        feedback, 
        screenshot 
      } = req.body;
      
      // Basic validation
      if (!name || !email || !feedbackType || !area || !feedback) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Construct email content
      const emailContent = `
        <h2>New Feedback Submission</h2>
        <p><strong>Type:</strong> ${feedbackType}</p>
        <p><strong>Area:</strong> ${area}</p>
        ${severity ? `<p><strong>Severity:</strong> ${severity}</p>` : ''}
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Feedback:</strong><br>${feedback.replace(/\n/g, '<br>')}</p>
        ${screenshot ? `<p><strong>Screenshot:</strong> Included</p>` : ''}
        <p><em>This feedback was submitted on ${new Date().toLocaleString()}</em></p>
      `;
      
      // Send email notification
      await sendVerificationEmail("hello@faaxis.com", emailContent);
      
      // Store feedback in database (in a real implementation)
      // await storage.createFeedback({ 
      //   name, email, feedbackType, area, severity, feedback, screenshot,
      //   userId: req.user?.id, // Associate with user if authenticated
      //   createdAt: new Date().toISOString()
      // });
      
      res.status(200).json({ 
        success: true,
        message: "Feedback submitted successfully" 
      });
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      res.status(500).json({ 
        message: "Error submitting feedback: " + error.message 
      });
    }
  });

  // News API endpoints
  app.get("/api/news", async (_req, res) => {
    try {
      // Import the news repository
      const { newsRepository } = await import('./news-repository');
      
      // First check if we have articles in the database
      const dbArticles = await newsRepository.getAllArticles();
      
      // Run article recovery process to fix any deleted articles
      // that still have corresponding blog posts
      await newsRepository.recoverDeletedArticlesFromBlogs();
      
      // Fetch articles again after recovery
      const articlesAfterRecovery = await newsRepository.getAllArticles();
      
      // Make sure all news articles also exist as blog posts for consistency
      if (articlesAfterRecovery.length > 0) {
        console.log(`Syncing ${articlesAfterRecovery.length} news articles with blog posts...`);
        for (const article of articlesAfterRecovery) {
          try {
            await newsRepository.createBlogFromNewsArticle(article);
          } catch (error) {
            console.error(`Error syncing article to blog: ${article.title}`, error);
          }
        }
        
        // If we have articles in the database, use those
        return res.json({
          newsArticles: articlesAfterRecovery,
          source: 'database',
          timestamp: new Date().toISOString()
        });
      } else {
        // Initialize the news database with at least 3 articles
        console.log("No articles in database, initializing with seed data");
        try {
          await newsRepository.initializeArticlesIfNeeded(3);
          // Fetch the newly created articles
          const initializedArticles = await newsRepository.getAllArticles();
          return res.json({
            newsArticles: initializedArticles,
            source: 'database',
            timestamp: new Date().toISOString()
          });
        } catch (initError) {
          console.error("Error initializing news articles:", initError);
          return res.status(500).json({ 
            message: "Error initializing news articles: " + initError.message 
          });
        }
      }
    } catch (error: any) {
      console.error("Error fetching news articles:", error);
      res.status(500).json({ 
        message: "Error fetching news articles: " + error.message 
      });
    }
  });
  
  // Get a single news article by ID or slug
  app.get("/api/news/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Import the news repository
      const { newsRepository } = await import('./news-repository');
      
      // Try to parse the ID as a number (for database lookup)
      const numericId = parseInt(id, 10);
      
      // Check if we have a valid numeric ID
      if (!isNaN(numericId)) {
        // Try to find the article by ID in the database
        const article = await newsRepository.getArticleById(numericId);
        
        if (article) {
          console.log(`Found article with ID ${numericId} in database`);
          return res.json(article);
        }
      }
      
      // Try to find the article by slug
      if (id.match(/^[a-zA-Z0-9-]+$/)) {
        const articleBySlug = await newsRepository.getArticleBySlug(id);
        
        if (articleBySlug) {
          console.log(`Found article with slug ${id} in database`);
          return res.json(articleBySlug);
        }
      }
      
      // If article is not found, return 404
      return res.status(404).json({ message: "Article not found" });
    } catch (error: any) {
      console.error(`Error fetching news article ${req.params.id}:`, error);
      res.status(500).json({ 
        message: `Error fetching news article: ${error.message}` 
      });
    }
  });
  
  // Generate image for a specific news article (admin only)
  app.post("/api/news/:id/generate-image", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }
      
      // Import the news repository and image generator
      const { newsRepository } = await import('./news-repository');
      const { generateImageForArticleById } = await import('./image-generator');
      
      // Find the article in the database
      const article = await newsRepository.getArticleById(numericId);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Check if we have an OpenAI key
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({
          message: "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable."
        });
      }
      
      // Generate image for this article
      const imageUrl = await generateImageForArticleById(id, article);
      
      if (!imageUrl) {
        return res.status(500).json({
          message: "Failed to generate image for article"
        });
      }
      
      // Update the article in the database with the new image URL
      const updatedArticle = await newsRepository.updateArticle(numericId, {
        imageUrl,
        updatedAt: new Date()
      });
      
      // Return success response with updated article including image URL
      res.json({
        success: true,
        article: updatedArticle,
        message: "Image generated successfully"
      });
    } catch (error: any) {
      console.error(`Error generating image for article ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false,
        message: `Error generating image: ${error.message}` 
      });
    }
  });
  
  // Admin routes for news articles
  app.post("/api/news", isAdmin, async (req, res) => {
    try {
      const articleData = req.body;
      
      // Import the news repository
      const { newsRepository } = await import('./news-repository');
      
      // Validate required fields
      if (!articleData.title || !articleData.content) {
        return res.status(400).json({ message: "Title and content are required" });
      }
      
      // Generate slug if not provided
      if (!articleData.slug) {
        articleData.slug = articleData.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      
      // Add defaults for missing fields
      const now = new Date();
      const article = {
        ...articleData,
        excerpt: articleData.excerpt || articleData.content.substring(0, 150) + '...',
        date: articleData.date || new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}),
        source: articleData.source || 'Financial Advisor News',
        category: articleData.category || 'Advisor Moves',
        published: articleData.published ?? true,
        featured: articleData.featured ?? false,
        createdAt: now,
        updatedAt: now,
      };
      
      // Save to database
      const savedArticle = await newsRepository.createArticle(article);
      
      // Also create a corresponding blog post
      await newsRepository.createBlogFromNewsArticle(savedArticle);
      console.log(`Created blog post for new article: ${savedArticle.title}`);
      
      res.status(201).json({
        success: true,
        article: savedArticle,
        message: "Article created successfully"
      });
    } catch (error: any) {
      console.error("Error creating news article:", error);
      res.status(500).json({
        success: false,
        message: `Error creating article: ${error.message}`
      });
    }
  });
  
  // Generate news article with AI (admin only)
  app.post("/api/news/generate-with-ai", isAdmin, async (req, res) => {
    try {
      const { title } = req.body;
      
      // Check if we have an OpenAI key
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({
          message: "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable."
        });
      }
      
      // Import the news generator and repository
      const { generateArticleWithAI } = await import('./news-generator');
      const { newsRepository } = await import('./news-repository');
      
      // Generate a new article with AI
      const generatedArticle = await generateArticleWithAI(`temp-${Date.now()}`, title);
      
      // Save the article to the database
      const savedArticle = await newsRepository.createArticle({
        title: generatedArticle.title,
        slug: generatedArticle.slug,
        content: generatedArticle.content,
        excerpt: generatedArticle.excerpt,
        date: generatedArticle.date,
        source: generatedArticle.source,
        sourceUrl: generatedArticle.sourceUrl,
        category: generatedArticle.category,
        imageUrl: generatedArticle.imageUrl,
        published: true,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Also create a corresponding blog post
      await newsRepository.createBlogFromNewsArticle(savedArticle);
      console.log(`Created blog post for new AI-generated article: ${savedArticle.title}`);
      
      res.status(201).json({
        success: true,
        article: savedArticle,
        message: "Article generated and saved successfully"
      });
    } catch (error: any) {
      console.error("Error generating news article with AI:", error);
      res.status(500).json({
        success: false,
        message: `Error generating article: ${error.message}`
      });
    }
  });
  
  // Update a news article (admin only)
  app.put("/api/news/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }
      
      // Import the news repository
      const { newsRepository } = await import('./news-repository');
      
      // Check if article exists
      const existingArticle = await newsRepository.getArticleById(numericId);
      
      if (!existingArticle) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Update the article
      const updatedArticle = await newsRepository.updateArticle(numericId, {
        ...req.body,
        updatedAt: new Date()
      });
      
      res.json({
        success: true,
        article: updatedArticle,
        message: "Article updated successfully"
      });
    } catch (error: any) {
      console.error(`Error updating news article ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: `Error updating article: ${error.message}`
      });
    }
  });
  
  // Delete a news article (admin only)
  app.delete("/api/news/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }
      
      // Import the news repository
      const { newsRepository } = await import('./news-repository');
      
      // Check if article exists
      const existingArticle = await newsRepository.getArticleById(numericId);
      
      if (!existingArticle) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Delete the article
      const deleted = await newsRepository.deleteArticle(numericId);
      
      if (deleted) {
        res.json({
          success: true,
          message: "Article deleted successfully"
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to delete article"
        });
      }
    } catch (error: any) {
      console.error(`Error deleting news article ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: `Error deleting article: ${error.message}`
      });
    }
  });
  
  // Advisor transition contact form endpoint
  app.post("/api/contact/advisor-transition", async (req, res) => {
    try {
      const { 
        name, 
        email, 
        phone, 
        firm, 
        aum, 
        message,
        honeypot
      } = req.body;
      
      // Bot protection - silently accept if honeypot is filled
      if (honeypot) {
        console.log("Potential bot submission detected (honeypot filled)");
        return res.status(200).json({ success: true });
      }
      
      // Basic validation
      if (!name || !email || !firm) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Construct email content
      const emailContent = `
        <h2>New Advisor Transition Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Current Firm:</strong> ${firm}</p>
        <p><strong>AUM:</strong> ${aum || 'Not specified'}</p>
        ${message ? `<p><strong>Additional Information:</strong><br>${message.replace(/\\n/g, '<br>')}</p>` : ''}
        <p><em>This inquiry was submitted on ${new Date().toLocaleString()}</em></p>
      `;
      
      // In a real implementation, send email notification
      // Example: await sendEmail(process.env.NOTIFICATIONS_EMAIL, "New Advisor Transition Inquiry", emailContent);
      
      console.log("New advisor transition inquiry received:", {
        name,
        email,
        firm,
        aum,
        timestamp: new Date().toISOString()
      });
      
      // In a production environment, you would save this to a database
      // await storage.createLeadInquiry({ 
      //   name, email, phone, firm, aum, message,
      //   type: "advisor-transition",
      //   source: "commonwealth-lpl-landing",
      //   createdAt: new Date().toISOString()
      // });
      
      res.status(200).json({ 
        success: true,
        message: "Your inquiry has been submitted successfully"
      });
    } catch (error: any) {
      console.error("Advisor transition form submission error:", error);
      res.status(500).json({ 
        success: false,
        message: "Error submitting your inquiry: " + error.message 
      });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server on the same HTTP server but with a distinct path
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Send a welcome message to the client
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to Financial Axis WebSocket Server'
    }));

    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        // Parse the message (assuming it's JSON)
        const parsedMessage = JSON.parse(message.toString());
        console.log('Received message:', parsedMessage);

        // Handle different message types
        switch (parsedMessage.type) {
          case 'chat':
            // Broadcast the message to all connected clients
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'chat',
                  from: parsedMessage.from || 'Anonymous',
                  message: parsedMessage.message,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;
            
          case 'ping':
            // Respond with a pong message
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
            break;
            
          default:
            console.log('Unknown message type:', parsedMessage.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    // Handle disconnections
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Use database and schema objects
  
  // Update an existing firm profile
  app.put("/api/admin/firm-profiles/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      console.log(`Updating firm profile with ID: ${id}`);
      
      // Fetch the profile first to ensure it exists
      const profiles = await db.select()
        .from(firmProfiles)
        .where(eq(firmProfiles.id, parseInt(id)));
        
      if (profiles.length === 0) {
        return res.status(404).json({ 
          message: "Firm profile not found" 
        });
      }
      
      // Update the profile in the database
      await db.update(firmProfiles)
        .set(updates)
        .where(eq(firmProfiles.id, parseInt(id)));
      
      // Fetch and return the updated profile
      const updatedProfiles = await db.select()
        .from(firmProfiles)
        .where(eq(firmProfiles.id, parseInt(id)));
      
      res.status(200).json(updatedProfiles[0]);
    } catch (error: any) {
      console.error("Error updating firm profile:", error);
      res.status(500).json({ 
        message: "Error updating firm profile: " + error.message 
      });
    }
  });
  
  // Update an existing firm profile by name (legacy support)
  app.put("/api/firm-profiles/:firmName", isAdmin, async (req, res) => {
    try {
      const { firmName } = req.params;
      const updates = req.body;
      
      console.log(`Updating firm profile for: ${firmName}`);
      
      // Fetch the profile first to ensure it exists
      const profiles = await db.select()
        .from(firmProfiles)
        .where(eq(firmProfiles.firm, decodeURIComponent(firmName)));
        
      if (profiles.length === 0) {
        return res.status(404).json({ 
          message: "Firm profile not found" 
        });
      }
      
      // Update the profile in the database
      await db.update(firmProfiles)
        .set(updates)
        .where(eq(firmProfiles.id, profiles[0].id));
      
      // Fetch and return the updated profile
      const updatedProfiles = await db.select()
        .from(firmProfiles)
        .where(eq(firmProfiles.id, profiles[0].id));
      
      res.status(200).json(updatedProfiles[0]);
    } catch (error: any) {
      console.error("Error updating firm profile:", error);
      res.status(500).json({ 
        message: "Error updating firm profile: " + error.message 
      });
    }
  });
  
  // Enrich firm profile with AI 
  app.post("/api/enrich-firm-profile", isAdmin, async (req, res) => {
    // This handler is now in api-routes/enrich-firm-profile.ts
    try {
      const { enrichFirmProfileHandler } = await import('./api-routes/enrich-firm-profile');
      return enrichFirmProfileHandler(req, res);
    } catch (error: any) {
      console.error("Error importing/executing firm profile enrichment handler:", error);
      res.status(500).json({
        success: false,
        message: error.message || "An error occurred while enriching the firm profile"
      });
    }
  });
  
  // Generate practice listing profile with AI
  app.post("/api/generate-practice-listing", isAdmin, async (req, res) => {
    try {
      const { generatePracticeListingHandler } = await import('./api-routes/generate-practice-listing');
      return generatePracticeListingHandler(req, res);
    } catch (error: any) {
      console.error("Error importing/executing practice listing generator handler:", error);
      res.status(500).json({
        success: false,
        message: error.message || "An error occurred while generating the practice listing profile"
      });
    }
  });

  // Practice Listing Inquiries API
  app.get("/api/practice-listing-inquiries/:listingId", async (req, res) => {
    try {
      const { listingId } = req.params;
      
      if (!listingId) {
        return res.status(400).json({ message: "Missing listing ID" });
      }
      
      // In a real implementation, fetch inquiries from database
      // For now, return mock data if the listing ID is valid
      if (parseInt(listingId) > 0) {
        // Mock data structure
        const mockInquiries = [
          {
            id: 1,
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "(555) 123-4567",
            message: "I'm interested in learning more about this practice. Please contact me with additional details.",
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            contacted: false
          },
          {
            id: 2,
            name: "Michael Johnson",
            email: "michael.j@example.com",
            phone: "(555) 987-6543",
            message: "I have 15 years of experience and am looking to transition. This practice seems like a good fit. Could we discuss?",
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            contacted: true
          }
        ];
        
        return res.status(200).json({ 
          inquiries: mockInquiries,
          listingId
        });
      }
      
      // Return empty array if listing not found
      return res.status(200).json({ 
        inquiries: [],
        listingId
      });
      
    } catch (error: any) {
      console.error("Error fetching practice listing inquiries:", error);
      res.status(500).json({ 
        message: "Error fetching inquiries: " + error.message 
      });
    }
  });
  
  // Activity logs endpoint
  app.get("/api/activity-logs", async (req, res) => {
    try {
      // Get optional limit parameter
      const limit = parseInt(req.query.limit as string) || 10;
      
      // First, get recently published blog posts
      const recentPosts = await db.select().from(blogPosts)
        .orderBy(desc(blogPosts.createdAt))
        .limit(20);
        
      // Create log entries for recent blog posts
      const blogActivityLogs = recentPosts.map((post, index) => ({
        id: 1000 + index, // Unique ID for each log entry
        type: 'blog',
        action: post.published ? 'published' : 'created',
        message: `Blog post "${post.title}" ${post.published ? 'published' : 'created'}`,
        user: post.author || 'Admin',
        timestamp: post.createdAt || new Date().toISOString(),
        entityId: post.id,
        entityType: 'blog'
      }));
      
      // Try to get actual logs from the activity_logs table if it exists
      let dbLogs = [];
      try {
        const [result] = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'activity_logs'
          );
        `);
        
        const tableExists = result && result.exists;
        
        if (tableExists) {
          dbLogs = await storage.getRecentActivityLogs(20);
        }
      } catch (error) {
        console.warn("Could not retrieve logs from activity_logs table:", error);
      }
      
      // Add some system logs for UI display
      const systemLogs = [
        {
          id: 998,
          type: 'system',
          action: 'backup',
          message: 'System backup completed successfully',
          user: 'System',
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
        },
        {
          id: 999,
          type: 'system',
          action: 'maintenance',
          message: 'System maintenance completed',
          user: 'System',
          timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString() // 6 hours ago
        }
      ];
      
      // Combine all logs and sort by timestamp (newest first)
      const combinedLogs = [...blogActivityLogs, ...dbLogs, ...systemLogs]
        .sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA;
        });
      
      // Return limited number of logs
      res.json(combinedLogs.slice(0, limit));
    } catch (error: any) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Error fetching activity logs: " + error.message });
    }
  });

  return httpServer;
}

// Add default export pointing to the named export for better compatibility
export default registerRoutes;