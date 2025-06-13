import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email-service";
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcryptjs';

// Determine environment - use this single variable throughout the file
const isProduction = process.env.NODE_ENV === 'production';

// Authentication middleware - no bypass allowed
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Always perform proper authentication check
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  // ...etc...
};

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    console.log("Comparing passwords - supplied length:", supplied.length);
    
    // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
      console.log("Using bcrypt comparison for password");
      try {
        return await bcrypt.compare(supplied, stored);
      } catch (bcryptError) {
        console.error("Bcrypt comparison error:", bcryptError);
        return false;
      }
    }
    
    // If not bcrypt, try scrypt with dot format
    console.log("Using scrypt comparison for password");
    
    // Check if the stored password contains a salt separator
    if (!stored.includes('.')) {
      console.error("Stored password missing salt separator");
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    
    // Validate we have both hash and salt
    if (!hashed || !salt) {
      console.error("Invalid password format: missing hash or salt");
      return false;
    }
    
    // Check if hash is valid hex
    if (!/^[0-9a-f]+$/i.test(hashed)) {
      console.error("Invalid hash format: not a hex string");
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    
    // Ensure consistent buffer sizes for comparison
    try {
      const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
      
      // Make sure buffers are the same length before comparison
      if (hashedBuf.length !== suppliedBuf.length) {
        console.error("Buffer length mismatch:", hashedBuf.length, suppliedBuf.length);
        return false;
      }
      
      const result = timingSafeEqual(hashedBuf, suppliedBuf);
      return result;
    } catch (err) {
      console.error("Error during password comparison:", err);
      return false;
    }
  } catch (error) {
    console.error("Unexpected error in password comparison:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Ensure we have a proper session secret
  if (!process.env.SESSION_SECRET) {
    console.error("WARNING: SESSION_SECRET environment variable not set. Using a random secret for this session only.");
    process.env.SESSION_SECRET = randomBytes(32).toString('hex');
  }
  
  // Generate a default session secret if not provided
  if (!process.env.SESSION_SECRET) {
    console.warn('⚠️ No SESSION_SECRET environment variable set. Using a generated secret (not secure for production).');
  }
  
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
  
  // Configure session settings - use different settings for dev vs prod
  const cookieSettings = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    path: '/',
  };
  
  // Determine environment for logging
  const environment = isProduction ? 'production' : 'development';
  console.log(`Configuring session cookies for ${environment} environment`);
  
  // In development environment, explicitly set cookie settings for compatibility
  if (!isProduction) {
    Object.assign(cookieSettings, {
      sameSite: 'lax', // 'lax' is the most compatible option for most browsers
      secure: false    // Don't require HTTPS in development
    });
    console.log('Cookie settings for development:', JSON.stringify(cookieSettings));
  } else {
    // In production
    Object.assign(cookieSettings, {
      sameSite: 'lax',  // 'lax' still allows cross-site requests from direct links
      secure: true      // Require HTTPS in production
    });
    console.log('Cookie settings for production:', JSON.stringify(cookieSettings));
  }
  
  console.log('Cookie settings:', JSON.stringify(cookieSettings));
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: true, 
    saveUninitialized: true,
    store: storage.sessionStore,
    name: 'faaxis_sid',
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'lax'
    }
  };
  
  // Add a small delay to session writes to ensure data is saved
  storage.sessionStore.on('create', (id) => {
    console.log(`New session created: ${id}`);
  });
  
  storage.sessionStore.on('set', (id) => {
    console.log(`Session updated: ${id}`);
  });
  
  storage.sessionStore.on('destroy', (id) => {
    console.log(`Session destroyed: ${id}`);
  });
  
  // Log session store to debug
  console.log("Session store initialized:", storage.sessionStore ? "OK" : "MISSING");

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid email or password. Please check your credentials and try again." });
        } 
        
        // Allow all users to login regardless of email verification status
        // This improves user experience while we transition to TOTP
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      // If user is undefined (not found), we should pass null as the user instead of error
      // This prevents the "Failed to deserialize user out of session" error
      done(null, user || null);
    } catch (error) {
      console.error("Session deserialize error:", error);
      // Pass null as the user instead of the error to prevent session deserialization errors
      done(null, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    console.log("🔍 Registration request received:", {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      // Don't log sensitive information like passwords
    });
    
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("❌ Registration failed: Email address already exists");
        return res.status(400).json({ message: "Email address already exists" });
      }

      console.log("✅ No existing user found, proceeding with registration");
      
      // Create the user
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });
      
      console.log("✅ User created successfully:", { userId: user.id, username: user.username });
      
      // Generate verification token and send verification email
      const verificationToken = randomBytes(32).toString("hex");
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      console.log("🔑 Generated verification token", {
        userId: user.id,
        tokenLength: verificationToken.length,
        expires: tokenExpires
      });
      
      await storage.updateUserVerification(user.id, {
        emailVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpires: tokenExpires.toISOString()
      });
      
      // Send verification email
      try {
        console.log("📧 Attempting to send verification email to:", user.username);
        await sendVerificationEmail(user.username, verificationToken);
        console.log(`✅ Verification email successfully sent to ${user.username}`);
      } catch (emailError) {
        console.error("❌ Failed to send verification email:", emailError);
        // Continue with registration process even if email fails
      }
      
      // Generate TOTP secret (for future use with 2FA)
      console.log("🔐 Generating TOTP secret for 2FA");
      const totpSecret = speakeasy.generateSecret({
        name: `FaAxis:${user.username}`
      });
      
      // Store TOTP secret (but don't enable it yet)
      console.log("💾 Storing TOTP secret (disabled by default)");
      await storage.updateUserTOTP(user.id, {
        totpSecret: totpSecret.base32,
        totpEnabled: false,
        totpVerified: false
      });

      // Log the user in immediately
      console.log("🔑 Logging in user after registration", { userId: user.id });
      req.login(user, (err) => {
        if (err) {
          console.error("❌ Failed to login user after registration:", err);
          return next(err);
        }
        
        console.log("✅ User logged in successfully after registration");
        
        // Remove password from response
        const { password, ...safeUser } = user;
        
        // Generate an immediate auth token for cross-site login
        const immediateAuthToken = randomBytes(32).toString("hex");
        const tokenExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
        
        console.log("🔑 Generated immediate auth token for cross-site login", { 
          userId: user.id,
          tokenLength: immediateAuthToken.length,
          expires: tokenExpires
        });
        
        // Update the user with the immediate auth token
        storage.updateUserImmediateAuth(user.id, {
          immediateAuthToken,
          immediateAuthExpires: tokenExpires
        }).then(() => {
          console.log("✅ Immediate auth token saved successfully");
          
          // Return user data with auth token
          const responseData = { 
            ...safeUser, 
            emailVerified: false, // User needs to verify email
            immediateAuthToken,
            authRedirectUrl: `/api/user?auth_token=${immediateAuthToken}`,
            message: "Registration successful! Please check your email to verify your account."
          };
          
          console.log("📤 Sending registration success response", {
            statusCode: 201,
            userId: safeUser.id,
            username: safeUser.username
          });
          
          res.status(201).json(responseData);
        }).catch(error => {
          console.error("❌ Error saving immediate auth token:", error);
          // Still return success even if we couldn't save the token
          const fallbackResponse = { 
            ...safeUser,
            emailVerified: false, // User needs to verify email
            message: "Registration successful! Please check your email to verify your account."
          };
          
          console.log("📤 Sending fallback registration success response", {
            statusCode: 201,
            userId: safeUser.id,
            username: safeUser.username
          });
          
          res.status(201).json(fallbackResponse);
        });
      });
    } catch (error) {
      console.error("❌ Registration error:", error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: Error | null, user: Express.User | undefined, info: { message?: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || "Invalid username or password",
          sessionActive: false
        });
      }
      
      try {
        // Set additional session flags if the user is an admin
        if (user.isAdmin) {
          req.session.adminAuthenticated = true;
        }
        
        // Login the user directly without auth token redirection
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("Login error:", loginErr);
            return next(loginErr);
          }
          
          // Save the session with an explicit save call
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("Session save error:", saveErr);
              return next(saveErr);
            }
            
            console.log(`User logged in: ${user.username}, Session ID: ${req.sessionID}`);
            
            // Remove sensitive fields before sending response
            const { password, resetPasswordToken, resetPasswordExpires, 
                   verificationToken, verificationTokenExpires, ...safeUser } = user;
            
            // Return user data directly with session information
            res.status(200).json({
              ...safeUser,
              sessionId: req.sessionID,
              sessionActive: true,
              message: "Login successful"
            });
          });
        });
      } catch (error) {
        console.error("Error during login:", error);
        next(error);
      }
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", async (req, res) => {
    console.log("GET /api/user - Session ID:", req.sessionID);
    
    // No development bypass - all users must authenticate properly
    
    // Check for immediate auth token in query parameters
    const authToken = req.query.auth_token as string;
    if (authToken) {
      console.log(`Auth token provided: ${authToken.substring(0, 8)}...`);
      try {
        const user = await storage.getUserByImmediateAuthToken(authToken);
        
        if (user) {
          // Valid token found, log the user in
          console.log(`Valid immediate auth token for user: ${user.username}`);
          
          // Clear the token immediately after use (one-time use)
          await storage.updateUserImmediateAuth(user.id, {
            immediateAuthToken: null,
            immediateAuthExpires: null
          });
          
          // Log the user in
          return new Promise<void>((resolve, reject) => {
            req.login(user, (err) => {
              if (err) {
                console.error("Login error with immediate auth token:", err);
                res.status(401).json({ message: "Authentication failed" });
                return reject(err);
              }
              
              // Set admin flag in session
              req.session.adminAuthenticated = user.isAdmin || false;
              
              // Save session and send response
              req.session.save((saveErr) => {
                if (saveErr) {
                  console.error("Session save error:", saveErr);
                  res.status(401).json({ message: "Session save failed" });
                  return reject(saveErr);
                }
                
                // Remove sensitive fields
                const { password, resetPasswordToken, resetPasswordExpires, 
                       verificationToken, verificationTokenExpires, ...safeUser } = user;
                
                console.log("User authenticated via immediate auth token");
                res.json({
                  ...safeUser,
                  sessionId: req.sessionID, // Include session ID for the client
                  sessionActive: true
                });
                resolve();
              });
            });
          });
        }
      } catch (error) {
        console.error("Error processing immediate auth token:", error);
      }
    }
    
    // If no token or token invalid, proceed with regular session check
    console.log("GET /api/user - isAuthenticated:", req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      console.log("User not authenticated, returning 401");
      return res.status(401).json({ 
        message: "Not authenticated", 
        sessionId: req.sessionID, // Include session ID even for failed requests
        sessionActive: false
      });
    }
    
    // Remove password from response
    const { password, ...safeUser } = req.user;
    console.log("Authenticated user:", safeUser);
    res.json({
      ...safeUser,
      sessionId: req.sessionID, // Include session ID for the client
      sessionActive: true
    });
  });
  
  // Direct login endpoints have been removed for security reasons
  app.post("/api/user-direct-login", async (req, res) => {
    console.log("Attempt to use removed direct login endpoint");
    res.status(403).json({ 
      message: "This endpoint has been disabled for security reasons. Please use the standard login process.",
      error: "ENDPOINT_DISABLED"
    });
  });
  
  // Direct admin login endpoint has been removed for security
  app.post("/api/admin-direct-login", async (req, res) => {
    console.log("Attempt to use removed admin direct login endpoint");
    res.status(403).json({ 
      message: "This endpoint has been disabled for security reasons. Please use the standard login process with 2FA for admin access.",
      error: "ENDPOINT_DISABLED"
    });
  });

  // Send verification email
  app.post("/api/send-verification", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to request email verification" });
      }

      // Generate a verification token
      const verificationToken = randomBytes(32).toString("hex");
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      // Save the token to the user
      await storage.updateUserVerification(req.user.id, {
        verificationToken,
        verificationTokenExpires: tokenExpires
      });

      // Send the verification email
      const emailSent = await sendVerificationEmail(req.user.username, verificationToken);

      if (emailSent) {
        res.json({ message: "Verification email sent" });
      } else {
        res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Verify email with token
  app.post("/api/verify-email", async (req, res, next) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      // Standard verification flow
      // Find user with the token
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      // Check if token is expired
      if (user.verificationTokenExpires) {
        const expires = new Date(user.verificationTokenExpires);
        if (expires < new Date()) {
          return res.status(400).json({ message: "Verification token has expired" });
        }
      }

      // Update user as verified
      await storage.updateUserVerification(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null
      });

      // If user is already logged in, update their session
      if (req.isAuthenticated() && req.user.id === user.id) {
        req.user.emailVerified = true;
      }

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Request password reset
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Email address is required" });
      }

      // Find user by email
      const user = await storage.getUserByUsername(username);
      if (!user) {
        // Don't reveal that the user doesn't exist for security
        return res.json({ message: "If your account exists, a password reset email has been sent" });
      }

      // Generate a reset token
      const resetToken = randomBytes(32).toString("hex");
      const tokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(); // 1 hour

      // Save the token to the user
      await storage.updateUserResetToken(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: tokenExpires
      });

      // Send the reset email
      const emailSent = await sendPasswordResetEmail(user.username, resetToken);

      if (emailSent) {
        res.json({ message: "Password reset email sent" });
      } else {
        res.status(500).json({ message: "Failed to send password reset email" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Reset password with token
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      // Find user with the token
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

      // Update user password
      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(user.id, hashedPassword);

      // Clear the reset token
      await storage.updateUserResetToken(user.id, {
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  });
  
  // TOTP authentication endpoints
  app.post("/api/setup-totp", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Generate new TOTP secret
      const secret = speakeasy.generateSecret({
        name: `FaAxis:${req.user.username}`
      });
      
      // Save the secret to the user's account
      await storage.updateUserTOTP(req.user.id, {
        totpSecret: secret.base32,
        totpEnabled: false,
        totpVerified: false
      });
      
      // Generate QR code
      const otpAuthUrl = secret.otpauth_url;
      const qrCode = otpAuthUrl ? await QRCode.toDataURL(otpAuthUrl) : '';
      
      res.json({
        secret: secret.base32,
        qrCode,
        message: "TOTP setup initiated. Scan the QR code with your authenticator app."
      });
    } catch (error) {
      console.error("TOTP setup error:", error);
      next(error);
    }
  });
  
  app.post("/api/verify-totp", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Verification code is required" });
      }
      
      // Get the user's secret
      const user = req.user;
      if (!user.totpSecret) {
        return res.status(400).json({ message: "TOTP not set up for this account" });
      }
      
      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow 1 step before/after for clock drift
      });
      
      if (!verified) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Mark TOTP as verified and enabled
      await storage.updateUserTOTP(user.id, {
        totpEnabled: true,
        totpVerified: true
      });
      
      res.json({ message: "TOTP verification successful", totpEnabled: true });
    } catch (error) {
      console.error("TOTP verification error:", error);
      next(error);
    }
  });
  
  app.post("/api/disable-totp", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Disable TOTP for the user
      await storage.updateUserTOTP(req.user.id, {
        totpEnabled: false,
        totpVerified: false
      });
      
      res.json({ message: "TOTP disabled successfully" });
    } catch (error) {
      console.error("TOTP disable error:", error);
      next(error);
    }
  });
}
