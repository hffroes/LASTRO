import { describe, expect, it } from 'vitest';
import {
  areaParaCentesimos,
  dividirArredondando,
  formatarArea,
  formatarMoeda,
  formatarNumeroBr,
  interpretarNumeroBr,
} from '../formatacao';

function lido(texto: string) {
  const leitura = interpretarNumeroBr(texto);
  return leitura.tipo === 'valido' ? leitura.unidadesMenores : leitura.tipo;
}

describe('interpretarNumeroBr', () => {
  it('vazio e só espaços são "vazio", não zero', () => {
    expect(lido('')).toBe('vazio');
    expect(lido('   ')).toBe('vazio');
  });

  it('lê inteiros sem separador', () => {
    expect(lido('1200000')).toBe(120_000_000);
    expect(lido('0')).toBe(0);
  });

  it('lê o formato brasileiro com milhar e vírgula decimal', () => {
    expect(lido('1.200.000,00')).toBe(120_000_000);
    expect(lido('1.200.000,5')).toBe(120_000_050);
    expect(lido('1.250,55')).toBe(125_055);
    expect(lido('1250,55')).toBe(125_055);
  });

  it('ponto seguido de três dígitos é milhar, não decimal', () => {
    expect(lido('1.250')).toBe(125_000);
    expect(lido('12.345.678')).toBe(1_234_567_800);
  });

  it('aceita valor colado com ponto decimal de uma ou duas casas', () => {
    expect(lido('1250.5')).toBe(125_050);
    expect(lido('1250.55')).toBe(125_055);
  });

  it('ignora "R$", "m²" e espaços, inclusive o inseparável', () => {
    expect(lido('R$ 1.200.000,00')).toBe(120_000_000);
    expect(lido('R$ 1.200,00')).toBe(120_000);
    expect(lido('1.250,50 m²')).toBe(125_050);
    expect(lido(' 1 250 ')).toBe(125_000);
  });

  it('aceita vírgula no fim ou no começo enquanto se digita', () => {
    expect(lido('1250,')).toBe(125_000);
    expect(lido(',5')).toBe(50);
  });

  it('lê o sinal negativo, para a validação recusar com mensagem própria', () => {
    expect(lido('-1.000')).toBe(-100_000);
  });

  it('recusa o que é ambíguo ou não é número, em vez de adivinhar', () => {
    expect(lido('abc')).toBe('invalido');
    expect(lido(',')).toBe('invalido');
    expect(lido('1,2,3')).toBe('invalido');
    expect(lido('1,234')).toBe('invalido'); // três casas: centavo de centavo
    expect(lido('1.2345')).toBe('invalido');
    expect(lido('1.25.000')).toBe('invalido');
    expect(lido('12.50,00')).toBe('invalido');
    expect(lido('1,000.50')).toBe('invalido'); // formato americano completo
    expect(lido('1e6')).toBe('invalido');
  });
});

describe('formatarNumeroBr', () => {
  it('formata com milhar e duas casas fixas', () => {
    expect(formatarNumeroBr(0)).toBe('0,00');
    expect(formatarNumeroBr(5)).toBe('0,05');
    expect(formatarNumeroBr(125_050)).toBe('1.250,50');
    expect(formatarNumeroBr(120_000_000)).toBe('1.200.000,00');
    expect(formatarNumeroBr(-100_000)).toBe('-1.000,00');
  });

  it('valores grandes não perdem dígitos', () => {
    expect(formatarNumeroBr(1_000_000_000_000)).toBe('10.000.000.000,00');
    expect(formatarNumeroBr(999_999_999_999_99)).toBe('999.999.999.999,99');
  });

  it('volta exatamente ao que foi lido', () => {
    for (const texto of ['0,01', '1.250,50', '1.200.000,00', '987.654.321,09']) {
      const leitura = interpretarNumeroBr(texto);
      expect(leitura.tipo).toBe('valido');
      if (leitura.tipo === 'valido') expect(formatarNumeroBr(leitura.unidadesMenores)).toBe(texto);
    }
  });

  it('moeda e área levam a unidade', () => {
    expect(formatarMoeda(120_000)).toBe('R$ 1.200,00');
    expect(formatarArea(125_050)).toBe('1.250,50 m²');
  });
});

describe('areaParaCentesimos', () => {
  it('converte sem erro de ponto flutuante', () => {
    expect(areaParaCentesimos(0.29)).toBe(29); // 0.29 × 100 = 28,999999999999996
    expect(areaParaCentesimos(1250.55)).toBe(125_055);
    expect(areaParaCentesimos(1000)).toBe(100_000);
  });
});

describe('dividirArredondando', () => {
  it('divisão exata não arredonda', () => {
    expect(dividirArredondando(120_000_000, 1_000)).toBe(120_000);
  });

  it('arredonda meio para cima', () => {
    expect(dividirArredondando(5, 2)).toBe(3); // 2,5
    expect(dividirArredondando(15, 10)).toBe(2); // 1,5
    expect(dividirArredondando(25, 10)).toBe(3); // 2,5: não é arredondamento bancário
  });

  it('abaixo do meio arredonda para baixo, acima para cima', () => {
    expect(dividirArredondando(149, 100)).toBe(1);
    expect(dividirArredondando(151, 100)).toBe(2);
    expect(dividirArredondando(10, 3)).toBe(3);
    expect(dividirArredondando(20, 3)).toBe(7);
  });

  it('é exato com valores grandes, onde o ponto flutuante já erra', () => {
    // 2^53 − 1 ÷ 2 = 4503599627370495,5 → meio para cima.
    expect(dividirArredondando(Number.MAX_SAFE_INTEGER, 2)).toBe(4_503_599_627_370_496);
    expect(dividirArredondando(100_000_000_000_000, 3)).toBe(33_333_333_333_333);
  });

  it('recusa divisão por zero, negativos e não inteiros', () => {
    expect(() => dividirArredondando(100, 0)).toThrow(RangeError);
    expect(() => dividirArredondando(100, -1)).toThrow(RangeError);
    expect(() => dividirArredondando(-100, 3)).toThrow(RangeError);
    expect(() => dividirArredondando(1.5, 3)).toThrow(RangeError);
    expect(() => dividirArredondando(2 ** 53, 3)).toThrow(RangeError);
  });
});
