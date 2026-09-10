import { z } from 'zod';

export const TipologySchema = z.object({
  id: z.string(),
  nome: z.string(),
  padrao: z.enum(['Baixo', 'Normal', 'Alto']),
  percentualTerreno: z.number(),
  percentualLucro: z.number(),
});

export type Tipology = z.infer<typeof TipologySchema>;

export const CubAdjustmentSchema = z.object({
  id: z.string(),
  tipologia: z.string(),
  padrao: z.string(),
  // Nulo quando o PRD não define o ajuste para a combinação tipologia/padrão
  // (ex: Galpão, Comercial Baixo, Uso Misto) — nunca um valor inventado.
  ajusteTipologia: z.number().nullable(),
  ajusteTopografia: z.record(z.number()),
  ajusteFormato: z.record(z.number()),
});

export type CubAdjustment = z.infer<typeof CubAdjustmentSchema>;

export const ParametersResponseSchema = z.object({
  tipologies: z.array(TipologySchema),
  cubAdjustments: z.array(CubAdjustmentSchema),
});

export type ParametersResponse = z.infer<typeof ParametersResponseSchema>;

// PRD §3.3 — placeholder enquanto os coeficientes de IA por zoneamento de
// Minas Gerais não são definidos.
export const CoeficienteIaResponseSchema = z.object({
  status: z.literal('nao_definido'),
  mensagem: z.string(),
  coeficientes: z.array(
    z.object({
      zona: z.string(),
      coeficiente: z.number(),
    })
  ),
});

export type CoeficienteIaResponse = z.infer<typeof CoeficienteIaResponseSchema>;

// GET /api/v1/dados/precos-mercado — dados mock enquanto FipeZap não é
// integrado de fato (PRD §3.4, plan.md decisão técnica #6/Fase 10).
export const PrecoMercadoQuerySchema = z.object({
  tipologia: z.string().min(1, 'Tipologia obrigatória'),
  regiao: z.string().min(1, 'Região obrigatória').default('MG'),
});

export type PrecoMercadoQuery = z.infer<typeof PrecoMercadoQuerySchema>;

export const PrecoMercadoResponseSchema = z.object({
  tipologia: z.string(),
  regiao: z.string(),
  precoM2: z.number(),
  atualizadoEm: z.string(),
  mock: z.literal(true),
  fonte: z.string(),
});

export type PrecoMercadoResponse = z.infer<typeof PrecoMercadoResponseSchema>;
