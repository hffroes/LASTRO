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

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticateToken, me);

export default router;
