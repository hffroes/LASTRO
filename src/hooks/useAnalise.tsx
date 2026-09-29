import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { OBJETIVOS_ANALISE, criarAnaliseVazia, type Analise, type ObjetivoAnalise } from '../types/analise';
import { criarTerrenoVazio, type DadosTerreno } from '../types/terreno';

// D-A2 (decidido na F05): rascunho só nesta aba. Sobrevive a um F5 acidental e some ao fechar a
// aba; nada vai ao servidor, coerente com "sem persistência para o usuário" (PRD 2.7).
export const CHAVE_RASCUNHO = 'lastro-rascunho-analise';
// Sobe só quando o formato mudar de forma incompatível (um campo mudar de sentido): rascunho antigo
// é descartado, não interpretado errado. Campo novo não exige subir.
const VERSAO_RASCUNHO = 1;

interface Rascunho {
  versao: number;
  analise: Analise;
}

// O sessionStorage é entrada externa (pode ter sido editado ou vir de outra versão do app): cada
// campo é aceito só se tiver o tipo esperado; o resto volta ao valor vazio. Campos novos (F06 em
// diante) entram vazios em rascunhos antigos, sem precisar subir a versão.
function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : '';
}

function lerTerreno(bruto: Partial<Record<keyof DadosTerreno, unknown>> | undefined): DadosTerreno {
  const vazio = criarTerrenoVazio();
  if (!bruto || typeof bruto !== 'object') return vazio;
  return {
    nome: texto(bruto.nome),
    codigoMunicipioIbge: typeof bruto.codigoMunicipioIbge === 'number' ? bruto.codigoMunicipioIbge : null,
    cep: texto(bruto.cep),
    logradouro: texto(bruto.logradouro),
    bairro: texto(bruto.bairro),
    ufCep: typeof bruto.ufCep === 'string' ? bruto.ufCep : null,
    enderecoPeloCep: bruto.enderecoPeloCep === true,
  };
}

function lerRascunho(): Analise {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE_RASCUNHO);
    if (!bruto) return criarAnaliseVazia();
    const rascunho = JSON.parse(bruto) as Partial<Rascunho> | null;
    const analise = rascunho?.analise;
    if (rascunho?.versao !== VERSAO_RASCUNHO || !analise || typeof analise !== 'object') {
      return criarAnaliseVazia();
    }
    const objetivo = OBJETIVOS_ANALISE.includes(analise.objetivo as ObjetivoAnalise) ? analise.objetivo : null;
    return { objetivo, terreno: lerTerreno(analise.terreno) };
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
