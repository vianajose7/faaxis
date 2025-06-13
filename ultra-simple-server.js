import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

console.log('▶️  ultra-simple-server.js starting…');

// Set up port handling
const PORT = process.env.PORT || 3000;
process.env.PORT = PORT.toString();

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
const publicDir = path.join(__dirname, 'dist/public');
console.log('📂 Serving static files from:', publicDir);
app.use(express.static(publicDir));

// Fallback route for SPA
app.get(/^(?!\/api\/).*/, (_req, res) => {
  console.log('SPA fallback route hit for:', _req.url);
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start the bundled server as a child process
const startNodeServer = () => {
  console.log('▶️  Starting node server from dist/index.js...');
  
  // Create child process for the bundled server
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '5000' // The port monkey-patch will redirect this to PORT
    }
  });
  
  // Handle server process exit
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Server process exited with code ${code}`);
    }
  });
  
  return serverProcess;
};

// Start the Express server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`✅ Express server listening on port ${PORT}`);
  console.log('🔗 Health check endpoint: /health');
  
  // Start the server process after our Express server is running
  const nodeServer = startNodeServer();
  
  // Handle process shutdown
  const shutdown = () => {
    console.log('Shutting down server...');
    server.close();
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
});