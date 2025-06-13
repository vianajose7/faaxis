// Ultra-production-server.js - GUARANTEED to work static server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES module __dirname equivalent (critical for correct path resolution!)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Calculate the client dist directory path
const distDir = path.join(__dirname, 'dist/public');
console.log(`[Server] Starting with dist directory: ${distDir}`);

// Ensure the dist directory exists
if (!fs.existsSync(distDir)) {
  console.error(`[SERVER ERROR] ${distDir} directory does not exist!`);
  console.error('Creating it now...');
  fs.mkdirSync(distDir, { recursive: true });
}

// CRITICAL FIX: Always ensure a valid index.html exists
// If missing or the build failed, create a hand-crafted static version
const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.warn('[SERVER] No index.html found, creating fallback landing page');
  
  fs.writeFileSync(indexPath, `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>FA Axis - Financial Advisor Transition Platform</title>
    <script src="https://js.stripe.com/v3/"></script>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #333;
        line-height: 1.6;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 40px;
      }
      .logo {
        font-size: 32px;
        font-weight: bold;
        color: #3a86ff;
        margin-bottom: 10px;
      }
      .tagline {
        font-size: 18px;
        color: #555;
        margin-bottom: 20px;
      }
      .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 25px;
        margin-bottom: 30px;
      }
      h1 {
        color: #2b6cb0;
        margin-top: 0;
      }
      h2 {
        color: #3a86ff;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      .button {
        display: inline-block;
        background: #3a86ff;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        text-decoration: none;
        font-weight: bold;
        margin-top: 20px;
      }
      .feature {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }
      .feature-icon {
        width: 40px;
        height: 40px;
        background: #ebf5ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        color: #3a86ff;
        font-size: 18px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">FA Axis</div>
        <div class="tagline">Financial Advisor Transition Platform</div>
      </div>
      
      <div class="card">
        <h1>Welcome to FA Axis</h1>
        <p>The comprehensive platform designed to simplify and streamline the financial advisor transition process.</p>
        
        <h2>Core Features</h2>
        <div class="feature">
          <div class="feature-icon">✓</div>
          <div>Transition planning and execution support with 10+ years of industry expertise</div>
        </div>
        <div class="feature">
          <div class="feature-icon">✓</div>
          <div>Practice valuation tools and financial calculators</div>
        </div>
        <div class="feature">
          <div class="feature-icon">✓</div>
          <div>Marketplace for buying and selling practices</div>
        </div>
        <div class="feature">
          <div class="feature-icon">✓</div>
          <div>Industry news, blogs and advisor resources</div>
        </div>
        
        <p><strong>Note:</strong> You're seeing this static page because the full application is currently being deployed or encountered a build issue. The complete interactive platform will be available soon.</p>
      </div>
      
      <div class="card">
        <h2>Contact Information</h2>
        <p>For immediate assistance, please contact our support team:</p>
        <p>Email: support@faaxis.com<br>
        Phone: (555) 123-4567</p>
      </div>
    </div>
  </body>
</html>`);
}

// Serve static files from the dist directory
app.use(express.static(distDir));

// Logging middleware for all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// SPA catch-all route (must be after other routes)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API Request] ${req.path} - Returning 404 in static mode`);
    return res.status(404).send('API not available in static server mode');
  }
  
  console.log(`[SPA Route] ${req.path} → Serving index.html`);
  res.sendFile(indexPath);
});

// Start the server
app.listen(PORT, () => {
  console.log(`
  =======================================================
   ULTRA PRODUCTION SERVER RUNNING ON PORT ${PORT}
  =======================================================
  
  • Static files served from: ${distDir}
  • All routes will serve the landing page
  • API routes will return 404 (static mode only)
  
  IMPORTANT: If you're seeing a static landing page instead
  of your full application, it means the build process couldn't
  generate all the necessary JS assets. This is a common issue
  with large React applications in Replit's environment.
  
  To fix this:
  1. Try using a simplified build: npm run build
  2. Check your vite.config.ts settings
  3. Consider breaking up large components
  
  =======================================================
  `);
});