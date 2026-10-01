import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { criarTerrenoVazio } from '../types/terreno';
import { AnaliseProvider, CHAVE_RASCUNHO, useAnalise } from './useAnalise';

function envolver({ children }: { children: ReactNode }) {
  return <AnaliseProvider>{children}</AnaliseProvider>;
}

function renderUseAnalise() {
  return renderHook(() => useAnalise(), { wrapper: envolver });
}

describe('useAnalise', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('começa vazia e sem objetivo padrão', () => {
    const { result } = renderUseAnalise();

    expect(result.current.analise).toEqual({ objetivo: null, terreno: criarTerrenoVazio() });
  });

  it('registra o objetivo e os dados do terreno', () => {
    const { result } = renderUseAnalise();

    act(() => result.current.definirObjetivo('executarEmpreendimento'));
    act(() => result.current.atualizarTerreno({ nome: 'Lote da Rua Alagoas' }));

    expect(result.current.analise).toEqual({
      objetivo: 'executarEmpreendimento',
      terreno: { ...criarTerrenoVazio(), nome: 'Lote da Rua Alagoas' },
    });
  });

  it('guarda o rascunho na aba e o recupera numa nova montagem (F5)', () => {
    const primeira = renderUseAnalise();
    act(() => primeira.result.current.definirObjetivo('comprarTerreno'));
    act(() =>
      primeira.result.current.atualizarTerreno({
        nome: 'Lote 12',
        codigoMunicipioIbge: 3106200,
        cep: '30130010',
        ufCep: 'MG',
        enderecoPeloCep: true,
        areaTotalM2: 1250.5,
        precoPedidoCentavos: 120_000_000,
      }),
    );
    primeira.unmount();

    const segunda = renderUseAnalise();

    expect(segunda.result.current.analise).toEqual(primeira.result.current.analise);
    expect(segunda.result.current.analise.terreno.codigoMunicipioIbge).toBe(3106200);
    expect(segunda.result.current.analise.terreno.precoPedidoCentavos).toBe(120_000_000);
  });

  it('descarta rascunho corrompido ou de outra versão', () => {
    for (const bruto of ['{não é json', JSON.stringify({ versao: 99, analise: { objetivo: null, terreno: { nome: 'x' } } })]) {
      window.sessionStorage.setItem(CHAVE_RASCUNHO, bruto);
      const { result, unmount } = renderUseAnalise();
      expect(result.current.analise).toEqual({ objetivo: null, terreno: criarTerrenoVazio() });
      unmount();
    }
  });

  it('aceita campo a campo: valor de tipo errado volta a vazio, sem perder os válidos', () => {
    window.sessionStorage.setItem(
      CHAVE_RASCUNHO,
      JSON.stringify({
        versao: 1,
        analise: { objetivo: 'investir', terreno: { nome: 'Lote 12', codigoMunicipioIbge: '3106200', cep: 30130010 } },
      }),
    );

    const { result } = renderUseAnalise();

    expect(result.current.analise).toEqual({ objetivo: null, terreno: { ...criarTerrenoVazio(), nome: 'Lote 12' } });
  });

  it('área e preço só voltam do rascunho como número; preço só em centavos inteiros', () => {
    for (const [areaTotalM2, precoPedidoCentavos] of [
      ['1000', '120000000'],
      [null, 1200.5],
      [Number.NaN, Number.MAX_SAFE_INTEGER + 2],
    ]) {
      window.sessionStorage.setItem(
        CHAVE_RASCUNHO,
        JSON.stringify({ versao: 1, analise: { objetivo: null, terreno: { areaTotalM2, precoPedidoCentavos } } }),
      );
      const { result, unmount } = renderUseAnalise();
      expect(result.current.analise.terreno.areaTotalM2).toBeNull();
      expect(result.current.analise.terreno.precoPedidoCentavos).toBeNull();
      unmount();
    }
  });

  it('rascunho da F05 (só com nome) continua valendo, com os campos novos vazios', () => {
    window.sessionStorage.setItem(
      CHAVE_RASCUNHO,
      JSON.stringify({ versao: 1, analise: { objetivo: 'comprarTerreno', terreno: { nome: 'Lote 12' } } }),
    );

    const { result } = renderUseAnalise();

    expect(result.current.analise).toEqual({
      objetivo: 'comprarTerreno',
      terreno: { ...criarTerrenoVazio(), nome: 'Lote 12' },
    });
  });

  it('segue funcionando em memória se o sessionStorage estiver bloqueado', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    const { result } = renderUseAnalise();
    act(() => result.current.atualizarTerreno({ nome: 'Lote 12' }));

    expect(result.current.analise.terreno.nome).toBe('Lote 12');
  });

  it('exige o provedor', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAnalise())).toThrow('AnaliseProvider');
  });
});
