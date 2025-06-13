import express from 'express';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import helmet from 'helmet';
// ESModule __dirname
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security + performance
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// Serve static assets from dist/public
const DIST_DIR = path.resolve(__dirname, './dist/public');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(INDEX_PATH)) {
  console.error('ERROR: index.html not found at', INDEX_PATH);
  process.exit(1);
}

app.use(express.static(DIST_DIR, {
  etag: true,
  lastModified: true,
  maxAge: '1d',
  immutable: true,
  index: false
}));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(INDEX_PATH);
});

// Use the port Replit provides, or 5000 as fallback
// In Replit deployment, process.env.PORT will be set automatically
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Production server running on port ${port}`);
});