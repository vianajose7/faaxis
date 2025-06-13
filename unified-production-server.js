// unified-production-server.js
// Simple, clean production entry point that respects Replit environment
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Import your compiled server entrypoint (the file esbuild spits out)
import { registerRoutes } from './dist/index.js';

// Set NODE_ENV
process.env.NODE_ENV = 'production';

// Ensure we use Replit's PORT
const PORT = process.env.PORT || '3000';
console.log(`Starting server on PORT=${PORT}`);

// Create Express app and server
const app = express();
const server = http.createServer(app);

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Start the server immediately to pass health checks
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Server listening on port ${PORT}`);
  
  try {
    // Register all of your routes (API, JWT, health, etc.)
    await registerRoutes(app);
    
    // Setup static file serving and SPA fallback
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const publicDir = path.join(__dirname, 'dist', 'public');
    
    // Serve static files
    app.use(express.static(publicDir));
    
    // SPA fallback - exclude both /api and /jwt routes
    app.get(/^(?!\/api\/|\/jwt\/).*/, (_req, res) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
    
    console.log('✅ Server initialization complete');
  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
});