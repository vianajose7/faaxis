// replit-server.js - Clean production server for Replit
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Environment setup - CRITICAL: Use Replit's PORT variable
process.env.NODE_ENV = 'production';
const PORT = process.env.PORT || 3000;
console.log(`Starting server on PORT=${PORT}`);

// Create Express app
const app = express();
const server = http.createServer(app);

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API routes first (processed before static files)
console.log('Loading API routes...');
try {
  // Import the main server module
  const { registerRoutes } = await import('./dist/index.js');
  await registerRoutes(app, server);
  console.log('✓ API routes registered successfully');
} catch (error) {
  console.error('Failed to load API routes:', error);
}

// Health check endpoint for load balancer
app.get('/health', (req, res) => res.status(200).send('OK'));

// Static files AFTER routes
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'dist', 'public');
console.log(`Serving static files from: ${publicDir}`);
app.use(express.static(publicDir));

// SPA fallback for client routes
const indexPath = path.join(publicDir, 'index.html');
app.get('*', (req, res) => res.sendFile(indexPath));

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});