import type { Parametro } from '../../types/parametros';

// Taxa de ocupação padrão da ferramenta (PRD 3.3): 0,6 = 60%. Provisória e global; a validação por
// município (D-A5) é pós-MVP. O usuário pode ajustá-la na análise sem alterar este padrão (PRD 2.10).
export const TAXA_OCUPACAO_PADRAO: Parametro<number> = {
  valor: 6_000, // pontos-base
  provisorio: true,
  fonte: 'PRD 3.3 — padrão da ferramenta, a validar por município (D-A5)',
};
