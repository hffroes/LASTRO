import { describe, expect, it } from 'vitest';
import { criarProdutoVazio, type DadosProduto } from '../../../types/produto';
import { calcularAreas, calcularAreasDoProduto, type EntradaAreas } from '../areas';
import { TAXA_OCUPACAO_PADRAO } from '../parametros';

// Caso do plano (F11): 1.000 m², taxa 0,6, 4 pavimentos → utilizada 600, construída 2.400, CA 2,4.
const REFERENCIA: EntradaAreas = {
  areaTerrenoM2: 1000,
  taxaOcupacaoPontosBase: 6000,
  pavimentos: 4,
  unidadesPorPavimento: 4,
  totalUnidades: 16,
  areaUnidadeM2: 68.5,
  aplicaCoeficienteUnidades: true,
};

describe('calcularAreas — caso de referência do plano', () => {
  const r = calcularAreas(REFERENCIA);

  it('Área Utilizada = Área do Terreno × Taxa de Ocupação', () => {
    expect(r.areaUtilizadaCentesimos).toBe(60_000); // 600,00 m²
  });

  it('Área Total Construída = Área Utilizada × Pavimentos', () => {
    expect(r.areaConstruidaCentesimos).toBe(240_000); // 2.400,00 m²
  });

  it('Área Comercializável = Total de Unidades × Área da Unidade', () => {
    expect(r.areaComercializavelCentesimos).toBe(109_600); // 16 × 68,50 = 1.096,00 m²
  });

  it('CA atingido = Área Construída ÷ Área do Terreno', () => {
    expect(r.coeficienteAproveitamentoCentesimos).toBe(240); // 2,40
  });

  it('coeficiente das unidades = (unidades por pavimento × área da unidade) ÷ área utilizada', () => {
    // 4 × 68,50 = 274 m² ÷ 600 m² = 45,666…% → 45,67%
    expect(r.coeficienteUnidadesPontosBase).toBe(4_567);
  });

  it('as quatro áreas são distintas: construída ≠ comercializável (a obra incide numa, o VGV na outra)', () => {
    expect(r.areaConstruidaCentesimos).not.toBe(r.areaComercializavelCentesimos);
  });
});

describe('calcularAreas — o coeficiente soma todas as unidades do pavimento', () => {
  it('na faixa de 80–85% do PRD: 4 unidades de 120 m² num pavimento de 600 m² = 80%', () => {
    const r = calcularAreas({ ...REFERENCIA, areaUnidadeM2: 120 });
    expect(r.coeficienteUnidadesPontosBase).toBe(8_000);
  });

  it('uma unidade isolada daria um quarto: o numerador não é a área de uma unidade só', () => {
    const r = calcularAreas({ ...REFERENCIA, areaUnidadeM2: 120 });
    const isolada = (120 * 100 * 10_000) / 60_000; // 2.000 pontos-base = 20%
    expect(r.coeficienteUnidadesPontosBase).not.toBe(isolada);
  });

  it('com mais unidades por pavimento o coeficiente cresce na mesma proporção', () => {
    const r = calcularAreas({ ...REFERENCIA, unidadesPorPavimento: 8, areaUnidadeM2: 60 });
    expect(r.coeficienteUnidadesPontosBase).toBe(8_000);
  });
});

describe('calcularAreas — casas', () => {
  it('não produzem o coeficiente das unidades por pavimento (PRD 3.3), mas têm as áreas e o CA', () => {
    const r = calcularAreas({
      ...REFERENCIA,
      aplicaCoeficienteUnidades: false,
      pavimentos: 2,
      unidadesPorPavimento: 1,
      totalUnidades: 1,
      areaUnidadeM2: 180,
    });
    expect(r.coeficienteUnidadesPontosBase).toBeNull();
    expect(r.areaConstruidaCentesimos).toBe(120_000);
    expect(r.areaComercializavelCentesimos).toBe(18_000);
    expect(r.coeficienteAproveitamentoCentesimos).toBe(120);
  });
});

describe('calcularAreas — bordas', () => {
  it('1 pavimento: construída = utilizada e CA = taxa de ocupação', () => {
    const r = calcularAreas({ ...REFERENCIA, pavimentos: 1 });
    expect(r.areaConstruidaCentesimos).toBe(r.areaUtilizadaCentesimos);
    expect(r.coeficienteAproveitamentoCentesimos).toBe(60);
  });

  it('1 unidade: comercializável = área da unidade', () => {
    const r = calcularAreas({ ...REFERENCIA, totalUnidades: 1, unidadesPorPavimento: 1 });
    expect(r.areaComercializavelCentesimos).toBe(6_850);
  });

  it('taxa de 100%: a utilizada é o terreno inteiro', () => {
    const r = calcularAreas({ ...REFERENCIA, taxaOcupacaoPontosBase: 10_000 });
    expect(r.areaUtilizadaCentesimos).toBe(100_000);
    expect(r.coeficienteAproveitamentoCentesimos).toBe(400);
  });

  it('taxa 0 ou acima de 100%: sem área utilizada, e nada derivado dela', () => {
    for (const taxa of [0, -100, 10_001]) {
      const r = calcularAreas({ ...REFERENCIA, taxaOcupacaoPontosBase: taxa });
      expect(r.areaUtilizadaCentesimos).toBeNull();
      expect(r.areaConstruidaCentesimos).toBeNull();
      expect(r.coeficienteAproveitamentoCentesimos).toBeNull();
      expect(r.coeficienteUnidadesPontosBase).toBeNull();
      expect(r.areaComercializavelCentesimos).toBe(109_600); // não depende da taxa
    }
  });

  it('arredonda meio para cima ao centésimo, e a construída parte da utilizada já arredondada', () => {
    // 333,33 m² × 60% = 199,998 → 200,00; construída = 200,00 × 3 = 600,00 (e não 599,994 → 599,99)
    const r = calcularAreas({ ...REFERENCIA, areaTerrenoM2: 333.33, pavimentos: 3 });
    expect(r.areaUtilizadaCentesimos).toBe(20_000);
    expect(r.areaConstruidaCentesimos).toBe(60_000);
  });

  it('precisão exata onde o ponto flutuante falharia (0,1 × 3 e afins)', () => {
    const r = calcularAreas({ ...REFERENCIA, areaTerrenoM2: 10.1, taxaOcupacaoPontosBase: 3_000 });
    expect(r.areaUtilizadaCentesimos).toBe(303); // 3,03 m²
  });
});

describe('calcularAreas — insumos insuficientes ou inválidos', () => {
  it('cada área só aparece com os insumos dela', () => {
    const semPavimentos = calcularAreas({ ...REFERENCIA, pavimentos: null });
    expect(semPavimentos.areaUtilizadaCentesimos).toBe(60_000);
    expect(semPavimentos.areaConstruidaCentesimos).toBeNull();
    expect(semPavimentos.coeficienteAproveitamentoCentesimos).toBeNull();
    expect(semPavimentos.areaComercializavelCentesimos).toBe(109_600);

    const semUnidade = calcularAreas({ ...REFERENCIA, areaUnidadeM2: null });
    expect(semUnidade.areaComercializavelCentesimos).toBeNull();
    expect(semUnidade.coeficienteUnidadesPontosBase).toBeNull();
    expect(semUnidade.areaConstruidaCentesimos).toBe(240_000);

    const semTerreno = calcularAreas({ ...REFERENCIA, areaTerrenoM2: null });
    expect(semTerreno.areaUtilizadaCentesimos).toBeNull();
    expect(semTerreno.coeficienteAproveitamentoCentesimos).toBeNull();
  });

  it('recusa zero, fração e negativo nas contagens e áreas, em vez de calcular', () => {
    expect(calcularAreas({ ...REFERENCIA, pavimentos: 0 }).areaConstruidaCentesimos).toBeNull();
    expect(calcularAreas({ ...REFERENCIA, pavimentos: 2.5 }).areaConstruidaCentesimos).toBeNull();
    expect(calcularAreas({ ...REFERENCIA, totalUnidades: -1 }).areaComercializavelCentesimos).toBeNull();
    expect(calcularAreas({ ...REFERENCIA, areaUnidadeM2: 0 }).areaComercializavelCentesimos).toBeNull();
    expect(calcularAreas({ ...REFERENCIA, areaTerrenoM2: Number.NaN }).areaUtilizadaCentesimos).toBeNull();
  });

  it('nos tetos técnicos somados, o coeficiente sai null em vez de impreciso', () => {
    const r = calcularAreas({
      ...REFERENCIA,
      areaTerrenoM2: 10_000_000,
      unidadesPorPavimento: 1_000,
      areaUnidadeM2: 10_000_000,
    });
    expect(r.coeficienteUnidadesPontosBase).toBeNull();
    expect(r.areaUtilizadaCentesimos).toBe(600_000_000);
  });
});

describe('taxa de ocupação padrão (parâmetro centralizado)', () => {
  it('é 0,6 = 60%, provisória e identificada como TBD', () => {
    expect(TAXA_OCUPACAO_PADRAO.valor).toBe(6_000);
    expect(TAXA_OCUPACAO_PADRAO.provisorio).toBe(true);
  });

  it('o produto nasce com o padrão, e ajustar a taxa de uma análise não altera o padrão', () => {
    const produto = criarProdutoVazio();
    expect(produto.taxaOcupacaoPontosBase).toBe(6_000);
    produto.taxaOcupacaoPontosBase = 5_000;
    expect(criarProdutoVazio().taxaOcupacaoPontosBase).toBe(6_000);
    expect(TAXA_OCUPACAO_PADRAO.valor).toBe(6_000);
  });
});

describe('calcularAreasDoProduto', () => {
  const predio: DadosProduto = {
    ...criarProdutoVazio(),
    tipoProjeto: 'residencial',
    tipologia: 'predio',
    pavimentos: 4,
    unidadesPorPavimento: 4,
    areaUnidadeM2: 68.5,
  };

  it('une a Etapa 1 e o programa e reproduz o caso de referência', () => {
    const r = calcularAreasDoProduto(1000, predio);
    expect(r.areaUtilizadaCentesimos).toBe(60_000);
    expect(r.areaConstruidaCentesimos).toBe(240_000);
    expect(r.areaComercializavelCentesimos).toBe(109_600);
    expect(r.coeficienteAproveitamentoCentesimos).toBe(240);
  });

  it('mexer na taxa reage em tudo o que depende dela', () => {
    const r = calcularAreasDoProduto(1000, { ...predio, taxaOcupacaoPontosBase: 5_000 });
    expect(r.areaUtilizadaCentesimos).toBe(50_000);
    expect(r.areaConstruidaCentesimos).toBe(200_000);
    expect(r.coeficienteAproveitamentoCentesimos).toBe(200);
  });

  it('casa: aplica a trava de 1 unidade e não tem o coeficiente das unidades', () => {
    const r = calcularAreasDoProduto(1000, { ...predio, tipologia: 'casa', pavimentos: 2, unidadesPorPavimento: 9 });
    expect(r.areaComercializavelCentesimos).toBe(6_850); // 1 × 68,50, e não 18 unidades
    expect(r.coeficienteUnidadesPontosBase).toBeNull();
    expect(r.areaConstruidaCentesimos).toBe(120_000);
  });

  it('galpão: 1 pavimento e 1 unidade, o que foi digitado antes da trava não conta', () => {
    const r = calcularAreasDoProduto(1000, { ...predio, tipologia: 'galpao', pavimentos: 6, unidadesPorPavimento: 3 });
    expect(r.areaConstruidaCentesimos).toBe(60_000);
    expect(r.areaComercializavelCentesimos).toBe(6_850);
  });
});
