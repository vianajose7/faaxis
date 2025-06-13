// Minimal production server that just serves static assets and handles SPA routing
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, 'client/dist')));

// SPA catch-all route for client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).send('API not found in minimal server mode');
  }
  // Send the index.html for all other routes
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'client/dist')}`);
});