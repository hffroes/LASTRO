import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface ContextoMetodologia {
  aberta: boolean;
  abrir: () => void;
  fechar: () => void;
}

const Contexto = createContext<ContextoMetodologia | null>(null);

// O painel vive acima das rotas: abri-lo não desmonta a página por baixo, e por isso nada do que
// estiver preenchido se perde ao consultar a metodologia.
export function MetodologiaProvider({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(false);
  const abrir = useCallback(() => setAberta(true), []);
  const fechar = useCallback(() => setAberta(false), []);
  const valor = useMemo(() => ({ aberta, abrir, fechar }), [aberta, abrir, fechar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useMetodologia(): ContextoMetodologia {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('useMetodologia precisa estar dentro de MetodologiaProvider.');
  }
  return contexto;
}
