import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { MarketDataAdapter, PrecoMercado } from './MarketDataAdapter';
import type { CubBase, CubDataAdapter } from './CubDataAdapter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../data');

interface FipeZapArquivo {
  mock: boolean;
  fonte: string;
  atualizadoEm: string;
  precos: Array<{ tipologia: string; regiao: string; precoM2: number }>;
}

interface CubArquivo {
  mock: boolean;
  fonte: string;
  atualizadoEm: string;
  valoresBase: Array<{ cubCodigo: string; valorM2: number }>;
}

function readJson<T>(fileName: string): T {
  const raw = readFileSync(path.join(dataDir, fileName), 'utf-8');
  return JSON.parse(raw) as T;
}

// Implementação padrão do Adapter Pattern (plan.md decisão técnica #6): lê
// de /server/data/*.json, versionado manualmente no repo até confirmação
// real de API pública do FipeZap/Sinduscon-MG (Fase 10).
export class StaticAdapter implements MarketDataAdapter, CubDataAdapter {
  async getPrecoMercado(
    tipologia: string,
    regiao: string
  ): Promise<PrecoMercado | null> {
    const arquivo = readJson<FipeZapArquivo>('fipezap-static.json');
    const encontrado = arquivo.precos.find(
      p => p.tipologia === tipologia && p.regiao === regiao
    );
    if (!encontrado) return null;

    return {
      tipologia: encontrado.tipologia,
      regiao: encontrado.regiao,
      precoM2: encontrado.precoM2,
      atualizadoEm: arquivo.atualizadoEm,
      mock: arquivo.mock,
      fonte: arquivo.fonte,
    };
  }

  async getCubBase(cubCodigo: string): Promise<CubBase | null> {
    const arquivo = readJson<CubArquivo>('cub-static.json');
    const encontrado = arquivo.valoresBase.find(v => v.cubCodigo === cubCodigo);
    if (!encontrado) return null;

    return {
      cubCodigo: encontrado.cubCodigo,
      valorM2: encontrado.valorM2,
      atualizadoEm: arquivo.atualizadoEm,
      mock: arquivo.mock,
      fonte: arquivo.fonte,
    };
  }
}
