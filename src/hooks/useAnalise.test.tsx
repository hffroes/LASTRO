import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

    expect(result.current.analise).toEqual({ objetivo: null, terreno: { nome: '' } });
  });

  it('registra o objetivo e os dados do terreno', () => {
    const { result } = renderUseAnalise();

    act(() => result.current.definirObjetivo('executarEmpreendimento'));
    act(() => result.current.atualizarTerreno({ nome: 'Lote da Rua Alagoas' }));

    expect(result.current.analise).toEqual({
      objetivo: 'executarEmpreendimento',
      terreno: { nome: 'Lote da Rua Alagoas' },
    });
  });

  it('guarda o rascunho na aba e o recupera numa nova montagem (F5)', () => {
    const primeira = renderUseAnalise();
    act(() => primeira.result.current.definirObjetivo('comprarTerreno'));
    act(() => primeira.result.current.atualizarTerreno({ nome: 'Lote 12' }));
    primeira.unmount();

    const segunda = renderUseAnalise();

    expect(segunda.result.current.analise).toEqual({ objetivo: 'comprarTerreno', terreno: { nome: 'Lote 12' } });
  });

  it('descarta rascunho corrompido, de outra versão ou com objetivo desconhecido', () => {
    for (const bruto of [
      '{não é json',
      JSON.stringify({ versao: 99, analise: { objetivo: null, terreno: { nome: 'x' } } }),
      JSON.stringify({ versao: 1, analise: { objetivo: 'investir', terreno: { nome: 'x' } } }),
      JSON.stringify({ versao: 1, analise: { objetivo: null, terreno: { nome: 7 } } }),
    ]) {
      window.sessionStorage.setItem(CHAVE_RASCUNHO, bruto);
      const { result, unmount } = renderUseAnalise();
      expect(result.current.analise).toEqual({ objetivo: null, terreno: { nome: '' } });
      unmount();
    }
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
