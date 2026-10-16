import type { Parametro } from '../../types/parametros';
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
