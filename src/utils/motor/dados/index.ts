import type { RepositorioCub, VersaoCub } from '../../../types/parametros';
import { CUB_2026_08 } from './cub-2026-08';

// Versões conhecidas, da mais recente para a mais antiga (PRD 3.4: cada importação gera uma versão
// datada e nada é sobrescrito). Na F24 a lista passa a vir do banco, com o fallback para a última
// válida e o critério de desatualização (D-A3, D-A4).
const VERSOES_CUB: readonly VersaoCub[] = [CUB_2026_08];

export const repositorioCubEmMemoria: RepositorioCub = {
  obterVersaoVigente: () => VERSOES_CUB[0] as VersaoCub,
};
