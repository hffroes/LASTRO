import express from 'express';
import { rotaSaude } from './routes/saude';

export function criarApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/saude', rotaSaude);
  return app;
}
