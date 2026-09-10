import { Router } from 'express';
import { getPrecosMercado } from '../controllers/dadosController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/precos-mercado', asyncHandler(getPrecosMercado));

export default router;
