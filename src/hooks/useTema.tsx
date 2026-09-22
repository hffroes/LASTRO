import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Tema = 'claro' | 'escuro';

interface ContextoTema {
  tema: Tema;
  alternar: () => void;
}

const CHAVE_ARMAZENAMENTO = 'lastro-tema';

const ContextoTemaReact = createContext<ContextoTema | null>(null);

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

// Estado compartilhado via Context: mais de um componente lê o tema (Cabecalho escolhe o
// logo, AlternadorTema desenha o botão) e todos precisam reagir à mesma alternância.
export function TemaProvider({ children }: { children: ReactNode }) {
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

  return <ContextoTemaReact.Provider value={{ tema, alternar }}>{children}</ContextoTemaReact.Provider>;
}

export function useTema(): ContextoTema {
  const contexto = useContext(ContextoTemaReact);
  if (!contexto) {
    throw new Error('useTema precisa ser usado dentro de <TemaProvider>.');
  }
  return contexto;
}
