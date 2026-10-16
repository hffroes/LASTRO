import { describe, expect, it } from 'vitest';
import { LIMITE_VGV_CENTAVOS } from '../motor/economia';
import { lerAnaliseDoPayload } from './analise';
import { MENSAGENS_PRODUTO } from './produto';
import { MENSAGENS_TERRENO } from './terreno';

// Payload válido: prédio Normal de 4 × 4 unidades num terreno de 1.000 m².
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

function campos(bruto: unknown) {
  return lerAnaliseDoPayload(bruto).erros.map((erro) => `${erro.etapa}.${erro.campo}`);
}

describe('lerAnaliseDoPayload — payload válido', () => {
  it('devolve a análise, sem erros', () => {
    const r = lerAnaliseDoPayload(payloadValido());
    expect(r.erros).toEqual([]);
    expect(r.analise?.produto.pavimentos).toBe(4);
    expect(r.analise?.terreno.precoPedidoCentavos).toBe(120_000_000);
  });

  it('ignora campos desconhecidos: nada além dos conhecidos chega ao cálculo', () => {
    const bruto = { ...payloadValido(), admin: true, terreno: { ...payloadValido().terreno, __proto__: { x: 1 }, extra: 'lixo' } };
    const r = lerAnaliseDoPayload(bruto);
    expect(r.erros).toEqual([]);
    expect(r.analise).not.toHaveProperty('admin');
    expect(r.analise?.terreno).not.toHaveProperty('extra');
  });
});

describe('lerAnaliseDoPayload — corpo inválido', () => {
  it.each([null, undefined, 'texto', 42, [], true])('recusa corpo que não é objeto (%j)', (bruto) => {
    const r = lerAnaliseDoPayload(bruto);
    expect(r.analise).toBeNull();
    expect(r.erros).toHaveLength(1);
    expect(r.erros[0]).toMatchObject({ etapa: 'corpo', campo: 'corpo' });
  });

  it('exige terreno e produto como objetos', () => {
    expect(campos({ objetivo: 'comprarTerreno' })).toEqual(['corpo.terreno', 'corpo.produto']);
    expect(campos({ terreno: [], produto: 'x' })).toEqual(['corpo.terreno', 'corpo.produto']);
  });
});

describe('lerAnaliseDoPayload — tipos errados são recusados, não coagidos', () => {
  it('texto onde se espera número, e o inverso', () => {
    const bruto = payloadValido();
    (bruto.terreno as Record<string, unknown>).areaTotalM2 = '1000';
    (bruto.terreno as Record<string, unknown>).nome = 42;
    (bruto.produto as Record<string, unknown>).pavimentos = '4';
    const r = lerAnaliseDoPayload(bruto);
    expect(r.analise).toBeNull();
    expect(r.erros).toEqual(
      expect.arrayContaining([
        { etapa: 'terreno', campo: 'areaTotalM2', mensagem: 'Esperado um número.' },
        { etapa: 'terreno', campo: 'nome', mensagem: 'Esperado um texto.' },
        { etapa: 'produto', campo: 'pavimentos', mensagem: 'Esperado um número.' },
      ]),
    );
  });

  it('número não finito é recusado', () => {
    const bruto = payloadValido();
    (bruto.produto as Record<string, unknown>).areaUnidadeM2 = Number.POSITIVE_INFINITY;
    expect(lerAnaliseDoPayload(bruto).analise).toBeNull();
  });
});

describe('lerAnaliseDoPayload — regras da tela, no backend, com as mesmas mensagens', () => {
  it('payload vazio pede tudo o que a tela pede, na ordem da página', () => {
    expect(campos({ terreno: {}, produto: {} })).toEqual([
      'objetivo.objetivo',
      'terreno.nome',
      'terreno.cidade',
      'terreno.area',
      'terreno.preco',
      'terreno.formato',
      'terreno.topografia',
      'produto.tipoProjeto',
      'produto.padrao',
      'produto.pavimentos',
      'produto.unidadesPorPavimento',
      'produto.areaUnidade',
      'produto.precoUnidade',
      'produto.taxaOcupacao',
    ]);
  });

  it('a mensagem é a da tela', () => {
    const bruto = payloadValido();
    bruto.terreno.nome = '   ';
    const erro = lerAnaliseDoPayload(bruto).erros.find((e) => e.campo === 'nome');
    expect(erro?.mensagem).toBe(MENSAGENS_TERRENO.nomeVazio);
  });

  it('valor de opção fora da tabela conta como não escolhido (Uso Misto, D-B6, e inventados)', () => {
    for (const [campo, valor] of [['tipoProjeto', 'usoMisto'], ['tipologia', 'cobertura'], ['padrao', 'medio']] as const) {
      const bruto = payloadValido();
      (bruto.produto as Record<string, unknown>)[campo] = valor;
      expect(lerAnaliseDoPayload(bruto).analise).toBeNull();
    }
  });

  it('tipologia de outro tipo é recusada', () => {
    const bruto = payloadValido();
    bruto.produto.tipologia = 'galpao';
    expect(campos(bruto)).toEqual(['produto.tipologia']);
  });

  it('recusa tipologia com nome de propriedade do protótipo ("constructor")', () => {
    const bruto = payloadValido();
    bruto.produto.tipologia = 'constructor';
    const r = lerAnaliseDoPayload(bruto);
    expect(r.analise).toBeNull();
    expect(r.erros.some((e) => e.campo === 'tipologia')).toBe(true);
  });

  it('galpão e casa dispensam o que a trava fixa, e valores guardados a mais não atrapalham', () => {
    const galpao = payloadValido();
    Object.assign(galpao.produto, { tipoProjeto: 'galpoes', tipologia: 'galpao', pavimentos: null, unidadesPorPavimento: null });
    expect(lerAnaliseDoPayload(galpao).erros).toEqual([]);
  });

  it('CEP fora de MG, informado pela consulta, bloqueia (D-R15)', () => {
    const bruto = payloadValido();
    Object.assign(bruto.terreno, { cep: '01001000', ufCep: 'SP' });
    expect(campos(bruto)).toEqual(['terreno.cep']);
  });
});

describe('teto do VGV na validação da etapa', () => {
  it('cada campo passa no seu teto, mas unidades × preço passam do que o cálculo representa', () => {
    const bruto = payloadValido();
    Object.assign(bruto.produto, { pavimentos: 200, unidadesPorPavimento: 1000, precoUnidadeCentavos: 1_000_000_000_000 });
    const r = lerAnaliseDoPayload(bruto);
    expect(r.analise).toBeNull();
    expect(r.erros).toEqual([{ etapa: 'produto', campo: 'precoUnidade', mensagem: MENSAGENS_PRODUTO.vgvAcimaDoLimite }]);
  });

  it('no limite exato, passa', () => {
    const bruto = payloadValido();
    Object.assign(bruto.produto, { pavimentos: 1, unidadesPorPavimento: 1, precoUnidadeCentavos: LIMITE_VGV_CENTAVOS });
    expect(lerAnaliseDoPayload(bruto).erros).toEqual([]);
  });

  it('não soma um segundo erro quando o preço já está inválido', () => {
    const analise = lerAnaliseDoPayload({ ...payloadValido(), produto: { ...payloadValido().produto, precoUnidadeCentavos: 0 } });
    expect(analise.erros.map((e) => e.campo)).toEqual(['precoUnidade']);
    expect(analise.erros[0]?.mensagem).toBe(MENSAGENS_PRODUTO.precoUnidadeNaoPositivo);
  });
});
