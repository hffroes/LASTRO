import { describe, expect, it } from 'vitest';
import type { Analise } from '../../types/analise';
import { LIMITE_VGV_CENTAVOS } from '../motor/economia';
import { LIMITE_CUB_AJUSTADO_CENTAVOS, MENSAGENS_AJUSTES, lerAjustesDoPayload, validarAjuste, validarAjustes } from './ajustes';
import { MENSAGENS_PRODUTO } from './produto';

// Só o produto importa para os ajustes: 16 unidades (4 × 4) a R$ 900.000.
const analise: Pick<Analise, 'produto'> = {
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

describe('validarAjuste — limites técnicos, não de negócio', () => {
  it('preço e taxa usam as regras e mensagens da Etapa 2', () => {
    expect(validarAjuste('precoUnidade', 99_000_000, analise)).toBeUndefined();
    expect(validarAjuste('precoUnidade', 0, analise)).toBe(MENSAGENS_PRODUTO.precoUnidadeNaoPositivo);
    expect(validarAjuste('precoUnidade', 10.5, analise)).toBe(MENSAGENS_PRODUTO.precoUnidadeIlegivel);
    expect(validarAjuste('taxaOcupacao', 0, analise)).toBe(MENSAGENS_PRODUTO.taxaOcupacaoNaoPositiva);
    expect(validarAjuste('taxaOcupacao', 10_001, analise)).toBe(MENSAGENS_PRODUTO.taxaOcupacaoAcimaDeCem);
    expect(validarAjuste('taxaOcupacao', 10_000, analise)).toBeUndefined();
  });

  it('o preço ajustado não pode levar o VGV além do que a conta representa', () => {
    const precoNoTeto = Math.floor(LIMITE_VGV_CENTAVOS / 16);
    expect(validarAjuste('precoUnidade', precoNoTeto, analise)).toBeUndefined();
    expect(validarAjuste('precoUnidade', precoNoTeto + 1, analise)).toBe(MENSAGENS_PRODUTO.vgvAcimaDoLimite);
  });

  it.each(['lucroIncorporador', 'despesasGerais'] as const)('%s: de 0% a 100%, os dois inclusive', (premissa) => {
    expect(validarAjuste(premissa, 0, analise)).toBeUndefined();
    expect(validarAjuste(premissa, 10_000, analise)).toBeUndefined();
    expect(validarAjuste(premissa, -1, analise)).toBe(MENSAGENS_AJUSTES.percentualNegativo);
    expect(validarAjuste(premissa, 10_001, analise)).toBe(MENSAGENS_AJUSTES.percentualAcimaDeCem);
    expect(validarAjuste(premissa, 22.5, analise)).toBe(MENSAGENS_AJUSTES.percentualIlegivel);
    expect(validarAjuste(premissa, '22', analise)).toBe(MENSAGENS_AJUSTES.ausente);
  });

  it('CUB ajustado: maior que zero e até o teto técnico', () => {
    expect(validarAjuste('cubAjustado', 1, analise)).toBeUndefined();
    expect(validarAjuste('cubAjustado', LIMITE_CUB_AJUSTADO_CENTAVOS, analise)).toBeUndefined();
    expect(validarAjuste('cubAjustado', 0, analise)).toBe(MENSAGENS_AJUSTES.cubNaoPositivo);
    expect(validarAjuste('cubAjustado', LIMITE_CUB_AJUSTADO_CENTAVOS + 1, analise)).toBe(MENSAGENS_AJUSTES.cubAcimaDoLimite);
    expect(validarAjuste('cubAjustado', Number.NaN, analise)).toBe(MENSAGENS_AJUSTES.ausente);
  });

  it('validarAjustes só confere as premissas presentes', () => {
    expect(validarAjustes({}, analise)).toEqual({});
    expect(validarAjustes({ lucroIncorporador: 2_500, cubAjustado: 0 }, analise)).toEqual({ cubAjustado: MENSAGENS_AJUSTES.cubNaoPositivo });
  });
});

describe('lerAjustesDoPayload — entrada hostil', () => {
  it('ausente ou null é cenário sem ajuste', () => {
    expect(lerAjustesDoPayload(undefined, analise)).toEqual({ ajustes: {}, erros: [] });
    expect(lerAjustesDoPayload(null, analise)).toEqual({ ajustes: {}, erros: [] });
  });

  it('o que não é objeto é recusado como corpo inválido', () => {
    for (const bruto of ['x', 3, [1]]) {
      const leitura = lerAjustesDoPayload(bruto, analise);
      expect(leitura.ajustes).toBeNull();
      expect(leitura.erros[0]).toMatchObject({ etapa: 'corpo', campo: 'ajustes' });
    }
  });

  it('lê só as premissas conhecidas; chaves desconhecidas não chegam ao cálculo', () => {
    const leitura = lerAjustesDoPayload({ despesasGerais: 1_200, padrao: 'alto', __proto__: { lucroIncorporador: 1 } }, analise);
    expect(leitura).toEqual({ ajustes: { despesasGerais: 1_200 }, erros: [] });
  });

  it('cada ajuste inválido vira um erro da etapa "ajustes", com o campo e a mensagem', () => {
    const leitura = lerAjustesDoPayload({ precoUnidade: -1, lucroIncorporador: '22' }, analise);
    expect(leitura.ajustes).toBeNull();
    expect(leitura.erros).toEqual([
      { etapa: 'ajustes', campo: 'precoUnidade', mensagem: MENSAGENS_PRODUTO.precoUnidadeNaoPositivo },
      { etapa: 'ajustes', campo: 'lucroIncorporador', mensagem: MENSAGENS_AJUSTES.ausente },
    ]);
  });
});
