// Ultra Simple Express Server with Zero Dependencies
// This file serves as a guaranteed fallback emergency server
// It's designed to be as simple as possible to ensure reliability

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5000;

// Set up all possible static file locations
const staticPaths = [
  path.join(rootDir, 'client', 'dist'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'server', 'public'),
  path.join(rootDir, 'dist', 'public'),
  path.join(rootDir, 'public')
];

// Serve static files from all possible locations
staticPaths.forEach(staticPath => {
  if (fs.existsSync(staticPath)) {
    console.log(`Serving static files from: ${staticPath}`);
    app.use(express.static(staticPath, {
      etag: false,
      maxAge: '0',
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }));
  }
});

// Basic API endpoints
app.get('/api/blog/posts', (req, res) => {
  res.json([
    {
      id: 1,
      title: "Wells Fargo Welcomes $6.7 Million Team from Morgan Stanley",
      slug: "wells-fargo-welcomes-team-from-morgan-stanley",
      excerpt: "A veteran team has joined Wells Fargo Advisors, bringing $6.7 million in production and significant AUM from Morgan Stanley.",
      content: "Full article content here...",
      imageUrl: "/assets/blog-1.jpg",
      featuredImage: "/assets/blog-1.jpg",
      published: true,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: ["Moves"]
    },
    {
      id: 2,
      title: "LPL Financial Announces New Strategic Partnership",
      slug: "lpl-financial-announces-new-strategic-partnership",
      excerpt: "LPL Financial has formed a strategic partnership to enhance technology solutions for independent financial advisors.",
      content: "Full article content here...",
      imageUrl: "/assets/blog-2.jpg",
      featuredImage: "/assets/blog-2.jpg",
      published: true,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: ["News"]
    }
  ]);
});

app.get('/api/news', (req, res) => {
  res.json({
    newsArticles: [
      {
        id: 1,
        title: "Morgan Stanley Team Joins UBS",
        slug: "morgan-stanley-team-joins-ubs",
        excerpt: "A veteran team with over $500M in AUM has transitioned from Morgan Stanley to UBS.",
        content: "Full article content here...",
        date: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: "Moves"
      }
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'ultra-simple', time: new Date().toISOString() });
});

app.get('/api/user', (req, res) => {
  res.status(401).json({ message: "Not authenticated" });
});

// Find index.html files
const indexFiles = [];
staticPaths.forEach(staticPath => {
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    indexFiles.push(indexPath);
  }
});

// SPA catchall - serve index.html for any other route
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Try all index files
  for (const indexPath of indexFiles) {
    console.log(`Trying to serve: ${indexPath}`);
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // Last resort - generate a simple page
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FA Axis - Emergency Mode</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; color: #333; background: #f8f9fa; }
        .container { max-width: 800px; margin: 50px auto; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #0066cc; border-bottom: 1px solid #eee; padding-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>FaAxis - Emergency Mode</h1>
        <p>The application is running in emergency mode. Please contact support for assistance.</p>
        <p>If you're seeing this message, try refreshing the page or clearing your browser cache.</p>
      </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║      ULTRA SIMPLE SERVER - GUARANTEED FALLBACK MODE       ║
║                                                           ║
║      Port: ${PORT}                                             ║
║      Mode: Production                                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});