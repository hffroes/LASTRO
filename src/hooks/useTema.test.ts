import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTema } from './useTema';

function mockarPreferenciaSistema(prefereEscuro: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('dark') && prefereEscuro,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('useTema', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('usa o tema claro do sistema quando não há preferência salva', () => {
    mockarPreferenciaSistema(false);

    const { result } = renderHook(() => useTema());

    expect(result.current.tema).toBe('claro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('usa o tema escuro do sistema quando não há preferência salva', () => {
    mockarPreferenciaSistema(true);

    const { result } = renderHook(() => useTema());

    expect(result.current.tema).toBe('escuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('prioriza a preferência salva sobre a preferência do sistema', () => {
    mockarPreferenciaSistema(true);
    window.localStorage.setItem('lastro-tema', 'claro');

    const { result } = renderHook(() => useTema());

    expect(result.current.tema).toBe('claro');
  });

  it('alterna o tema, atualiza o documento e persiste em localStorage', () => {
    mockarPreferenciaSistema(false);

    const { result } = renderHook(() => useTema());

    act(() => {
      result.current.alternar();
    });

    expect(result.current.tema).toBe('escuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem('lastro-tema')).toBe('escuro');

    act(() => {
      result.current.alternar();
    });

    expect(result.current.tema).toBe('claro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('continua funcionando quando localStorage lança erro (armazenamento bloqueado)', () => {
    mockarPreferenciaSistema(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage bloqueado');
    });

    const { result } = renderHook(() => useTema());

    expect(result.current.tema).toBe('claro');

    act(() => {
      result.current.alternar();
    });

    expect(result.current.tema).toBe('escuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
