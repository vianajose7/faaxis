// Simple MIME-fixing production server
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Get port from environment
const PORT = process.env.PORT || 3000;

console.log('Starting MIME-fixed production server...');

// Check if dist/public exists
const publicDir = path.join(__dirname, 'dist/public');
if (!fs.existsSync(publicDir)) {
  console.error(`Error: ${publicDir} directory not found`);
  process.exit(1);
}

// Special handling for JavaScript files
app.get('*.js', (req, res) => {
  console.log(`Serving JS file with proper MIME type: ${req.path}`);
  const filePath = path.join(publicDir, req.path);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.set('Content-Type', 'application/javascript');
    res.sendFile(filePath);
  } else {
    console.error(`File not found: ${filePath}`);
    res.status(404).send('Not found');
  }
});

// Handle assets with explicit MIME types
app.get('/assets/*', (req, res, next) => {
  const filePath = path.join(publicDir, req.path);
  const ext = path.extname(filePath).toLowerCase();
  
  // Set correct MIME type based on file extension
  if (ext === '.js') {
    res.set('Content-Type', 'application/javascript');
  } else if (ext === '.css') {
    res.set('Content-Type', 'text/css');
  } else if (ext === '.png') {
    res.set('Content-Type', 'image/png');
  } else if (ext === '.jpg' || ext === '.jpeg') {
    res.set('Content-Type', 'image/jpeg');
  } else if (ext === '.svg') {
    res.set('Content-Type', 'image/svg+xml');
  }
  
  next();
});

// Serve static files
app.use(express.static(publicDir));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});