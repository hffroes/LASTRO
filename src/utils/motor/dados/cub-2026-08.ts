// Snapshot do CUB Sinduscon-MG, competência Agosto/2026 (R$/m², série NBR 12.721:2006), como no PRD 3.1.
// É o ÚNICO lugar com valores de CUB: a lógica (cub.ts) nunca os embute (CLAUDE.md). Na F24 esta
// versão passa a ser importada para a tabela external_data, sem mudar quem a consome.
// Valores em centavos por m². null = o boletim não publica o padrão (lacuna D-B4); projeto ausente =
// a tabela não tem o projeto (D-B5: CAL-16). Nenhuma das lacunas é preenchida aqui.
import type { VersaoCub } from '../../../types/parametros';

export const CUB_2026_08: VersaoCub = {
  id: 'cub-2026-08',
  competencia: { ano: 2026, mes: 8 },
  // O PRD 3.1 registra a competência, mas não a data de emissão do boletim nem o arquivo: TBD.
  dataEmissao: null,
  origem: 'PRD 3.1 — snapshot do boletim Sinduscon-MG, competência Ago/2026 (arquivo de origem não informado)',
  valores: {
    'R-1': { tipo: 'porPadrao', baixoCentavos: 256_262, normalCentavos: 310_216, altoCentavos: 385_238 },
    'R-8': { tipo: 'porPadrao', baixoCentavos: 228_568, normalCentavos: 255_458, altoCentavos: 312_021 },
    'R-16': { tipo: 'porPadrao', baixoCentavos: null, normalCentavos: 248_039, altoCentavos: 322_352 },
    'CSL-8': { tipo: 'porPadrao', baixoCentavos: null, normalCentavos: 249_095, altoCentavos: 274_980 },
    'CSL-16': { tipo: 'porPadrao', baixoCentavos: null, normalCentavos: 333_525, altoCentavos: 368_045 },
    'CAL-8': { tipo: 'porPadrao', baixoCentavos: null, normalCentavos: 295_474, altoCentavos: 321_383 },
    GI: { tipo: 'unico', valorCentavos: 133_376 },
  },
};
