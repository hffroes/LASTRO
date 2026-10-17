import { describe, expect, it } from 'vitest';
import type { Analise } from '../../../types/analise';
import type { AjustesPremissas } from '../../../types/parametros';
import { gerarAnalise } from '../analise';
import { PARAMETROS_ECONOMIA_PADRAO } from '../economia';
import {
  DESPESAS_GERAIS_TOTAL,
  FAIXAS_NORMALIDADE,
  LUCRO_INCORPORADOR_POR_PADRAO,
  TAXA_OCUPACAO_PADRAO,
} from '../parametros';
import {
  aplicarAjustes,
  avisosDoCenario,
  contarAjustes,
  descreverCenario,
  normalizarAjustes,
  parametrosDoCenario,
  valoresOriginais,
  type ValoresPremissas,
} from '../premissas';

// O cenário de referência de economia.test.ts, como análise: prédio Normal de 4 pavimentos, 1.000 m² a 60%
// (2.400 m² construídos), CUB ajustado R$ 3.154,91/m², 16 unidades a R$ 900.000, pedido R$ 1,2 milhão.
// Sem ajuste: VGV 14.400.000 · obra 7.571.784 · despesas 1.584.000 · lucro 3.168.000 · terreno 2.076.216.
function analise(): Analise {
  return {
    objetivo: 'comprarTerreno',
    terreno: {
      nome: 'Lote',
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

function calcular(ajustes: AjustesPremissas) {
  const resposta = gerarAnalise(analise(), {}, ajustes);
  if (resposta.situacao !== 'calculado') throw new Error(`esperado calculado, veio ${resposta.situacao}`);
  return resposta;
}

const ORIGINAIS: ValoresPremissas = {
  precoUnidade: 90_000_000,
  lucroIncorporador: 2_200,
  despesasGerais: 1_100,
  taxaOcupacao: 6_000,
  cubAjustado: 315_491,
};

describe('sobreposição de premissas — cada ajuste recalcula a conta, conferida à mão', () => {
  it('sem ajuste, a resposta é a da análise informada', () => {
    const r = calcular({});
    expect(r.economia.resultadoTerrenoCentavos).toBe(207_621_600);
    expect(r).toEqual(gerarAnalise(analise()));
    expect(r.premissas.ajustes.quantidade).toBe(0);
  });

  it('preço de venda +10% (PRD 10.2): VGV 15.840.000, despesas 1.742.400, lucro 3.484.800, terreno 3.041.016', () => {
    const r = calcular({ precoUnidade: 99_000_000 });
    expect(r.economia.vgvCentavos).toBe(1_584_000_000);
    expect(r.economia.custoObraCentavos).toBe(757_178_400);
    expect(r.economia.despesasGeraisCentavos).toBe(174_240_000);
    expect(r.economia.lucroIncorporadorCentavos).toBe(348_480_000);
    expect(r.economia.resultadoTerrenoCentavos).toBe(304_101_600);
  });

  it('lucro de 20%: lucro 2.880.000, terreno 2.364.216', () => {
    const r = calcular({ lucroIncorporador: 2_000 });
    expect(r.economia.lucroIncorporadorCentavos).toBe(288_000_000);
    expect(r.economia.resultadoTerrenoCentavos).toBe(236_421_600);
    expect(r.premissas.lucroIncorporador.pontosBase).toBe(2_000);
  });

  it('despesas de 12%: despesas 1.728.000, terreno 1.932.216', () => {
    const r = calcular({ despesasGerais: 1_200 });
    expect(r.economia.despesasGeraisCentavos).toBe(172_800_000);
    expect(r.economia.resultadoTerrenoCentavos).toBe(193_221_600);
    expect(r.premissas.despesasGerais.pontosBase).toBe(1_200);
  });

  it('taxa de ocupação de 50%: 2.000 m² construídos, obra 6.309.820, terreno 3.338.180 — o VGV não muda', () => {
    const r = calcular({ taxaOcupacao: 5_000 });
    expect(r.areas.areaConstruidaCentesimos).toBe(200_000);
    expect(r.economia.vgvCentavos).toBe(1_440_000_000);
    expect(r.economia.custoObraCentavos).toBe(630_982_000);
    expect(r.economia.resultadoTerrenoCentavos).toBe(333_818_000);
    expect(r.premissas.taxaOcupacao.pontosBase).toBe(5_000);
  });

  it('CUB ajustado de R$ 3.000,00/m²: obra 7.200.000, terreno 2.448.000; o CUB calculado segue registrado', () => {
    const r = calcular({ cubAjustado: 300_000 });
    expect(r.economia.custoObraCentavos).toBe(720_000_000);
    expect(r.economia.resultadoTerrenoCentavos).toBe(244_800_000);
    expect(r.premissas.cub.cubAjustadoCentavos).toBe(315_491);
    expect(r.premissas.ajustes.premissas.cubAjustado).toEqual({ original: 315_491, usado: 300_000, ajustada: true });
  });

  it('ajustes se combinam na mesma conta: preço +10% e CUB R$ 3.000,00 dão terreno 3.412.800', () => {
    const r = calcular({ precoUnidade: 99_000_000, cubAjustado: 300_000 });
    expect(r.economia.resultadoTerrenoCentavos).toBe(341_280_000);
    expect(r.premissas.ajustes.quantidade).toBe(2);
  });

  it('a leitura Incorporador acompanha: lucro resultante = lucro do cenário + resultado líquido', () => {
    const r = calcular({ precoUnidade: 99_000_000, lucroIncorporador: 2_500 });
    expect(r.economia.lucroResultanteCentavos).toBe(r.economia.lucroIncorporadorCentavos + r.economia.resultadoLiquidoCentavos);
  });
});

describe('snapshot (PRD 10.5) — distingue premissa padrão de premissa ajustada', () => {
  it('registra original e usado de todas as premissas, ajustadas ou não', () => {
    const r = calcular({ despesasGerais: 1_200 });
    expect(r.premissas.ajustes).toEqual({
      quantidade: 1,
      premissas: {
        precoUnidade: { original: 90_000_000, usado: 90_000_000, ajustada: false },
        lucroIncorporador: { original: 2_200, usado: 2_200, ajustada: false },
        despesasGerais: { original: 1_100, usado: 1_200, ajustada: true },
        taxaOcupacao: { original: 6_000, usado: 6_000, ajustada: false },
        cubAjustado: { original: 315_491, usado: 315_491, ajustada: false },
      },
    });
  });

  it('a taxa ajustada no cenário é marcada contra o padrão da ferramenta, como a da Etapa 2', () => {
    const r = calcular({ taxaOcupacao: 5_000 });
    expect(r.premissas.taxaOcupacao).toMatchObject({ pontosBase: 5_000, padraoPontosBase: 6_000, ajustadaPeloUsuario: true });
  });

  it('o original da taxa é o informado na Etapa 2, e não o padrão global', () => {
    const informada = analise();
    informada.produto.taxaOcupacaoPontosBase = 7_000;
    const r = gerarAnalise(informada, {}, { taxaOcupacao: 5_000 });
    if (r.situacao !== 'calculado') throw new Error();
    expect(r.premissas.ajustes.premissas.taxaOcupacao).toEqual({ original: 7_000, usado: 5_000, ajustada: true });
  });

  it('ajuste igual ao original não conta como ajustado', () => {
    expect(calcular({ lucroIncorporador: 2_200 }).premissas.ajustes.quantidade).toBe(0);
  });
});

describe('o padrão global nunca muda (PRD 2.10, CLAUDE.md)', () => {
  it('depois de ajustar tudo, parâmetros e próxima análise sem ajuste voltam ao padrão', () => {
    const antes = JSON.stringify([PARAMETROS_ECONOMIA_PADRAO, LUCRO_INCORPORADOR_POR_PADRAO, DESPESAS_GERAIS_TOTAL, TAXA_OCUPACAO_PADRAO]);
    calcular({ precoUnidade: 99_000_000, lucroIncorporador: 3_000, despesasGerais: 1_500, taxaOcupacao: 5_000, cubAjustado: 300_000 });
    expect(JSON.stringify([PARAMETROS_ECONOMIA_PADRAO, LUCRO_INCORPORADOR_POR_PADRAO, DESPESAS_GERAIS_TOTAL, TAXA_OCUPACAO_PADRAO])).toBe(antes);
    expect(calcular({}).economia.resultadoTerrenoCentavos).toBe(207_621_600);
  });

  it('o lucro ajustado substitui só o do padrão da análise, numa tabela nova', () => {
    const usados = aplicarAjustes(ORIGINAIS, { lucroIncorporador: 3_000 });
    const parametros = parametrosDoCenario(PARAMETROS_ECONOMIA_PADRAO, 'normal', usados);
    expect(parametros.lucroIncorporadorPontosBase).toEqual({ baixo: 2_000, normal: 3_000, alto: 2_500 });
    expect(parametros.lucroIncorporadorPontosBase).not.toBe(PARAMETROS_ECONOMIA_PADRAO.lucroIncorporadorPontosBase);
    expect(PARAMETROS_ECONOMIA_PADRAO.lucroIncorporadorPontosBase.normal).toBe(2_200);
  });

  it('aplicar ajustes não altera os originais recebidos', () => {
    const originais = { ...ORIGINAIS };
    aplicarAjustes(originais, { precoUnidade: 1 });
    expect(originais).toEqual(ORIGINAIS);
  });
});

describe('funções da camada de ajustes', () => {
  it('valoresOriginais: preço e taxa da análise; lucro do padrão, despesas e CUB calculado', () => {
    expect(
      valoresOriginais({
        precoUnidadeCentavos: 90_000_000,
        taxaOcupacaoPontosBase: 6_000,
        padrao: 'alto',
        parametros: PARAMETROS_ECONOMIA_PADRAO,
        cubAjustadoCentavos: 315_491,
      }),
    ).toEqual({ ...ORIGINAIS, lucroIncorporador: 2_500 });
  });

  it('normalizarAjustes descarta o que é igual ao original; contarAjustes conta o resto', () => {
    const ajustes = normalizarAjustes({ precoUnidade: 90_000_000, despesasGerais: 1_200 }, ORIGINAIS);
    expect(ajustes).toEqual({ despesasGerais: 1_200 });
    expect(contarAjustes(ajustes)).toBe(1);
    expect(contarAjustes({})).toBe(0);
  });

  it('descreverCenario marca ajustada quando usado difere do original', () => {
    const descricao = descreverCenario(ORIGINAIS, aplicarAjustes(ORIGINAIS, { cubAjustado: 1 }));
    expect(descricao.quantidade).toBe(1);
    expect(descricao.premissas.cubAjustado.ajustada).toBe(true);
    expect(descricao.premissas.precoUnidade.ajustada).toBe(false);
  });
});

describe('avisos de plausibilidade — faixas do PRD 4.2, limites dentro', () => {
  const faixas = FAIXAS_NORMALIDADE.valor;

  it('as faixas são as do PRD 4.2: obra 40–65%, despesas 10–15%, lucro 20–25%', () => {
    expect(faixas).toEqual({
      custoObra: { minimo: 4_000, maximo: 6_500 },
      despesasGerais: { minimo: 1_000, maximo: 1_500 },
      lucroIncorporador: { minimo: 2_000, maximo: 2_500 },
    });
  });

  it.each([
    [1_999, true],
    [2_000, false],
    [2_200, false],
    [2_500, false],
    [2_501, true],
  ])('lucro de %i pontos-base fora da faixa: %s', (lucro, fora) => {
    expect(avisosDoCenario({ lucroIncorporador: lucro }, { custoObra: 5_000 }).lucroIncorporador !== null).toBe(fora);
  });

  it.each([
    [999, true],
    [1_000, false],
    [1_500, false],
    [1_501, true],
  ])('despesas de %i pontos-base fora da faixa: %s', (despesas, fora) => {
    expect(avisosDoCenario({ despesasGerais: despesas }, { custoObra: 5_000 }).despesasGerais !== null).toBe(fora);
  });

  it('o custo de obra só é avisado quando preço, taxa ou CUB foram ajustados', () => {
    expect(avisosDoCenario({}, { custoObra: 7_000 }).custoObra).toBeNull();
    expect(avisosDoCenario({ lucroIncorporador: 2_200 }, { custoObra: 7_000 }).custoObra).toBeNull();
    expect(avisosDoCenario({ cubAjustado: 600_000 }, { custoObra: 7_000 }).custoObra).toEqual({
      valorPontosBase: 7_000,
      faixa: faixas.custoObra,
    });
    expect(avisosDoCenario({ precoUnidade: 1 }, { custoObra: 6_500 }).custoObra).toBeNull();
    expect(avisosDoCenario({ taxaOcupacao: 1 }, { custoObra: 3_999 }).custoObra).not.toBeNull();
    expect(avisosDoCenario({ taxaOcupacao: 1 }, { custoObra: null }).custoObra).toBeNull();
  });

  it('ajuste sem faixa não gera aviso: lucro e despesas ausentes', () => {
    const avisos = avisosDoCenario({ precoUnidade: 1 }, { custoObra: 5_000 });
    expect(avisos).toEqual({ lucroIncorporador: null, despesasGerais: null, custoObra: null });
  });
});

describe('performance (PRD 6.2: recálculo < 500 ms)', () => {
  it('o motor recalcula um cenário com os cinco ajustes muito abaixo do limite', () => {
    const ajustes = { precoUnidade: 99_000_000, lucroIncorporador: 2_500, despesasGerais: 1_200, taxaOcupacao: 5_000, cubAjustado: 300_000 };
    const inicio = performance.now();
    for (let i = 0; i < 100; i += 1) calcular(ajustes);
    // 100 recálculos inteiros dentro do orçamento de um só.
    expect(performance.now() - inicio).toBeLessThan(500);
  });
});
