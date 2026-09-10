import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken, type JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  if (!token) {
    res.status(401).json({ error: 'Token de acesso não fornecido' });
    return;
  }

  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Token de acesso inválido ou expirado' });
  }
}
