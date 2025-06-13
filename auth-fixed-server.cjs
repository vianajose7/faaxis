/**
 * Auth-Fixed Production Server
 * 
 * This server:
 * 1. Serves static files with correct MIME types
 * 2. Injects authentication fix script
 * 3. Proxies API requests to backend
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const app = express();

// Port configuration
const PORT = process.env.PORT || 3000;
const API_PORT = 5000;

console.log('Starting auth-fixed production server...');

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

// Special handling for index.html to inject auth fix script
app.get('/', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Server Error');
    }
    
    // Read the auth fix script
    const authFixPath = path.join(__dirname, 'auth-fix.js');
    fs.readFile(authFixPath, 'utf8', (err, authFixScript) => {
      if (err) {
        console.error('Error reading auth-fix.js:', err);
        return res.send(data); // Send original if auth fix can't be read
      }
      
      // Inject the auth fix script
      const modifiedHtml = data.replace('</head>', `<script>${authFixScript}</script></head>`);
      
      // Send the modified HTML
      res.send(modifiedHtml);
    });
  });
});

// Same special handling for marketplace and calculator pages
app.get('/marketplace*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Server Error');
    }
    
    // Read the auth fix script
    const authFixPath = path.join(__dirname, 'auth-fix.js');
    fs.readFile(authFixPath, 'utf8', (err, authFixScript) => {
      if (err) {
        console.error('Error reading auth-fix.js:', err);
        return res.send(data); // Send original if auth fix can't be read
      }
      
      // Inject the auth fix script
      const modifiedHtml = data.replace('</head>', `<script>${authFixScript}</script></head>`);
      
      // Send the modified HTML
      res.send(modifiedHtml);
    });
  });
});

app.get('/calculator*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Server Error');
    }
    
    // Read the auth fix script
    const authFixPath = path.join(__dirname, 'auth-fix.js');
    fs.readFile(authFixPath, 'utf8', (err, authFixScript) => {
      if (err) {
        console.error('Error reading auth-fix.js:', err);
        return res.send(data); // Send original if auth fix can't be read
      }
      
      // Inject the auth fix script
      const modifiedHtml = data.replace('</head>', `<script>${authFixScript}</script></head>`);
      
      // Send the modified HTML
      res.send(modifiedHtml);
    });
  });
});

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
  // For all other routes, serve index.html but also inject auth fix
  const indexPath = path.join(publicDir, 'index.html');
  
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Server Error');
    }
    
    // Read the auth fix script
    const authFixPath = path.join(__dirname, 'auth-fix.js');
    fs.readFile(authFixPath, 'utf8', (err, authFixScript) => {
      if (err) {
        console.error('Error reading auth-fix.js:', err);
        return res.send(data); // Send original if auth fix can't be read
      }
      
      // Inject the auth fix script
      const modifiedHtml = data.replace('</head>', `<script>${authFixScript}</script></head>`);
      
      // Send the modified HTML
      res.send(modifiedHtml);
    });
  });
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