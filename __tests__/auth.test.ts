// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app';
import { prisma } from '../server/lib/prisma';
import { signAccessToken, signRefreshToken } from '../server/utils/jwt';

const app = createApp();

const credentials = {
  email: 'usuario.teste@lastro.com',
  password: 'senhaSegura123',
};

async function cleanUsers() {
  await prisma.user.deleteMany({ where: { email: credentials.email } });
}

beforeAll(async () => {
  await cleanUsers();
});

afterAll(async () => {
  await cleanUsers();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await cleanUsers();
});

describe('POST /api/v1/auth/signup', () => {
  it('cria um usuário e retorna access token + cookie de refresh', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toEqual({
      id: expect.any(String),
      email: credentials.email,
      createdAt: expect.any(String),
    });
    expect(res.headers['set-cookie']?.[0]).toMatch(/refreshToken=/);

    const stored = await prisma.user.findUnique({
      where: { email: credentials.email },
    });
    expect(stored?.password).not.toBe(credentials.password);
  });

  it('rejeita email duplicado', async () => {
    await request(app).post('/api/v1/auth/signup').send(credentials);
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send(credentials);

    expect(res.status).toBe(409);
  });

  it('rejeita senha curta', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: credentials.email, password: '123' });

    expect(res.status).toBe(400);
  });

  it('rejeita email inválido', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'nao-e-email', password: credentials.password });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/signup').send(credentials);
  });

  it('autentica com credenciais corretas', async () => {
    const res = await request(app).post('/api/v1/auth/login').send(credentials);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.headers['set-cookie']?.[0]).toMatch(/refreshToken=/);
  });

  it('rejeita senha incorreta', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: 'senhaErrada' });

    expect(res.status).toBe(401);
  });

  it('rejeita usuário inexistente', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ninguem@lastro.com', password: credentials.password });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('emite novo access token a partir do cookie de refresh válido', async () => {
    const signupRes = await request(app)
      .post('/api/v1/auth/signup')
      .send(credentials);
    const cookie = signupRes.headers['set-cookie'][0];

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  it('rejeita quando não há cookie', async () => {
    const res = await request(app).post('/api/v1/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('rejeita refresh token inválido', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', 'refreshToken=token-invalido');

    expect(res.status).toBe(401);
  });

  it('rejeita access token usado como se fosse refresh token', async () => {
    const signupRes = await request(app)
      .post('/api/v1/auth/signup')
      .send(credentials);
    const accessToken = signupRes.body.accessToken;

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refreshToken=${accessToken}`);

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('retorna o usuário autenticado', async () => {
    const signupRes = await request(app)
      .post('/api/v1/auth/signup')
      .send(credentials);
    const { accessToken } = signupRes.body;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(credentials.email);
  });

  it('rejeita sem token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejeita token expirado/adulterado', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer token.invalido.aqui');

    expect(res.status).toBe(401);
  });

  it('rejeita refresh token usado como access token', async () => {
    const fakeRefresh = signRefreshToken({
      sub: 'user-id',
      email: credentials.email,
    });
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${fakeRefresh}`);

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('limpa o cookie de refresh', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(204);
    expect(res.headers['set-cookie']?.[0]).toMatch(/refreshToken=;/);
  });
});

describe('rate limiting em rotas de auth', () => {
  it('bloqueia após exceder o limite de tentativas', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      let lastStatus = 0;
      for (let i = 0; i < 21; i++) {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'inexistente@lastro.com', password: 'qualquer' });
        lastStatus = res.status;
      }
      expect(lastStatus).toBe(429);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('assinatura de tokens', () => {
  it('gera tokens distintos com claims corretas', () => {
    const token = signAccessToken({ sub: 'abc', email: credentials.email });
    expect(token.split('.')).toHaveLength(3);
  });
});
