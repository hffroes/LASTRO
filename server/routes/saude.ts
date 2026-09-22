import { Router } from 'express';

export const rotaSaude = Router();

rotaSaude.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});
