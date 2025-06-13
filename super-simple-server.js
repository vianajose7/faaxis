// Super Simple Server - Just serves the emergency HTML file
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve the emergency.html file
const emergencyHtmlPath = path.join(__dirname, 'emergency.html');

// Disable caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve the API routes needed for the homepage
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

app.get('/admin-login', (req, res) => {
  // Send the regular emergency.html but with instructions to log in at /api/admin-auth
  const html = fs.readFileSync(emergencyHtmlPath, 'utf8');
  const loginHtml = html.replace('<h1>Maximize Your Financial Practice\'s Value</h1>', 
    '<h1>Admin Login</h1><div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px; text-align: center;">' +
    '<p>Please use the API endpoint directly at <code>/api/admin-auth/login</code> with your credentials until we fix the UI.</p>' +
    '<p>Or visit <a href="/api/admin-auth/login" style="color: #0066cc; font-weight: bold;">/api/admin-auth/login</a> directly.</p>' +
    '</div>');
  res.send(loginHtml);
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    mode: 'super-simple-emergency-server'
  });
});

// Always serve the emergency HTML file for everything else
app.get('*', (req, res) => {
  // Log details for debugging
  console.log(`[EMERGENCY SERVER] Requested: ${req.path}`);
  console.log(`[EMERGENCY SERVER] Serving emergency.html (${emergencyHtmlPath})`);
  console.log(`[EMERGENCY SERVER] File exists: ${fs.existsSync(emergencyHtmlPath)}`);
  
  // Send the emergency HTML file
  res.sendFile(emergencyHtmlPath);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🚨 SUPER SIMPLE EMERGENCY SERVER RUNNING 🚨               ║
║                                                            ║
║  Port: ${PORT.toString().padEnd(47, ' ')}║
║  Mode: Static HTML fallback                                ║
║  HTML: ${emergencyHtmlPath.padEnd(47, ' ')}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
});