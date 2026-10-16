import { describe, expect, it } from 'vitest';
import { criarProdutoVazio, PADROES_ACABAMENTO, TIPOS_PROJETO } from '../../types/produto';
import { TIPOLOGIAS_POR_TIPO } from '../../data/tipologias';
import {
  MENSAGENS_PRODUTO,
  etapaProdutoValida,
  validarEtapaProduto,
  validarPadrao,
  validarTipologia,
  validarTipoProjeto,
} from './produto';

describe('validarTipoProjeto', () => {
  it('aceita os três tipos do PRD 2.2', () => {
    for (const tipo of TIPOS_PROJETO) expect(validarTipoProjeto(tipo)).toBeUndefined();
  });

  it('recusa vazio, Uso Misto (D-B6) e valores de fora (entrada vinda da API)', () => {
    for (const valor of [null, undefined, '', 'usoMisto', 'loteamento', 'Residencial', 1]) {
      expect(validarTipoProjeto(valor)).toBe(MENSAGENS_PRODUTO.tipoProjetoAusente);
    }
  });
});

describe('validarTipologia', () => {
  it('sem tipo, não acusa a tipologia: a pendência é do tipo', () => {
    expect(validarTipologia(null, null)).toBeUndefined();
    expect(validarTipologia('usoMisto', 'casa')).toBeUndefined();
  });

  it('com tipo e sem tipologia, pede a tipologia', () => {
    expect(validarTipologia('residencial', null)).toBe(MENSAGENS_PRODUTO.tipologiaAusente);
    expect(validarTipologia('residencial', 'cobertura')).toBe(MENSAGENS_PRODUTO.tipologiaAusente);
  });

  it('aceita toda combinação da tabela e só ela', () => {
    for (const tipo of TIPOS_PROJETO) {
      for (const outro of TIPOS_PROJETO) {
        for (const tipologia of TIPOLOGIAS_POR_TIPO[outro]) {
          const esperado = tipo === outro ? undefined : MENSAGENS_PRODUTO.tipologiaForaDoTipo;
          expect(validarTipologia(tipo, tipologia)).toBe(esperado);
        }
      }
    }
  });
});

describe('validarPadrao', () => {
  it('aceita Baixo, Normal e Alto', () => {
    for (const padrao of PADROES_ACABAMENTO) expect(validarPadrao(padrao)).toBeUndefined();
  });

  it('recusa vazio e valores de fora', () => {
    for (const valor of [null, '', 'medio', 'Normal']) {
      expect(validarPadrao(valor)).toBe(MENSAGENS_PRODUTO.padraoAusente);
    }
  });
});

describe('validarEtapaProduto', () => {
  it('produto vazio: pede tipo e padrão, nessa ordem, sem repetir a tipologia', () => {
    const erros = validarEtapaProduto({ produto: criarProdutoVazio() });

    expect(Object.keys(erros)).toEqual(['tipoProjeto', 'padrao']);
    expect(etapaProdutoValida({ produto: criarProdutoVazio() })).toBe(false);
  });

  it('com tipo, passa a pedir a tipologia', () => {
    const erros = validarEtapaProduto({ produto: { tipoProjeto: 'comercial', tipologia: null, padrao: 'normal' } });

    expect(erros).toEqual({ tipologia: MENSAGENS_PRODUTO.tipologiaAusente });
  });

  it('completo e coerente com o PRD 3.1: etapa válida', () => {
    const produto = { tipoProjeto: 'residencial', tipologia: 'predio', padrao: 'normal' } as const;

    expect(validarEtapaProduto({ produto })).toEqual({});
    expect(etapaProdutoValida({ produto })).toBe(true);
  });
});
