/**
 * Fixed Production Server
 * 
 * This server:
 * 1. Serves static files with correct MIME types
 * 2. Proxies API requests to the backend
 * 3. Handles SPA routing properly
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';

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

// Set proper MIME types
app.use((req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  
  if (ext === '.js' || ext === '.mjs' || req.path.includes('index-')) {
    res.type('application/javascript');
  } else if (ext === '.css') {
    res.type('text/css');
  } else if (ext === '.json') {
    res.type('application/json');
  } else if (ext === '.png') {
    res.type('image/png');
  } else if (ext === '.jpg' || ext === '.jpeg') {
    res.type('image/jpeg');
  } else if (ext === '.svg') {
    res.type('image/svg+xml');
  } else if (ext === '.woff') {
    res.type('font/woff');
  } else if (ext === '.woff2') {
    res.type('font/woff2');
  } else if (ext === '.ttf') {
    res.type('font/ttf');
  } else if (ext === '.eot') {
    res.type('application/vnd.ms-fontobject');
  }
  
  next();
});

// Main API proxy for all /api routes
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' },
  onError: (err, req, res) => {
    console.error('API proxy error:', err.message);
    res.status(500).json({ error: 'API service unavailable' });
  }
}));

// JWT proxy for all /jwt routes
app.use('/jwt', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: { '^/jwt': '/jwt' },
  onError: (err, req, res) => {
    console.error('JWT proxy error:', err.message);
    res.status(500).json({ error: 'JWT service unavailable' });
  }
}));

// Static file serving
app.use(express.static(publicDir, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set proper content type for JavaScript files
    if (filePath.endsWith('.js') || filePath.includes('index-')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    // Add proper caching headers
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Start API server
import { spawn } from 'child_process';
const apiServer = spawn('node', ['dist/index.js'], {
  env: { ...process.env, PORT: '5000' },
  stdio: 'inherit'
});

apiServer.on('error', (err) => {
  console.error('Failed to start API server:', err);
});

// Listen for process exit and kill child process
process.on('exit', () => {
  console.log('Shutting down API server...');
  apiServer.kill();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  apiServer.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  apiServer.kill();
  process.exit(0);
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`👉 API server running on port 5000`);
});