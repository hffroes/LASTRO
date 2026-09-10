import { Router } from 'express';
import {
  getAjustesCub,
  getCoeficientesIa,
  getTipologias,
} from '../controllers/parametrosController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/tipologias', asyncHandler(getTipologias));
router.get('/ajustes-cub', asyncHandler(getAjustesCub));
router.get('/coeficientes-ia', asyncHandler(getCoeficientesIa));

export default router;
