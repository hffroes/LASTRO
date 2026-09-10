// Interface estável para custo básico de construção por projeto-padrão
// Sinduscon-MG (plan.md decisão técnica #6). Consumida pelo motor de
// cálculo (Fase 3) através do adapter ativo — nunca diretamente do JSON.

export interface CubBase {
  cubCodigo: string;
  valorM2: number;
  atualizadoEm: string;
  mock: boolean;
  fonte: string;
}

export interface CubDataAdapter {
  getCubBase(cubCodigo: string): Promise<CubBase | null>;
}
