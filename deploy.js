// deploy.js
// ✅ Use Replit's PORT or default to 3000
process.env.PORT = process.env.PORT || '3000';

// ✅ Just delegate to your compiled server
import('./dist/index.js');