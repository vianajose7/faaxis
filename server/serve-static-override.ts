import express from 'express';
import path from 'path';

export function serveStaticOverride(app: express.Application) {
  // Primary static file location (where Vite builds to)
  const primaryStatic = path.resolve('client/dist');
  
  console.log(`Primary static directory: ${primaryStatic}`);
  
  // Check if the build directory exists
  if (require('fs').existsSync(primaryStatic)) {
    app.use(express.static(primaryStatic, {
      etag: true,
      lastModified: true,
      maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
      index: false
    }));
    console.log('✅ Serving static files from client/dist');
  } else {
    console.warn('⚠️ client/dist directory not found, build may be incomplete');
  }

  // SPA fallback - always serve index.html for client routes
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.url.startsWith('/api/')) {
      return;
    }

    const indexPath = path.resolve('client/dist/index.html');
    
    if (require('fs').existsSync(indexPath)) {
      console.log(`SPA route: ${req.url} → serving index.html`);
      return res.sendFile(indexPath);
    }

    console.error(`Index.html not found at ${indexPath}`);
    res.status(404).send('Application not built. Please run npm run build.');
  });

  // Add a dedicated health check endpoint for monitoring
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: "1.0.0"
    });
  });
}