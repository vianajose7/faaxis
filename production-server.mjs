/**
 * Simplified Production Server
 * 
 * A clean approach that:
 * 1. Serves static files with the correct paths
 * 2. Properly forwards API requests
 * 3. Uses environment variables for configuration
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

console.log(`Starting production server in ${NODE_ENV} mode...`);

// Verify dist/public directory exists
const publicDir = path.join(__dirname, 'dist/public');
if (!fs.existsSync(publicDir)) {
  console.error(`Error: ${publicDir} directory does not exist`);
  console.log('Available directories:', fs.readdirSync(__dirname));
  process.exit(1);
}

// Static file serving
app.use(express.static(publicDir));

// Serve index.html for all routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on port ${PORT}`);
});