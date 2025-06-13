// production-deployment-fixed.js
// Clean, consolidated server entry point that addresses all issues

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Environment setup - use Replit's PORT variable
process.env.NODE_ENV = 'production';
const PORT = process.env.PORT || 3000;
console.log(`Starting server on PORT=${PORT}`);

// Create Express app and server
const app = express();
const server = http.createServer(app);

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize server immediately to pass health checks
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
  
  // Continue with the rest of initialization asynchronously
  continueInitialization().catch(err => {
    console.error('Error during initialization:', err);
  });
});

// Separate function for post-listen initialization
async function continueInitialization() {
  try {
    // Import server module and register routes
    console.log('Loading server from dist/index.js');
    const { registerRoutes } = await import('./dist/index.js');
    await registerRoutes(app, server);
    console.log('✓ API routes registered successfully');
    
    // Health check endpoint (fallback if not already defined)
    app.get('/health', (req, res) => res.status(200).send('OK'));
    
    // Static files AFTER routes
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const publicDir = path.join(__dirname, 'dist', 'public');
    console.log(`Serving static files from: ${publicDir}`);
    app.use(express.static(publicDir));
    
    // SPA fallback for client routes - IMPORTANT: exclude both /api and /jwt routes
    app.get(/^(?!\/api\/|\/jwt\/).*/, (req, res) => {
      const indexPath = path.join(publicDir, 'index.html');
      res.sendFile(indexPath);
    });
    
    console.log('✅ Server initialization complete');
  } catch (error) {
    console.error('Server initialization error:', error);
  }
}