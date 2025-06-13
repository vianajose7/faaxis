/**
 * Fixed Production Server with Relaxed CSP
 * 
 * This server:
 * 1. Serves static files with correct MIME types
 * 2. Sets relaxed CSP headers to fix auth and font loading issues
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Port configuration
const PORT = process.env.PORT || 3000;

console.log('Starting production server with relaxed CSP...');

// Public directory
const publicDir = path.join(__dirname, 'dist/public');

// Add relaxed CSP headers that allow everything needed
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
  next();
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

// Simple API mock routes
app.get('/api/blog', (req, res) => {
  res.json({ posts: [{ title: 'Blog Post', content: 'Content' }] });
});

app.get('/api/news', (req, res) => {
  res.json({ articles: [{ title: 'News Article', content: 'Content' }] });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});