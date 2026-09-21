import { useCallback, useEffect, useState } from 'react';

export type Tema = 'claro' | 'escuro';

const CHAVE_ARMAZENAMENTO = 'lastro-tema';

function lerPreferenciaSistema(): Tema {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'claro';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

function lerTemaArmazenado(): Tema | null {
  try {
    const valor = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    return valor === 'claro' || valor === 'escuro' ? valor : null;
  } catch {
    return null;
  }
}

function salvarTemaArmazenado(tema: Tema): void {
  try {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, tema);
  } catch {
    // localStorage indisponível (ex.: aba anônima bloqueada) — tema válido só para esta sessão.
  }
}

function aplicarTemaNoDocumento(tema: Tema): void {
  document.documentElement.setAttribute('data-theme', tema === 'escuro' ? 'dark' : 'light');
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(() => lerTemaArmazenado() ?? lerPreferenciaSistema());

  useEffect(() => {
    aplicarTemaNoDocumento(tema);
  }, [tema]);

  const alternar = useCallback(() => {
    setTema((atual) => {
      const proximo: Tema = atual === 'claro' ? 'escuro' : 'claro';
      salvarTemaArmazenado(proximo);
      return proximo;
    });
  }, []);

  return { tema, alternar };
}
