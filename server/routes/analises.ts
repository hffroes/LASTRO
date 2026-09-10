import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import {
  calcular,
  criar,
  deletar,
  listar,
  obter,
} from '../controllers/analisesController';

const router = Router();

// Rate limiting conforme decisão técnica #10 do plan.md (memory store),
// também aplicado às rotas de análises, não só auth. Limite mais generoso
// que o de auth: /calcular é chamado a cada ajuste interativo (PRD §2.6).
const analisesRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

router.use(authenticateToken);
router.use(analisesRateLimiter);

router.post('/calcular', asyncHandler(calcular));
router.post('/', asyncHandler(criar));
router.get('/', asyncHandler(listar));
router.get('/:id', asyncHandler(obter));
router.delete('/:id', asyncHandler(deletar));

export default router;
