import express from 'express';
import http from 'http';
import cors from 'express';

const API_PORT = process.env.API_PORT || 5001;
const app = express();

// Add middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', server: 'jwt-api-check' });
});

// Diagnostic route for JWT status
app.get('/jwt/status', (req, res) => {
  console.log('JWT status endpoint hit');
  res.status(200).json({ 
    status: 'ok',
    message: 'JWT routes are registered and working',
    timestamp: new Date().toISOString()
  });
});

// Debug route to echo request details
app.all('/jwt/*', (req, res) => {
  console.log(`JWT request received: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  res.status(200).json({
    message: 'JWT endpoint debug info',
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

// JWT registration mock endpoint
app.post('/jwt/register', (req, res) => {
  console.log('JWT register endpoint hit with body:', req.body);
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      error: 'Missing required fields',
      requiredFields: ['username', 'password']
    });
  }
  
  res.status(201).json({
    id: Date.now(),
    username,
    message: 'User registration successful (mock)',
    timestamp: new Date().toISOString()
  });
});

// JWT login mock endpoint
app.post('/jwt/login', (req, res) => {
  console.log('JWT login endpoint hit with body:', req.body);
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      error: 'Missing required fields',
      requiredFields: ['username', 'password']
    });
  }
  
  res.status(200).json({
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: Date.now(),
      username
    },
    message: 'Login successful (mock)',
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = http.createServer(app);
server.listen(API_PORT, () => {
  console.log(`🚀 JWT API check server running on port ${API_PORT}`);
  console.log(`Try these endpoints:`);
  console.log(`  GET  http://localhost:${API_PORT}/health`);
  console.log(`  GET  http://localhost:${API_PORT}/jwt/status`);
  console.log(`  POST http://localhost:${API_PORT}/jwt/register`);
  console.log(`  POST http://localhost:${API_PORT}/jwt/login`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close();
  process.exit(0);
});