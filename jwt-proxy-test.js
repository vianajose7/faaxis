import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const PORT = 4000;
const API_PORT = 4001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple API server
const apiApp = express();
apiApp.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', server: 'api' });
});

// This logs all incoming requests to the API server for debugging
apiApp.use((req, res, next) => {
  console.log(`[API SERVER] ${req.method} ${req.url} - Headers:`, JSON.stringify(req.headers));
  next();
});

apiApp.get('/status', (req, res) => {
  console.log('[API] Status endpoint hit (without /jwt prefix)');
  res.status(200).json({ 
    status: 'ok', 
    message: 'Status endpoint works (without /jwt prefix)',
    path: req.path,
    originalUrl: req.originalUrl
  });
});

apiApp.get('/jwt/status', (req, res) => {
  console.log('[API] JWT status endpoint hit (with /jwt prefix)');
  res.status(200).json({ 
    status: 'ok', 
    message: 'JWT status endpoint works (with /jwt prefix)',
    path: req.path,
    originalUrl: req.originalUrl
  });
});

apiApp.post('/jwt/register', (req, res) => {
  console.log('[API] JWT register endpoint hit');
  res.status(200).json({ 
    status: 'ok', 
    message: 'Registration would succeed',
    path: req.path
  });
});

// Start API server
const apiServer = http.createServer(apiApp);
apiServer.listen(API_PORT, () => {
  console.log(`🚀 Test API server listening on port ${API_PORT}`);
});

// Main proxy server
const mainApp = express();

// Health check
mainApp.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', server: 'main' });
});

// Create proxy middlewares with different strategies
const apiProxy = createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error(`API proxy error:`, err);
    res.status(503).json({ error: 'API Service Unavailable' });
  }
});

// JwtProxy with path rewriting
const jwtProxy = createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/jwt': '' }, // Try removing the /jwt prefix
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] Rewriting ${req.originalUrl} → ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error(`JWT proxy error:`, err);
    res.status(503).json({ error: 'JWT Service Unavailable' });
  }
});

// Apply proxies for different paths
mainApp.use('/api', apiProxy);
mainApp.use('/jwt', jwtProxy);

// Static files and SPA fallback
mainApp.use(express.static(path.join(__dirname, 'dist/public')));
mainApp.get(/^(?!\/api\/|\/jwt\/).*/, (req, res) => {
  res.send(`
    <html>
      <head><title>JWT Proxy Test</title></head>
      <body>
        <h1>JWT Proxy Test</h1>
        <p>This is a test server to verify JWT proxy routing.</p>
        <ul>
          <li><a href="/health">Main server health check</a></li>
          <li><a href="/api/health">API server health check via proxy</a></li>
          <li><a href="/jwt/status">JWT status check via proxy</a></li>
        </ul>
        <div>
          <h2>Test JWT Register</h2>
          <button id="test-jwt">Test JWT Registration</button>
          <pre id="result"></pre>
        </div>
        <script>
          document.getElementById('test-jwt').addEventListener('click', async () => {
            try {
              const response = await fetch('/jwt/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: 'test@example.com',
                  password: 'password123'
                })
              });
              
              const data = await response.json();
              document.getElementById('result').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
              document.getElementById('result').textContent = 'Error: ' + error.message;
            }
          });
        </script>
      </body>
    </html>
  `);
});

// Start main server
const mainServer = http.createServer(mainApp);
mainServer.listen(PORT, () => {
  console.log(`🚀 Main server listening on port ${PORT}`);
  console.log(`📝 Test URLs:`);
  console.log(`   Main server: http://localhost:${PORT}/health`);
  console.log(`   API server (via proxy): http://localhost:${PORT}/api/health`);
  console.log(`   JWT status (via proxy): http://localhost:${PORT}/jwt/status`);
  console.log(`   Web interface: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  mainServer.close();
  apiServer.close();
  process.exit(0);
});