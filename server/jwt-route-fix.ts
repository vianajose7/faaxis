/**
 * JWT Router Export Fix
 * 
 * This file properly exports the JWT router as required for production deployment.
 * Ensures that /jwt/* endpoints are available and working.
 */

import express, { Router } from 'express';
import { jwtRouter } from './jwt-auth';

// Export the router for use in the production server
export default jwtRouter;

// Export a function to properly mount the router
export function mountJwtRouter(app: express.Express) {
  // Mount the router at the /jwt path
  app.use('/jwt', jwtRouter);
  console.log('JWT router mounted at /jwt');
}