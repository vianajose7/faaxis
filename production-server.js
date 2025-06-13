/**
 * Production Server for FA Axis Deployment
 * This file will be called by your deployment configuration
 */

console.log('🚀 FA Axis Production Server Starting...');

// Import and start the correct deployment server
import('./correct-deployment-server.js')
  .then(() => {
    console.log('✅ FA Axis deployment server loaded successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to load deployment server:', error);
    
    // Fallback: Create a basic server directly
    import('express').then((express) => {
      const app = express.default();
      const PORT = process.env.PORT || 3000;
      
      app.get('/', (req, res) => {
        res.send(`
          <!DOCTYPE html>
          <html><head><title>FA Axis</title></head>
          <body>
            <h1>FA Axis - Your Next Move, Simplified</h1>
            <p>Loading your financial platform...</p>
            <script>setTimeout(() => window.location.href = 'https://b8c736c6-40a1-4bb1-af36-eeb7ad533fdc-00-1sqqkajo6e3i4.worf.replit.dev', 2000);</script>
          </body></html>
        `);
      });
      
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Fallback server running on port ${PORT}`);
      });
    });
  });