import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// env
process.env.NODE_ENV = 'production';
// Use Replit's PORT environment variable with fallback
const PORT = Number(process.env.PORT || 3000);
console.log(`Starting server with PORT=${PORT}`);

// --- base app --------------------------------------------------
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit:'1mb' }));
app.use(express.urlencoded({ extended:false }));

// --- mount compiled API + websockets ---------------------------
// dist/index.js exports registerRoutes(app, server)
const { registerRoutes } = await import('./dist/index.js');
registerRoutes(app, server);             // 👈 ATTACH **before** static

// --- static + SPA fallback ------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname,'dist','public');
app.use(express.static(publicDir));

app.get('/health', (_req,res)=>res.status(200).send('OK'));

app.get('*', (_req,res) =>
  res.sendFile(path.join(publicDir,'index.html'))
);

// --- start -----------------------------------------------------
server.listen(PORT, () =>
  console.log(`[prod] unified server up on :${PORT}`)
);