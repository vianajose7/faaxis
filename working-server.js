
// Guaranteed working server for production
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Print crucial debugging information
console.log('Current directory:', __dirname);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Define the correct build path based on vite.config.ts
const VITE_BUILD_PATH = path.join(__dirname, 'dist/public');
console.log('Vite build path:', VITE_BUILD_PATH);
console.log('Build path exists:', fs.existsSync(VITE_BUILD_PATH));

// Explicitly serve the correct build path
app.use(express.static(VITE_BUILD_PATH));

// Admin login redirect
app.get('/admin-login', (req, res) => {
  res.redirect('/api/admin-auth/login');
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'production-fixed',
    timestamp: new Date().toISOString()
  });
});

// SPA fallback - handle any other route
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve the index.html file for client-side routing
  const indexPath = path.join(VITE_BUILD_PATH, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log(`Serving index.html for route: ${req.path}`);
    return res.sendFile(indexPath);
  } else {
    console.error(`ERROR: index.html not found at ${indexPath}`);
    
    // Show list of files in the build directory
    let fileList = 'Build directory is empty or does not exist';
    if (fs.existsSync(VITE_BUILD_PATH)) {
      fileList = fs.readdirSync(VITE_BUILD_PATH).join(', ');
    }
    
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>FaAxis - Application Error</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 800px; margin: 40px auto; padding: 20px; background: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #0066cc; }
          h2 { color: #cc3300; margin-top: 30px; }
          .error-details { background: #fff; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #cc3300; }
          code { background: #f5f5f5; padding: 4px 6px; border-radius: 4px; font-family: monospace; }
          .btn { background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>FaAxis</h1>
          <p>The leading platform for financial advisors</p>
          
          <h2>Application Error</h2>
          <p>The application could not load because the required index.html file is missing from the build directory.</p>
          
          <div class="error-details">
            <p><strong>Build Path:</strong> <code>${VITE_BUILD_PATH}</code></p>
            <p><strong>Index File:</strong> <code>${indexPath}</code></p>
            <p><strong>File Exists:</strong> <code>${fs.existsSync(indexPath)}</code></p>
            <p><strong>Files in Build Directory:</strong> <code>${fileList}</code></p>
          </div>
          
          <p>This is likely a deployment issue. The application has been built, but the files are not in the expected location.</p>
          
          <a href="/admin-login" class="btn">Admin Login</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║  PRODUCTION SERVER RUNNING ON PORT ${PORT}              ║
║                                                      ║
║  SERVING VITE BUILD FROM: ${VITE_BUILD_PATH}               
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});
