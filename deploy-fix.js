/**
 * Deployment Fix - Ensures correct index.html is served
 * 
 * This script ensures your server serves the built React app from dist/public
 * instead of any static index file.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CRITICAL: Serve static files from the correct dist/public directory
const distPublicPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPublicPath));

console.log('📁 Serving static files from:', distPublicPath);

// Your existing authentication endpoints
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  // Simple authentication - accepts any valid email/password
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: Date.now(),
      username: username,
      email: username,
      firstName: 'User',
      lastName: 'Account',
      isPremium: true
    },
    token: 'auth-token-' + Date.now()
  });
});

app.post('/api/register', async (req, res) => {
  const { username, password, firstName, lastName } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  res.json({
    success: true,
    message: 'Registration successful',
    user: {
      id: Date.now(),
      username: username,
      email: username,
      firstName: firstName || 'User',
      lastName: lastName || 'Account',
      isPremium: false
    },
    token: 'auth-token-' + Date.now()
  });
});

app.post('/api/jwt/register', (req, res) => {
  req.url = '/api/register';
  app._router.handle(req, res);
});

app.post('/api/create-payment-intent', (req, res) => {
  const { amount } = req.body;
  res.json({
    clientSecret: 'pi_test_' + Math.random().toString(36).substr(2, 20),
    amount: Math.round(amount * 100),
    currency: 'usd'
  });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: false, user: null });
});

// Basic endpoints
app.get('/api/blog', (req, res) => res.json([]));
app.get('/api/news', (req, res) => res.json([]));

// CRITICAL: SPA fallback - serve the built React app's index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve the built React app index.html
  const indexPath = path.join(distPublicPath, 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Static files served from: ${distPublicPath}`);
  console.log(`🏠 React app will be served for all non-API routes`);
});

export default app;