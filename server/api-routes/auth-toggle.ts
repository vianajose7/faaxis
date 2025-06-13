import { Request, Response } from 'express';

/**
 * SECURITY NOTICE:
 * All authentication bypass functionality has been permanently removed.
 * Proper security protocols are now enforced in all environments.
 * 
 * This file remains only for API compatibility with existing endpoints
 * but provides no actual bypass functionality.
 */

/**
 * Returns a security message for API compatibility
 */
export const checkSkipAuth = (req: Request, res: Response) => {
  // Log security audit message to track attempts to check authentication bypass
  console.log(`SECURITY: Authentication bypass check attempt from ${req.ip}`);
  
  res.status(403).json({
    enabled: false,
    message: "Authentication bypass has been permanently disabled for security reasons."
  });
};

/**
 * Returns a security error for API compatibility
 */
export const toggleSkipAuth = async (req: Request, res: Response) => {
  // Log security audit message to track attempts to toggle authentication bypass
  console.log(`SECURITY ALERT: Authentication bypass toggle attempt from ${req.ip}`);
  
  res.status(403).json({
    error: "Forbidden",
    message: "Authentication bypass has been permanently disabled for security reasons."
  });
};

/**
 * Always returns false to enforce proper authentication
 */
export const getSkipAuthStatus = (): boolean => {
  return false;
};