#!/usr/bin/env node

/**
 * Development Server with Built Files
 * 
 * This server runs your development environment but serves the production-built
 * files from dist/public instead of using Vite's development mode.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// We'll add basic API endpoints instead of importing routes

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Disable trust proxy to prevent HTTPS redirects in development
app.set('trust proxy', false);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/public (your built React app)
const publicDir = path.join(__dirname, 'dist/public');
console.log(`📂 Serving static files from: ${publicDir}`);

// Serve static files with proper headers for JavaScript modules
app.use(express.static(publicDir, {
  maxAge: '1h',
  etag: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Add basic API endpoints that your app needs
console.log('🔗 Setting up API endpoints...');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// News endpoint (basic response to prevent 404s)
app.get('/api/news', (req, res) => {
  res.json({ articles: [], message: 'News service available' });
});

// Blog endpoint (basic response to prevent 404s) 
app.get('/api/blog', (req, res) => {
  res.json({ posts: [], message: 'Blog service available' });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(publicDir, 'index.html');
  console.log(`📄 Serving index.html from: ${indexPath}`);
  res.sendFile(indexPath);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Development server started!');
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`📁 Serving built files from: dist/public`);
  console.log('✨ Your app should now use the correct production index file!');
});