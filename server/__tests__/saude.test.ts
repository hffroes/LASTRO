// @vitest-environment node
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { criarApp } from '../app';

describe('GET /api/v1/saude', () => {
  let servidor: Server;
  let url: string;

  beforeAll(async () => {
    const app = criarApp();
    await new Promise<void>((resolver) => {
      servidor = app.listen(0, () => {
        const endereco = servidor.address();
        const porta = typeof endereco === 'object' && endereco ? endereco.port : 0;
        url = `http://localhost:${porta}`;
        resolver();
      });
    });
  });

  afterAll(() => {
    servidor.close();
  });

  it('responde com status ok', async () => {
    const resposta = await fetch(`${url}/api/v1/saude`);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({ status: 'ok' });
  });
});
