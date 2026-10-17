import { describe, expect, it } from 'vitest';
import { criarProdutoVazio, type DadosProduto, type Tipologia } from '../../../types/produto';
import { calcularPrecoM2VendidoCentavos, calcularProgramaEfetivo } from '../produto';

function produto(tipologia: Tipologia | null, pavimentos: number | null, unidadesPorPavimento: number | null): DadosProduto {
  return { ...criarProdutoVazio(), tipologia, pavimentos, unidadesPorPavimento };
}

describe('calcularProgramaEfetivo', () => {
  it('total = pavimentos × unidades por pavimento (exemplo do plano: 4 × 4 = 16)', () => {
    expect(calcularProgramaEfetivo(produto('predio', 4, 4))).toEqual({
      pavimentos: 4,
      unidadesPorPavimento: 4,
      totalUnidades: 16,
    });
    expect(calcularProgramaEfetivo(produto('salasLojas', 12, 10)).totalUnidades).toBe(120);
  });

  it('sem os dois insumos válidos, não há total', () => {
    expect(calcularProgramaEfetivo(produto('predio', null, 4)).totalUnidades).toBeNull();
    expect(calcularProgramaEfetivo(produto('predio', 4, 0)).totalUnidades).toBeNull();
    expect(calcularProgramaEfetivo(produto('predio', 2.5, 4)).totalUnidades).toBeNull();
    expect(calcularProgramaEfetivo(produto(null, 4, 4)).totalUnidades).toBe(16);
  });

  it('casa: 1 unidade total mesmo com mais pavimentos, e o que foi digitado antes não conta (PRD 2.2)', () => {
    expect(calcularProgramaEfetivo(produto('casa', 2, 4))).toEqual({
      pavimentos: 2,
      unidadesPorPavimento: 1,
      totalUnidades: 1,
    });
  });

  it('galpão: 1 pavimento e 1 unidade, quaisquer que sejam os valores guardados (D-R19)', () => {
    expect(calcularProgramaEfetivo(produto('galpao', 6, 3))).toEqual({
      pavimentos: 1,
      unidadesPorPavimento: 1,
      totalUnidades: 1,
    });
  });

  it('voltar de casa para prédio recupera o que o usuário tinha digitado', () => {
    const digitado = produto('casa', 4, 4);
    expect(calcularProgramaEfetivo({ ...digitado, tipologia: 'predio' }).totalUnidades).toBe(16);
  });
});

describe('calcularPrecoM2VendidoCentavos', () => {
  it('preço da unidade ÷ área da unidade, arredondado ao centavo', () => {
    expect(calcularPrecoM2VendidoCentavos(45_000_000, 68.5)).toBe(656_934); // R$ 6.569,34/m²
    expect(calcularPrecoM2VendidoCentavos(50_000_000, 100)).toBe(500_000);
  });

  it('sem insumo, ou com área zero, não há preço por m²', () => {
    expect(calcularPrecoM2VendidoCentavos(null, 68.5)).toBeNull();
    expect(calcularPrecoM2VendidoCentavos(45_000_000, null)).toBeNull();
    expect(calcularPrecoM2VendidoCentavos(45_000_000, 0)).toBeNull();
  });
});
