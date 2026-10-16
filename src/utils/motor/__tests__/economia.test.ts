import { describe, expect, it } from 'vitest';
import {
  LIMITE_VGV_CENTAVOS,
  PARAMETROS_ECONOMIA_PADRAO,
  calcularCustoObraCentavos,
  calcularEconomia,
  calcularVgvCentavos,
  percentualDoVgvCentavos,
  type EntradaEconomia,
} from '../economia';
import {
  DESPESAS_GERAIS_TOTAL,
  LUCRO_INCORPORADOR_POR_PADRAO,
  SOMA_ITEMIZACAO_DESPESAS_GERAIS,
} from '../parametros';

// Cenário de referência, conferido à mão: prédio Normal de 4 pavimentos num terreno de 1.000 m² a 60%
// (construída 2.400 m²), CUB ajustado de R$ 3.154,91/m² (caso do PRD 3.2), 16 unidades a R$ 900.000.
//   VGV      = 16 × 900.000,00                 = R$ 14.400.000,00
//   Obra     = 3.154,91 × 2.400                = R$  7.571.784,00
//   Despesas = 11% × 14.400.000                = R$  1.584.000,00
//   Lucro    = 22% × 14.400.000                = R$  3.168.000,00
//   Terreno  = 14.400.000 − 7.571.784 − 1.584.000 − 3.168.000 = R$ 2.076.216,00
//   Líquido  = 2.076.216 − 1.200.000           = R$   876.216,00
const REFERENCIA: EntradaEconomia = {
  totalUnidades: 16,
  precoUnidadeCentavos: 90_000_000,
  areaConstruidaCentesimos: 240_000,
  cubAjustadoCentavos: 315_491,
  padrao: 'normal',
  precoPedidoCentavos: 120_000_000,
};

describe('calcularEconomia — cenário de referência conferido à mão', () => {
  const r = calcularEconomia(REFERENCIA);

  it('VGV = unidades × preço da unidade', () => {
    expect(r?.vgvCentavos).toBe(1_440_000_000);
  });

  it('Custo de Obra = CUB Ajustado × Área Total Construída', () => {
    expect(r?.custoObraCentavos).toBe(757_178_400);
  });

  it('Despesas Gerais = 11% do VGV', () => {
    expect(r?.despesasGeraisCentavos).toBe(158_400_000);
  });

  it('Lucro do Incorporador = 22% do VGV (padrão Normal, D-R23)', () => {
    expect(r?.lucroIncorporadorCentavos).toBe(316_800_000);
  });

  it('Resultado Terreno = VGV − Obra − Despesas − Lucro', () => {
    expect(r?.resultadoTerrenoCentavos).toBe(207_621_600);
  });

  it('devolve o preço pedido usado, para a resposta ser autossuficiente', () => {
    expect(r?.precoPedidoCentavos).toBe(120_000_000);
  });

  it('Resultado Líquido = Resultado Terreno − Preço Pedido, e é viável quando ≥ 0', () => {
    expect(r?.resultadoLiquidoCentavos).toBe(87_621_600);
    expect(r?.viavel).toBe(true);
  });
});

describe('calcularEconomia — inviável e fronteira da viabilidade', () => {
  it('com a obra maior que o VGV disponível, o Resultado Terreno é negativo e inviável', () => {
    // 16 × R$ 450.000 = R$ 7.200.000 de VGV, contra R$ 7.571.784 só de obra.
    const r = calcularEconomia({ ...REFERENCIA, precoUnidadeCentavos: 45_000_000 });
    expect(r?.vgvCentavos).toBe(720_000_000);
    expect(r?.resultadoTerrenoCentavos).toBe(-274_778_400);
    expect(r?.resultadoLiquidoCentavos).toBe(-394_778_400);
    expect(r?.viavel).toBe(false);
  });

  it('Resultado Líquido exatamente zero é viável (≥ 0)', () => {
    const r = calcularEconomia({ ...REFERENCIA, precoPedidoCentavos: 207_621_600 });
    expect(r?.resultadoLiquidoCentavos).toBe(0);
    expect(r?.viavel).toBe(true);
  });

  it('um centavo acima do Resultado Terreno já é inviável', () => {
    const r = calcularEconomia({ ...REFERENCIA, precoPedidoCentavos: 207_621_601 });
    expect(r?.resultadoLiquidoCentavos).toBe(-1);
    expect(r?.viavel).toBe(false);
  });

  it('o preço pedido só entra no Resultado Líquido, nunca no Resultado Terreno', () => {
    const barato = calcularEconomia({ ...REFERENCIA, precoPedidoCentavos: 1 });
    const caro = calcularEconomia({ ...REFERENCIA, precoPedidoCentavos: 900_000_000 });
    expect(barato?.resultadoTerrenoCentavos).toBe(caro?.resultadoTerrenoCentavos);
  });
});

describe('VGV = unidades × preço da unidade, nunca m² × preço/m² (PRD 4.1)', () => {
  it('a área construída não entra no VGV', () => {
    const pequena = calcularEconomia({ ...REFERENCIA, areaConstruidaCentesimos: 100_000 });
    const grande = calcularEconomia({ ...REFERENCIA, areaConstruidaCentesimos: 500_000 });
    expect(pequena?.vgvCentavos).toBe(grande?.vgvCentavos);
  });

  it('mais unidades pelo mesmo preço escalam o VGV linearmente', () => {
    expect(calcularVgvCentavos(1, 45_000_000)).toBe(45_000_000);
    expect(calcularVgvCentavos(16, 45_000_000)).toBe(720_000_000);
  });

  it('sem unidade ou preço válidos, não há VGV', () => {
    for (const [unidades, preco] of [[0, 100], [1, 0], [-1, 100], [1.5, 100], [1, 100.5]]) {
      expect(calcularVgvCentavos(unidades as number, preco as number)).toBeNull();
    }
  });

  it('acima do teto técnico (≈ R$ 9 bilhões), recusa em vez de calcular com imprecisão', () => {
    expect(calcularVgvCentavos(1, LIMITE_VGV_CENTAVOS)).toBe(LIMITE_VGV_CENTAVOS);
    expect(calcularVgvCentavos(1, LIMITE_VGV_CENTAVOS + 1)).toBeNull();
    expect(calcularVgvCentavos(200_000, 1_000_000_000_000)).toBeNull();
  });
});

describe('arredondamento em cada etapa (meio para cima, ao centavo)', () => {
  it('percentual do VGV', () => {
    expect(percentualDoVgvCentavos(333, 1_100)).toBe(37); // 36,63
    expect(percentualDoVgvCentavos(50, 1_100)).toBe(6); // 5,5 → 6
    expect(percentualDoVgvCentavos(49, 1_100)).toBe(5); // 5,39
    expect(percentualDoVgvCentavos(1_440_000_000, 1_100)).toBe(158_400_000);
  });

  it('custo de obra: R$/m² × m², com a área em centésimos', () => {
    expect(calcularCustoObraCentavos(315_491, 240_000)).toBe(757_178_400);
    expect(calcularCustoObraCentavos(100, 1)).toBe(1); // 1 centésimo de m² × R$ 1,00 = R$ 0,01
    expect(calcularCustoObraCentavos(150, 1)).toBe(2); // 1,5 → 2
  });

  it('o resultado soma parcelas já arredondadas, então a conta fecha ao centavo', () => {
    const r = calcularEconomia({ ...REFERENCIA, totalUnidades: 1, precoUnidadeCentavos: 333_333 });
    expect(r).not.toBeNull();
    if (!r) return;
    expect(r.vgvCentavos - r.custoObraCentavos - r.despesasGeraisCentavos - r.lucroIncorporadorCentavos).toBe(
      r.resultadoTerrenoCentavos,
    );
    expect(Number.isInteger(r.resultadoTerrenoCentavos)).toBe(true);
  });

  it('obra acima do que o ponto flutuante representa: recusa, não imprecisão', () => {
    expect(calcularCustoObraCentavos(1_000_000, 200_000_000_000)).toBeNull();
  });
});

describe('lucro por padrão e despesas gerais: parâmetros centralizados e provisórios', () => {
  it('o lucro vem do padrão, nunca da tipologia: 20% / 22% / 25%', () => {
    const lucro = (padrao: 'baixo' | 'normal' | 'alto') =>
      calcularEconomia({ ...REFERENCIA, padrao })?.lucroIncorporadorCentavos;
    expect(lucro('baixo')).toBe(288_000_000);
    expect(lucro('normal')).toBe(316_800_000);
    expect(lucro('alto')).toBe(360_000_000);
  });

  it('D-R23: Normal é 22% (a tabela), e não os 20% do exemplo da planilha', () => {
    expect(LUCRO_INCORPORADOR_POR_PADRAO.valor.normal).toBe(2_200);
    expect(LUCRO_INCORPORADOR_POR_PADRAO.valor.normal).not.toBe(LUCRO_INCORPORADOR_POR_PADRAO.valor.baixo);
  });

  it('D-R24: despesas gerais de 11,0% (a planilha), com a itemização da fonte somando 12,0% registrada', () => {
    expect(DESPESAS_GERAIS_TOTAL.valor).toBe(1_100);
    expect(SOMA_ITEMIZACAO_DESPESAS_GERAIS).toBe(1_200);
    expect(DESPESAS_GERAIS_TOTAL.valor).not.toBe(SOMA_ITEMIZACAO_DESPESAS_GERAIS);
  });

  it('ambos são provisórios (TBD) e carregam fonte e versão', () => {
    for (const parametro of [DESPESAS_GERAIS_TOTAL, LUCRO_INCORPORADOR_POR_PADRAO]) {
      expect(parametro.provisorio).toBe(true);
      expect(parametro.fonte.length).toBeGreaterThan(0);
      expect(parametro.versao).toBe('v1');
    }
  });

  it('trocar o parâmetro muda o resultado sem tocar no código (12% daria 1% do VGV a menos)', () => {
    const doze = calcularEconomia(REFERENCIA, { ...PARAMETROS_ECONOMIA_PADRAO, despesasGeraisPontosBase: 1_200 });
    const onze = calcularEconomia(REFERENCIA);
    expect(doze?.despesasGeraisCentavos).toBe(172_800_000);
    expect((onze?.resultadoTerrenoCentavos ?? 0) - (doze?.resultadoTerrenoCentavos ?? 0)).toBe(14_400_000);
  });
});

describe('insumos inválidos: sem número', () => {
  it('recusa preço pedido, padrão ou CUB inválidos', () => {
    expect(calcularEconomia({ ...REFERENCIA, precoPedidoCentavos: 0 })).toBeNull();
    expect(calcularEconomia({ ...REFERENCIA, precoPedidoCentavos: 10.5 })).toBeNull();
    expect(calcularEconomia({ ...REFERENCIA, padrao: 'medio' as never })).toBeNull();
    expect(calcularEconomia({ ...REFERENCIA, cubAjustadoCentavos: -1 })).toBeNull();
  });
});
