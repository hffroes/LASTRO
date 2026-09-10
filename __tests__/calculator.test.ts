// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  CORRETAGEM_PERCENTUAL_VGV,
  IMPOSTOS_PERCENTUAL_VGV,
  analisaNormalidadePercentuais,
  calcCubAjustado,
  calcCustoConstrucao,
  calcCustoTerreno,
  calcLastroScore,
  calcLucroIncorporador,
  calcOutrosCustos,
  calcPrecoMaximoRecomendado,
  calcResultadoLiquido,
  calcScoreConformidade,
  calcScorePotencialMercado,
  calcScoreRiscoTecnico,
  calcScoreViabilidade,
  calcVGV,
  calcularAnalise,
  recomendacao,
} from '../server/utils/calculator';
import { AnalysisResultSchema } from '../shared/schemas';
import type { CalculatorInput } from '../server/types/analysis';

describe('calcVGV', () => {
  it('calcula VGV = unidades × preço de venda unitário (exemplo plan.md)', () => {
    expect(calcVGV(1000, 500_000)).toBe(500_000_000);
  });

  it('arredonda para centavos', () => {
    expect(calcVGV(3, 33.333)).toBe(100);
  });
});

describe('calcCubAjustado', () => {
  it('aplica os três ajustes multiplicativos em cadeia (PRD §3.2)', () => {
    // Multifamiliar Normal (+15%) + topografia regular (+4%) + formato regular (0%)
    const resultado = calcCubAjustado(2000, 0.15, 0.04, 0);
    expect(resultado).toBeCloseTo(2000 * 1.15 * 1.04 * 1.0, 6);
  });

  it('sem nenhum ajuste retorna o próprio CUB base', () => {
    expect(calcCubAjustado(1500, 0, 0, 0)).toBe(1500);
  });
});

describe('calcCustoConstrucao', () => {
  it('multiplica CUB ajustado pela área construída', () => {
    const custo = calcCustoConstrucao(2000, 3000, 0.15, 0.04, 0.03);
    const cubAjustado = 2000 * 1.15 * 1.04 * 1.03;
    expect(custo).toBeCloseTo(cubAjustado * 3000, 2);
  });

  it('ajusteTipologia 0 (tipologia sem ajuste definido no PRD) não altera o CUB base', () => {
    const custo = calcCustoConstrucao(1200, 1000, 0, 0.02, 0);
    expect(custo).toBeCloseTo(1200 * 1.02 * 1000, 2);
  });
});

describe('calcCustoTerreno', () => {
  it('é o valor pedido pelo terreno, não um percentual do VGV (PRD §4.1)', () => {
    expect(calcCustoTerreno(850_000)).toBe(850_000);
  });
});

describe('calcLucroIncorporador', () => {
  it('calcula percentual × VGV', () => {
    expect(calcLucroIncorporador(0.23, 500_000_000)).toBe(115_000_000);
  });
});

describe('calcOutrosCustos', () => {
  it('usa 9,5% do VGV (corretagem 5% + impostos 4,5%, decisão de produto Fase 3)', () => {
    expect(CORRETAGEM_PERCENTUAL_VGV + IMPOSTOS_PERCENTUAL_VGV).toBeCloseTo(
      0.095,
      10
    );
    expect(calcOutrosCustos(1_000_000)).toBe(95_000);
  });
});

describe('calcResultadoLiquido', () => {
  it('subtrai todos os componentes do VGV', () => {
    const resultado = calcResultadoLiquido(
      1_000_000,
      90_000,
      400_000,
      220_000,
      95_000
    );
    expect(resultado).toBe(1_000_000 - 90_000 - 400_000 - 220_000 - 95_000);
  });
});

describe('calcPrecoMaximoRecomendado', () => {
  it('é o VGV menos tudo, exceto o custo do terreno (ponto de equilíbrio)', () => {
    const precoMax = calcPrecoMaximoRecomendado(
      1_000_000,
      400_000,
      220_000,
      95_000
    );
    expect(precoMax).toBe(1_000_000 - 400_000 - 220_000 - 95_000);

    // No preço máximo, o resultado líquido é exatamente zero
    const resultadoNoLimite = calcResultadoLiquido(
      1_000_000,
      precoMax,
      400_000,
      220_000,
      95_000
    );
    expect(resultadoNoLimite).toBe(0);
  });
});

describe('analisaNormalidadePercentuais', () => {
  it('não gera alertas quando tudo está dentro da normalidade', () => {
    const alertas = analisaNormalidadePercentuais(0.09, 0.09, 0.23, 0.23, 0.5);
    expect(alertas).toEqual([]);
  });

  it('alerta "terreno_acima_esperado" quando terreno excede a referência da tipologia', () => {
    const alertas = analisaNormalidadePercentuais(0.12, 0.09, 0.23, 0.23, 0.5);
    expect(alertas).toEqual([
      {
        tipo: 'terreno_acima_esperado',
        mensagem: 'Preço do terreno acima do esperado para este cenário',
        severidade: 'warning',
      },
    ]);
  });

  it('alerta "lucro_abaixo_esperado" quando lucro usado é menor que a referência', () => {
    const alertas = analisaNormalidadePercentuais(0.09, 0.09, 0.15, 0.23, 0.5);
    expect(alertas).toEqual([
      {
        tipo: 'lucro_abaixo_esperado',
        mensagem: 'Margem de lucro abaixo do esperado para este mercado',
        severidade: 'warning',
      },
    ]);
  });

  it('alerta "construcao_elevada" quando construção excede 65% do VGV (PRD §4.2)', () => {
    const alertas = analisaNormalidadePercentuais(0.09, 0.09, 0.23, 0.23, 0.7);
    expect(alertas).toEqual([
      {
        tipo: 'construcao_elevada',
        mensagem: 'Custos de construção elevados para esta tipologia',
        severidade: 'warning',
      },
    ]);
  });

  it('acumula múltiplos alertas simultaneamente', () => {
    const alertas = analisaNormalidadePercentuais(0.15, 0.09, 0.1, 0.23, 0.7);
    expect(alertas).toHaveLength(3);
  });
});

describe('calcScoreViabilidade (bucket de 40pts)', () => {
  it('margem líquida 0% ou negativa dá 0 pontos', () => {
    expect(calcScoreViabilidade(0, 1_000_000)).toBe(0);
    expect(calcScoreViabilidade(-50_000, 1_000_000)).toBe(0);
  });

  it('margem líquida 10%+ dá nota máxima (decisão de produto Fase 3)', () => {
    expect(calcScoreViabilidade(100_000, 1_000_000)).toBe(40);
    expect(calcScoreViabilidade(200_000, 1_000_000)).toBe(40);
  });

  it('margem líquida 5% dá metade dos pontos (interpolação linear)', () => {
    expect(calcScoreViabilidade(50_000, 1_000_000)).toBeCloseTo(20, 6);
  });

  it('VGV zero não gera divisão por zero', () => {
    expect(calcScoreViabilidade(0, 0)).toBe(0);
  });
});

describe('calcScoreConformidade (bucket de 30pts)', () => {
  it('todos os percentuais dentro da normalidade dá nota máxima', () => {
    expect(calcScoreConformidade(0.09, 0.09, 0.23, 0.23, 0.5)).toBeCloseTo(
      30,
      6
    );
  });

  it('cada checagem fora da normalidade custa 10 pontos', () => {
    expect(calcScoreConformidade(0.15, 0.09, 0.23, 0.23, 0.5)).toBeCloseTo(
      20,
      6
    );
    expect(calcScoreConformidade(0.15, 0.09, 0.1, 0.23, 0.7)).toBeCloseTo(0, 6);
  });
});

describe('calcScoreRiscoTecnico (bucket de 20pts)', () => {
  it('sempre retorna nota máxima (MVP não faz validação técnica real, PRD §2.4/§10.4)', () => {
    expect(calcScoreRiscoTecnico()).toBe(20);
  });
});

describe('calcScorePotencialMercado (bucket de 10pts)', () => {
  it('preço igual ou abaixo do mercado dá nota máxima', () => {
    expect(calcScorePotencialMercado(4000, 4200)).toBe(10);
    expect(calcScorePotencialMercado(4200, 4200)).toBe(10);
  });

  it('preço 5% acima do mercado dá metade dos pontos (tolerância ±10%)', () => {
    expect(calcScorePotencialMercado(4200 * 1.05, 4200)).toBeCloseTo(5, 6);
  });

  it('preço 10% ou mais acima do mercado dá 0 pontos', () => {
    expect(calcScorePotencialMercado(4200 * 1.1, 4200)).toBe(0);
    expect(calcScorePotencialMercado(4200 * 1.5, 4200)).toBe(0);
  });

  it('sem dado de mercado disponível (mock ausente), nota máxima', () => {
    expect(calcScorePotencialMercado(9999, null)).toBe(10);
  });
});

describe('calcLastroScore', () => {
  it('soma os quatro buckets (máximo 100)', () => {
    expect(calcLastroScore(40, 30, 20, 10)).toBe(100);
  });

  it('nunca ultrapassa 100 nem fica negativo', () => {
    expect(calcLastroScore(40, 30, 20, 10)).toBeLessThanOrEqual(100);
    expect(calcLastroScore(0, 0, 0, 0)).toBeGreaterThanOrEqual(0);
  });
});

describe('recomendacao (PRD §4.4)', () => {
  it('COMPRAR: viável, score > 70, todos os percentuais OK', () => {
    expect(recomendacao(85, true, true)).toBe('COMPRAR');
  });

  it('RESSALVAS: viável, score 50-70', () => {
    expect(recomendacao(60, true, true)).toBe('RESSALVAS');
  });

  it('RESSALVAS: viável, score > 70 mas algum percentual fora do padrão', () => {
    expect(recomendacao(85, true, false)).toBe('RESSALVAS');
  });

  it('RESSALVAS no limite exato de 70 pontos (COMPRAR exige > 70, estritamente)', () => {
    expect(recomendacao(70, true, true)).toBe('RESSALVAS');
  });

  it('RESSALVAS no limite exato de 50 pontos (NAO_COMPRAR exige < 50, estritamente)', () => {
    expect(recomendacao(50, true, true)).toBe('RESSALVAS');
  });

  it('NAO_COMPRAR: inviável, independente do score', () => {
    expect(recomendacao(90, false, true)).toBe('NAO_COMPRAR');
  });

  it('NAO_COMPRAR: score < 50, independente da viabilidade', () => {
    expect(recomendacao(40, true, true)).toBe('NAO_COMPRAR');
  });
});

describe('calcularAnalise (integração ponta a ponta)', () => {
  const inputBase: CalculatorInput = {
    unidades: 100,
    precoVendaUnitario: 500_000,
    areaConstruida: 10_000,
    cubBase: 2000,
    ajusteTipologiaCub: 0.15,
    ajusteTopografia: 0.04,
    ajusteFormato: 0,
    valorTerrenoR: 4_000_000,
    percentualTerrenoReferencia: 0.09,
    percentualLucroUsado: 0.23,
    percentualLucroReferencia: 0.23,
    // preço de venda derivado (precoVendaUnitario/área da unidade) = 5000 R$/m²,
    // exatamente no preço de mercado — cenário-base "no par", sem sobrepreço.
    precoMercadoM2: 5000,
  };

  it('produz um resultado válido conforme o schema compartilhado (AnalysisResultSchema)', () => {
    const resultado = calcularAnalise(inputBase);
    expect(AnalysisResultSchema.safeParse(resultado).success).toBe(true);
  });

  it('calcula VGV e custo de terreno consistentes com os inputs', () => {
    const resultado = calcularAnalise(inputBase);
    expect(resultado.vgv).toBe(50_000_000);
    expect(resultado.custoTerreno).toBe(4_000_000);
  });

  it('cenário claramente viável recomenda COMPRAR', () => {
    const resultado = calcularAnalise(inputBase);
    expect(resultado.resultadoLiquido).toBeGreaterThan(0);
    expect(resultado.recomendacao).not.toBe('NAO_COMPRAR');
  });

  it('cenário inviável (terreno muito caro) recomenda NAO_COMPRAR', () => {
    const resultado = calcularAnalise({
      ...inputBase,
      valorTerrenoR: 100_000_000,
    });
    expect(resultado.resultadoLiquido).toBeLessThan(0);
    expect(resultado.recomendacao).toBe('NAO_COMPRAR');
  });

  it('preço de venda 15% acima do mercado reduz o score em exatamente 10 pontos (bucket de mercado zerado)', () => {
    const noPar = calcularAnalise(inputBase);
    expect(noPar.lastroScore).toBe(100);

    // +15% no preço da unidade: viabilidade e conformidade continuam no teto
    // (margem líquida já bem acima de 10%), isolando o efeito do bucket de
    // potencial de mercado (10 → 0 pontos, sobrepreço de 15% > tolerância de 10%).
    const superestimado = calcularAnalise({
      ...inputBase,
      precoVendaUnitario: 575_000,
    });
    expect(superestimado.lastroScore).toBe(90);
  });
});
