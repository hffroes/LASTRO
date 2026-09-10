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
  ajusteTipologia: z.number(),
  ajusteTopografia: z.record(z.number()),
  ajusteFormato: z.record(z.number()),
});

export type CubAdjustment = z.infer<typeof CubAdjustmentSchema>;

export const ParametersResponseSchema = z.object({
  tipologies: z.array(TipologySchema),
  cubAdjustments: z.array(CubAdjustmentSchema),
});

export type ParametersResponse = z.infer<typeof ParametersResponseSchema>;
