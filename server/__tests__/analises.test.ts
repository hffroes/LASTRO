// @vitest-environment node
import type { Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CorpoApi, RespostaAnalise } from '../../src/types/analise';
import { gerarAnalise } from '../../src/utils/motor/analise';
import { lerAnaliseDoPayload } from '../../src/utils/validacao/analise';
import { criarApp } from '../app';

let servidor: Server | undefined;

async function subir(opcoesAnalise?: Parameters<typeof criarApp>[0]): Promise<string> {
  const app = criarApp(opcoesAnalise);
  return new Promise((resolver) => {
    servidor = app.listen(0, () => {
      const endereco = servidor?.address();
      resolver(`http://localhost:${typeof endereco === 'object' && endereco ? endereco.port : 0}`);
    });
  });
}

afterEach(() => {
  servidor?.close();
  servidor = undefined;
  vi.restoreAllMocks();
});

// Prédio Normal de 4 pavimentos, topografia Regular e formato Regular, num terreno de 1.000 m² a 60%.
// 16 unidades a R$ 900.000: os números da resposta estão conferidos à mão em economia.test.ts.
function payloadValido() {
  return {
    objetivo: 'comprarTerreno',
    terreno: {
      nome: 'Lote da Rua Alagoas',
      codigoMunicipioIbge: 3106200,
      cep: '',
      logradouro: '',
      bairro: '',
      ufCep: null,
      enderecoPeloCep: false,
      areaTotalM2: 1000,
      precoPedidoCentavos: 120_000_000,
      formatoLote: 'regular',
      topografia: 'regular',
    },
    produto: {
      tipoProjeto: 'residencial',
      tipologia: 'predio',
      padrao: 'normal',
      pavimentos: 4,
      unidadesPorPavimento: 4,
      areaUnidadeM2: 68.5,
      precoUnidadeCentavos: 90_000_000,
      taxaOcupacaoPontosBase: 6_000,
    },
  };
}

async function postar(base: string, corpo: unknown, cabecalhos: Record<string, string> = { 'Content-Type': 'application/json' }) {
  return fetch(`${base}/api/v1/analises`, {
    method: 'POST',
    headers: cabecalhos,
    body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  });
}

describe('POST /api/v1/analises — payload válido', () => {
  it('devolve { dados } com o resultado: VGV, obra, despesas, lucro, Resultado Terreno e Líquido', async () => {
    const base = await subir();
    const resposta = await postar(base, payloadValido());
    const corpo = (await resposta.json()) as CorpoApi<RespostaAnalise>;

    expect(resposta.status).toBe(200);
    expect(corpo).toHaveProperty('dados');
    const dados = (corpo as { dados: RespostaAnalise }).dados;
    expect(dados.situacao).toBe('calculado');
    if (dados.situacao !== 'calculado') return;
    expect(dados.economia).toEqual({
      vgvCentavos: 1_440_000_000,
      custoObraCentavos: 757_178_400,
      despesasGeraisCentavos: 158_400_000,
      lucroIncorporadorCentavos: 316_800_000,
      precoPedidoCentavos: 120_000_000,
      resultadoTerrenoCentavos: 207_621_600,
      resultadoLiquidoCentavos: 87_621_600,
      lucroResultanteCentavos: 404_421_600,
      percentuaisDoVgvPontosBase: {
        custoObra: 5_258,
        despesasGerais: 1_100,
        lucroIncorporador: 2_200,
        resultadoTerreno: 1_442,
        precoPedido: 833,
        resultadoLiquido: 609,
        lucroResultante: 2_809,
      },
      viavel: true,
    });
    expect(dados.areas.areaConstruidaCentesimos).toBe(240_000);
  });

  it('devolve o programa efetivo, com as travas da tipologia: casa de 2 pavimentos tem 1 unidade', async () => {
    const base = await subir();
    const payload = payloadValido();
    Object.assign(payload.produto, { tipoProjeto: 'residencial', tipologia: 'casa', pavimentos: 2, unidadesPorPavimento: 9 });
    const corpo = (await (await postar(base, payload)).json()) as { dados: RespostaAnalise };
    if (corpo.dados.situacao !== 'calculado') throw new Error('esperava calculado');
    expect(corpo.dados.programa).toEqual({ pavimentos: 2, unidadesPorPavimento: 1, totalUnidades: 1 });

    const predio = (await (await postar(base, payloadValido())).json()) as { dados: RespostaAnalise };
    if (predio.dados.situacao !== 'calculado') throw new Error('esperava calculado');
    expect(predio.dados.programa).toEqual({ pavimentos: 4, unidadesPorPavimento: 4, totalUnidades: 16 });
  });

  it('o snapshot das premissas e da versão de dados acompanha a resposta', async () => {
    const base = await subir();
    const corpo = (await (await postar(base, payloadValido())).json()) as { dados: RespostaAnalise };
    if (corpo.dados.situacao !== 'calculado') throw new Error('esperava calculado');
    const { premissas } = corpo.dados;

    expect(premissas.versaoMotor).toBe('motor-v1');
    expect(premissas.cub.versaoBase).toMatchObject({ id: 'cub-2026-08', competencia: { ano: 2026, mes: 8 } });
    expect(premissas.cub.cubAjustadoCentavos).toBe(315_491);
    expect(premissas.cub.aditivos.somaPontosBase).toBe(2_350);
    expect(premissas.lucroIncorporador).toMatchObject({ padrao: 'normal', pontosBase: 2_200, provisorio: true, versao: 'v1' });
    // D-B2 e D-R26: aplica 11,0% (comissões + impostos + despesas financeiras) e registra que a fonte lista
    // Venda e Marketing (1,0%) fora do total, o que leva a soma dos itens a 12,0%.
    expect(premissas.despesasGerais).toMatchObject({
      pontosBase: 1_100,
      provisorio: true,
      componentesAplicados: { comissoes: 500, impostosETaxas: 450, despesasFinanceiras: 150 },
      foraDoTotal: { vendaEMarketing: 100 },
      somaItemizacaoPontosBase: 1_200,
    });
    expect(premissas.taxaOcupacao).toMatchObject({ pontosBase: 6_000, ajustadaPeloUsuario: false, provisorio: true });
  });

  it('taxa de ocupação ajustada pelo usuário é refletida e sinalizada no snapshot, sem alterar o padrão', async () => {
    const base = await subir();
    const payload = payloadValido();
    payload.produto.taxaOcupacaoPontosBase = 5_000;
    const corpo = (await (await postar(base, payload)).json()) as { dados: RespostaAnalise };
    if (corpo.dados.situacao !== 'calculado') throw new Error('esperava calculado');

    expect(corpo.dados.areas.areaConstruidaCentesimos).toBe(200_000);
    expect(corpo.dados.premissas.taxaOcupacao).toMatchObject({ pontosBase: 5_000, padraoPontosBase: 6_000, ajustadaPeloUsuario: true });

    const outra = (await (await postar(base, payloadValido())).json()) as { dados: RespostaAnalise };
    if (outra.dados.situacao !== 'calculado') throw new Error('esperava calculado');
    expect(outra.dados.premissas.taxaOcupacao.pontosBase).toBe(6_000);
  });

  it('a regra existe uma vez só: a resposta é idêntica à execução direta do motor compartilhado', async () => {
    const base = await subir();
    const corpo = (await (await postar(base, payloadValido())).json()) as { dados: RespostaAnalise };
    const direto = gerarAnalise(lerAnaliseDoPayload(payloadValido()).analise!);
    expect(corpo.dados).toEqual(JSON.parse(JSON.stringify(direto)));
  });

  it('é repetível e não guarda nada: duas chamadas iguais dão a mesma resposta', async () => {
    const base = await subir();
    const primeira = await (await postar(base, payloadValido())).json();
    const segunda = await (await postar(base, payloadValido())).json();
    expect(segunda).toEqual(primeira);
  });

  it('responde em menos de 500 ms (PRD 6.2)', async () => {
    const base = await subir();
    await postar(base, payloadValido()); // aquece a conexão
    const inicio = performance.now();
    const resposta = await postar(base, payloadValido());
    const duracao = performance.now() - inicio;
    expect(resposta.status).toBe(200);
    expect(duracao).toBeLessThan(500);
  });

  it('o motor sozinho calcula em menos de 50 ms', () => {
    const analise = lerAnaliseDoPayload(payloadValido()).analise!;
    const inicio = performance.now();
    for (let i = 0; i < 100; i += 1) gerarAnalise(analise);
    expect((performance.now() - inicio) / 100).toBeLessThan(50);
  });
});

describe('POST /api/v1/analises — CUB sem valor publicado não é erro', () => {
  it('padrão Baixo em R-16 (D-B4): 200 com situação cubPendente, sem número inventado', async () => {
    const base = await subir();
    const payload = payloadValido();
    Object.assign(payload.produto, { padrao: 'baixo', pavimentos: 10 });
    const resposta = await postar(base, payload);
    const corpo = (await resposta.json()) as { dados: RespostaAnalise };

    expect(resposta.status).toBe(200);
    expect(corpo.dados).toMatchObject({ situacao: 'cubPendente', motivo: 'padraoSemValorPublicado', projeto: 'R-16' });
    expect(corpo.dados).not.toHaveProperty('economia');
    expect(corpo.dados).not.toHaveProperty('premissas');
  });

  it('andares livres com 9+ pavimentos (D-B5): cubPendente por projeto sem tabela', async () => {
    const base = await subir();
    const payload = payloadValido();
    Object.assign(payload.produto, { tipoProjeto: 'comercial', tipologia: 'andaresLivres', pavimentos: 12 });
    const corpo = (await (await postar(base, payload)).json()) as { dados: RespostaAnalise };
    expect(corpo.dados).toMatchObject({ situacao: 'cubPendente', motivo: 'projetoSemTabela', projeto: 'CAL-16' });
  });
});

describe('POST /api/v1/analises — validação obrigatória no backend', () => {
  it('payload incompleto: 400 VALIDACAO_FALHOU com cada campo e a mensagem da tela', async () => {
    const base = await subir();
    const resposta = await postar(base, { terreno: {}, produto: {} });
    const corpo = (await resposta.json()) as { erro: { codigo: string; mensagem: string; detalhes: { etapa: string; campo: string }[] } };

    expect(resposta.status).toBe(400);
    expect(corpo.erro.codigo).toBe('VALIDACAO_FALHOU');
    expect(corpo.erro.detalhes.map((d) => `${d.etapa}.${d.campo}`)).toContain('terreno.nome');
    expect(corpo.erro.detalhes.map((d) => `${d.etapa}.${d.campo}`)).toContain('produto.precoUnidade');
    expect(corpo).not.toHaveProperty('dados');
  });

  it('recusa o que o front já recusaria: valores negativos, zero e fora da tabela', async () => {
    const base = await subir();
    const casos: [string, object][] = [
      ['área negativa', { terreno: { areaTotalM2: -10 } }],
      ['preço pedido zero', { terreno: { precoPedidoCentavos: 0 } }],
      ['pavimentos fracionados', { produto: { pavimentos: 2.5 } }],
      ['taxa acima de 100%', { produto: { taxaOcupacaoPontosBase: 20_000 } }],
      ['padrão inventado', { produto: { padrao: 'luxo' } }],
      ['Uso Misto', { produto: { tipoProjeto: 'usoMisto' } }],
    ];
    for (const [nome, alteracao] of casos) {
      const payload = payloadValido();
      const a = alteracao as { terreno?: object; produto?: object };
      Object.assign(payload.terreno, a.terreno);
      Object.assign(payload.produto, a.produto);
      const resposta = await postar(base, payload);
      expect(resposta.status, nome).toBe(400);
    }
  });

  it('recusa tipo errado (texto no lugar de número) em vez de coagir', async () => {
    const base = await subir();
    const payload = payloadValido() as unknown as { terreno: Record<string, unknown> };
    payload.terreno.areaTotalM2 = '1000';
    const resposta = await postar(base, payload);
    const corpo = (await resposta.json()) as { erro: { detalhes: { campo: string; mensagem: string }[] } };
    expect(resposta.status).toBe(400);
    expect(corpo.erro.detalhes).toContainEqual({ etapa: 'terreno', campo: 'areaTotalM2', mensagem: 'Esperado um número.' });
  });

  it('VGV acima do teto técnico é recusado na validação, não explode no cálculo', async () => {
    const base = await subir();
    const payload = payloadValido();
    Object.assign(payload.produto, { pavimentos: 200, unidadesPorPavimento: 1000, precoUnidadeCentavos: 1_000_000_000_000 });
    const resposta = await postar(base, payload);
    expect(resposta.status).toBe(400);
  });

  it('corpo que não é objeto: 400 CORPO_INVALIDO', async () => {
    const base = await subir();
    for (const corpo of ['[]', '42', '"texto"', 'null']) {
      const resposta = await postar(base, corpo);
      const json = (await resposta.json()) as { erro: { codigo: string } };
      expect(resposta.status, corpo).toBe(400);
      expect(json.erro.codigo, corpo).toBe('CORPO_INVALIDO');
    }
  });

  it('JSON malformado: 400 CORPO_INVALIDO, em JSON e sem pilha', async () => {
    const base = await subir();
    const resposta = await postar(base, '{ "terreno": ');
    const corpo = (await resposta.json()) as { erro: { codigo: string; mensagem: string } };
    expect(resposta.status).toBe(400);
    expect(corpo.erro.codigo).toBe('CORPO_INVALIDO');
    expect(JSON.stringify(corpo)).not.toMatch(/at .*\(.*:\d+:\d+\)|node_modules|SyntaxError/);
  });

  it('tipo de conteúdo que não é JSON: 415', async () => {
    const base = await subir();
    const resposta = await postar(base, 'terreno=1', { 'Content-Type': 'text/plain' });
    const corpo = (await resposta.json()) as { erro: { codigo: string } };
    expect(resposta.status).toBe(415);
    expect(corpo.erro.codigo).toBe('TIPO_NAO_SUPORTADO');
  });

  it('corpo grande demais: 413', async () => {
    const base = await subir();
    const resposta = await postar(base, { ...payloadValido(), lixo: 'x'.repeat(80_000) });
    const corpo = (await resposta.json()) as { erro: { codigo: string } };
    expect(resposta.status).toBe(413);
    expect(corpo.erro.codigo).toBe('PAYLOAD_GRANDE_DEMAIS');
  });

  it('campos desconhecidos e tentativa de poluir o protótipo não alteram o resultado', async () => {
    const base = await subir();
    const corpoMalicioso = JSON.parse(
      JSON.stringify({ ...payloadValido(), admin: true }).replace('"terreno":{', '"terreno":{"__proto__":{"polluted":true},"constructor":{"prototype":{"x":1}},'),
    );
    // Garante que a injeção existe no corpo enviado: sem isso o teste passaria vazio.
    expect(Object.keys(corpoMalicioso.terreno)).toEqual(expect.arrayContaining(['__proto__', 'constructor']));
    const resposta = await postar(base, corpoMalicioso);
    const limpa = await (await postar(base, payloadValido())).json();
    expect(await resposta.json()).toEqual(limpa);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe('formato consistente e rotas', () => {
  it('rota inexistente da API responde 404 em JSON, no mesmo formato de erro', async () => {
    const base = await subir();
    const resposta = await fetch(`${base}/api/v1/nao-existe`);
    const corpo = (await resposta.json()) as { erro: { codigo: string } };
    expect(resposta.status).toBe(404);
    expect(corpo.erro.codigo).toBe('ROTA_NAO_ENCONTRADA');
  });

  it('GET na rota de análises não é aceito', async () => {
    const base = await subir();
    const resposta = await fetch(`${base}/api/v1/analises`);
    expect(resposta.status).toBe(404);
  });

  it('as rotas anteriores seguem funcionando', async () => {
    const base = await subir();
    const resposta = await fetch(`${base}/api/v1/saude`);
    expect(await resposta.json()).toEqual({ status: 'ok' });
  });

  it('falha interna: 500 ERRO_INTERNO com mensagem genérica, sem vazar o motivo', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const base = await subir({
      opcoesAnalise: {
        repositorioCub: {
          obterVersaoVigente: () => {
            throw new Error('segredo-interno: senha do banco');
          },
        },
      },
    });
    const resposta = await postar(base, payloadValido());
    const texto = await resposta.text();
    expect(resposta.status).toBe(500);
    expect(JSON.parse(texto).erro.codigo).toBe('ERRO_INTERNO');
    expect(texto).not.toContain('segredo-interno');
  });
});
