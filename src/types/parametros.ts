// Convenção única de percentual no motor (CLAUDE.md: "percentuais em convenção única"): inteiro em
// pontos-base, em que 10.000 = 100% e 6.000 = 60,00%. Fica na mesma linha de centavos e centésimos de
// m²: a conta é toda em inteiros exatos e nenhum 0,1 + 0,2 vira 0,30000000000000004. A tela digita
// "60" e lê 6.000 sem conversão, porque o parser já devolve centésimos.
export const PONTOS_BASE_CEM_POR_CENTO = 10_000;

// Parâmetro de negócio centralizado (CLAUDE.md regra 8): nunca um número solto no código. O valor
// carrega se ainda é provisório, de onde veio e em que versão, para o snapshot da análise (F20/F31) e
// a tela poderem dizê-lo (PRD 2.10 e 10.5: premissas versionadas, com snapshot no resultado).
export interface Parametro<Valor> {
  valor: Valor;
  // true = TBD aguardando validação (PRD 3.3: "valor provisório e centralizado").
  provisorio: boolean;
  fonte: string;
  // Sobe a cada mudança de valor; a F24 passa a gravá-la junto do parâmetro no banco.
  versao: string;
}

// ——— CUB (PRD 3.1 e 3.2) ———

// Projetos-padrão da tabela CUB Sinduscon-MG. O padrão é coluna separada: não existem códigos
// combinados do tipo "R8-B" (PRD 3.1).
export type ProjetoCub = 'R-1' | 'R-8' | 'R-16' | 'CSL-8' | 'CSL-16' | 'CAL-8' | 'CAL-16' | 'GI';

// Em centavos por m². null = a tabela não publica valor para o padrão (lacuna D-B4): nunca vira zero
// nem um valor estimado.
export type ValoresPorPadrao =
  | { tipo: 'porPadrao'; baixoCentavos: number | null; normalCentavos: number | null; altoCentavos: number | null }
  // GI tem padrão único.
  | { tipo: 'unico'; valorCentavos: number };

// Uma importação do boletim do Sinduscon-MG (PRD 3.4): datada, com origem, e nunca sobrescrita.
export interface VersaoCub {
  id: string;
  competencia: { ano: number; mes: number };
  // O PRD pede data de emissão e arquivo de origem; null = a fonte não informa (TBD, não inventar).
  dataEmissao: string | null;
  origem: string;
  // Projeto ausente = a tabela não tem o projeto (D-B5: CAL-16).
  valores: Partial<Record<ProjetoCub, ValoresPorPadrao>>;
}

// A lógica consome o CUB por esta interface desde a F12; na F24 a implementação passa a ler a tabela
// external_data do PostgreSQL, sem mudar quem a chama.
export interface RepositorioCub {
  obterVersaoVigente(): VersaoCub;
}

// ——— Premissas ajustáveis (F17, PRD 2.6 e 10.2) ———

// O que o usuário pode mudar no resultado para explorar um "e se...": o preço de venda e a taxa de
// ocupação, que ele próprio informou na Etapa 2, e o lucro, as despesas gerais e o CUB ajustado, que
// são da lastro. Na ordem do painel.
export type PremissaAjustavel = 'precoUnidade' | 'lucroIncorporador' | 'despesasGerais' | 'taxaOcupacao' | 'cubAjustado';

export const PREMISSAS_AJUSTAVEIS: readonly PremissaAjustavel[] = [
  'precoUnidade',
  'lucroIncorporador',
  'despesasGerais',
  'taxaOcupacao',
  'cubAjustado',
];

// Só o que o usuário mudou: premissa ausente vale o original. Preço e CUB em centavos (o CUB por m²),
// percentuais em pontos-base. Vive só na análise aberta: nunca altera um parâmetro global (PRD 2.10).
export type AjustesPremissas = Partial<Record<PremissaAjustavel, number>>;

// Faixa em pontos-base, com os dois limites dentro dela.
export interface FaixaPontosBase {
  minimo: number;
  maximo: number;
}
