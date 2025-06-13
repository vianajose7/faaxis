/**
 * Production Entry Point - Synced with Development Version
 * 
 * This uses your exact development server setup for deployment consistency
 */

// Set production environment
process.env.NODE_ENV = 'production';

// Import TSX for TypeScript support (same as development)
import { register } from 'tsx/esm';

// Register TypeScript loader
register();

// Start your development server in production mode
import('./server/index.ts').then(() => {
  console.log('🚀 Production server started with development configuration!');
  console.log('✅ Deployed version now matches your development environment');
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});