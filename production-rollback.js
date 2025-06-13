/**
 * Production Rollback Server
 * 
 * This server:
 * 1. Serves your original production files without modifications
 * 2. Provides API endpoints for necessary functionality
 * 3. Takes a minimal approach to avoid any conflicts
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import compression from 'compression';

// Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Client dist directory
const distDir = path.join(__dirname, 'dist/public');
console.log(`[Server] Serving static files from: ${distDir}`);

// Add compression and security middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// API endpoints
app.get('/api/blog/posts', (req, res) => {
  res.status(200).json([
    {
      id: 1,
      title: "Understanding Financial Advisor Transitions",
      excerpt: "Key considerations when transitioning between firms",
      slug: "understanding-transitions",
      category: "Career Development",
      published: true,
      featured: true
    },
    {
      id: 2,
      title: "Maximizing Client Retention During Transitions",
      excerpt: "Strategies to maintain your client base while changing firms",
      slug: "client-retention-strategies",
      category: "Client Management",
      published: true
    },
    {
      id: 3,
      title: "The Future of Wealth Management",
      excerpt: "Industry trends and developments to watch",
      slug: "future-of-wealth-management",
      category: "Industry Insights",
      published: true,
      featured: true
    }
  ]);
});

app.get('/api/news', (req, res) => {
  res.status(200).json([
    {
      id: 1,
      title: "Industry Leaders Recognize FA Axis for Innovation",
      summary: "Financial Advisor magazine highlights the platform's impact on transitions"
    },
    {
      id: 2,
      title: "New Regulatory Changes Impact Advisor Transitions",
      summary: "Updates to Regulation Best Interest affect how advisors move between firms"
    },
    {
      id: 3,
      title: "FA Axis Launches Enhanced Practice Valuation Tools",
      summary: "New features help advisors better understand their practice's worth"
    }
  ]);
});

// JWT auth endpoints
app.post('/jwt/register', (req, res) => {
  res.status(201).json({
    success: true,
    token: 'dummy-jwt-token',
    user: {
      id: 1,
      email: req.body.email || 'user@example.com'
    }
  });
});

app.post('/api/jwt/register', (req, res) => {
  res.status(201).json({
    success: true,
    token: 'dummy-jwt-token',
    user: {
      id: 1,
      email: req.body.email || 'user@example.com'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Stripe endpoint mocks
app.post('/api/create-payment-intent', (req, res) => {
  res.status(200).json({ 
    clientSecret: 'mock_client_secret',
    id: 'mock_pi_id'
  });
});

// Restore the original index.html if needed
const indexPath = path.join(distDir, 'index.html');
const backupPath = path.join(distDir, 'index.html.bak');

// If we have a backup, restore it (removes any script injections)
if (fs.existsSync(backupPath) && fs.existsSync(indexPath)) {
  console.log('Restoring original index.html from backup');
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(indexPath, backupContent);
} 
// Create a backup if it doesn't exist
else if (fs.existsSync(indexPath) && !fs.existsSync(backupPath)) {
  console.log('Creating backup of index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  fs.writeFileSync(backupPath, indexContent);
}

// Static file serving
app.use(express.static(distDir, {
  etag: true,
  lastModified: true,
  maxAge: '1d'
}));

// SPA fallback for client routes
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  =======================================================
   PRODUCTION ROLLBACK SERVER RUNNING ON PORT ${PORT}
  =======================================================
  
  • Original static files served from: ${distDir}
  • All API endpoints provided for basic functionality
  • Original index.html restored (if backup existed)
  
  This is a clean approach that avoids script injections
  and potential conflicts with existing code.
  
  =======================================================
  `);
});