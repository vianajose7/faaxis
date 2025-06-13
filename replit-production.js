// replit-production.js
// Uses Replit's PORT environment variable and imports the main server
process.env.PORT = process.env.PORT || 3000;
await import('./dist/index.js');