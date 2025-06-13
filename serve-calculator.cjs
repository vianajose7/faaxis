/**
 * Simple Calculator Server
 * 
 * This server focuses solely on making the calculator available
 * without requiring authentication.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static files from dist/public
app.use(express.static('dist/public'));

// Serve the direct calculator at /calc
app.get('/calc', (req, res) => {
  res.sendFile(path.join(__dirname, 'direct-calculator.html'));
});

// Handle SPA routing for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('✅ Direct calculator available at /calc');
  console.log('Visit /calc for calculator access without authentication');
});