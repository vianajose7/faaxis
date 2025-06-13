/**
 * Simple Production Static File Server
 * Serves files with proper MIME types
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Port configuration
const PORT = process.env.PORT || 3000;

console.log('Starting production static file server...');

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