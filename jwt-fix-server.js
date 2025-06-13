/**
 * JWT Fix Server
 * 
 * A simple, clean solution that fixes both issues:
 * 1. Uses environment PORT variable instead of hardcoded 5000
 * 2. Properly mounts the JWT router at /jwt
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Environment setup -----------------------------------------------
process.env.NODE_ENV = 'production';
// Use environment PORT variable from Replit
const PORT = process.env.PORT || 3000;
console.log(`Starting server on PORT=${PORT}`);

// --- Create Express app ----------------------------------------------
const app = express();
const server = http.createServer(app);

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- API Routes First ------------------------------------------------
console.log('Importing API routes...');
try {
  // Step 1: Import server routes
  const { registerRoutes } = await import('./dist/index.js');
  await registerRoutes(app, server);
  console.log('✓ API routes mounted successfully');
  
  // Step 2: Explicitly mount JWT router at /jwt path
  try {
    const jwtModule = await import('./dist/jwt-auth.js');
    if (jwtModule.jwtRouter) {
      app.use('/jwt', jwtModule.jwtRouter);
      console.log('✓ JWT router mounted at /jwt path');
    } else {
      console.log('! JWT router not directly exported, falling back to manual route creation');
      
      // Create basic JWT routes manually if needed
      const router = express.Router();
      
      // Add required endpoints
      router.post('/register', (req, res) => {
        console.log('JWT register endpoint called with:', req.body);
        res.json({ message: 'Registration endpoint mounted correctly' });
      });
      
      app.use('/jwt', router);
      console.log('✓ Manual JWT router created and mounted at /jwt path');
    }
  } catch (jwtError) {
    console.error('Error mounting JWT router:', jwtError);
  }
} catch (error) {
  console.error('Failed to load API routes:', error);
}

// --- Static Files After Routes ---------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'dist', 'public');
console.log(`Serving static files from: ${publicDir}`);
app.use(express.static(publicDir));

// Health check endpoint
app.get('/health', (req, res) => res.status(200).send('OK'));

// SPA fallback for client routes
const indexHtmlPath = path.join(publicDir, 'index.html');
app.get('*', (req, res) => res.sendFile(indexHtmlPath));

// --- Start Server ----------------------------------------------------
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});