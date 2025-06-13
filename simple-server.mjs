/**
 * Simple Production Server
 * 
 * This server:
 * 1. Serves static files cleanly without script injections
 * 2. Properly routes API and JWT endpoints
 * 3. Uses environment variables for port configuration
 */

import express from 'express';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;

console.log('Starting simple production server...');

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, 'dist/public'), {
  index: false, // Don't serve index.html for root paths yet
}));

// Main API proxy for all /api routes (except the ones we handle specially)
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

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

// Start API server
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

// Start main server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`👉 API server running on port 5000`);
});