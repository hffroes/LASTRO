// Dados acumulados pelo wizard multi-step (Fase 6). Espelha o subconjunto
// de AnalysisInput (shared/schemas) que o formulário realmente coleta —
// percentualLucro (ajuste em tempo real, PRD §2.6) e detalhesProto ficam
// para a Fase 7 (Resultado Interativo).
export interface AnalysisFormData {
  areaTerreno: number;
  formatoLote: 'regular' | 'irregular';
  topografia: 'plana' | 'regular' | 'irregular' | 'acidentada';
  valorTerrenoR: number;
  tipologia: string;
  padrao: 'Baixo' | 'Normal' | 'Alto';
  areaConstruida: number;
  unidades: number;
  precoVendaUnitario: number;
}
