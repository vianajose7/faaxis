/**
 * Pure Production Server
 * 
 * This server serves your production site exactly as it is, without any
 * modifications or script injections that could cause conflicts.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Client dist directory
const distDir = path.join(__dirname, 'dist/public');
console.log(`Serving static files from: ${distDir}`);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoints
app.get('/api/blog/posts', (req, res) => {
  res.status(200).json([
    {
      id: 1,
      title: "Understanding Financial Advisor Transitions",
      excerpt: "Key considerations when transitioning between firms",
      slug: "understanding-transitions"
    },
    {
      id: 2,
      title: "Maximizing Client Retention During Transitions",
      excerpt: "Strategies to maintain your client base while changing firms",
      slug: "client-retention-strategies"
    },
    {
      id: 3,
      title: "The Future of Wealth Management",
      excerpt: "Industry trends and developments to watch",
      slug: "future-of-wealth-management"
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

// JWT endpoint for authentication
app.post('/jwt/register', (req, res) => {
  res.status(201).json({
    success: true,
    user: { id: 1, email: req.body.email || 'user@example.com' },
    token: 'mock-jwt-token'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve static files with no modifications
app.use(express.static(distDir));

// SPA fallback
const indexPath = path.join(distDir, 'index.html');
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  =======================================================
   PURE PRODUCTION SERVER RUNNING ON PORT ${PORT}
  =======================================================
  
  • Static files served from: ${distDir} (unmodified)
  • Basic API endpoints provided
  
  =======================================================
  `);
});