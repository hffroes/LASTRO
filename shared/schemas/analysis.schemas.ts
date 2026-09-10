import { z } from 'zod';

export const AnalysisInputSchema = z.object({
  areaTerreno: z.number().positive('Área deve ser positiva'),
  formatoLote: z.enum(['regular', 'irregular']),
  topografia: z.enum(['plana', 'regular', 'irregular', 'acidentada']),
  valorTerrenoR: z.number().positive('Valor deve ser positivo'),
  tipologia: z.string().min(1, 'Tipologia obrigatória'),
  padrao: z.enum(['Baixo', 'Normal', 'Alto']),
  unidades: z.number().int().positive('Número de unidades deve ser positivo'),
  precoVendaUnitario: z.number().positive('Preço deve ser positivo'),
  detalhesProto: z.record(z.any()).optional(),
});

export type AnalysisInput = z.infer<typeof AnalysisInputSchema>;

export const AnalysisResultSchema = z.object({
  vgv: z.number(),
  custoConstrucao: z.number(),
  custoTerreno: z.number(),
  lucroIncorporador: z.number(),
  outrosCustos: z.number(),
  resultadoLiquido: z.number(),
  lastroScore: z.number(),
  recomendacao: z.enum(['COMPRAR', 'RESSALVAS', 'NAO_COMPRAR']),
  precoMaximoRecomendado: z.number(),
  alertas: z.array(z.object({
    tipo: z.string(),
    mensagem: z.string(),
    severidade: z.enum(['info', 'warning', 'error']),
  })),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
