// server/spa-catchall.ts
import { Express, Request, Response, NextFunction } from 'express';
import path from 'path';

export function setupSPARoutes(app: Express) {
  const distDir = path.resolve(__dirname, '../client/dist');
  app.use(express.static(distDir));
  
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}