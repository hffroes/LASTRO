// Camada de sobreposição de premissas (F17, PRD 2.6 e 10.2): o "e se..." do resultado. Os ajustes do
// usuário entram por cima dos valores da análise e nunca tocam nos parâmetros globais (PRD 2.10): cada
// função devolve objetos novos, e a conta continua sendo a mesma do motor. Puro, como o resto do motor:
// o servidor recalcula com ele e a tela o usa para marcar o que mudou e avisar o que sai do usual.
import type { ParametrosEconomia, PercentuaisDoVgv } from './economia';
import type { PremissaDoCenario } from '../../types/analise';
import {
  PREMISSAS_AJUSTAVEIS,
  type AjustesPremissas,
  type FaixaPontosBase,
  type PremissaAjustavel,
} from '../../types/parametros';
import type { DadosProduto, PadraoAcabamento } from '../../types/produto';
import { FAIXAS_NORMALIDADE } from './parametros';

// Um valor por premissa ajustável, na unidade dela (centavos ou pontos-base).
export type ValoresPremissas = Record<PremissaAjustavel, number>;

interface BaseDosOriginais {
  precoUnidadeCentavos: number;
  taxaOcupacaoPontosBase: number;
  padrao: PadraoAcabamento;
  parametros: ParametrosEconomia;
  /** O CUB ajustado que a análise calcula (base × aditivos): é o original da premissa. */
  cubAjustadoCentavos: number;
}

// O original de cada premissa é o que a análise usaria sem ajuste nenhum: o que o usuário informou na
// Etapa 2 (preço e taxa) ou o parâmetro da lastro para o padrão escolhido (lucro, despesas e CUB).
export function valoresOriginais(base: BaseDosOriginais): ValoresPremissas {
  return {
    precoUnidade: base.precoUnidadeCentavos,
    lucroIncorporador: base.parametros.lucroIncorporadorPontosBase[base.padrao],
    despesasGerais: base.parametros.despesasGeraisPontosBase,
    taxaOcupacao: base.taxaOcupacaoPontosBase,
    cubAjustado: base.cubAjustadoCentavos,
  };
}

export function aplicarAjustes(originais: ValoresPremissas, ajustes: AjustesPremissas): ValoresPremissas {
  const usados = { ...originais };
  for (const premissa of PREMISSAS_AJUSTAVEIS) {
    const ajuste = ajustes[premissa];
    if (ajuste !== undefined) usados[premissa] = ajuste;
  }
  return usados;
}

// Ajuste igual ao original não é ajuste: não marca a premissa nem conta como cenário alterado.
export function normalizarAjustes(ajustes: AjustesPremissas, originais: ValoresPremissas): AjustesPremissas {
  const normalizados: AjustesPremissas = {};
  for (const premissa of PREMISSAS_AJUSTAVEIS) {
    const ajuste = ajustes[premissa];
    if (ajuste !== undefined && ajuste !== originais[premissa]) normalizados[premissa] = ajuste;
  }
  return normalizados;
}

export function contarAjustes(ajustes: AjustesPremissas): number {
  return PREMISSAS_AJUSTAVEIS.filter((premissa) => ajustes[premissa] !== undefined).length;
}

// O que vai no snapshot (PRD 10.5): original e usado de cada premissa, lado a lado.
export function descreverCenario(
  originais: ValoresPremissas,
  usados: ValoresPremissas,
): { quantidade: number; premissas: Record<PremissaAjustavel, PremissaDoCenario> } {
  const premissas = {} as Record<PremissaAjustavel, PremissaDoCenario>;
  for (const premissa of PREMISSAS_AJUSTAVEIS) {
    const original = originais[premissa];
    const usado = usados[premissa];
    premissas[premissa] = { original, usado, ajustada: usado !== original };
  }
  return { quantidade: PREMISSAS_AJUSTAVEIS.filter((premissa) => premissas[premissa].ajustada).length, premissas };
}

// O lucro ajustado substitui só o do padrão desta análise; a tabela recebida segue intacta.
export function parametrosDoCenario(
  base: ParametrosEconomia,
  padrao: PadraoAcabamento,
  usados: ValoresPremissas,
): ParametrosEconomia {
  return {
    despesasGeraisPontosBase: usados.despesasGerais,
    lucroIncorporadorPontosBase: { ...base.lucroIncorporadorPontosBase, [padrao]: usados.lucroIncorporador },
  };
}

export function produtoDoCenario(produto: DadosProduto, usados: ValoresPremissas): DadosProduto {
  return { ...produto, precoUnidadeCentavos: usados.precoUnidade, taxaOcupacaoPontosBase: usados.taxaOcupacao };
}

// ——— Avisos de plausibilidade ———
// Um ajuste fora do usual nunca é recusado (o "e se" é do usuário), mas também nunca passa sem aviso. As
// faixas são as de normalidade do PRD 4.2: lucro e despesas têm faixa própria; preço de venda, taxa de
// ocupação e CUB não têm, mas os três movem o custo de obra sobre o VGV, que tem.

export interface AvisoFaixa {
  valorPontosBase: number;
  faixa: FaixaPontosBase;
}

export interface AvisosDoCenario {
  lucroIncorporador: AvisoFaixa | null;
  despesasGerais: AvisoFaixa | null;
  /** Só quando preço, taxa ou CUB foram ajustados: sem ajuste deles, o custo de obra é o da análise. */
  custoObra: AvisoFaixa | null;
}

export function foraDaFaixa(valorPontosBase: number, faixa: FaixaPontosBase): boolean {
  return valorPontosBase < faixa.minimo || valorPontosBase > faixa.maximo;
}

function avisoSeFora(valor: number | null | undefined, faixa: FaixaPontosBase): AvisoFaixa | null {
  return valor !== null && valor !== undefined && foraDaFaixa(valor, faixa) ? { valorPontosBase: valor, faixa } : null;
}

export function avisosDoCenario(
  ajustes: AjustesPremissas,
  percentuaisDoVgv: Pick<PercentuaisDoVgv, 'custoObra'>,
): AvisosDoCenario {
  const faixas = FAIXAS_NORMALIDADE.valor;
  const moveCustoObra =
    ajustes.precoUnidade !== undefined || ajustes.taxaOcupacao !== undefined || ajustes.cubAjustado !== undefined;
  return {
    lucroIncorporador: avisoSeFora(ajustes.lucroIncorporador, faixas.lucroIncorporador),
    despesasGerais: avisoSeFora(ajustes.despesasGerais, faixas.despesasGerais),
    custoObra: moveCustoObra ? avisoSeFora(percentuaisDoVgv.custoObra, faixas.custoObra) : null,
  };
}
