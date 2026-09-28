import type { DadosTerreno } from './terreno';

// PRD 2.6 e D-R6: escolha explícita do usuário, nunca inferida. Decide a perspectiva padrão (F16)
// e o rótulo da recomendação (F19); aqui ela só é capturada.
export type ObjetivoAnalise = 'comprarTerreno' | 'executarEmpreendimento';

export const OBJETIVOS_ANALISE: readonly ObjetivoAnalise[] = ['comprarTerreno', 'executarEmpreendimento'];

export interface Analise {
  // null até o usuário escolher: não existe objetivo padrão.
  objetivo: ObjetivoAnalise | null;
  terreno: DadosTerreno;
}

export function criarAnaliseVazia(): Analise {
  return { objetivo: null, terreno: { nome: '' } };
}
