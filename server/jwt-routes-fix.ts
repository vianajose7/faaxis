/**
 * JWT Router Fix
 * 
 * This file provides the necessary code to mount the JWT router at /jwt.
 * Import and use this in server/routes.ts to ensure JWT routes work correctly.
 */
import express from 'express';
import { jwtRouter } from './jwt-auth';

// Export a function to mount the JWT router
export function mountJwtRouter(app: express.Express) {
  app.use('/jwt', jwtRouter);
  console.log('JWT router mounted at /jwt path for registration and login');
  
  // Also add a health check endpoint
  app.get('/health', (req, res) => res.status(200).send('OK'));
}