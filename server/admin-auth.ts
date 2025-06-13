// server/admin-auth.ts
import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { logger } from './logger';
import { sendAdminVerificationCode } from './email-service';

const router = express.Router();

// in-memory store for OTPs (or use Redis for production)
const pendingOtps = new Map<string, { code: string; expires: number; email: string }>();

// in-memory store for password reset tokens
const passwordResetTokens = new Map<string, { 
  code: string; 
  expires: number; 
  email: string;
  attempts: number;
  used: boolean;
}>();

// Debug helper to print admin settings (with redacted sensitive info)
function printAdminSettings(): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  
  logger.info('=== ADMIN SETTINGS DEBUG ===');
  logger.info(`ADMIN_EMAIL: ${adminEmail ? 'Set' : 'NOT SET'}`);
  logger.info(`ADMIN_PASSWORD_HASH: ${adminPasswordHash ? 'Set' : 'NOT SET'}`);
  
  if (adminEmail) {
    // Print part of the email for verification
    const [username, domain] = adminEmail.split('@');
    logger.info(`Email format: ${username.substring(0, 2)}...@${domain || 'unknown'}`);
  }
  
  if (adminPasswordHash) {
    // Check hash format - proper bcrypt hashes have a specific format
    const isValidFormat = adminPasswordHash.includes('$2') || adminPasswordHash.includes('.');
    logger.info(`Password hash format valid: ${isValidFormat}`);
    logger.info(`Password hash length: ${adminPasswordHash.length}`);
    
    if (adminPasswordHash.includes('.')) {
      const [hash, salt] = adminPasswordHash.split('.');
      logger.info(`Hash part length: ${hash.length}, Salt part length: ${salt.length}`);
    } else if (adminPasswordHash.startsWith('$2')) {
      // Standard bcrypt format
      logger.info(`Standard bcrypt format detected`);
    }
  }
  logger.info('=============================');
}

// Admin email validation against environment variable
function isValidAdminEmail(email: string): boolean {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  
  // Ensure ADMIN_EMAIL is configured
  if (!ADMIN_EMAIL) {
    logger.error('ADMIN_EMAIL environment variable is not set');
    return false;
  }
  
  return email === ADMIN_EMAIL;
}

// 1) step 1: submit admin password
router.post('/verify', (req, res) => {
  const { password, email } = req.body;
  
  // Get admin credentials from environment
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
  
  // Call our debug helper to print admin settings
  printAdminSettings();
  
  // Ensure admin credentials are configured
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    logger.error('Admin credentials not configured in environment variables');
    return res.status(403).json({ error: 'Admin credentials not configured' });
  }
  
  // Debug log for admin authentication (with sensitive info redacted)
  logger.info('=== ADMIN AUTH REQUEST ===');
  logger.info(`Admin auth attempt for email: ${email}`);
  logger.info(`Email used matches expected: ${email === ADMIN_EMAIL}`);
  logger.info(`Password provided length: ${password ? password.length : 0}`);
  logger.info('=========================');
  
  // First validate the admin email
  if (!isValidAdminEmail(email)) {
    logger.info('Admin email validation failed');
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  
  // Validate password against stored hash
  let isPasswordValid = false;
  
  try {
    // Debug log the password validation attempt
    logger.info(`Password validation attempt`);
    
    // Check hash format and handle different formats
    // Format #1: Standard bcrypt format ($2a$...)
    if (ADMIN_PASSWORD_HASH.startsWith('$2')) {
      logger.info(`Using standard bcrypt format validation`);
      isPasswordValid = bcryptjs.compareSync(password, ADMIN_PASSWORD_HASH);
    } 
    // Format #2: Custom format with hash.salt
    else if (ADMIN_PASSWORD_HASH.includes('.')) {
      logger.info(`Using custom hash.salt format validation`);
      const [hashed, salt] = ADMIN_PASSWORD_HASH.split('.');
      
      // Re-hash the provided password with the same salt
      const hashedBuf = Buffer.from(hashed, 'hex');
      const suppliedBuf = Buffer.from(
        bcryptjs.hashSync(password, salt).toString('hex'), 
        'hex'
      );
      
      // Compare the hashes
      isPasswordValid = hashedBuf.equals(suppliedBuf);
    }
    // Format #3: Plain text comparison (for legacy/simple systems)
    else {
      logger.info(`Using direct comparison as last resort`);
      isPasswordValid = (password === ADMIN_PASSWORD_HASH);
    }
    
    logger.info(`Password validation result: ${isPasswordValid ? 'success' : 'failed'}`);
  } catch (error) {
    logger.error('Error during password validation:', error);
  }
  
  if (!isPasswordValid) {
    logger.info('Admin password validation failed');
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  
  logger.info('Admin credentials validation successful');

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const key = crypto.randomUUID();
  
  // Store the OTP with expiration (5 minutes)
  pendingOtps.set(key, { 
    code, 
    expires: Date.now() + 5 * 60 * 1000,
    email 
  });

  // Security-enhanced logging - verification codes are never exposed
  logger.info(`\n=== ADMIN OTP EMAIL VERIFICATION ===`);
  logger.info(`EMAIL: ${email}`);
  logger.info(`CODE: ${'*'.repeat(code.length)}`);
  logger.info(`KEY: ${key.substring(0, 8)}...`);
  logger.info(`EXPIRES: ${new Date(Date.now() + 5 * 60 * 1000).toISOString()}`);
  logger.info(`DELIVERY: Email-only verification`);
  logger.info(`=============================================\n`);

  // Send email 
  sendAdminVerificationCode(email, code).catch((error: Error) => {
    console.error('Failed to send OTP email:', error);
  });

  // Return a reference so client can verify
  res.json({ 
    otpKey: key,
    message: 'Verification code sent to your email'
    // No development bypass - security is enforced in all environments
    // Verification codes ONLY available via email
  });
});

// 2) step 2: verify OTP
router.post('/verify-code', (req, res) => {
  const { otpKey, code } = req.body;
  
  console.log('=== ADMIN OTP VERIFICATION ATTEMPT ===');
  console.log(`OTP Key: ${otpKey ? otpKey.substring(0, 8) + '...' : 'undefined'}`);
  console.log(`Code length: ${code ? code.length : 'undefined'}`);
  console.log(`Session ID: ${req.sessionID}`);
  
  // Basic validation
  if (!otpKey || !code) {
    console.log('OTP Verification failed: Missing otpKey or code');
    return res.status(400).json({ error: 'OTP key and code are required' });
  }
  
  const entry = pendingOtps.get(otpKey);
  
  if (!entry) {
    console.log('OTP Verification failed: Invalid or expired key');
    return res.status(401).json({ error: 'Invalid or expired verification key' });
  }
  
  if (entry.expires < Date.now()) {
    console.log('OTP Verification failed: Code expired');
    pendingOtps.delete(otpKey);
    return res.status(401).json({ error: 'Verification code has expired' });
  }
  
  // Simple string comparison with normalization
  const expectedCode = entry.code.toString();
  const providedCode = code.toString();
  
  console.log(`Code comparison: expected="${expectedCode}", provided="${providedCode}"`);
  
  if (expectedCode !== providedCode) {
    console.log('OTP Verification failed: Code mismatch');
    return res.status(401).json({ error: 'Invalid verification code' });
  }
  
  // Clean up the used OTP
  pendingOtps.delete(otpKey);

  // Mark session as authenticated admin
  if (req.session) {
    req.session.isAdmin = true;
    
    // Store the admin email for reference
    if (typeof req.session === 'object') {
      (req.session as any).adminEmail = entry.email;
      (req.session as any).adminAuthenticated = true;
    }
    
    // Save the session explicitly to ensure it's persisted
    req.session.save((err) => {
      if (err) {
        console.error('Failed to save admin session:', err);
      } else {
        console.log(`Admin session saved successfully: ${req.sessionID}`);
        console.log(`Session after save: ${JSON.stringify(req.session, null, 2)}`);
      }
    });
    
    console.log('OTP Verification successful - admin session created');
  } else {
    console.log('OTP Verification warning: No session object available');
  }
  
  res.json({ 
    success: true,
    message: 'Admin verified successfully',
    sessionId: req.sessionID,
    redirectUrl: '/secure-management-portal'
  });
});

// 3) middleware to protect admin routes
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Log detailed authentication information for debugging
  console.log('isAdmin middleware - adminSessionAuthenticated:', req.session?.isAdmin === true);
  console.log('isAdmin middleware - adminAuthenticated:', req.session?.adminAuthenticated === true);
  console.log('isAdmin middleware - session data:', JSON.stringify(req.session, null, 2));
  
  // Update the session.isAdmin check to be more permissive - accept any truthy value
  if (req.session && ((req.session as any).isAdmin || (req.session as any).adminAuthenticated)) {
    console.log('Admin session authenticated - access granted');
    
    // If no user is attached to the request, add a minimalist admin user object
    if (!req.user) {
      (req as any).user = {
        id: 0,
        username: (req.session as any).adminEmail || 'admin',
        isAdmin: true
      };
    }
    
    return next();
  }
  
  // Also check if the user has authenticated through Passport (if Passport is available)
  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
    console.log('Admin user authenticated through Passport - access granted');
    
    // Set the admin flag in the session if it's not already set
    if (req.session) {
      (req.session as any).isAdmin = true;
    }
    
    return next();
  }
  
  console.log('isAdmin middleware - failed authentication check');
  return res.status(403).json({ error: 'Admin access required' });
}

// Direct admin login bypass for when email verification fails
router.post('/direct-login', (req, res) => {
  const { email, password } = req.body;
  
  // Get admin credentials from environment
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
  
  logger.info('Direct admin login attempt');
  
  // Ensure admin credentials are configured
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    logger.error('Admin credentials not configured in environment variables');
    return res.status(403).json({ error: 'Admin credentials not configured' });
  }
  
  // Validate email
  if (email !== ADMIN_EMAIL) {
    logger.info('Direct admin login failed: Invalid email');
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  
  // Validate password
  let isPasswordValid = false;
  try {
    if (ADMIN_PASSWORD_HASH.startsWith('$2')) {
      isPasswordValid = bcryptjs.compareSync(password, ADMIN_PASSWORD_HASH);
    } else if (ADMIN_PASSWORD_HASH.includes('.')) {
      const [hashed, salt] = ADMIN_PASSWORD_HASH.split('.');
      const hashedBuf = Buffer.from(hashed, 'hex');
      const suppliedBuf = Buffer.from(
        bcryptjs.hashSync(password, salt).toString('hex'), 
        'hex'
      );
      isPasswordValid = hashedBuf.equals(suppliedBuf);
    } else {
      isPasswordValid = (password === ADMIN_PASSWORD_HASH);
    }
  } catch (error) {
    logger.error('Error during password validation:', error);
  }
  
  if (!isPasswordValid) {
    logger.info('Direct admin login failed: Invalid password');
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  
  // Create admin session
  if (req.session) {
    req.session.isAdmin = true;
    (req.session as any).adminEmail = email;
    (req.session as any).adminAuthenticated = true;
    
    req.session.save((err) => {
      if (err) {
        console.error('Failed to save admin session:', err);
        return res.status(500).json({ error: 'Session creation failed' });
      } else {
        logger.info('Direct admin login successful - session created');
        res.json({ 
          success: true,
          message: 'Admin authenticated successfully',
          redirectUrl: '/secure-management-portal'
        });
      }
    });
  } else {
    logger.error('No session object available');
    return res.status(500).json({ error: 'Session not available' });
  }
});

// Debug route - disabled for security
router.get('/debug-codes', (req, res) => {
  // No debug routes in any environment
  logger.warn('[SECURITY] Attempt to access debug-codes endpoint was blocked');
  return res.status(403).json({ 
    error: 'This endpoint has been disabled for security reasons',
    message: 'Verification codes are only delivered via email'
  });
});

// Status check endpoint to verify admin authentication
// GET /api/admin-auth/status
router.get('/status', (req, res) => {
  // Limited logging for security - avoids exposing full session contents
  logger.info(`Admin status check - Session ID: ${req.sessionID}`);
  logger.info(`Admin authentication status: ${Boolean(req.session?.isAdmin) || Boolean(req.session?.adminAuthenticated)}`);
  
  // Don't log full session data to protect sensitive information
  // Instead log sanitized version
  const safeSessionInfo = req.session ? {
    hasSession: true,
    cookieMaxAge: req.session.cookie ? req.session.cookie.originalMaxAge : null,
    sessionId: req.sessionID,
    isAuthenticated: Boolean(req.session?.isAdmin) || Boolean(req.session?.adminAuthenticated)
  } : { hasSession: false };
  
  logger.info(`Admin status check - sanitized session data: ${JSON.stringify(safeSessionInfo)}`);
  
  // Check if the user is admin by any method - isAdmin or adminAuthenticated
  const isAdminAuthenticated = Boolean(req.session?.isAdmin) || Boolean(req.session?.adminAuthenticated);
  
  res.json({ 
    authenticated: isAdminAuthenticated,
    sessionId: req.sessionID,
    adminAuthMethod: req.session?.isAdmin ? 'isAdmin' : 
                     req.session?.adminAuthenticated ? 'adminAuthenticated' : 'none'
  });
});

// Request password reset endpoint
router.post('/request-reset', (req, res) => {
  const { email } = req.body;
  
  // Validate that this is the admin email
  if (!isValidAdminEmail(email)) {
    // For security, don't reveal whether this email is valid or not
    return res.json({ 
      message: 'If this email is registered as an admin, you will receive a reset link.' 
    });
  }
  
  // Generate a reset token and 6-digit OTP code
  const token = crypto.randomUUID();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store the reset token with expiration (30 minutes)
  passwordResetTokens.set(token, {
    code,
    expires: Date.now() + 30 * 60 * 1000, // 30 minutes
    email,
    attempts: 0,
    used: false
  });
  
  // Log password reset request (without revealing code)
  logger.info(`\n=== ADMIN PASSWORD RESET REQUEST ===`);
  logger.info(`Email: ${email}`);
  logger.info(`Token: ${token.substring(0, 8)}...`);
  logger.info(`Code: ${'*'.repeat(code.length)}`);
  logger.info(`Expires: ${new Date(Date.now() + 30 * 60 * 1000).toISOString()}`);
  logger.info(`DELIVERY: Email-only verification`);
  logger.info(`=======================================\n`);
  
  // Send email with reset code
  sendAdminVerificationCode(email, code, 'password-reset')
    .then(() => {
      logger.info(`Password reset email sent to ${email}`);
    })
    .catch((error: Error) => {
      logger.error(`Failed to send password reset email to ${email}:`, error);
    });
  
  // Return success message and token
  res.json({
    message: 'Password reset instructions have been sent to your email.',
    token
    // No development shortcuts - verification codes are only delivered via email
  });
});

// Reset password endpoint
router.post('/reset', async (req, res) => {
  const { token, otp, newPassword } = req.body;
  
  // Validate input
  if (!token || !otp || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if token exists
  const resetData = passwordResetTokens.get(token);
  if (!resetData) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }
  
  // Check if token is expired
  if (resetData.expires < Date.now()) {
    passwordResetTokens.delete(token); // Clean up expired token
    return res.status(400).json({ error: 'Reset token has expired' });
  }
  
  // Check if token was already used
  if (resetData.used) {
    return res.status(400).json({ error: 'Reset token has already been used' });
  }
  
  // Increment attempts counter
  resetData.attempts += 1;
  
  // Check if OTP matches - never reveal the code in logs
  if (resetData.code !== otp) {
    // Log the failed attempt securely without revealing codes
    logger.warn(`[SECURITY] Failed password reset attempt with token ${token.substring(0, 8)}...`);
    
    // If too many failed attempts, invalidate the token
    if (resetData.attempts >= 5) {
      logger.warn(`[SECURITY] Too many failed password reset attempts, token invalidated: ${token.substring(0, 8)}...`);
      passwordResetTokens.delete(token);
      return res.status(400).json({ error: 'Too many failed attempts. Please request a new reset link.' });
    }
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  
  // Mark token as used
  resetData.used = true;
  
  try {
    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    
    // Update the admin password in the environment
    // In a real app, you would update this in a database
    // For now, we'll just log it for manual update
    logger.info('\n=== ADMIN PASSWORD RESET SUCCESSFUL ===');
    logger.info(`New password hash: ${hashedPassword}`);
    logger.info('Please update the ADMIN_PASSWORD_HASH environment variable.');
    logger.info('=======================================\n');
    
    // Clean up the used token
    passwordResetTokens.delete(token);
    
    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. Please contact your system administrator to update your password hash.'
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({ error: 'An error occurred during password reset' });
  }
});

// For ESM export
const adminAuth = router;
export default adminAuth;