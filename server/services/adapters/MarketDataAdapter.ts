// Interface estável consumida pelo resto da aplicação (plan.md decisão
// técnica #6). Nenhum consumidor sabe se os dados vêm do StaticAdapter
// (padrão, JSON versionado) ou de um futuro HttpAdapter (Fase 10, somente
// após confirmação real de API pública do FipeZap).

export interface PrecoMercado {
  tipologia: string;
  regiao: string;
  precoM2: number;
  atualizadoEm: string;
  mock: boolean;
  fonte: string;
}

export interface MarketDataAdapter {
  getPrecoMercado(
    tipologia: string,
    regiao: string
  ): Promise<PrecoMercado | null>;
}
