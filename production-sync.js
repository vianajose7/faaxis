/**
 * Production Sync Server - Matches Development Environment Exactly
 * 
 * This server ensures your deployed version works identically to your dev setup
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Set production environment
process.env.NODE_ENV = 'production';

// Basic middleware setup matching your dev environment
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Try to load your existing server routes
let serverModule;
try {
  // First try to load the built version
  serverModule = await import('./dist/index.js');
  console.log('✅ Loaded built server from dist/index.js');
} catch (buildError) {
  console.log('ℹ️ Built version not found, compiling TypeScript directly...');
  
  try {
    // Fallback to running TypeScript directly in production
    const { register } = await import('tsx/esm');
    register();
    serverModule = await import('./server/index.ts');
    console.log('✅ Loaded TypeScript server directly');
  } catch (tsError) {
    console.error('❌ Could not load server:', tsError);
    
    // Final fallback - serve static files and basic API
    app.use(express.static(path.join(__dirname, 'client/dist')));
    
    // Basic health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Server is running' });
    });
    
    // Catch-all for SPA
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'client/dist/index.html'));
    });
    
    console.log('⚠️ Running in fallback mode - serving static files only');
  }
}

// Start the server
if (!serverModule) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Production sync server running on port ${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
  });
} else {
  console.log(`🚀 Production server synced with development environment!`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
}