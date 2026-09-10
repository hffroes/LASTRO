// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app';
import { prisma } from '../server/lib/prisma';
import {
  CubAdjustmentSchema,
  CoeficienteIaResponseSchema,
  TipologySchema,
} from '../shared/schemas';

const app = createApp();

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/v1/parametros/tipologias', () => {
  it('retorna as 16 combinações tipologia/padrão do PRD §3.1', async () => {
    const res = await request(app).get('/api/v1/parametros/tipologias');

    expect(res.status).toBe(200);
    expect(res.body.tipologias).toHaveLength(16);
    for (const item of res.body.tipologias) {
      expect(TipologySchema.safeParse(item).success).toBe(true);
    }
  });

  it('inclui os percentuais corretos para Multifamiliar Normal', async () => {
    const res = await request(app).get('/api/v1/parametros/tipologias');
    const multifamiliarNormal = res.body.tipologias.find(
      (t: { nome: string; padrao: string }) =>
        t.nome === 'Multifamiliar' && t.padrao === 'Normal'
    );

    expect(multifamiliarNormal).toMatchObject({
      percentualTerreno: 0.09,
      percentualLucro: 0.23,
    });
  });
});

describe('GET /api/v1/parametros/ajustes-cub', () => {
  it('retorna ajustes válidos contra o schema compartilhado', async () => {
    const res = await request(app).get('/api/v1/parametros/ajustes-cub');

    expect(res.status).toBe(200);
    expect(res.body.ajustesCub).toHaveLength(16);
    for (const item of res.body.ajustesCub) {
      expect(CubAdjustmentSchema.safeParse(item).success).toBe(true);
    }
  });

  it('expõe ajusteTipologia nulo quando o PRD não define o valor (Galpão)', async () => {
    const res = await request(app).get('/api/v1/parametros/ajustes-cub');
    const galpao = res.body.ajustesCub.find(
      (a: { tipologia: string; padrao: string }) =>
        a.tipologia === 'Galpão' && a.padrao === 'Normal'
    );

    expect(galpao.ajusteTipologia).toBeNull();
  });

  it('replica os ajustes de topografia e formato do PRD §3.2-B/C em cada item', async () => {
    const res = await request(app).get('/api/v1/parametros/ajustes-cub');
    const item = res.body.ajustesCub[0];

    expect(item.ajusteTopografia).toEqual({
      plana: 0.02,
      regular: 0.04,
      irregular: 0.08,
      acidentada: 0.12,
    });
    expect(item.ajusteFormato).toEqual({ regular: 0, irregular: 0.03 });
  });
});

describe('GET /api/v1/parametros/coeficientes-ia', () => {
  it('retorna o placeholder "não definido" do PRD §3.3', async () => {
    const res = await request(app).get('/api/v1/parametros/coeficientes-ia');

    expect(res.status).toBe(200);
    expect(CoeficienteIaResponseSchema.safeParse(res.body).success).toBe(true);
    expect(res.body.status).toBe('nao_definido');
    expect(res.body.coeficientes).toEqual([]);
  });
});
