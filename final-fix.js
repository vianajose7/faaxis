/**
 * Final Production Fix
 * 
 * This file combines both fixes needed for production:
 * 1. Uses process.env.PORT to avoid port conflicts
 * 2. Properly loads and mounts the JWT router
 */

import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Environment setup
process.env.NODE_ENV = 'production';
const PORT = process.env.PORT || 3000;
console.log(`Starting server on PORT=${PORT}`);

// Create Express app
const app = express();
const server = http.createServer(app);

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import server modules
console.log('Loading server modules...');
try {
  const { default: indexModule } = await import('./dist/index.js');
  
  // If the module exports a function, call it with the app
  if (typeof indexModule === 'function') {
    console.log('Calling server index as a function');
    await indexModule(app, server);
  } else {
    console.log('Server index is not a function, trying registerRoutes');
    
    // If not a function, try to get registerRoutes
    const { registerRoutes } = await import('./dist/index.js');
    if (typeof registerRoutes === 'function') {
      console.log('Calling registerRoutes');
      await registerRoutes(app, server);
    } else {
      console.error('No registerRoutes function found');
    }
  }
  
  // Mount JWT router explicitly
  console.log('Attempting to load and mount JWT router...');
  try {
    // Try to import the jwt-auth module
    const jwtAuthModule = await import('./dist/jwt-auth.js');
    
    // Check for different exports to handle
    if (jwtAuthModule.jwtRouter) {
      console.log('Found jwtRouter export - mounting at /jwt');
      app.use('/jwt', jwtAuthModule.jwtRouter);
    } else if (typeof jwtAuthModule.setupJwtAuth === 'function') {
      console.log('No direct router found, using setupJwtAuth function');
      jwtAuthModule.setupJwtAuth(app);
      
      // Additional explicit mounting to ensure /jwt path works
      console.log('Adding extra explicit mount for JWT router at /jwt');
      
      // Create basic endpoints at /jwt/* for critical functionality
      const tempRouter = express.Router();
      
      tempRouter.post('/register', async (req, res) => {
        console.log('JWT register endpoint called with body:', req.body);
        // Forward to the regular registration endpoint
        try {
          const response = await fetch(`http://localhost:${PORT}/api/jwt/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
          });
          
          const data = await response.json();
          return res.status(response.status).json(data);
        } catch (error) {
          console.error('Error forwarding registration:', error);
          return res.status(500).json({ error: 'Registration forwarding failed' });
        }
      });
      
      app.use('/jwt', tempRouter);
    } else {
      console.warn('JWT module found but no router or setup function available');
    }
  } catch (jwtError) {
    console.error('Error loading JWT module:', jwtError);
  }
} catch (error) {
  console.error('Failed to load server modules:', error);
}

// Health check endpoint
app.get('/health', (req, res) => res.status(200).send('OK'));

// Static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'dist', 'public');
console.log(`Serving static files from: ${publicDir}`);
app.use(express.static(publicDir));

// SPA fallback
const indexPath = path.join(publicDir, 'index.html');
if (fs.existsSync(indexPath)) {
  console.log(`SPA fallback found at: ${indexPath}`);
  app.get('*', (req, res) => res.sendFile(indexPath));
} else {
  console.warn(`Index HTML not found at: ${indexPath}`);
  app.get('*', (req, res) => res.send('Application is starting up...'));
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});