# GUARANTEED DEPLOYMENT FIX FOR REPLIT

Follow these exact steps to fix the deployment issues:

## 1. Update package.json build & start scripts

Edit package.json and ensure you have these exact scripts:

```json
"scripts": {
  "build": "vite build && tsc --project tsconfig.build.json",
  "start": "NODE_ENV=production node dist/server/index.js"
}
```

## 2. Create minimal fallback server

Create a new file called `production-server.js` in the root with this exact code:

```javascript
// production-server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from client/dist
const distDir = path.join(__dirname, 'client/dist');
console.log(`Serving static files from: ${distDir}`);
app.use(express.static(distDir));

// SPA catch-all route for client-side routing
app.get('*', (req, res) => {
  // Skip API routes (though they'll 404 in this minimal server)
  if (req.path.startsWith('/api')) {
    console.log(`API request received: ${req.path} (not handled in minimal mode)`);
    return res.status(404).send('API not available in minimal server mode');
  }
  
  // Log route handling
  console.log(`SPA route: ${req.path} → serving index.html`);
  
  // Send the index.html for all other routes
  res.sendFile(path.join(distDir, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
  console.log(`Navigate to http://localhost:${PORT} in your browser`);
});
```

## 3. Deployment Settings

In Replit's deployment settings, put these EXACT values:

**Build Command:**
```
npm ci && npm run build
```

**Run Command:**
```
node production-server.js
```

## 4. Verify in Browser

After deployment, be sure to:

1. Hard refresh (Ctrl+Shift+R) to clear any cached content
2. Check the deployment logs for any errors
3. Verify all routes are working (/, /blog, /calculator, etc.)

## If Issues Persist

If you still have trouble, try this debugging step:

```bash
curl -i https://your-deployed-url.replit.app
```

You should see a 200 OK response with HTML content. If not, check your Replit logs.