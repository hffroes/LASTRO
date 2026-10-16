// Convenção única de percentual no motor (CLAUDE.md: "percentuais em convenção única"): inteiro em
// pontos-base, em que 10.000 = 100% e 6.000 = 60,00%. Fica na mesma linha de centavos e centésimos de
// m²: a conta é toda em inteiros exatos e nenhum 0,1 + 0,2 vira 0,30000000000000004. A tela digita
// "60" e lê 6.000 sem conversão, porque o parser já devolve centésimos.
export const PONTOS_BASE_CEM_POR_CENTO = 10_000;

// Parâmetro de negócio centralizado (CLAUDE.md regra 8): nunca um número solto no código. O valor
// carrega se ainda é provisório e de onde veio, para o snapshot da análise (F20/F31) e a tela
// poderem dizê-lo. A F12 estende este formato com versão e origem da base.
export interface Parametro<Valor> {
  valor: Valor;
  // true = TBD aguardando validação (PRD 3.3: "valor provisório e centralizado").
  provisorio: boolean;
  fonte: string;
}
