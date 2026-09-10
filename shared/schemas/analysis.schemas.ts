import { z } from 'zod';

export const AnalysisInputSchema = z.object({
  areaTerreno: z.number().positive('Área deve ser positiva'),
  // PRD §2.3: sugerido a partir do IA (ainda não definido, PRD §3.3) mas
  // sempre ajustável manualmente — por isso é um input direto, não derivado
  // internamente pelo motor de cálculo (regra CLAUDE.md #8: não inventar IA).
  areaConstruida: z.number().positive('Área construída deve ser positiva'),
  formatoLote: z.enum(['regular', 'irregular']),
  topografia: z.enum(['plana', 'regular', 'irregular', 'acidentada']),
  valorTerrenoR: z.number().positive('Valor deve ser positivo'),
  tipologia: z.string().min(1, 'Tipologia obrigatória'),
  padrao: z.enum(['Baixo', 'Normal', 'Alto']),
  unidades: z.number().int().positive('Número de unidades deve ser positivo'),
  precoVendaUnitario: z.number().positive('Preço deve ser positivo'),
  // PRD §2.6: usuário pode ajustar a margem de lucro em tempo real; omitido
  // usa o percentual padrão da tipologia/padrão (Fase 2).
  percentualLucro: z
    .number()
    .min(0, 'Percentual de lucro não pode ser negativo')
    .max(1, 'Percentual de lucro deve estar em formato decimal (0.23 = 23%)')
    .optional(),
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
  alertas: z.array(
    z.object({
      tipo: z.string(),
      mensagem: z.string(),
      severidade: z.enum(['info', 'warning', 'error']),
    })
  ),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// Formato de uma análise salva (Fase 4) — input + resultado + snapshot dos
// parâmetros efetivamente usados no cálculo (CLAUDE.md: "Análise salva
// preserva snapshot dos parâmetros usados").
export const SavedAnalysisSchema = z.object({
  id: z.string(),
  input: AnalysisInputSchema,
  resultado: AnalysisResultSchema,
  parametrosSnapshot: z.record(z.any()),
  createdAt: z.string(),
});

export type SavedAnalysis = z.infer<typeof SavedAnalysisSchema>;
