// Método do resíduo do terreno (PRD 4.1), puro e em inteiros exatos: dinheiro em centavos, percentuais
// em pontos-base. Cada parcela é arredondada ao centavo, meio para cima, e o resultado é somado dessas
// parcelas já arredondadas, então a conta que o usuário refaz com a calculadora bate com o que vê.
// Esta é a ÚNICA definição da regra econômica (D-B1): o servidor a importa, o navegador também.
import type { PadraoAcabamento } from '../../types/produto';
import { PONTOS_BASE_CEM_POR_CENTO } from '../../types/parametros';
import { dividirArredondando } from './formatacao';
import { DESPESAS_GERAIS_TOTAL, LUCRO_INCORPORADOR_POR_PADRAO } from './parametros';

export interface ParametrosEconomia {
  despesasGeraisPontosBase: number;
  lucroIncorporadorPontosBase: Readonly<Record<PadraoAcabamento, number>>;
}

export const PARAMETROS_ECONOMIA_PADRAO: ParametrosEconomia = {
  despesasGeraisPontosBase: DESPESAS_GERAIS_TOTAL.valor,
  lucroIncorporadorPontosBase: LUCRO_INCORPORADOR_POR_PADRAO.valor,
};

export interface EntradaEconomia {
  totalUnidades: number;
  precoUnidadeCentavos: number;
  /** Em centésimos de m²: a obra incide na área CONSTRUÍDA; o VGV, nas unidades vendidas. */
  areaConstruidaCentesimos: number;
  cubAjustadoCentavos: number;
  padrao: PadraoAcabamento;
  precoPedidoCentavos: number;
}

export interface ResultadoEconomia {
  vgvCentavos: number;
  custoObraCentavos: number;
  despesasGeraisCentavos: number;
  lucroIncorporadorCentavos: number;
  /** O preço pedido usado na conta, devolvido junto para a resposta ser autossuficiente. */
  precoPedidoCentavos: number;
  /** VGV − Obra − Despesas − Lucro: o quanto o terreno PODE valer no cenário. Pode ser negativo. */
  resultadoTerrenoCentavos: number;
  /** Resultado do Terreno − Preço Pedido. */
  resultadoLiquidoCentavos: number;
  /** Viável se o Resultado Líquido é maior ou igual a zero (PRD 4.1). */
  viavel: boolean;
}

// O VGV é multiplicado por pontos-base (até 10.000) antes de dividir: o teto garante que esse produto
// fica nos inteiros exatos do ponto flutuante. Equivale a cerca de R$ 9 bilhões.
export const LIMITE_VGV_CENTAVOS = Math.floor(Number.MAX_SAFE_INTEGER / PONTOS_BASE_CEM_POR_CENTO);

// VGV = Número Total de Unidades × Preço de Venda da Unidade — nunca m² × preço/m² (PRD 4.1). null se
// a conta sair do que representa com exatidão (a validação da etapa já recusa antes).
export function calcularVgvCentavos(totalUnidades: number, precoUnidadeCentavos: number): number | null {
  if (!Number.isSafeInteger(totalUnidades) || !Number.isSafeInteger(precoUnidadeCentavos)) return null;
  if (totalUnidades <= 0 || precoUnidadeCentavos <= 0) return null;
  const vgv = totalUnidades * precoUnidadeCentavos;
  return Number.isSafeInteger(vgv) && vgv <= LIMITE_VGV_CENTAVOS ? vgv : null;
}

// % do VGV: VGV × pontos-base ÷ 10.000, meio para cima.
export function percentualDoVgvCentavos(vgvCentavos: number, pontosBase: number): number {
  return dividirArredondando(vgvCentavos * pontosBase, PONTOS_BASE_CEM_POR_CENTO);
}

// Custo de Obra = CUB Ajustado × Área Total Construída. R$/m² (centavos) × centésimos de m² ÷ 100.
export function calcularCustoObraCentavos(cubAjustadoCentavos: number, areaConstruidaCentesimos: number): number | null {
  const produto = cubAjustadoCentavos * areaConstruidaCentesimos;
  if (!Number.isSafeInteger(produto) || produto < 0) return null;
  return dividirArredondando(produto, 100);
}

// null = os valores passam do que a conta representa com exatidão, ou há insumo inválido.
export function calcularEconomia(
  entrada: EntradaEconomia,
  parametros: ParametrosEconomia = PARAMETROS_ECONOMIA_PADRAO,
): ResultadoEconomia | null {
  const vgv = calcularVgvCentavos(entrada.totalUnidades, entrada.precoUnidadeCentavos);
  const custoObra = calcularCustoObraCentavos(entrada.cubAjustadoCentavos, entrada.areaConstruidaCentesimos);
  const lucroPontosBase = parametros.lucroIncorporadorPontosBase[entrada.padrao];
  if (vgv === null || custoObra === null || lucroPontosBase === undefined) return null;
  if (!Number.isSafeInteger(entrada.precoPedidoCentavos) || entrada.precoPedidoCentavos <= 0) return null;

  const despesasGerais = percentualDoVgvCentavos(vgv, parametros.despesasGeraisPontosBase);
  const lucroIncorporador = percentualDoVgvCentavos(vgv, lucroPontosBase);
  const resultadoTerreno = vgv - custoObra - despesasGerais - lucroIncorporador;
  const resultadoLiquido = resultadoTerreno - entrada.precoPedidoCentavos;

  return {
    vgvCentavos: vgv,
    custoObraCentavos: custoObra,
    despesasGeraisCentavos: despesasGerais,
    lucroIncorporadorCentavos: lucroIncorporador,
    precoPedidoCentavos: entrada.precoPedidoCentavos,
    resultadoTerrenoCentavos: resultadoTerreno,
    resultadoLiquidoCentavos: resultadoLiquido,
    viavel: resultadoLiquido >= 0,
  };
}
