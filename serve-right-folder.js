// This server is specifically designed to serve the correct Vite build output
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// The correct path to the Vite build output according to your vite.config.ts
const CORRECT_BUILD_PATH = path.join(__dirname, 'dist/public');

// Log important paths for debugging
console.log('Working directory:', __dirname);
console.log('Correct build path:', CORRECT_BUILD_PATH);
console.log('Build folder exists:', fs.existsSync(CORRECT_BUILD_PATH));

if (fs.existsSync(CORRECT_BUILD_PATH)) {
  // List files in build directory for debugging
  console.log('Files in build directory:', fs.readdirSync(CORRECT_BUILD_PATH));

  // Check for index.html
  const indexPath = path.join(CORRECT_BUILD_PATH, 'index.html');
  console.log('index.html exists:', fs.existsSync(indexPath));
  
  // Check for assets folder
  const assetsPath = path.join(CORRECT_BUILD_PATH, 'assets');
  console.log('assets folder exists:', fs.existsSync(assetsPath));
  if (fs.existsSync(assetsPath)) {
    console.log('Files in assets folder:', fs.readdirSync(assetsPath));
  }
}

// Serve static files from the correct build directory
app.use(express.static(CORRECT_BUILD_PATH));

// Serve static assets
app.use('/assets', express.static(path.join(CORRECT_BUILD_PATH, 'assets')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'correct-folder-server' });
});

// Admin login redirect
app.get('/admin-login', (req, res) => {
  res.redirect('/api/admin-auth/login');
});

// Fallback route - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Try to serve index.html
  const indexPath = path.join(CORRECT_BUILD_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback to inline HTML if index.html doesn't exist
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>FaAxis - Financial Advisor Transition Platform</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; }
          h1 { color: #0066cc; }
          .container { max-width: 800px; margin: 40px auto; }
          .alert { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .info { background: #e2f3f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .btn { background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>FaAxis</h1>
          <p>The leading platform for financial advisors</p>
          
          <div class="alert">
            <h2>Deployment Issue Detected</h2>
            <p>The application build files could not be found.</p>
            <p>Expected location: <code>${CORRECT_BUILD_PATH}</code></p>
          </div>
          
          <div class="info">
            <p>You are seeing this emergency page because the application could not locate its build files.</p>
            <p>Please contact support or check the server logs for more information.</p>
          </div>
          
          <a href="/admin-login" class="btn">Admin Login</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║  CORRECT FOLDER SERVER RUNNING ON PORT ${PORT}          ║
║                                                      ║
║  SERVING FROM: ${CORRECT_BUILD_PATH}                      
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});