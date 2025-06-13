/**
 * Transition Routes
 * 
 * This file implements routes that use both session-based and JWT authentication
 * to allow for a smooth transition between the two systems.
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { setupAuth } from "./auth"; // Existing session auth
import { setupJwtAuth, authenticateJwt, requireAdminJwt, JWT_SECRET } from "./jwt-auth"; // New JWT auth
import cookieParser from "cookie-parser";

export function registerTransitionRoutes(app: Express): Server {
  // Parse cookies (required for both authentication systems)
  app.use(cookieParser());
  
  // Set up both authentication systems
  setupAuth(app); // Traditional session-based auth
  setupJwtAuth(app); // New JWT-based auth

  // Create a JWT-enabled test route
  app.get('/api/jwt-test', authenticateJwt, (req, res) => {
    res.json({ 
      message: 'JWT Authentication working!', 
      user: req.user
    });
  });

  // Create a dual authentication route that works with both systems
  app.get('/api/dual-auth-test', (req, res, next) => {
    // First check for JWT auth
    const token = req.cookies?.auth_token;
    if (token) {
      authenticateJwt(req, res, () => {
        // JWT auth successful
        res.json({ 
          message: 'Authenticated with JWT', 
          user: req.user,
          authType: 'jwt'
        });
      });
    } else {
      // Fall back to session auth
      if (req.isAuthenticated && req.isAuthenticated()) {
        res.json({ 
          message: 'Authenticated with session', 
          user: req.user,
          authType: 'session'
        });
      } else {
        res.status(401).json({ message: 'Not authenticated' });
      }
    }
  });
  
  // Auth status check that works with both authentication methods
  // Session diagnostics route to help debug session issues
  app.get('/api/session-diagnostics', (req, res) => {
    // Log detailed information about the session
    console.log("=== Session Diagnostics ===");
    console.log("Session ID:", req.sessionID);
    console.log("Session object:", req.session);
    console.log("Is authenticated:", req.isAuthenticated ? req.isAuthenticated() : false);
    console.log("User:", req.user || "No user");
    console.log("Cookies:", req.cookies);
    console.log("=========================");
    
    // Return detailed diagnostic information
    res.json({
      success: true,
      diagnostics: {
        sessionID: req.sessionID,
        sessionObject: req.session,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
        user: req.user || null,
        cookies: req.cookies,
        headers: {
          cookie: req.headers.cookie
        }
      }
    });
  });

  app.get('/api/auth-status', (req, res) => {
    // Check for tokens from both JWT and session auth
    const cookieToken = req.cookies?.auth_token || null;
    const headerToken = req.headers.authorization?.split(' ')[1] ?? null;
    const token = cookieToken || headerToken;
    
    // Check session authentication
    const isSessionAuthenticated = req.isAuthenticated && req.isAuthenticated();
    
    // Create detailed response
    const response = {
      jwt: {
        tokenPresent: !!token,
        cookieTokenPresent: !!cookieToken,
        headerTokenPresent: !!headerToken,
        jwtValid: false,
        jwtDecoded: {} as any,
        jwtError: null
      },
      session: {
        authenticated: isSessionAuthenticated,
        sessionId: req.sessionID,
        sessionUser: isSessionAuthenticated ? req.user : null
      },
      cookies: req.cookies,
      headers: {
        authorization: req.headers.authorization,
        cookie: req.headers.cookie,
      }
    };

    // Try to validate the JWT token if present
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        response.jwt.jwtValid = true;
        // Only include non-sensitive parts of the decoded token
        if (typeof decoded === 'object' && decoded !== null) {
          const decodedObj = decoded as jwt.JwtPayload;
          const { iat, exp, ...safeDecoded } = decodedObj;
          response.jwt.jwtDecoded = {
            ...safeDecoded,
            iat: iat ? new Date(iat * 1000).toISOString() : null,
            exp: exp ? new Date(exp * 1000).toISOString() : null,
            expiresIn: exp ? Math.floor((exp * 1000 - Date.now()) / 1000) + ' seconds' : null
          };
        }
      } catch (err: any) {
        response.jwt.jwtValid = false;
        response.jwt.jwtError = err.message;
      }
    }

    // Set response status code based on authentication state
    const statusCode = (response.jwt.jwtValid || response.session.authenticated) ? 200 : 401;
    
    return res.status(statusCode).json(response);
  });

  // Example admin-only route with fallback
  app.get('/api/admin-test', (req, res, next) => {
    // First try JWT auth
    const token = req.cookies?.auth_token;
    if (token) {
      requireAdminJwt(req, res, () => {
        res.json({ 
          message: 'Admin access granted via JWT', 
          user: req.user
        });
      });
    } else {
      // Fall back to session admin check
      if (req.isAuthenticated && req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
        res.json({ 
          message: 'Admin access granted via session', 
          user: req.user
        });
      } else {
        res.status(403).json({ message: 'Admin access required' });
      }
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}