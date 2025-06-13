import express from 'express';
import type { Express } from 'express';

/**
 * Registers JWT diagnostic endpoints to help with troubleshooting JWT routing issues
 */
export function registerJwtDiagnosticRoutes(app: Express) {
  console.log('🔍 Registering JWT diagnostic routes');
  
  // Simple status endpoint that just returns 200 OK
  app.get('/jwt/status', (req, res) => {
    console.log('JWT status check endpoint hit');
    res.status(200).json({
      status: 'ok',
      message: 'JWT routes are properly registered',
      timestamp: new Date().toISOString(),
      headers: req.headers,
      cookies: req.cookies,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl
    });
  });
  
  // Test the actual routing paths
  app.get('/api/jwt-routes-check', (req, res) => {
    res.json({
      status: 'ok',
      message: 'JWT diagnostic endpoints are active',
      routes: [
        '/jwt/status',
        '/jwt/register',
        '/jwt/login',
        '/jwt/logout'
      ],
      timestamp: new Date().toISOString()
    });
  });
}