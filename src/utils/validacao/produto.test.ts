import { describe, expect, it } from 'vitest';
import { criarProdutoVazio, PADROES_ACABAMENTO, TIPOS_PROJETO, type DadosProduto } from '../../types/produto';
import { TIPOLOGIAS_POR_TIPO } from '../../data/tipologias';
import {
  LIMITE_AREA_UNIDADE_M2,
  LIMITE_PAVIMENTOS,
  LIMITE_PRECO_UNIDADE_CENTAVOS,
  LIMITE_UNIDADES_POR_PAVIMENTO,
  MENSAGENS_PRODUTO,
  etapaProdutoValida,
  validarAreaUnidade,
  validarEtapaProduto,
  validarPadrao,
  validarPavimentos,
  validarPrecoUnidade,
  validarTaxaOcupacao,
  validarTipologia,
  validarTipoProjeto,
  validarUnidadesPorPavimento,
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

describe('validarPavimentos', () => {
  const predio = (pavimentos: unknown) => ({ tipologia: 'predio' as const, pavimentos: pavimentos as number | null });

  it('aceita inteiros de 1 até o teto', () => {
    expect(validarPavimentos(predio(1))).toBeUndefined();
    expect(validarPavimentos(predio(LIMITE_PAVIMENTOS))).toBeUndefined();
  });

  it('recusa vazio, fração, zero, negativo e acima do teto', () => {
    expect(validarPavimentos(predio(null))).toBe(MENSAGENS_PRODUTO.pavimentosAusente);
    expect(validarPavimentos(predio('4'))).toBe(MENSAGENS_PRODUTO.pavimentosAusente);
    expect(validarPavimentos(predio(4.5))).toBe(MENSAGENS_PRODUTO.pavimentosNaoInteiro);
    expect(validarPavimentos(predio(0))).toBe(MENSAGENS_PRODUTO.pavimentosNaoPositivo);
    expect(validarPavimentos(predio(-2))).toBe(MENSAGENS_PRODUTO.pavimentosNaoPositivo);
    expect(validarPavimentos(predio(LIMITE_PAVIMENTOS + 1))).toBe(MENSAGENS_PRODUTO.pavimentosAcimaDoLimite);
  });

  it('galpão não pede pavimentos: são fixos em 1 (D-R19)', () => {
    expect(validarPavimentos({ tipologia: 'galpao', pavimentos: null })).toBeUndefined();
    expect(validarPavimentos({ tipologia: 'galpao', pavimentos: 7 })).toBeUndefined();
  });

  it('casa pede pavimentos: térrea ou sobrado continuam sendo uma casa', () => {
    expect(validarPavimentos({ tipologia: 'casa', pavimentos: null })).toBe(MENSAGENS_PRODUTO.pavimentosAusente);
    expect(validarPavimentos({ tipologia: 'casa', pavimentos: 2 })).toBeUndefined();
  });
});

describe('validarUnidadesPorPavimento', () => {
  it('aceita inteiros de 1 até o teto e recusa o resto', () => {
    const salas = (unidadesPorPavimento: number | null) => ({ tipologia: 'salasLojas' as const, unidadesPorPavimento });
    expect(validarUnidadesPorPavimento(salas(12))).toBeUndefined();
    expect(validarUnidadesPorPavimento(salas(LIMITE_UNIDADES_POR_PAVIMENTO))).toBeUndefined();
    expect(validarUnidadesPorPavimento(salas(null))).toBe(MENSAGENS_PRODUTO.unidadesAusente);
    expect(validarUnidadesPorPavimento(salas(2.5))).toBe(MENSAGENS_PRODUTO.unidadesNaoInteiro);
    expect(validarUnidadesPorPavimento(salas(0))).toBe(MENSAGENS_PRODUTO.unidadesNaoPositivo);
    expect(validarUnidadesPorPavimento(salas(LIMITE_UNIDADES_POR_PAVIMENTO + 1))).toBe(
      MENSAGENS_PRODUTO.unidadesAcimaDoLimite,
    );
  });

  it('Casa e Galpões não pedem: é 1 unidade fixa (PRD 2.2)', () => {
    for (const tipologia of ['casa', 'galpao'] as const) {
      expect(validarUnidadesPorPavimento({ tipologia, unidadesPorPavimento: null })).toBeUndefined();
      expect(validarUnidadesPorPavimento({ tipologia, unidadesPorPavimento: 9 })).toBeUndefined();
    }
  });
});

describe('validarAreaUnidade', () => {
  it('aceita área positiva com até duas casas', () => {
    expect(validarAreaUnidade(68.5)).toBeUndefined();
    expect(validarAreaUnidade(LIMITE_AREA_UNIDADE_M2)).toBeUndefined();
  });

  it('recusa vazio, zero, acima do teto e mais de duas casas', () => {
    expect(validarAreaUnidade(null)).toBe(MENSAGENS_PRODUTO.areaUnidadeAusente);
    expect(validarAreaUnidade(0)).toBe(MENSAGENS_PRODUTO.areaUnidadeNaoPositiva);
    expect(validarAreaUnidade(LIMITE_AREA_UNIDADE_M2 + 1)).toBe(MENSAGENS_PRODUTO.areaUnidadeAcimaDoLimite);
    expect(validarAreaUnidade(68.555)).toBe(MENSAGENS_PRODUTO.areaUnidadeIlegivel);
  });
});

describe('validarPrecoUnidade', () => {
  it('aceita centavos inteiros positivos até o teto', () => {
    expect(validarPrecoUnidade(45_000_000)).toBeUndefined();
    expect(validarPrecoUnidade(LIMITE_PRECO_UNIDADE_CENTAVOS)).toBeUndefined();
  });

  it('recusa vazio, fração de centavo, zero e acima do teto', () => {
    expect(validarPrecoUnidade(undefined)).toBe(MENSAGENS_PRODUTO.precoUnidadeAusente);
    expect(validarPrecoUnidade(4500.5)).toBe(MENSAGENS_PRODUTO.precoUnidadeIlegivel);
    expect(validarPrecoUnidade(0)).toBe(MENSAGENS_PRODUTO.precoUnidadeNaoPositivo);
    expect(validarPrecoUnidade(LIMITE_PRECO_UNIDADE_CENTAVOS + 1)).toBe(MENSAGENS_PRODUTO.precoUnidadeAcimaDoLimite);
  });
});

describe('validarTaxaOcupacao', () => {
  it('aceita de 0% exclusive até 100%, em pontos-base', () => {
    for (const taxa of [1, 5_000, 6_000, 10_000]) expect(validarTaxaOcupacao(taxa)).toBeUndefined();
  });

  it('recusa apagada, zero, negativa e acima de 100%', () => {
    expect(validarTaxaOcupacao(null)).toBe(MENSAGENS_PRODUTO.taxaOcupacaoAusente);
    expect(validarTaxaOcupacao(0)).toBe(MENSAGENS_PRODUTO.taxaOcupacaoNaoPositiva);
    expect(validarTaxaOcupacao(-500)).toBe(MENSAGENS_PRODUTO.taxaOcupacaoNaoPositiva);
    expect(validarTaxaOcupacao(10_001)).toBe(MENSAGENS_PRODUTO.taxaOcupacaoAcimaDeCem);
  });

  it('recusa fração de ponto-base (vinda da API)', () => {
    expect(validarTaxaOcupacao(6_000.5)).toBe(MENSAGENS_PRODUTO.taxaOcupacaoIlegivel);
  });

  it('apagar a taxa trava a etapa, mesmo com todo o resto válido', () => {
    const produto = { ...criarProdutoVazio(), tipoProjeto: 'residencial', tipologia: 'predio', padrao: 'normal', pavimentos: 4, unidadesPorPavimento: 4, areaUnidadeM2: 68.5, precoUnidadeCentavos: 45_000_000, taxaOcupacaoPontosBase: null } as const;
    expect(validarEtapaProduto({ produto })).toEqual({ taxaOcupacao: MENSAGENS_PRODUTO.taxaOcupacaoAusente });
  });
});

describe('validarEtapaProduto', () => {
  const PREDIO_COMPLETO: DadosProduto = {
    tipoProjeto: 'residencial',
    tipologia: 'predio',
    padrao: 'normal',
    pavimentos: 4,
    unidadesPorPavimento: 4,
    areaUnidadeM2: 68.5,
    precoUnidadeCentavos: 45_000_000,
    taxaOcupacaoPontosBase: 6_000,
  };

  it('produto vazio: pede tudo na ordem da página, sem repetir a tipologia antes do tipo', () => {
    const erros = validarEtapaProduto({ produto: criarProdutoVazio() });

    // A taxa de ocupação nasce preenchida com o padrão, então não aparece entre as pendências.
    expect(Object.keys(erros)).toEqual(['tipoProjeto', 'padrao', 'pavimentos', 'unidadesPorPavimento', 'areaUnidade', 'precoUnidade']);
    expect(etapaProdutoValida({ produto: criarProdutoVazio() })).toBe(false);
  });

  it('com tipo, passa a pedir a tipologia', () => {
    const erros = validarEtapaProduto({ produto: { ...PREDIO_COMPLETO, tipoProjeto: 'comercial', tipologia: null } });

    expect(erros).toEqual({ tipologia: MENSAGENS_PRODUTO.tipologiaAusente });
  });

  it('completo e coerente com o PRD 3.1: etapa válida', () => {
    expect(validarEtapaProduto({ produto: PREDIO_COMPLETO })).toEqual({});
    expect(etapaProdutoValida({ produto: PREDIO_COMPLETO })).toBe(true);
  });

  it('galpão completo sem pavimentos nem unidades informados: válido, pelas travas', () => {
    const galpao: DadosProduto = {
      ...PREDIO_COMPLETO,
      tipoProjeto: 'galpoes',
      tipologia: 'galpao',
      pavimentos: null,
      unidadesPorPavimento: null,
    };
    expect(etapaProdutoValida({ produto: galpao })).toBe(true);
  });
});
