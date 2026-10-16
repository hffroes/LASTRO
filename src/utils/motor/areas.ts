// Cadeia de áreas e coeficientes do PRD 3.3, pura e em inteiros exatos (convenção de formatacao.ts):
// área em centésimos de m², taxa e coeficiente da soma das unidades em pontos-base, CA em centésimos.
// As quatro áreas são distintas e não se confundem: terreno ≠ utilizada ≠ construída ≠ comercializável.
// A obra incide na construída (inclui hall, corredores, escadas e elevadores); o VGV, na comercializável.
import { aplicaCoeficienteUnidades } from '../../data/tipologias';
import { PONTOS_BASE_CEM_POR_CENTO } from '../../types/parametros';
import type { DadosProduto } from '../../types/produto';
import { areaParaCentesimos, dividirArredondando } from './formatacao';
import { calcularProgramaEfetivo } from './produto';

export interface EntradaAreas {
  areaTerrenoM2: number | null;
  taxaOcupacaoPontosBase: number | null;
  pavimentos: number | null;
  unidadesPorPavimento: number | null;
  totalUnidades: number | null;
  areaUnidadeM2: number | null;
  /** false para casa: o coeficiente das unidades por pavimento não se aplica (PRD 3.3). */
  aplicaCoeficienteUnidades: boolean;
}

// null = insumos insuficientes ou inválidos: a tela nunca mostra um número sem base.
export interface ResultadoAreas {
  areaUtilizadaCentesimos: number | null;
  areaConstruidaCentesimos: number | null;
  areaComercializavelCentesimos: number | null;
  /** Coeficiente de Aproveitamento atingido, em centésimos: 240 = 2,40. */
  coeficienteAproveitamentoCentesimos: number | null;
  /** Soma das áreas das unidades do pavimento ÷ área utilizada, em pontos-base: 8.000 = 80,00%. */
  coeficienteUnidadesPontosBase: number | null;
}

function inteiroPositivo(valor: number | null): valor is number {
  return valor !== null && Number.isSafeInteger(valor) && valor > 0;
}

function areaEmCentesimos(areaM2: number | null): number | null {
  if (areaM2 === null || !Number.isFinite(areaM2) || areaM2 <= 0) return null;
  return areaParaCentesimos(areaM2);
}

// Divisão com arredondamento meio para cima, mas null se a conta sair do que o ponto flutuante
// representa com exatidão: só ocorre nos tetos técnicos somados, e mostrar nada é melhor que errado.
function dividirOuNulo(numerador: number, denominador: number): number | null {
  if (!Number.isSafeInteger(numerador) || !Number.isSafeInteger(denominador) || denominador <= 0) return null;
  return dividirArredondando(numerador, denominador);
}

export function calcularAreas(entrada: EntradaAreas): ResultadoAreas {
  const areaTerreno = areaEmCentesimos(entrada.areaTerrenoM2);
  const areaUnidade = areaEmCentesimos(entrada.areaUnidadeM2);
  const taxa = entrada.taxaOcupacaoPontosBase;
  const taxaValida = taxa !== null && Number.isSafeInteger(taxa) && taxa > 0 && taxa <= PONTOS_BASE_CEM_POR_CENTO;

  // Área Utilizada = Área do Terreno × Taxa de Ocupação.
  const areaUtilizada =
    areaTerreno !== null && taxaValida ? dividirOuNulo(areaTerreno * taxa, PONTOS_BASE_CEM_POR_CENTO) : null;

  // Área Total Construída = Área Utilizada × Pavimentos. Usa a utilizada já arredondada, a mesma que o
  // usuário vê, para ele refazer a conta à mão e chegar ao número exibido.
  const areaConstruida =
    areaUtilizada !== null && inteiroPositivo(entrada.pavimentos) ? areaUtilizada * entrada.pavimentos : null;

  // Área Comercializável = Total de Unidades × Área da Unidade Vendida.
  const areaComercializavel =
    inteiroPositivo(entrada.totalUnidades) && areaUnidade !== null ? entrada.totalUnidades * areaUnidade : null;

  // CA atingido = Área Total Construída ÷ Área do Terreno, em centésimos.
  const coeficienteAproveitamento =
    areaConstruida !== null && areaTerreno !== null ? dividirOuNulo(areaConstruida * 100, areaTerreno) : null;

  // Coeficiente das unidades = (Unidades por Pavimento × Área da Unidade) ÷ Área Utilizada. O numerador
  // é a SOMA das áreas de todas as unidades do pavimento, nunca a de uma isolada.
  const coeficienteUnidades =
    entrada.aplicaCoeficienteUnidades && inteiroPositivo(entrada.unidadesPorPavimento) && areaUnidade !== null && areaUtilizada !== null
      ? dividirOuNulo(entrada.unidadesPorPavimento * areaUnidade * PONTOS_BASE_CEM_POR_CENTO, areaUtilizada)
      : null;

  return {
    areaUtilizadaCentesimos: areaUtilizada,
    areaConstruidaCentesimos: areaConstruida,
    areaComercializavelCentesimos: areaComercializavel,
    coeficienteAproveitamentoCentesimos: coeficienteAproveitamento,
    coeficienteUnidadesPontosBase: coeficienteUnidades,
  };
}

// Une a Etapa 1 (área do terreno) e o programa efetivo da Etapa 2, com as travas da tipologia já
// aplicadas (casa e galpão: 1 unidade), para a tela e o motor econômico (F13) usarem a mesma entrada.
export function montarEntradaAreas(areaTerrenoM2: number | null, produto: DadosProduto): EntradaAreas {
  const programa = calcularProgramaEfetivo(produto);
  return {
    areaTerrenoM2,
    taxaOcupacaoPontosBase: produto.taxaOcupacaoPontosBase,
    pavimentos: programa.pavimentos,
    unidadesPorPavimento: programa.unidadesPorPavimento,
    totalUnidades: programa.totalUnidades,
    areaUnidadeM2: produto.areaUnidadeM2,
    aplicaCoeficienteUnidades: aplicaCoeficienteUnidades(produto.tipologia),
  };
}

export function calcularAreasDoProduto(areaTerrenoM2: number | null, produto: DadosProduto): ResultadoAreas {
  return calcularAreas(montarEntradaAreas(areaTerrenoM2, produto));
}
