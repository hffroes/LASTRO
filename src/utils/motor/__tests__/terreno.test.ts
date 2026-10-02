import { describe, expect, it } from 'vitest';
import { calcularPrecoUnitarioCentavos } from '../terreno';

describe('calcularPrecoUnitarioCentavos', () => {
  it('caso de validação do plano: R$ 1.200.000 em 1.000 m² = R$ 1.200,00/m²', () => {
    expect(calcularPrecoUnitarioCentavos(120_000_000, 1000)).toBe(120_000);
  });

  it('arredonda ao centavo, meio para cima', () => {
    // R$ 1.000.000 ÷ 3 m² = 333.333,333… → R$ 333.333,33
    expect(calcularPrecoUnitarioCentavos(100_000_000, 3)).toBe(33_333_333);
    // R$ 2.000.000 ÷ 3 m² = 666.666,666… → R$ 666.666,67
    expect(calcularPrecoUnitarioCentavos(200_000_000, 3)).toBe(66_666_667);
    // R$ 0,01 ÷ 2 m² = 0,005 → R$ 0,01
    expect(calcularPrecoUnitarioCentavos(1, 2)).toBe(1);
  });

  it('usa a área com casas decimais sem erro de ponto flutuante', () => {
    // R$ 500.000 ÷ 1.250,50 m² = 399,8400…
    expect(calcularPrecoUnitarioCentavos(50_000_000, 1250.5)).toBe(39_984);
    expect(calcularPrecoUnitarioCentavos(29, 0.29)).toBe(100);
  });

  it('nos limites técnicos (R$ 10 bi, 1.000 ha) a conta segue exata', () => {
    expect(calcularPrecoUnitarioCentavos(1_000_000_000_000, 0.01)).toBe(100_000_000_000_000);
    expect(calcularPrecoUnitarioCentavos(1, 10_000_000)).toBe(0);
  });

  it('sem insumo válido, não há número: área zero não vira divisão por zero', () => {
    expect(calcularPrecoUnitarioCentavos(null, 1000)).toBeNull();
    expect(calcularPrecoUnitarioCentavos(120_000_000, null)).toBeNull();
    expect(calcularPrecoUnitarioCentavos(120_000_000, 0)).toBeNull();
    expect(calcularPrecoUnitarioCentavos(120_000_000, -10)).toBeNull();
    expect(calcularPrecoUnitarioCentavos(0, 1000)).toBeNull();
    expect(calcularPrecoUnitarioCentavos(1.5, 1000)).toBeNull();
  });
});
