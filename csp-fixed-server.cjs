/**
 * Production Server with CSP Fixes
 * Serves files with proper MIME types and CSP headers
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Port configuration
const PORT = process.env.PORT || 3000;

console.log('Starting production server with CSP fixes...');

// Public directory
const publicDir = path.join(__dirname, 'dist/public');

// MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Add CSP and security headers
app.use((req, res, next) => {
  // Set CSP headers to allow necessary connections
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.openai.com https://api.perplexity.ai 
                 https://api.stripe.com https://*.stripe.com https://www.linkedin.com
                 wss://${req.hostname} ws://${req.hostname} ws://0.0.0.0:* wss://0.0.0.0:*;
    frame-src 'self' https://js.stripe.com https://*.stripe.com;
  `.replace(/\s+/g, ' ').trim());
  
  // Set other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

// Serve all files with custom MIME types
app.use((req, res, next) => {
  // Skip for API routes
  if (req.path.startsWith('/api/')) return next();
  
  // Get file path
  const filePath = path.join(publicDir, req.path === '/' ? 'index.html' : req.path);
  const ext = path.extname(filePath).toLowerCase();
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file doesn't exist, try index.html (SPA fallback)
      if (req.path !== '/' && !req.path.includes('.')) {
        res.sendFile(path.join(publicDir, 'index.html'));
      } else {
        next();
      }
      return;
    }
    
    // Set correct content type
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
    
    // Send the file
    res.sendFile(filePath);
  });
});

// Mock API routes for basic functionality
app.get('/api/blog', (req, res) => {
  res.json({ posts: [{ title: 'Blog Post', content: 'Content' }] });
});

app.get('/api/news', (req, res) => {
  res.json({ articles: [{ title: 'News Article', content: 'Content' }] });
});

// Static file serving (as fallback)
app.use(express.static(publicDir));

// SPA fallback (last resort)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});