// @vitest-environment node
import type { Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { criarApp } from '../app';

const RESPOSTA_VIACEP_BH = {
  cep: '30130-010',
  logradouro: 'Praça Sete de Setembro',
  complemento: '',
  bairro: 'Centro',
  localidade: 'Belo Horizonte',
  uf: 'MG',
  ibge: '3106200',
};

let servidor: Server | undefined;

async function subir(buscar: typeof fetch): Promise<string> {
  const app = criarApp({ buscarExterno: buscar });
  return new Promise((resolver) => {
    servidor = app.listen(0, () => {
      const endereco = servidor?.address();
      resolver(`http://localhost:${typeof endereco === 'object' && endereco ? endereco.port : 0}`);
    });
  });
}

async function codigoErro(resposta: Response): Promise<string> {
  const corpo = (await resposta.json()) as { erro: { codigo: string } };
  return corpo.erro.codigo;
}

function respostaJson(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });
}

afterEach(() => {
  servidor?.close();
  servidor = undefined;
});

describe('GET /api/v1/cep/:cep', () => {
  it('devolve o endereço no formato da lastro, sem o formato do provedor', async () => {
    const buscar = vi.fn(async () => respostaJson(RESPOSTA_VIACEP_BH));
    const url = await subir(buscar as unknown as typeof fetch);

    const resposta = await fetch(`${url}/api/v1/cep/30130010`);

    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({
      dados: {
        cep: '30130010',
        logradouro: 'Praça Sete de Setembro',
        bairro: 'Centro',
        cidade: 'Belo Horizonte',
        uf: 'MG',
        codigoIbge: 3106200,
      },
    });
    expect(buscar).toHaveBeenCalledWith('https://viacep.com.br/ws/30130010/json/', expect.anything());
  });

  it('aceita o CEP com hífen', async () => {
    const url = await subir((async () => respostaJson(RESPOSTA_VIACEP_BH)) as unknown as typeof fetch);

    expect((await fetch(`${url}/api/v1/cep/30130-010`)).status).toBe(200);
  });

  it('recusa formato inválido sem consultar o provedor', async () => {
    const buscar = vi.fn();
    const url = await subir(buscar as unknown as typeof fetch);

    for (const invalido of ['1234', '301300100', '3013001a', '30130%20010']) {
      const resposta = await fetch(`${url}/api/v1/cep/${invalido}`);
      expect(resposta.status).toBe(400);
      expect(await codigoErro(resposta)).toBe('CEP_INVALIDO');
    }
    expect(buscar).not.toHaveBeenCalled();
  });

  it('CEP inexistente ({ erro: "true" } do ViaCEP) vira 404', async () => {
    const url = await subir((async () => respostaJson({ erro: 'true' })) as unknown as typeof fetch);

    const resposta = await fetch(`${url}/api/v1/cep/99999999`);

    expect(resposta.status).toBe(404);
    expect(await codigoErro(resposta)).toBe('CEP_NAO_ENCONTRADO');
  });

  it('provedor fora do ar (rede) vira 503', async () => {
    const url = await subir((async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch);

    const resposta = await fetch(`${url}/api/v1/cep/30130010`);

    expect(resposta.status).toBe(503);
    expect(await codigoErro(resposta)).toBe('CEP_INDISPONIVEL');
  });

  it('provedor com erro HTTP ou resposta que não é JSON vira 503', async () => {
    const url500 = await subir((async () => new Response('erro', { status: 500 })) as unknown as typeof fetch);
    expect((await fetch(`${url500}/api/v1/cep/30130010`)).status).toBe(503);
    servidor?.close();

    const urlHtml = await subir((async () => new Response('<html>', { status: 200 })) as unknown as typeof fetch);
    expect((await fetch(`${urlHtml}/api/v1/cep/30130010`)).status).toBe(503);
  });

  it('tempo esgotado vira 504', async () => {
    const url = await subir((async () => {
      throw new DOMException('esgotou', 'TimeoutError');
    }) as unknown as typeof fetch);

    const resposta = await fetch(`${url}/api/v1/cep/30130010`);

    expect(resposta.status).toBe(504);
    expect(await codigoErro(resposta)).toBe('CEP_TEMPO_ESGOTADO');
  });

  it('guarda em cache o que foi encontrado, mas não as falhas', async () => {
    let falhar = true;
    const buscar = vi.fn(async () => {
      if (falhar) throw new TypeError('fetch failed');
      return respostaJson(RESPOSTA_VIACEP_BH);
    });
    const url = await subir(buscar as unknown as typeof fetch);

    expect((await fetch(`${url}/api/v1/cep/30130010`)).status).toBe(503);
    falhar = false;
    expect((await fetch(`${url}/api/v1/cep/30130010`)).status).toBe(200);
    expect((await fetch(`${url}/api/v1/cep/30130010`)).status).toBe(200);

    expect(buscar).toHaveBeenCalledTimes(2);
  });
});
