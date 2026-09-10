import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  logout,
  me,
  refresh,
  signup,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Limite de tentativas conforme decisão técnica #10 do plan.md (express-rate-limit, memory store)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

router.use(authRateLimiter);

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', logout);
router.get('/me', authenticateToken, asyncHandler(me));

export default router;
