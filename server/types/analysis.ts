import type { AnalysisResult } from '../../shared/schemas';

// Entradas já resolvidas do motor de cálculo — tipologia/topografia/formato
// e área construída já traduzidos em números pela camada de persistência
// (Fase 4), a partir dos dados de /api/v1/parametros (Fase 2) e do
// formulário do usuário (Fase 6). O motor em si (server/utils/calculator.ts)
// não acessa banco nem UI — apenas números já resolvidos.
export interface CalculatorInput {
  // Vendas (PRD §2.2: usuário informa valor total da unidade, não R$/m²)
  unidades: number;
  precoVendaUnitario: number;

  // Construção
  areaConstruida: number;
  cubBase: number;
  // 0 quando a tipologia não tem ajuste de complexidade definido no PRD
  // (Galpão, Comercial Baixo, Uso Misto — ver server/utils/parameterConstants.ts)
  ajusteTipologiaCub: number;
  ajusteTopografia: number;
  ajusteFormato: number;

  // Terreno
  valorTerrenoR: number;
  // Percentual de referência da tipologia/padrão (PRD §3.1), usado apenas
  // para checagem de normalidade — Custo Terreno em si é o valor pedido.
  percentualTerrenoReferencia: number;

  // Lucro — PRD §2.6: usuário pode ajustar a margem em tempo real
  percentualLucroUsado: number;
  percentualLucroReferencia: number;

  // Potencial de mercado (Fase 2, StaticAdapter) — null quando não há dado
  // mock para a tipologia/região.
  precoMercadoM2: number | null;
}

export type { AnalysisResult };
