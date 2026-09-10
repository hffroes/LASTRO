import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get('/api/v1/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/auth', authRoutes);

  // Placeholder routes (will be populated in subsequent phases)
  // - parameters routes (Phase 2)
  // - analysis routes (Phase 4)
  // - export routes (Phase 8)

  // Serve static files from Vite build (production)
  const publicDir = path.join(__dirname, '../dist/public');
  app.use(express.static(publicDir));

  // Fallback to index.html for SPA routing (production)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(publicDir, 'index.html'));
    }
  });

  // Error handling
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(err.stack);
      res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
      });
    }
  );

  return app;
}
