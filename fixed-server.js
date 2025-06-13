/**
 * Fixed Production Server
 * 
 * This server fixes two critical issues:
 * 1. Uses the environment PORT variable instead of hardcoded 5000
 * 2. Properly mounts the JWT router at /jwt
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

// Production environment
process.env.NODE_ENV = 'production';

// Always use environment PORT variable with fallback
const PORT = process.env.PORT || 3000;
console.log(`Starting server on PORT=${PORT}`);

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Essential middleware before routes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Set proper security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Import API routes
console.log('Loading API routes from dist/index.js');
const apiRoutesPromise = import('./dist/index.js')
  .then(module => {
    if (typeof module.registerRoutes === 'function') {
      console.log('API routes module loaded successfully');
      return module.registerRoutes;
    } else {
      console.error('registerRoutes not found in module, using fallback');
      return null;
    }
  })
  .catch(err => {
    console.error('Failed to load API routes, using fallback:', err);
    return null;
  });

// Import JWT router
console.log('Loading JWT router');
const jwtRouterPromise = import('./dist/jwt-auth.js')
  .then(module => {
    // Check if the module exports jwtRouter directly
    if (module.jwtRouter) {
      console.log('Found jwtRouter export, using it directly');
      return module.jwtRouter;
    } 
    // Or if we need to create it through setupJwtAuth
    else if (typeof module.setupJwtAuth === 'function') {
      console.log('Using setupJwtAuth to create router');
      // Create a mock app to extract the router
      const mockApp = {
        use: (path, router) => {
          if (path === '/jwt') {
            console.log('Extracted JWT router from setupJwtAuth');
            return router;
          }
        }
      };
      return module.setupJwtAuth(mockApp);
    } else {
      console.error('No JWT router found in module');
      return null;
    }
  })
  .catch(err => {
    console.error('Failed to load JWT router:', err);
    return null;
  });

// Wait for all route modules to load
Promise.all([apiRoutesPromise, jwtRouterPromise])
  .then(([registerRoutes, jwtRouter]) => {
    if (registerRoutes) {
      // Mount API routes
      console.log('Mounting API routes');
      registerRoutes(app, server);
    }
    
    // Explicitly mount JWT router at /jwt path
    if (jwtRouter) {
      console.log('Mounting JWT router at /jwt path');
      app.use('/jwt', jwtRouter);
    } else {
      console.warn('No JWT router available to mount');
    }
    
    // Static files AFTER routes
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const publicDir = path.join(__dirname, 'dist', 'public');
    console.log(`Serving static files from: ${publicDir}`);
    app.use(express.static(publicDir));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).send('OK');
    });
    
    // SPA fallback for client routes
    app.get('*', (req, res) => {
      const indexPath = path.join(publicDir, 'index.html');
      console.log(`Serving SPA fallback: ${indexPath}`);
      res.sendFile(indexPath);
    });
    
    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server started successfully on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });