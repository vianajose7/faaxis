/**
 * Complete Production Server
 * 
 * This server:
 * 1. Serves static files with correct MIME types
 * 2. Proxies API requests to backend for auth
 * 3. Has relaxed CSP headers for proper functionality
 * 4. Handles JWT endpoints correctly
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const app = express();

// Port configuration
const PORT = process.env.PORT || 3000;
const API_PORT = 5000;

console.log('Starting complete production server...');

// Public directory
const publicDir = path.join(__dirname, 'dist/public');

// Add relaxed CSP headers that allow everything needed
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
  next();
});

// Proxy API requests to the API server
const { createProxyMiddleware } = require('http-proxy-middleware');

// API proxy for all /api routes
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('API proxy error:', err.message);
    res.status(500).json({ error: 'API service unavailable' });
  }
}));

// JWT proxy for all /jwt routes
app.use('/jwt', createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('JWT proxy error:', err.message);
    res.status(500).json({ error: 'JWT service unavailable' });
  }
}));

// Static file serving with correct MIME types
app.use(express.static(publicDir, {
  setHeaders: (res, path) => {
    // Set proper content types based on file extension
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start API server
const apiServer = spawn('node', ['dist/index.js'], {
  env: { ...process.env, PORT: API_PORT.toString() },
  stdio: 'inherit'
});

console.log(`Starting API server on port ${API_PORT}...`);

apiServer.on('error', (err) => {
  console.error('Failed to start API server:', err);
});

// Handle shutdown gracefully
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 API server running on port ${API_PORT}`);
});