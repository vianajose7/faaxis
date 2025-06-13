/**
 * Stripe Fix - Production Server
 * 
 * This file provides a production-ready server specifically configured
 * to ensure Stripe integration works properly.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { registerRoutes } from './dist/server/routes.js';

// Initialize Express application
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Verify Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY is missing. Stripe payments will not work.');
  // Don't proceed if this key is missing
  process.exit(1); 
}

if (!process.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('ERROR: VITE_STRIPE_PUBLIC_KEY is missing. Stripe payments will not work.');
  // Don't proceed if this key is missing
  process.exit(1);
}

console.log('Stripe configuration verified.');
console.log(`Stripe mode: ${process.env.STRIPE_SECRET_KEY.startsWith('sk_test') ? 'TEST' : 'LIVE'}`);

// Serve static files from the built client app
const publicDir = path.join(__dirname, 'dist/public');
console.log(`Serving static files from: ${publicDir}`);
app.use(express.static(publicDir));

// Create HTTP server
const server = http.createServer(app);

// Start server and register routes
async function startServer() {
  try {
    console.log('Starting server with Stripe support...');
    
    // Register all API routes
    await registerRoutes(app, server);
    
    // SPA fallback - serve index.html for all non-API routes
    app.get(/^(?!\/api\/|\/jwt\/).*/, (req, res) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();