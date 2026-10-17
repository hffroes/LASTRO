import type { FaixaPontosBase, Parametro } from '../../types/parametros';
import type { PadraoAcabamento } from '../../types/produto';
import type { FormatoLote, Topografia } from '../../types/terreno';

// Taxa de ocupação padrão da ferramenta (PRD 3.3): 0,6 = 60%. Provisória e global; a validação por
// município (D-A5) é pós-MVP. O usuário pode ajustá-la na análise sem alterar este padrão (PRD 2.10).
export const TAXA_OCUPACAO_PADRAO: Parametro<number> = {
  valor: 6_000, // pontos-base
  provisorio: true,
  fonte: 'PRD 3.3 — padrão da ferramenta, a validar por município (D-A5)',
  versao: 'v1',
};

// ——— Aditivos do CUB (PRD 3.2), em pontos-base ———
// Quatro aditivos independentes, cada um com a sua tabela, somados e aplicados numa só multiplicação.
// O PRD pede um documento técnico sobre a origem de cada um (pendência da fonte): os valores seguem
// como parâmetros centralizados até lá.

// Faixas do aditivo de fundação. D-R21: "até N" inclui N — 1–4, 5–8, 9–16 e 17 ou mais —, porque a
// tabela do PRD se sobrepõe em 8 e 16 e o caso de referência (4 pavimentos = "até 4" = 7%) fixa a primeira.
// As duas primeiras linhas da tabela ("1" e "2+") são as da casa e do galpão, de projeto térreo ou de
// poucos pavimentos; as demais, dos edifícios.
export type FaixaFundacao = keyof TabelaAditivoFundacao;

export type TabelaAditivoFundacao = Readonly<Record<'umPavimento' | 'doisOuMais' | 'ate4' | 'de5a8' | 'de9a16' | 'acima16', number>>;

export const ADITIVO_FUNDACAO: Parametro<TabelaAditivoFundacao> = {
  valor: {
    umPavimento: 400,
    doisOuMais: 500,
    ate4: 700,
    de5a8: 1_000,
    de9a16: 1_500,
    acima16: 2_000,
  },
  provisorio: false,
  fonte: 'PRD 3.2 A — faixas interpretadas em D-R21',
  versao: 'v1',
};

export const ADITIVO_PADRAO: Parametro<Readonly<Record<PadraoAcabamento, number>>> = {
  valor: { baixo: 1_000, normal: 1_500, alto: 2_000 },
  provisorio: false,
  fonte: 'PRD 3.2 B',
  versao: 'v1',
};

export const ADITIVO_TOPOGRAFIA: Parametro<Readonly<Record<Topografia, number>>> = {
  valor: { plana: 0, regular: 150, irregular: 300, acidentada: 500 },
  provisorio: false,
  fonte: 'PRD 3.2 C',
  versao: 'v1',
};

export const ADITIVO_FORMATO: Parametro<Readonly<Record<FormatoLote, number>>> = {
  valor: { regular: 0, irregular: 50 },
  provisorio: false,
  fonte: 'PRD 3.2 D',
  versao: 'v1',
};

// ——— Economia (PRD 3.1 e 4.1), em pontos-base ———

// Lucro do incorporador, % do VGV, definido pelo PADRÃO e nunca pela tipologia (PRD 3.1). D-R23: vale a
// tabela (Normal 22%), e não o 20% que o exemplo da planilha "Escopo MVP" aplica a um projeto Normal. Os
// valores seguem provisórios e centralizados: serão refinados com estudos de mercado.
export const LUCRO_INCORPORADOR_POR_PADRAO: Parametro<Readonly<Record<PadraoAcabamento, number>>> = {
  valor: { baixo: 2_000, normal: 2_200, alto: 2_500 },
  provisorio: true,
  fonte: 'PRD 3.1 — tabela por padrão; D-R23 (Normal = 22%, e não o 20% do exemplo da planilha)',
  versao: 'v1',
};

// Itemização das despesas gerais (PRD 4.1). Os quatro itens da fonte somam 12,0%, mas a planilha aplica
// 11,0% (D-B2, resolvida em D-R24). D-R26 esclarece de onde vêm os 11%: comissões, impostos e despesas
// financeiras. O item de Venda e Marketing (1,0%) é listado pela fonte, mas não entra no total aplicado.
// Nenhum percentual foi alterado por conta própria. Itens em pontos-base.
export const DESPESAS_GERAIS_COMPONENTES_APLICADOS = {
  comissoes: 500,
  impostosETaxas: 450,
  despesasFinanceiras: 150,
} as const;

export const DESPESAS_GERAIS_FORA_DO_TOTAL = {
  vendaEMarketing: 100,
} as const;

export const SOMA_COMPONENTES_APLICADOS_DESPESAS_GERAIS = Object.values(DESPESAS_GERAIS_COMPONENTES_APLICADOS).reduce(
  (soma, componente) => soma + componente,
  0,
);

// A soma de TODOS os itens da fonte: a divergência que a tela sinaliza.
export const SOMA_ITEMIZACAO_DESPESAS_GERAIS =
  SOMA_COMPONENTES_APLICADOS_DESPESAS_GERAIS +
  Object.values(DESPESAS_GERAIS_FORA_DO_TOTAL).reduce((soma, componente) => soma + componente, 0);

// Total aplicado sobre o VGV no MVP (PRD 4.1): 11,0%. Provisório até a validação adicional que o PRD
// pede (pode variar por tipologia ou padrão).
export const DESPESAS_GERAIS_TOTAL: Parametro<number> = {
  valor: 1_100,
  provisorio: true,
  fonte: 'PRD 4.1 — total da planilha de referência; D-R24 (11,0% adotado) e D-R26 (comissões + impostos + despesas financeiras)',
  versao: 'v1',
};

// Faixas de normalidade dos KPIs sobre o VGV (PRD 4.2 e 2.10), com os dois limites dentro da faixa. A F17
// as usa para avisar quando um ajuste de premissa sai do usual; a F18 parte delas para os alertas.
export const FAIXAS_NORMALIDADE: Parametro<Readonly<Record<'custoObra' | 'despesasGerais' | 'lucroIncorporador', FaixaPontosBase>>> = {
  valor: {
    custoObra: { minimo: 4_000, maximo: 6_500 },
    despesasGerais: { minimo: 1_000, maximo: 1_500 },
    lucroIncorporador: { minimo: 2_000, maximo: 2_500 },
  },
  provisorio: false,
  fonte: 'PRD 4.2 — análise de normalidade dos percentuais',
  versao: 'v1',
};

// Versão do conjunto de regras e parâmetros do motor, para o snapshot (PRD 10.5). Sobe a cada mudança de
// fórmula ou de parâmetro; a F24 passa a gravá-la junto do registro.
export const VERSAO_MOTOR = 'motor-v1';
