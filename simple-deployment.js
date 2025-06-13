/**
 * Ultra-Simple Deployment Server for FA Axis
 * This minimal server should work reliably in all deployment environments
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting FA Axis simple deployment server...');
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV || 'production');

// Basic middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'dist', 'public')));

// Health check
app.get('/health', (req, res) => {
  res.send('OK');
});

// Basic API endpoints
app.post('/api/register', (req, res) => {
  res.json({ success: true });
});

app.post('/api/jwt/register', (req, res) => {
  res.json({ success: true });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ success: true });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ FA Axis server running on port ${PORT}`);
});