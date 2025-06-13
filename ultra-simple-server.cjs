/**
 * Ultra-Simple Production Server with MIME Fix
 * 
 * This server focuses on correctly serving JavaScript files
 * to fix the MIME type issue causing white screens.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Get port from environment
const PORT = process.env.PORT || 3000;

console.log('Starting ultra-simple production server...');

// Check if dist/public exists
const publicDir = path.join(__dirname, 'dist/public');
if (!fs.existsSync(publicDir)) {
  console.error(`Error: ${publicDir} directory not found`);
  console.log('Available directories:', fs.readdirSync(__dirname));
  process.exit(1);
}

// Log directory structure for debugging
console.log('Assets directory contents:');
try {
  const assetDir = path.join(publicDir, 'assets');
  if (fs.existsSync(assetDir)) {
    fs.readdirSync(assetDir).forEach(file => {
      console.log(`- ${file}`);
    });
  } else {
    console.log('Assets directory not found');
  }
} catch (err) {
  console.error('Error reading assets directory:', err);
}

// Explicitly serve JS files with correct MIME type
app.get('/assets/*.js', (req, res) => {
  console.log(`Serving JS file with proper MIME type: ${req.path}`);
  res.type('application/javascript');
  res.sendFile(path.join(publicDir, req.path));
});

// Special handling for referenced assets
app.get('/assets/index-5d74068e.js', (req, res) => {
  const assetDir = path.join(publicDir, 'assets');
  const files = fs.readdirSync(assetDir);
  
  // Find the latest index-*.js file
  const jsFiles = files.filter(f => f.startsWith('index-') && f.endsWith('.js'));
  
  if (jsFiles.length > 0) {
    console.log(`Serving alternative JS file: ${jsFiles[0]}`);
    res.type('application/javascript');
    res.sendFile(path.join(assetDir, jsFiles[0]));
  } else {
    console.error('No index-*.js files found in assets directory');
    res.status(404).send('JavaScript file not found');
  }
});

// Static file serving with proper MIME types
app.use(express.static(publicDir, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// API routes - simple mock for now
app.get('/api/blog', (req, res) => {
  res.json({ posts: [{ title: 'Test Blog Post', content: 'This is a test blog post' }] });
});

app.get('/api/news', (req, res) => {
  res.json({ articles: [{ title: 'Test News Article', content: 'This is a test news article' }] });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});