import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { router as authRouter, authenticate } from "./auth.js";

export function registerRoutes(app: Express): Server {
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Mount auth routes
  app.use('/api/auth', authRouter);
  
  // Protected API routes - using the authenticate middleware
  app.get('/api/protected-example', authenticate, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
  });
  
  // All other API routes...
  
  const httpServer = createServer(app);
  return httpServer;
}