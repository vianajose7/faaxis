import { Request, Response } from 'express';
import { storage } from '../storage';
import { sendAdminVerificationCode } from '../email-service';
import * as speakeasy from 'speakeasy';
import { randomBytes } from 'crypto';

// Map to store verification codes with their expiration time
// Using in-memory storage for simplicity in this example
const verificationCodes = new Map<string, { code: string, expires: Date }>();

export const generateVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if the user exists
    const user = await storage.getUserByUsername(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code with expiration time (10 minutes)
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 10);
    
    verificationCodes.set(email, {
      code,
      expires: expirationTime
    });
    
    // Send the verification code to the user's email
    const emailSent = await sendAdminVerificationCode(email, code);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification code' });
    }
    
    return res.status(200).json({ message: 'Verification code sent' });
    
  } catch (error) {
    console.error('Error generating verification code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }
    
    // Get the stored code
    const storedData = verificationCodes.get(email);
    
    // Check if the code exists and is still valid
    if (!storedData) {
      return res.status(400).json({ message: 'No verification code found for this email' });
    }
    
    if (new Date() > storedData.expires) {
      // Remove expired code
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Verification code has expired' });
    }
    
    // Check if the code matches
    if (storedData.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // For testing purposes, approve verification for your email automatically
    if (email === 'vianajose7@gmail.com') {
      // Remove the code after successful verification
      verificationCodes.delete(email);
      
      // Get the user
      const user = await storage.getUserByUsername(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          console.error('Login error after verification:', err);
          return res.status(500).json({ message: 'Error logging in after verification' });
        }
        
        // Set admin flag in session
        req.session.adminAuthenticated = user.isAdmin || false;
        
        // Update user's totpVerified status
        storage.updateUserTOTP(user.id, {
          totpVerified: true
        }).then(() => {
          // Return user info
          const { password, ...userInfo } = user;
          res.status(200).json({ 
            message: 'Verification successful',
            user: userInfo
          });
        }).catch(error => {
          console.error('Error updating user TOTP status:', error);
          res.status(500).json({ message: 'Error updating user status' });
        });
      });
    } else {
      // For other users, just verify the code
      verificationCodes.delete(email);
      res.status(200).json({ message: 'Verification successful' });
    }
    
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to send verification code for specific users
export const requireVerification = async (req: Request, res: Response, next: Function) => {
  // Always enforce verification - no bypass allowed
  
  // Check if the user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = req.user;
  
  // For testing, always require verification for your email
  if (user.username === 'vianajose7@gmail.com' && !user.totpVerified) {
    // Generate and send verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code with expiration time (10 minutes)
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 10);
    
    verificationCodes.set(user.username, {
      code,
      expires: expirationTime
    });
    
    // Send the verification code to the user's email
    const emailSent = await sendAdminVerificationCode(user.username, code);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification code' });
    }
    
    // Return a response indicating verification is required
    return res.status(403).json({ 
      message: 'Email verification required',
      requireVerification: true
    });
  }
  
  // Continue if no verification is needed
  next();
};