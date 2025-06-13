import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('▶️  simplified-production.js starting…');

// Set up port handling (with 5000 -> PORT redirection)
const PORT = process.env.PORT || 3000;
process.env.PORT = PORT.toString();

// Monkey-patch http.Server.prototype.listen to handle port 5000 redirections
const origListen = http.Server.prototype.listen;
http.Server.prototype.listen = function(...args) {
  if ((args[0] === 5000) || (args[0]?.port === 5000)) {
    console.log('⚠️  Intercepted port 5000 binding request, redirecting to PORT:', PORT);
    args[0] = typeof args[0] === 'number'
      ? PORT
      : { ...args[0], port: PORT };
  }
  return origListen.apply(this, args);
};

// Initialize Express application
const app = express();

// Add health check endpoint (for load balancer)
app.get('/health', (_req, res) => {
  console.log('Health check endpoint hit');
  res.sendStatus(200);
});

// Set up static file serving
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'dist/public');
app.use(express.static(publicDir));

// Fallback route for SPA
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start the server by importing and running the bundled application
import('./dist/index.js')
  .then(module => {
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
      console.log('📂 Serving static files from:', publicDir);
      console.log('🔗 Health check endpoint: /health');
    });
  })
  .catch(err => {
    console.error('❌ Failed to import server module:', err);
    process.exit(1);
  });