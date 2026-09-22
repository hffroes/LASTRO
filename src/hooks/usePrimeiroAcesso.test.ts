import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePrimeiroAcesso } from './usePrimeiroAcesso';

const CHAVE = 'lastro-primeiro-acesso-visto';

describe('usePrimeiroAcesso', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('considera primeira visita quando não há flag salva', () => {
    const { result } = renderHook(() => usePrimeiroAcesso());

    expect(result.current.ehPrimeiroAcesso).toBe(true);
  });

  it('considera visita repetida quando a flag já foi marcada', () => {
    window.localStorage.setItem(CHAVE, 'true');

    const { result } = renderHook(() => usePrimeiroAcesso());

    expect(result.current.ehPrimeiroAcesso).toBe(false);
  });

  it('marcarComoVisto grava a flag em localStorage', () => {
    const { result } = renderHook(() => usePrimeiroAcesso());

    result.current.marcarComoVisto();

    expect(window.localStorage.getItem(CHAVE)).toBe('true');
  });

  it('trata como primeira visita quando localStorage lança erro ao ler', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    const { result } = renderHook(() => usePrimeiroAcesso());

    expect(result.current.ehPrimeiroAcesso).toBe(true);
  });

  it('não lança erro quando localStorage bloqueia a escrita', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    const { result } = renderHook(() => usePrimeiroAcesso());

    expect(() => result.current.marcarComoVisto()).not.toThrow();
  });
});
