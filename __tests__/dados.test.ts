// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app';
import { PrecoMercadoResponseSchema } from '../shared/schemas';

const app = createApp();

const originalAdapterEnv = process.env.FIPEZAP_ADAPTER;

afterEach(() => {
  process.env.FIPEZAP_ADAPTER = originalAdapterEnv;
});

describe('GET /api/v1/dados/precos-mercado', () => {
  it('retorna preço mock para tipologia/região conhecidas', async () => {
    const res = await request(app)
      .get('/api/v1/dados/precos-mercado')
      .query({ tipologia: 'Multifamiliar', regiao: 'MG' });

    expect(res.status).toBe(200);
    expect(PrecoMercadoResponseSchema.safeParse(res.body).success).toBe(true);
    expect(res.body.mock).toBe(true);
    expect(res.body.precoM2).toBeGreaterThan(0);
  });

  it('usa MG como região padrão quando não informada', async () => {
    const res = await request(app)
      .get('/api/v1/dados/precos-mercado')
      .query({ tipologia: 'Unifamiliar' });

    expect(res.status).toBe(200);
    expect(res.body.regiao).toBe('MG');
  });

  it('retorna 404 para combinação sem dado mock', async () => {
    const res = await request(app)
      .get('/api/v1/dados/precos-mercado')
      .query({ tipologia: 'Inexistente', regiao: 'MG' });

    expect(res.status).toBe(404);
  });

  it('retorna 400 quando tipologia não é informada', async () => {
    const res = await request(app)
      .get('/api/v1/dados/precos-mercado')
      .query({ regiao: 'MG' });

    expect(res.status).toBe(400);
  });

  it('retorna 500 (não trava a requisição) quando FIPEZAP_ADAPTER=http, ainda não implementado', async () => {
    process.env.FIPEZAP_ADAPTER = 'http';

    const res = await request(app)
      .get('/api/v1/dados/precos-mercado')
      .query({ tipologia: 'Multifamiliar', regiao: 'MG' });

    expect(res.status).toBe(500);
  });
});
