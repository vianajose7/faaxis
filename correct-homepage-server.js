#!/usr/bin/env node

/**
 * Correct Homepage Development Server
 * 
 * This server ensures your development environment shows the exact same
 * FA Axis homepage as your production site at faaxis.com
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Disable any redirects
app.set('trust proxy', false);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/public
const publicDir = path.join(__dirname, 'dist/public');
console.log(`📂 Serving static files from: ${publicDir}`);

app.use(express.static(publicDir, {
  maxAge: '1h',
  etag: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
    // Prevent any caching issues
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Basic API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/news', (req, res) => {
  res.json({ articles: [] });
});

app.get('/api/blog', (req, res) => {
  res.json({ posts: [] });
});

// SPA fallback - always serve index.html for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(publicDir, 'index.html');
  console.log(`📄 Serving FA Axis homepage from: ${indexPath}`);
  
  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 FA Axis Development Server Started!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏠 Serving your FA Axis homepage with "Your Next Move, Simplified"`);
  console.log(`📁 Files from: ${publicDir}`);
});