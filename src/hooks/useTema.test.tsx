import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TemaProvider, useTema } from './useTema';

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

function DoisConsumidores() {
  const a = useTema();
  const b = useTema();
  return (
    <div>
      <span data-testid="tema-a">{a.tema}</span>
      <span data-testid="tema-b">{b.tema}</span>
      <button onClick={a.alternar}>alternar</button>
    </div>
  );
}

describe('useTema', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('usa o tema claro do sistema quando não há preferência salva', () => {
    mockarPreferenciaSistema(false);

    const { result } = renderHook(() => useTema(), { wrapper: TemaProvider });

    expect(result.current.tema).toBe('claro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('usa o tema escuro do sistema quando não há preferência salva', () => {
    mockarPreferenciaSistema(true);

    const { result } = renderHook(() => useTema(), { wrapper: TemaProvider });

    expect(result.current.tema).toBe('escuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('prioriza a preferência salva sobre a preferência do sistema', () => {
    mockarPreferenciaSistema(true);
    window.localStorage.setItem('lastro-tema', 'claro');

    const { result } = renderHook(() => useTema(), { wrapper: TemaProvider });

    expect(result.current.tema).toBe('claro');
  });

  it('alterna o tema, atualiza o documento e persiste em localStorage', () => {
    mockarPreferenciaSistema(false);

    const { result } = renderHook(() => useTema(), { wrapper: TemaProvider });

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

    const { result } = renderHook(() => useTema(), { wrapper: TemaProvider });

    expect(result.current.tema).toBe('claro');

    act(() => {
      result.current.alternar();
    });

    expect(result.current.tema).toBe('escuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('lança um erro claro quando usado fora de <TemaProvider>', () => {
    const consoleErro = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useTema())).toThrow('useTema precisa ser usado dentro de <TemaProvider>.');

    consoleErro.mockRestore();
  });

  it('mantém dois consumidores diferentes sincronizados após alternar (regressão do bug de estado duplicado)', () => {
    mockarPreferenciaSistema(false);

    render(
      <TemaProvider>
        <DoisConsumidores />
      </TemaProvider>,
    );

    expect(screen.getByTestId('tema-a').textContent).toBe('claro');
    expect(screen.getByTestId('tema-b').textContent).toBe('claro');

    fireEvent.click(screen.getByRole('button', { name: 'alternar' }));

    expect(screen.getByTestId('tema-a').textContent).toBe('escuro');
    expect(screen.getByTestId('tema-b').textContent).toBe('escuro');
  });
});
