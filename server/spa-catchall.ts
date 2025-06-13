// server/spa-catchall.ts
import { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Handle ESModule __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupSPARoutes(app: Express) {
  // Set dist directory path - point to /dist/public where Vite builds
  const distDir = path.resolve(__dirname, '../dist/public');
  const indexPath = path.join(distDir, 'index.html');

  // Check if dist directory exists, log helpful message if not
  if (!fs.existsSync(distDir)) {
    console.warn(`Warning: Static directory ${distDir} does not exist. Build may not have completed.`);
  } else {
    console.log(`Serving static files from: ${distDir}`);
    if (fs.existsSync(indexPath)) {
      console.log(`Found index.html at: ${indexPath}`);
    } else {
      console.warn(`Warning: index.html not found at ${indexPath}. SPA routes may not work.`);
    }
  }

  // Serve static files with proper caching headers
  app.use(express.static(distDir, {
    etag: true,
    lastModified: true,
    maxAge: '1d', // Cache for 1 day
    immutable: true, // For hashed assets
    index: false, // Don't auto-serve index.html, we'll handle that
  }));
  
  // Handle SPA routes - any non-API route gets the index.html
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // Skip API routes and let them be handled by API middleware
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // For all other routes, serve the SPA's index.html
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`Error serving index.html: ${err.message}`);
        res.status(500).send('Error loading application. Please try again later.');
      }
    });
  });
}
