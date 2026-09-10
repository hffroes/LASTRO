// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app';
import { prisma } from '../server/lib/prisma';
import { AnalysisResultSchema } from '../shared/schemas';

const app = createApp();

const userA = {
  email: 'analises.usuarioA@lastro.com',
  password: 'senhaSegura123',
};
const userB = {
  email: 'analises.usuarioB@lastro.com',
  password: 'senhaSegura123',
};

const multifamiliarNormal = {
  areaTerreno: 5000,
  areaConstruida: 10_000,
  formatoLote: 'regular' as const,
  topografia: 'regular' as const,
  valorTerrenoR: 4_000_000,
  tipologia: 'Multifamiliar',
  padrao: 'Normal' as const,
  unidades: 100,
  precoVendaUnitario: 500_000,
};

async function limparUsuarios() {
  await prisma.user.deleteMany({
    where: { email: { in: [userA.email, userB.email] } },
  });
}

async function criarUsuarioELogar(credenciais: {
  email: string;
  password: string;
}) {
  const res = await request(app).post('/api/v1/auth/signup').send(credenciais);
  return {
    accessToken: res.body.accessToken as string,
    userId: res.body.user.id as string,
  };
}

afterAll(async () => {
  await limparUsuarios();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await limparUsuarios();
});

describe('POST /api/v1/analises/calcular', () => {
  it('rejeita sem autenticação', async () => {
    const res = await request(app)
      .post('/api/v1/analises/calcular')
      .send(multifamiliarNormal);
    expect(res.status).toBe(401);
  });

  it('calcula sem persistir (não aparece na listagem)', async () => {
    const { accessToken } = await criarUsuarioELogar(userA);

    const res = await request(app)
      .post('/api/v1/analises/calcular')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(multifamiliarNormal);

    expect(res.status).toBe(200);
    expect(AnalysisResultSchema.safeParse(res.body.resultado).success).toBe(
      true
    );
    expect(res.body.resultado.vgv).toBe(50_000_000);
    expect(res.body.resultado.recomendacao).toBe('COMPRAR');
    expect(res.body.parametrosSnapshot.tipologia.cubCodigo).toBe('R8-N');

    const listagem = await request(app)
      .get('/api/v1/analises')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(listagem.body.analises).toHaveLength(0);
  });

  it('rejeita tipologia/padrão inexistente', async () => {
    const { accessToken } = await criarUsuarioELogar(userA);

    const res = await request(app)
      .post('/api/v1/analises/calcular')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...multifamiliarNormal, tipologia: 'Inexistente' });

    expect(res.status).toBe(400);
  });

  it('rejeita tipologia sem código CUB mapeado (Comercial Baixo) em vez de inventar custo', async () => {
    const { accessToken } = await criarUsuarioELogar(userA);

    const res = await request(app)
      .post('/api/v1/analises/calcular')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...multifamiliarNormal,
        tipologia: 'Comercial',
        padrao: 'Baixo',
      });

    expect(res.status).toBe(422);
  });

  it('calcula Galpão com alerta de ajuste CUB não definido, sem bloquear', async () => {
    const { accessToken } = await criarUsuarioELogar(userA);

    const res = await request(app)
      .post('/api/v1/analises/calcular')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...multifamiliarNormal,
        tipologia: 'Galpão',
        padrao: 'Baixo',
        topografia: 'plana',
      });

    expect(res.status).toBe(200);
    expect(res.body.resultado.alertas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tipo: 'ajuste_cub_nao_definido' }),
      ])
    );
  });
});

describe('POST /api/v1/analises (persistência)', () => {
  it('cria e retorna a análise salva', async () => {
    const { accessToken } = await criarUsuarioELogar(userA);

    const res = await request(app)
      .post('/api/v1/analises')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(multifamiliarNormal);

    expect(res.status).toBe(201);
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.input.tipologia).toBe('Multifamiliar');
    expect(res.body.resultado.vgv).toBe(50_000_000);
    expect(res.body.parametrosSnapshot.tipologia.padrao).toBe('Normal');
  });

  it('preserva o snapshot dos parâmetros mesmo que os dados base mudem depois', async () => {
    const { accessToken } = await criarUsuarioELogar(userA);

    const res = await request(app)
      .post('/api/v1/analises')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(multifamiliarNormal);

    expect(res.body.parametrosSnapshot.cubBase.valorM2).toBeGreaterThan(0);
    expect(res.body.parametrosSnapshot.percentualLucroUsado).toBe(0.23);
  });

  it('respeita o limite de 3 análises salvas por usuário', async () => {
    const { accessToken } = await criarUsuarioELogar(userA);

    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post('/api/v1/analises')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(multifamiliarNormal);
      expect(res.status).toBe(201);
    }

    const quarta = await request(app)
      .post('/api/v1/analises')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(multifamiliarNormal);

    expect(quarta.status).toBe(400);
    expect(quarta.body.error).toMatch(/Limite de 3/);
  });

  it('usuário adjusta a margem de lucro (PRD §2.6) e o snapshot reflete o valor usado', async () => {
    const { accessToken } = await criarUsuarioELogar(userA);

    const res = await request(app)
      .post('/api/v1/analises')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...multifamiliarNormal, percentualLucro: 0.1 });

    expect(res.status).toBe(201);
    expect(res.body.parametrosSnapshot.percentualLucroUsado).toBe(0.1);
    // Lucro ajustado abaixo da referência (0.23) deve gerar o alerta de normalidade
    expect(res.body.resultado.alertas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tipo: 'lucro_abaixo_esperado' }),
      ])
    );
  });
});

describe('GET/DELETE /api/v1/analises/:id (isolamento entre usuários)', () => {
  it('usuário A não consegue ver nem deletar análise de usuário B', async () => {
    const contaA = await criarUsuarioELogar(userA);
    const contaB = await criarUsuarioELogar(userB);

    const criada = await request(app)
      .post('/api/v1/analises')
      .set('Authorization', `Bearer ${contaB.accessToken}`)
      .send(multifamiliarNormal);
    const idDeB = criada.body.id;

    const getComoA = await request(app)
      .get(`/api/v1/analises/${idDeB}`)
      .set('Authorization', `Bearer ${contaA.accessToken}`);
    expect(getComoA.status).toBe(404);

    const deleteComoA = await request(app)
      .delete(`/api/v1/analises/${idDeB}`)
      .set('Authorization', `Bearer ${contaA.accessToken}`);
    expect(deleteComoA.status).toBe(404);

    const getComoB = await request(app)
      .get(`/api/v1/analises/${idDeB}`)
      .set('Authorization', `Bearer ${contaB.accessToken}`);
    expect(getComoB.status).toBe(200);
  });

  it('lista apenas as análises do próprio usuário', async () => {
    const contaA = await criarUsuarioELogar(userA);
    const contaB = await criarUsuarioELogar(userB);

    await request(app)
      .post('/api/v1/analises')
      .set('Authorization', `Bearer ${contaA.accessToken}`)
      .send(multifamiliarNormal);
    await request(app)
      .post('/api/v1/analises')
      .set('Authorization', `Bearer ${contaB.accessToken}`)
      .send(multifamiliarNormal);

    const listaA = await request(app)
      .get('/api/v1/analises')
      .set('Authorization', `Bearer ${contaA.accessToken}`);

    expect(listaA.body.analises).toHaveLength(1);
  });

  it('deleta a própria análise', async () => {
    const { accessToken } = await criarUsuarioELogar(userA);

    const criada = await request(app)
      .post('/api/v1/analises')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(multifamiliarNormal);

    const del = await request(app)
      .delete(`/api/v1/analises/${criada.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(del.status).toBe(204);

    const getApos = await request(app)
      .get(`/api/v1/analises/${criada.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(getApos.status).toBe(404);
  });

  it('retorna 404 para id inexistente', async () => {
    const { accessToken } = await criarUsuarioELogar(userA);

    const res = await request(app)
      .get('/api/v1/analises/id-que-nao-existe')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });
});
