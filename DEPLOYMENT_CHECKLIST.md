# Deployment Checklist

## Before Deployment

1. ✅ Update `server/spa-catchall.ts` to properly handle ES modules:
   ```typescript
   // server/spa-catchall.ts
   import { fileURLToPath } from 'url';
   import path from 'path';
   import express from 'express';

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   const distDir = path.join(__dirname, '../client/dist');

   export function setupSPARoutes(app: express.Express) {
     app.use(express.static(distDir));
     
     app.get('*', (req, res, next) => {
       if (req.path.startsWith('/api')) return next();
       res.sendFile(path.join(distDir, 'index.html'));
     });
   }
   ```

2. ✅ Make sure `server/index.ts` has the correct import and function call:
   ```typescript
   import { setupSPARoutes } from './spa-catchall';
   // after all API routes
   setupSPARoutes(app);
   ```

3. ✅ Ensure package.json has the right scripts:
   ```json
   "scripts": {
     "build": "vite build",
     "start": "NODE_ENV=production node dist/index.js"
   }
   ```

## Deployment Settings

1. ✅ In Replit Deployments panel:
   - Build command: `npm ci && npm run build`
   - Run command: `npm run start`

## Verification

1. ✅ Test with curl to verify you're getting the SPA's index.html:
   ```bash
   curl -i https://your-deployed-url.replit.app
   ```
   (You should see a 200 OK and HTML content, not a blank response)

2. ✅ Check Deployment logs for any errors:
   - Look for any path resolution issues
   - Check if the static files are being served correctly

3. ✅ Perform a hard refresh in your browser (Ctrl+Shift+R) to clear cache

## Fallback Options

If the deployment still doesn't work, try using the minimal server:

1. ✅ Update the Run command to: `node minimal-server.js`

2. ✅ Verify the minimal server works locally:
   ```bash
   npm run build
   node minimal-server.js
   ```

## Final Checks

1. ✅ Manually verify these critical routes work in production:
   - Home page: `/`
   - Blog: `/blog`
   - Calculator: `/calculator`
   - Individual articles: `/blog/article/[slug]`

2. ✅ Check that API calls are working:
   - Blog posts are loading
   - News articles are appearing
   - CountUp animation works