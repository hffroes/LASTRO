import type { Request, Response } from 'express';
import { SignupRequestSchema, LoginRequestSchema } from '../../shared/schemas';
import {
  createUser,
  findUserByEmail,
  findUserById,
  toPublicUser,
  verifyPassword,
} from '../models/User';
import {
  REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
  REFRESH_TOKEN_COOKIE_NAME,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';

function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
  });
}

export async function signup(req: Request, res: Response): Promise<void> {
  const parsed = SignupRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }
  const { email, password } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'Email já cadastrado' });
    return;
  }

  const user = await createUser(email, password);
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email });

  setRefreshTokenCookie(res, refreshToken);
  res.status(201).json({ accessToken, user: toPublicUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = LoginRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }
  const { email, password } = parsed.data;

  const user = await findUserByEmail(email);
  const passwordMatches = user
    ? await verifyPassword(password, user.password)
    : false;
  if (!user || !passwordMatches) {
    res.status(401).json({ error: 'Email ou senha inválidos' });
    return;
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email });

  setRefreshTokenCookie(res, refreshToken);
  res.status(200).json({ accessToken, user: toPublicUser(user) });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: 'Refresh token não fornecido' });
    return;
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    return;
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    res.status(401).json({ error: 'Usuário não encontrado' });
    return;
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  res.status(200).json({ accessToken });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await findUserById(req.auth!.sub);
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  res.status(200).json({ user: toPublicUser(user) });
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
  res.status(204).send();
}
