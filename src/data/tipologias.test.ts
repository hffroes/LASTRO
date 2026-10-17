import { describe, expect, it } from 'vitest';
import { criarProdutoVazio, TIPOLOGIAS, TIPOS_PROJETO, type DadosProduto } from '../types/produto';
import {
  TIPOLOGIAS_POR_TIPO,
  TIPO_PROJETO_PENDENTE,
  ehTipoProjeto,
  ehUnidadeUnica,
  escolherTipoProjeto,
  pavimentosFixos,
  tipologiaPertenceAoTipo,
} from './tipologias';

describe('taxonomia (PRD 3.1)', () => {
  it('é exatamente a tabela de mapeamento do PRD, sem combinação inventada', () => {
    expect(TIPOLOGIAS_POR_TIPO).toEqual({
      residencial: ['casa', 'predio'],
      comercial: ['salasLojas', 'andaresLivres'],
      galpoes: ['galpao'],
    });
  });

  it('cada tipologia pertence a um tipo só, e todas estão em algum tipo', () => {
    const distribuidas = TIPOS_PROJETO.flatMap((tipo) => TIPOLOGIAS_POR_TIPO[tipo]);
    expect([...distribuidas].sort()).toEqual([...TIPOLOGIAS].sort());
  });

  it('recusa combinação de tipologia com tipo alheio', () => {
    expect(tipologiaPertenceAoTipo('residencial', 'casa')).toBe(true);
    expect(tipologiaPertenceAoTipo('residencial', 'galpao')).toBe(false);
    expect(tipologiaPertenceAoTipo('comercial', 'predio')).toBe(false);
    expect(tipologiaPertenceAoTipo('galpoes', 'salasLojas')).toBe(false);
  });

  it('Uso Misto (D-B6) não é tipo de projeto aceito', () => {
    expect(ehTipoProjeto(TIPO_PROJETO_PENDENTE)).toBe(false);
    expect(TIPOS_PROJETO).not.toContain(TIPO_PROJETO_PENDENTE);
  });
});

describe('escolherTipoProjeto', () => {
  const prontoResidencial: DadosProduto = {
    ...criarProdutoVazio(),
    tipoProjeto: 'residencial',
    tipologia: 'predio',
    padrao: 'alto',
    pavimentos: 4,
    unidadesPorPavimento: 4,
  };

  it('trocar o tipo apaga a tipologia e preserva o padrão e o programa', () => {
    expect(escolherTipoProjeto(prontoResidencial, 'comercial')).toEqual({
      ...prontoResidencial,
      tipoProjeto: 'comercial',
      tipologia: null,
    });
  });

  it('escolher de novo o mesmo tipo não mexe em nada', () => {
    expect(escolherTipoProjeto(prontoResidencial, 'residencial')).toBe(prontoResidencial);
  });

  it('Galpões já vem com a única tipologia do tipo', () => {
    expect(escolherTipoProjeto(criarProdutoVazio(), 'galpoes')).toEqual({
      ...criarProdutoVazio(),
      tipoProjeto: 'galpoes',
      tipologia: 'galpao',
    });
  });

  it('sair de Galpões apaga a tipologia que veio junto', () => {
    const galpao = escolherTipoProjeto(criarProdutoVazio(), 'galpoes');
    expect(escolherTipoProjeto(galpao, 'residencial').tipologia).toBeNull();
  });
});

describe('travas do programa por tipologia', () => {
  it('Casa e Galpões são unidade única (PRD 2.2); as demais, não', () => {
    expect(TIPOLOGIAS.filter(ehUnidadeUnica)).toEqual(['casa', 'galpao']);
    expect(ehUnidadeUnica(null)).toBe(false);
  });

  it('só Galpões trava os pavimentos, em 1 (D-R19: única faixa com CUB)', () => {
    expect(Object.fromEntries(TIPOLOGIAS.map((tipologia) => [tipologia, pavimentosFixos(tipologia)]))).toEqual({
      casa: null,
      predio: null,
      salasLojas: null,
      andaresLivres: null,
      galpao: 1,
    });
    expect(pavimentosFixos(null)).toBeNull();
  });
});
