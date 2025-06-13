import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';
import { createProxyMiddleware } from 'http-proxy-middleware';

console.log('▶️  Simple production server starting...');

// Port setup and monkey-patching to handle hard-coded port 5000
const PORT     = process.env.PORT     || 3000;
const API_PORT = process.env.API_PORT || 5001; // Use 5001 instead of 3001 to avoid conflicts with 5000

// Monkey-patch http.Server.prototype.listen to handle port 5000 redirections
console.log('⚙️  Setting up port monkey-patching (5000 → API_PORT)');
const origListen = http.Server.prototype.listen;
http.Server.prototype.listen = function(...args) {
  if ((args[0] === 5000) || (args[0]?.port === 5000)) {
    console.log(`⚠️  Intercepted port 5000 binding request, redirecting to ${API_PORT}`);
    args[0] = typeof args[0] === 'number'
      ? API_PORT
      : { ...args[0], port: API_PORT };
  }
  return origListen.apply(this, args);
};

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1) Static + health‐check server
const app = express();
app.get('/health', (_req, res) => {
  console.log('Health check endpoint hit');
  res.sendStatus(200);
});
app.use(express.static(path.join(__dirname, 'dist/public')));

// 2) API proxy for both /api and /jwt routes with specialized configurations
// Basic API proxy configuration
const apiProxy = createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  ws: true,
  logLevel: 'debug', // Add debug logging to see proxy requests
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying API request: ${req.method} ${req.url} → ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('API proxy error:', err);
    res.status(503).send('API Service Temporarily Unavailable');
  }
});

// JWT proxy with potential path rewriting
const jwtProxy = createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  // Option 1: No path rewriting - preserves /jwt prefix
  // Option 2: Strip /jwt prefix if your API expects it
  // pathRewrite: { '^/jwt': '' },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying JWT request: ${req.method} ${req.url} → ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('JWT proxy error:', err);
    res.status(503).json({
      error: 'JWT Service Temporarily Unavailable',
      details: err.message,
      url: req.originalUrl
    });
  }
});

// Proxy /api routes
app.use('/api', apiProxy);

// Proxy /jwt routes - needed for authentication endpoints
app.use('/jwt', jwtProxy);

// 3) SPA fallback - exclude both /api and /jwt paths
app.get(/^(?!\/api\/|\/jwt\/).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

// 4) Fork the real API server
function startApiServer() {
  console.log(`▶️  Forking API server on ${API_PORT}`);
  
  // In a testing environment where development server is running,
  // don't actually start the API server to avoid port conflicts
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Development environment detected - simulating API server');
    
    // Create a dummy event emitter to simulate API process
    const mockApi = new EventTarget();
    
    // Add a dummy kill method
    mockApi.kill = () => console.log('Simulated API server shutdown');
    
    // Add a route to handle /api/health manually since we're not starting the real API
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        simulated: true,
        timestamp: new Date().toISOString()
      });
    });
    
    return mockApi;
  }
  
  // Normal production mode - actually fork the API server
  const api = fork(path.join(__dirname, 'dist/index.js'), [], {
    env: { ...process.env, PORT: API_PORT.toString() },
    stdio: 'inherit' // Inherit stdio to see API logs directly
  });
  
  api.on('error', (err) => console.error('❌ API process error:', err));
  
  api.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ API exited (${code}), restarting…`);
      setTimeout(startApiServer, 5000);
    }
  });
  
  return api;
}

const apiProcess = startApiServer();

// 5) Launch static+proxy server
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
  console.log(`✅ Production server listening on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend: http://localhost:${PORT}/`);
  console.log(`🛠️  Proxying /api → http://localhost:${API_PORT}/`);
});

// 6) Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down…');
  apiProcess.kill();
  httpServer.close();
  process.exit(0);
});