// Fonte única dos dados hardcoded do PRD §3.1-3.3. Consumido pelo seed do
// Prisma (dados imutáveis, versionados em código, nunca "números mágicos"
// soltos pelo app — regra CLAUDE.md #9).
//
// Combinações tipologia/padrão sem código CUB ou ajuste definidos no PRD
// permanecem `null`, nunca preenchidas com valor inventado (regra #8).

export interface TipologiaParametro {
  tipologia: string;
  padrao: 'Baixo' | 'Normal' | 'Alto';
  percentualTerreno: number;
  percentualLucro: number;
  cubCodigo: string | null;
  ajusteTipologiaCub: number | null;
  notaCub: string | null;
}

// PRD §3.1 (tabela de percentuais) + mapeamento CUB Sinduscon-MG e PRD §3.2-A
// (ajustes de complexidade por tipologia/padrão).
export const TIPOLOGIA_PARAMETROS: TipologiaParametro[] = [
  {
    tipologia: 'Unifamiliar',
    padrao: 'Baixo',
    percentualTerreno: 0.08,
    percentualLucro: 0.18,
    cubCodigo: 'R1-B',
    ajusteTipologiaCub: 0.1,
    notaCub: null,
  },
  {
    tipologia: 'Unifamiliar',
    padrao: 'Normal',
    percentualTerreno: 0.09,
    percentualLucro: 0.22,
    cubCodigo: 'R1-N',
    ajusteTipologiaCub: 0.15,
    notaCub: null,
  },
  {
    tipologia: 'Unifamiliar',
    padrao: 'Alto',
    percentualTerreno: 0.1,
    percentualLucro: 0.25,
    cubCodigo: 'R1-A',
    ajusteTipologiaCub: 0.25,
    notaCub: null,
  },
  {
    tipologia: 'Loteamento',
    padrao: 'Baixo',
    percentualTerreno: 0.08,
    percentualLucro: 0.15,
    cubCodigo: 'R1-B',
    ajusteTipologiaCub: 0.1,
    notaCub:
      'PRD §3.1: loteamentos usam referência de Unifamiliar conforme padrão dominante.',
  },
  {
    tipologia: 'Loteamento',
    padrao: 'Normal',
    percentualTerreno: 0.09,
    percentualLucro: 0.2,
    cubCodigo: 'R1-N',
    ajusteTipologiaCub: 0.15,
    notaCub:
      'PRD §3.1: loteamentos usam referência de Unifamiliar conforme padrão dominante.',
  },
  {
    tipologia: 'Loteamento',
    padrao: 'Alto',
    percentualTerreno: 0.1,
    percentualLucro: 0.25,
    cubCodigo: 'R1-A',
    ajusteTipologiaCub: 0.25,
    notaCub:
      'PRD §3.1: loteamentos usam referência de Unifamiliar conforme padrão dominante.',
  },
  {
    tipologia: 'Multifamiliar',
    padrao: 'Baixo',
    percentualTerreno: 0.08,
    percentualLucro: 0.2,
    cubCodigo: 'R8-B',
    ajusteTipologiaCub: 0.1,
    notaCub: null,
  },
  {
    tipologia: 'Multifamiliar',
    padrao: 'Normal',
    percentualTerreno: 0.09,
    percentualLucro: 0.23,
    cubCodigo: 'R8-N',
    ajusteTipologiaCub: 0.15,
    notaCub:
      'PRD §3.1 permite R8-N ou R16-N; nº de pavimentos define a variante exata (detalhe capturado na Fase 6).',
  },
  {
    tipologia: 'Multifamiliar',
    padrao: 'Alto',
    percentualTerreno: 0.1,
    percentualLucro: 0.27,
    cubCodigo: 'R8-A',
    ajusteTipologiaCub: 0.25,
    notaCub:
      'PRD §3.1 permite R8-A ou R16-A; nº de pavimentos define a variante exata (detalhe capturado na Fase 6).',
  },
  {
    tipologia: 'Galpão',
    padrao: 'Baixo',
    percentualTerreno: 0.08,
    percentualLucro: 0.18,
    cubCodigo: 'GI',
    ajusteTipologiaCub: null,
    notaCub:
      'PRD §3.2-A não define ajuste de complexidade para Galpão (GI) — não inventado.',
  },
  {
    tipologia: 'Galpão',
    padrao: 'Normal',
    percentualTerreno: 0.09,
    percentualLucro: 0.22,
    cubCodigo: 'GI',
    ajusteTipologiaCub: null,
    notaCub:
      'PRD §3.2-A não define ajuste de complexidade para Galpão (GI) — não inventado.',
  },
  {
    tipologia: 'Galpão',
    padrao: 'Alto',
    percentualTerreno: 0.1,
    percentualLucro: 0.25,
    cubCodigo: 'GI',
    ajusteTipologiaCub: null,
    notaCub:
      'PRD §3.2-A não define ajuste de complexidade para Galpão (GI) — não inventado.',
  },
  {
    tipologia: 'Comercial',
    padrao: 'Baixo',
    percentualTerreno: 0.08,
    percentualLucro: 0.2,
    cubCodigo: null,
    ajusteTipologiaCub: null,
    notaCub:
      'PRD §3.1/3.2 não define código CUB nem ajuste para Comercial padrão Baixo — não inventado.',
  },
  {
    tipologia: 'Comercial',
    padrao: 'Normal',
    percentualTerreno: 0.09,
    percentualLucro: 0.24,
    cubCodigo: null,
    ajusteTipologiaCub: 0.15,
    notaCub:
      'Ajuste idêntico em CSL-8-N e CAL-8-N (PRD §3.2-A); cubCodigo depende do subtipo (Salas vs Andares Livres), a capturar na Fase 6.',
  },
  {
    tipologia: 'Comercial',
    padrao: 'Alto',
    percentualTerreno: 0.1,
    percentualLucro: 0.28,
    cubCodigo: null,
    ajusteTipologiaCub: 0.2,
    notaCub:
      'Ajuste idêntico em CSL-8-A e CAL-8-A (PRD §3.2-A); cubCodigo depende do subtipo (Salas vs Andares Livres), a capturar na Fase 6.',
  },
  {
    tipologia: 'Uso Misto',
    padrao: 'Normal',
    percentualTerreno: 0.09,
    percentualLucro: 0.22,
    cubCodigo: null,
    ajusteTipologiaCub: null,
    notaCub:
      'PRD §3.1/3.2 não mapeia código CUB nem ajuste para Uso Misto — não inventado.',
  },
];

// PRD §3.2-B: ajuste por topografia (aplicado sobre CUB + ajuste tipologia).
export const AJUSTES_TOPOGRAFIA: Record<string, number> = {
  plana: 0.02,
  regular: 0.04,
  irregular: 0.08,
  acidentada: 0.12,
};

// PRD §3.2-C: ajuste por formato do lote (aplicado sobre os ajustes anteriores).
export const AJUSTES_FORMATO: Record<string, number> = {
  regular: 0,
  irregular: 0.03,
};

// PRD §3.3: "Será definido durante desenvolvimento conforme normas de
// zoneamento de Minas Gerais." Placeholder explícito — nenhum coeficiente
// real é armazenado até essa definição existir (regra CLAUDE.md #8).
export const COEFICIENTES_IA_PLACEHOLDER = {
  status: 'nao_definido' as const,
  mensagem:
    'Coeficientes de Aproveitamento (IA) por zoneamento ainda não foram definidos (PRD §3.3). Aguardando confirmação junto às normas de zoneamento de Minas Gerais antes de qualquer uso no motor de cálculo.',
  coeficientes: [] as Array<{ zona: string; coeficiente: number }>,
};
