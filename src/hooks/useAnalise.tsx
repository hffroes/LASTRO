import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { OBJETIVOS_ANALISE, criarAnaliseVazia, type Analise, type ObjetivoAnalise } from '../types/analise';
import type { DadosTerreno } from '../types/terreno';

// D-A2 (decidido na F05): rascunho só nesta aba. Sobrevive a um F5 acidental e some ao fechar a
// aba; nada vai ao servidor, coerente com "sem persistência para o usuário" (PRD 2.7).
export const CHAVE_RASCUNHO = 'lastro-rascunho-analise';
// Sobe quando o formato de Analise mudar de forma incompatível: rascunho antigo é descartado, não
// interpretado errado.
const VERSAO_RASCUNHO = 1;

interface Rascunho {
  versao: number;
  analise: Analise;
}

// O sessionStorage é entrada externa (pode ter sido editado ou vir de outra versão do app): só
// aceita o que tem exatamente o formato esperado.
function lerRascunho(): Analise {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE_RASCUNHO);
    if (!bruto) return criarAnaliseVazia();
    const rascunho = JSON.parse(bruto) as Partial<Rascunho> | null;
    const analise = rascunho?.analise;
    const objetivoValido = analise?.objetivo === null || OBJETIVOS_ANALISE.includes(analise?.objetivo as ObjetivoAnalise);
    if (rascunho?.versao !== VERSAO_RASCUNHO || !objetivoValido || typeof analise?.terreno?.nome !== 'string') {
      return criarAnaliseVazia();
    }
    return { objetivo: analise.objetivo, terreno: { nome: analise.terreno.nome } };
  } catch {
    // sessionStorage bloqueado ou JSON corrompido: começa do zero em vez de quebrar a página.
    return criarAnaliseVazia();
  }
}

function salvarRascunho(analise: Analise): void {
  try {
    const rascunho: Rascunho = { versao: VERSAO_RASCUNHO, analise };
    window.sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(rascunho));
  } catch {
    // Sem armazenamento: o formulário segue funcionando só em memória.
  }
}

interface ContextoAnalise {
  analise: Analise;
  definirObjetivo: (objetivo: ObjetivoAnalise) => void;
  atualizarTerreno: (dados: Partial<DadosTerreno>) => void;
}

const Contexto = createContext<ContextoAnalise | null>(null);

// Acima das rotas: trocar de página (Terreno ↔ Produto) ou abrir a metodologia não perde nada.
export function AnaliseProvider({ children }: { children: ReactNode }) {
  const [analise, setAnalise] = useState<Analise>(lerRascunho);

  useEffect(() => {
    salvarRascunho(analise);
  }, [analise]);

  const definirObjetivo = useCallback((objetivo: ObjetivoAnalise) => {
    setAnalise((atual) => ({ ...atual, objetivo }));
  }, []);

  const atualizarTerreno = useCallback((dados: Partial<DadosTerreno>) => {
    setAnalise((atual) => ({ ...atual, terreno: { ...atual.terreno, ...dados } }));
  }, []);

  const valor = useMemo(
    () => ({ analise, definirObjetivo, atualizarTerreno }),
    [analise, definirObjetivo, atualizarTerreno],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAnalise(): ContextoAnalise {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('useAnalise precisa estar dentro de AnaliseProvider.');
  }
  return contexto;
}
