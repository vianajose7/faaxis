/**
 * Enhanced entry point for Replit deployment
 * Environment setup
 */
console.log('🚀 Starting FA Axis production server...');
console.log('Environment:', process.env.NODE_ENV || 'production');
console.log('Port:', process.env.PORT || 3000);

// Set production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import and start the server
import('./correct-deployment-server.js')
  .then(() => {
    console.log('✅ FA Axis server started successfully');
  })
  .catch((error) => {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  });