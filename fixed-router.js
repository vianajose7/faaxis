/**
 * Fixed Router for Production
 * 
 * This file provides a consolidated solution for routing issues in production,
 * particularly fixing the problems with page loading and authentication redirects.
 */

// Import dependencies
import express from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Sets up protected routes and SPA handling for the application
 * @param {express.Express} app - The Express app instance
 * @param {string} publicDir - Path to the public directory
 */
export function setupFixedRouter(app, publicDir) {
  console.log('📐 Setting up fixed router for improved SPA navigation');
  
  // Make sure index.html exists
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('⚠️ Warning: index.html not found in public directory');
    return;
  }
  
  // List of routes that should be handled by the SPA
  const spaRoutes = [
    '/dashboard',
    '/calculator',
    '/detailed-calculator',
    '/marketplace',
    '/checkout',
    '/profile',
    '/settings',
    '/firm-profiles',
    '/advisor-search',
    '/submissions',
    '/plans',
    '/blog',
    '/news'
  ];
  
  // Create explicit handlers for SPA routes to ensure they load correctly
  spaRoutes.forEach(route => {
    app.get(route, (req, res) => {
      console.log(`🛣️ Serving SPA for route: ${route}`);
      res.sendFile(indexPath);
    });
    
    // Also handle any subroutes
    app.get(`${route}/*`, (req, res) => {
      console.log(`🛣️ Serving SPA for subroute: ${req.path}`);
      res.sendFile(indexPath);
    });
  });
  
  console.log('✅ Fixed router setup complete');
}