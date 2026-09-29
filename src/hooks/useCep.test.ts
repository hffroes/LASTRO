import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TEMPO_LIMITE_CEP_MS, useCep, type EnderecoConsultado } from './useCep';

const BH: EnderecoConsultado = {
  cep: '30130010',
  logradouro: 'Praça Sete de Setembro',
  bairro: 'Centro',
  cidade: 'Belo Horizonte',
  uf: 'MG',
  codigoIbge: 3106200,
};

function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useCep', () => {
  it('começa ocioso e não consulta sozinho', () => {
    const buscar = vi.fn();
    const { result } = renderHook(() => useCep({ buscar }));

    expect(result.current.estado).toEqual({ situacao: 'ocioso' });
    expect(buscar).not.toHaveBeenCalled();
  });

  it('sucesso: fica "encontrado" e entrega o endereço uma vez', async () => {
    const aoEncontrar = vi.fn();
    const buscar = vi.fn(async () => json({ dados: BH }));
    const { result } = renderHook(() => useCep({ buscar, aoEncontrar }));

    await act(() => result.current.consultar('30130010'));

    expect(buscar).toHaveBeenCalledWith('/api/v1/cep/30130010', expect.anything());
    expect(result.current.estado).toEqual({ situacao: 'encontrado', endereco: BH });
    expect(aoEncontrar).toHaveBeenCalledTimes(1);
    expect(aoEncontrar).toHaveBeenCalledWith(BH);
  });

  it('404: fica "não encontrado", sem entregar endereço', async () => {
    const aoEncontrar = vi.fn();
    const { result } = renderHook(() =>
      useCep({ buscar: async () => json({ erro: { codigo: 'CEP_NAO_ENCONTRADO' } }, 404), aoEncontrar }),
    );

    await act(() => result.current.consultar('99999999'));

    expect(result.current.estado).toEqual({ situacao: 'naoEncontrado' });
    expect(aoEncontrar).not.toHaveBeenCalled();
  });

  it('503 e 504 do servidor viram "indisponível"', async () => {
    for (const status of [503, 504]) {
      const { result, unmount } = renderHook(() => useCep({ buscar: async () => json({ erro: {} }, status) }));
      await act(() => result.current.consultar('30130010'));
      expect(result.current.estado).toEqual({ situacao: 'indisponivel' });
      unmount();
    }
  });

  it('rede fora vira "indisponível"', async () => {
    const { result } = renderHook(() =>
      useCep({
        buscar: async () => {
          throw new TypeError('Failed to fetch');
        },
      }),
    );

    await act(() => result.current.consultar('30130010'));

    expect(result.current.estado).toEqual({ situacao: 'indisponivel' });
  });

  it('servidor que não responde: tempo esgotado vira "indisponível"', async () => {
    vi.useFakeTimers();
    const buscar = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolver, rejeitar) => {
          init?.signal?.addEventListener('abort', () => rejeitar(new DOMException('abortado', 'AbortError')));
        }),
    );
    const { result } = renderHook(() => useCep({ buscar: buscar as unknown as typeof fetch }));

    act(() => {
      void result.current.consultar('30130010');
    });
    expect(result.current.estado).toEqual({ situacao: 'consultando' });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(TEMPO_LIMITE_CEP_MS);
    });

    expect(result.current.estado).toEqual({ situacao: 'indisponivel' });
  });

  it('uma consulta nova cancela a anterior, e só a última vale', async () => {
    const aoEncontrar = vi.fn();
    const respostas: Record<string, (r: Response) => void> = {};
    const buscar = vi.fn(
      (url: string) =>
        new Promise<Response>((resolver) => {
          respostas[url] = resolver;
        }),
    );
    const { result } = renderHook(() => useCep({ buscar: buscar as unknown as typeof fetch, aoEncontrar }));

    act(() => {
      void result.current.consultar('11111111');
      void result.current.consultar('30130010');
    });
    await act(async () => {
      respostas['/api/v1/cep/30130010'](json({ dados: BH }));
      respostas['/api/v1/cep/11111111'](json({ dados: { ...BH, cep: '11111111', uf: 'SP' } }));
    });

    await waitFor(() => expect(result.current.estado).toEqual({ situacao: 'encontrado', endereco: BH }));
    expect(aoEncontrar).toHaveBeenCalledTimes(1);
    expect(aoEncontrar).toHaveBeenCalledWith(BH);
  });

  it('limpar volta a ocioso', async () => {
    const { result } = renderHook(() => useCep({ buscar: async () => json({ dados: BH }) }));

    await act(() => result.current.consultar('30130010'));
    act(() => result.current.limpar());

    expect(result.current.estado).toEqual({ situacao: 'ocioso' });
  });
});
