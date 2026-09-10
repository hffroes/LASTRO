import { z } from 'zod';

// Schemas por passo do wizard (Fase 6). Reflete as mesmas regras de
// AnalysisInputSchema (shared/schemas) para os campos já coletados aqui —
// z.coerce.number() porque inputs HTML sempre retornam string.

export const TerrenoSchema = z.object({
  areaTerreno: z.coerce.number().positive('Área deve ser positiva'),
  formatoLote: z.enum(['regular', 'irregular'], {
    errorMap: () => ({ message: 'Selecione o formato do lote' }),
  }),
  topografia: z.enum(['plana', 'regular', 'irregular', 'acidentada'], {
    errorMap: () => ({ message: 'Selecione a topografia' }),
  }),
  valorTerrenoR: z.coerce.number().positive('Valor deve ser positivo'),
});

export type TerrenoFormValues = z.infer<typeof TerrenoSchema>;

export const TipologiaFormSchema = z.object({
  tipologia: z.string().min(1, 'Selecione a tipologia'),
  padrao: z.enum(['Baixo', 'Normal', 'Alto'], {
    errorMap: () => ({ message: 'Selecione o padrão' }),
  }),
});

export type TipologiaFormValues = z.infer<typeof TipologiaFormSchema>;

export const DetalhesSchema = z.object({
  areaConstruida: z.coerce
    .number()
    .positive('Área construída deve ser positiva'),
});

export type DetalhesFormValues = z.infer<typeof DetalhesSchema>;

export const VendaSchema = z.object({
  unidades: z.coerce
    .number()
    .int()
    .positive('Número de unidades deve ser positivo'),
  precoVendaUnitario: z.coerce.number().positive('Preço deve ser positivo'),
});

export type VendaFormValues = z.infer<typeof VendaSchema>;
