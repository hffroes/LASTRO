import type { MarketDataAdapter } from './MarketDataAdapter';
import type { CubDataAdapter } from './CubDataAdapter';
import { StaticAdapter } from './StaticAdapter';

const staticAdapter = new StaticAdapter();

// HttpAdapter só é implementado na Fase 10, após confirmação real de API
// pública (regra CLAUDE.md #6/#7 — nunca inventar endpoint). Até lá,
// FIPEZAP_ADAPTER=http/CUB_ADAPTER=http falha alto e claro, em vez de
// silenciosamente cair para dados mock.
export function getMarketDataAdapter(): MarketDataAdapter {
  const tipo = process.env.FIPEZAP_ADAPTER ?? 'static';
  if (tipo === 'static') return staticAdapter;
  throw new Error(
    `FIPEZAP_ADAPTER="${tipo}" não implementado nesta fase (somente "static" disponível até a Fase 10)`
  );
}

export function getCubDataAdapter(): CubDataAdapter {
  const tipo = process.env.CUB_ADAPTER ?? 'static';
  if (tipo === 'static') return staticAdapter;
  throw new Error(
    `CUB_ADAPTER="${tipo}" não implementado nesta fase (somente "static" disponível até a Fase 10)`
  );
}
