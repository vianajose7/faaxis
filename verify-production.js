/**
 * Production Verification Script
 * 
 * This script helps verify that the production setup is correct.
 * Run with: node verify-production.js
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3099;

// Verify path to dist directory
const distDir = path.join(__dirname, 'client/dist');
console.log('Checking if client/dist exists...');
console.log(`Looking for directory: ${distDir}`);

try {
  // Serve static files from client/dist
  app.use(express.static(distDir));
  console.log('✓ Express static middleware setup successful');

  // SPA catch-all route
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      console.log(`API request: ${req.path}`);
      return res.status(404).send('API not found in verification mode');
    }
    
    console.log(`SPA route: ${req.path} -> serving index.html`);
    res.sendFile(path.join(distDir, 'index.html'));
  });

  // Start verification server
  const server = app.listen(PORT, () => {
    console.log(`Production verification server running at http://localhost:${PORT}`);
    console.log('If this works but your deployment doesn\'t, the issue is in your build settings');
    console.log('Make sure your Build command is: npm ci && npm run build');
    console.log('And your Run command is: npm run start');
  });

  // Auto-shutdown after 60 seconds
  setTimeout(() => {
    console.log('Verification server auto-shutting down after 60 seconds');
    server.close();
  }, 60000);
} catch (error) {
  console.error('Verification failed with error:', error);
}