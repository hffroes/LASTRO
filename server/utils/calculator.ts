import type { AnalysisResult } from '../../shared/schemas';
import type { CalculatorInput } from '../types/analysis';

// Outros Custos (impostos + corretagem) — hardcoded conforme PRD §2.1
// ("Impostos, corretagem e outros custos (hardcoded)"). Valores confirmados
// pelo usuário em consulta de produto (Fase 3, sem base no PRD, que só
// define a fórmula, não o percentual): corretagem 5% + impostos 4,5% =
// 9,5% do VGV, como dois componentes distintos.
//
// Isso fica acima da faixa "esperado 3-5%" citada no texto do PRD §4.2 para
// o componente combinado — mas o PRD só define regra de alerta de
// normalidade para Terreno, Lucro e Construção (ver `analisaNormalidadePercentuais`
// abaixo); não há alerta de normalidade definido para Outros Custos, então
// nenhum é gerado aqui.
export const CORRETAGEM_PERCENTUAL_VGV = 0.05;
export const IMPOSTOS_PERCENTUAL_VGV = 0.045;

// PRD §4.2 — único limite de normalidade com fórmula explícita (>65%).
const LIMITE_CONSTRUCAO_PERCENTUAL_VGV = 0.65;

// LASTRO Score (PRD §4.3) — pesos fixos por bucket, somam 100.
const PESO_VIABILIDADE = 40;
const PESO_CONFORMIDADE = 30;
const PESO_RISCO_TECNICO = 20;
const PESO_POTENCIAL_MERCADO = 10;

// Margem líquida (Resultado Líquido / VGV) que dá nota máxima no bucket de
// viabilidade — decisão de produto (Fase 3); o PRD não define esse teto.
const MARGEM_LIQUIDA_NOTA_MAXIMA = 0.1;

// Tolerância de sobrepreço de venda vs. mercado (Fase 2, dado mock) até
// zerar a pontuação de potencial de mercado — decisão de produto (Fase 3).
const TOLERANCIA_SOBREPRECO_MERCADO = 0.1;

function arredondarCentavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function calcVGV(unidades: number, precoVendaUnitario: number): number {
  return arredondarCentavos(unidades * precoVendaUnitario);
}

// PRD §3.2: CUB Ajustado = CUB Base × (1+ajusteTipologia) × (1+ajusteTopografia) × (1+ajusteFormato)
export function calcCubAjustado(
  cubBase: number,
  ajusteTipologia: number,
  ajusteTopografia: number,
  ajusteFormato: number
): number {
  return (
    cubBase *
    (1 + ajusteTipologia) *
    (1 + ajusteTopografia) *
    (1 + ajusteFormato)
  );
}

export function calcCustoConstrucao(
  cubBase: number,
  areaConstruida: number,
  ajusteTipologia: number,
  ajusteTopografia: number,
  ajusteFormato: number
): number {
  const cubAjustado = calcCubAjustado(
    cubBase,
    ajusteTipologia,
    ajusteTopografia,
    ajusteFormato
  );
  return arredondarCentavos(cubAjustado * areaConstruida);
}

// PRD §4.1: Custo Terreno = Valor Pedido pelo Terreno (não é percentual × VGV).
export function calcCustoTerreno(valorTerrenoR: number): number {
  return arredondarCentavos(valorTerrenoR);
}

export function calcLucroIncorporador(
  percentualLucro: number,
  vgv: number
): number {
  return arredondarCentavos(percentualLucro * vgv);
}

export function calcOutrosCustos(vgv: number): number {
  return arredondarCentavos(
    (CORRETAGEM_PERCENTUAL_VGV + IMPOSTOS_PERCENTUAL_VGV) * vgv
  );
}

export function calcResultadoLiquido(
  vgv: number,
  custoTerreno: number,
  custoConstrucao: number,
  lucroIncorporador: number,
  outrosCustos: number
): number {
  return arredondarCentavos(
    vgv - custoTerreno - custoConstrucao - lucroIncorporador - outrosCustos
  );
}

// PRD §2.1: preço máximo do terreno que ainda mantém Resultado Líquido = 0.
export function calcPrecoMaximoRecomendado(
  vgv: number,
  custoConstrucao: number,
  lucroIncorporador: number,
  outrosCustos: number
): number {
  return arredondarCentavos(
    vgv - custoConstrucao - lucroIncorporador - outrosCustos
  );
}

export interface Alerta {
  tipo: string;
  mensagem: string;
  severidade: 'info' | 'warning' | 'error';
}

interface ChecagensNormalidade {
  terrenoDentroDaFaixa: boolean;
  lucroDentroDaFaixa: boolean;
  construcaoDentroDoLimite: boolean;
}

function avaliarNormalidade(
  percentualTerrenoReal: number,
  percentualTerrenoReferencia: number,
  percentualLucroUsado: number,
  percentualLucroReferencia: number,
  percentualConstrucaoReal: number
): ChecagensNormalidade {
  return {
    terrenoDentroDaFaixa: percentualTerrenoReal <= percentualTerrenoReferencia,
    lucroDentroDaFaixa: percentualLucroUsado >= percentualLucroReferencia,
    construcaoDentroDoLimite:
      percentualConstrucaoReal <= LIMITE_CONSTRUCAO_PERCENTUAL_VGV,
  };
}

// PRD §4.2 — os três únicos alertas de normalidade com condição explícita
// no texto do PRD. Não há regra definida para Outros Custos.
export function analisaNormalidadePercentuais(
  percentualTerrenoReal: number,
  percentualTerrenoReferencia: number,
  percentualLucroUsado: number,
  percentualLucroReferencia: number,
  percentualConstrucaoReal: number
): Alerta[] {
  const checagens = avaliarNormalidade(
    percentualTerrenoReal,
    percentualTerrenoReferencia,
    percentualLucroUsado,
    percentualLucroReferencia,
    percentualConstrucaoReal
  );
  const alertas: Alerta[] = [];

  if (!checagens.terrenoDentroDaFaixa) {
    alertas.push({
      tipo: 'terreno_acima_esperado',
      mensagem: 'Preço do terreno acima do esperado para este cenário',
      severidade: 'warning',
    });
  }
  if (!checagens.lucroDentroDaFaixa) {
    alertas.push({
      tipo: 'lucro_abaixo_esperado',
      mensagem: 'Margem de lucro abaixo do esperado para este mercado',
      severidade: 'warning',
    });
  }
  if (!checagens.construcaoDentroDoLimite) {
    alertas.push({
      tipo: 'construcao_elevada',
      mensagem: 'Custos de construção elevados para esta tipologia',
      severidade: 'warning',
    });
  }

  return alertas;
}

export function calcScoreViabilidade(
  resultadoLiquido: number,
  vgv: number
): number {
  if (vgv <= 0) return 0;
  const margem = resultadoLiquido / vgv;
  const fracao = Math.min(Math.max(margem / MARGEM_LIQUIDA_NOTA_MAXIMA, 0), 1);
  return fracao * PESO_VIABILIDADE;
}

export function calcScoreConformidade(
  percentualTerrenoReal: number,
  percentualTerrenoReferencia: number,
  percentualLucroUsado: number,
  percentualLucroReferencia: number,
  percentualConstrucaoReal: number
): number {
  const checagens = avaliarNormalidade(
    percentualTerrenoReal,
    percentualTerrenoReferencia,
    percentualLucroUsado,
    percentualLucroReferencia,
    percentualConstrucaoReal
  );
  const pontosPorChecagem = PESO_CONFORMIDADE / 3;

  return (
    (checagens.terrenoDentroDaFaixa ? pontosPorChecagem : 0) +
    (checagens.lucroDentroDaFaixa ? pontosPorChecagem : 0) +
    (checagens.construcaoDentroDoLimite ? pontosPorChecagem : 0)
  );
}

// PRD §2.4/§10.4: os alertas técnicos do MVP são genéricos e não
// conclusivos; validação técnica real é escopo de produto futuro ("Lastro
// Engineering", PRD §8). Decisão de produto (Fase 3): não penalizar o score
// por uma validação que o MVP não realiza — nota máxima fixa até essa
// validação existir de fato.
export function calcScoreRiscoTecnico(): number {
  return PESO_RISCO_TECNICO;
}

// Decisão de produto (Fase 3): preço de venda até 10% acima do preço de
// mercado (mock FipeZap, Fase 2) reduz a pontuação linearmente até zero;
// no preço de mercado ou abaixo, nota máxima. Sem dado de mercado
// disponível, nota máxima — não penaliza pela ausência do dado.
export function calcScorePotencialMercado(
  precoVendaM2: number,
  precoMercadoM2: number | null
): number {
  if (precoMercadoM2 === null || precoMercadoM2 <= 0)
    return PESO_POTENCIAL_MERCADO;

  const sobrepreco = (precoVendaM2 - precoMercadoM2) / precoMercadoM2;
  if (sobrepreco <= 0) return PESO_POTENCIAL_MERCADO;
  if (sobrepreco >= TOLERANCIA_SOBREPRECO_MERCADO) return 0;

  const fracao = 1 - sobrepreco / TOLERANCIA_SOBREPRECO_MERCADO;
  return fracao * PESO_POTENCIAL_MERCADO;
}

export function calcLastroScore(
  scoreViabilidade: number,
  scoreConformidade: number,
  scoreRiscoTecnico: number,
  scorePotencialMercado: number
): number {
  const total =
    scoreViabilidade +
    scoreConformidade +
    scoreRiscoTecnico +
    scorePotencialMercado;
  return Math.round(Math.min(Math.max(total, 0), 100));
}

// PRD §4.4.
export function recomendacao(
  score: number,
  viavel: boolean,
  todosPercentuaisOk: boolean
): 'COMPRAR' | 'RESSALVAS' | 'NAO_COMPRAR' {
  if (!viavel || score < 50) return 'NAO_COMPRAR';
  if (score > 70 && todosPercentuaisOk) return 'COMPRAR';
  return 'RESSALVAS';
}

// Ponto de entrada único do motor de cálculo — orquestra as funções puras
// acima e monta o AnalysisResult (contrato compartilhado, Fase 0/4).
export function calcularAnalise(input: CalculatorInput): AnalysisResult {
  const vgv = calcVGV(input.unidades, input.precoVendaUnitario);
  const custoConstrucao = calcCustoConstrucao(
    input.cubBase,
    input.areaConstruida,
    input.ajusteTipologiaCub,
    input.ajusteTopografia,
    input.ajusteFormato
  );
  const custoTerreno = calcCustoTerreno(input.valorTerrenoR);
  const lucroIncorporador = calcLucroIncorporador(
    input.percentualLucroUsado,
    vgv
  );
  const outrosCustos = calcOutrosCustos(vgv);
  const resultadoLiquido = calcResultadoLiquido(
    vgv,
    custoTerreno,
    custoConstrucao,
    lucroIncorporador,
    outrosCustos
  );
  const precoMaximoRecomendado = calcPrecoMaximoRecomendado(
    vgv,
    custoConstrucao,
    lucroIncorporador,
    outrosCustos
  );

  const percentualTerrenoReal = vgv > 0 ? custoTerreno / vgv : 0;
  const percentualConstrucaoReal = vgv > 0 ? custoConstrucao / vgv : 0;

  const alertas = analisaNormalidadePercentuais(
    percentualTerrenoReal,
    input.percentualTerrenoReferencia,
    input.percentualLucroUsado,
    input.percentualLucroReferencia,
    percentualConstrucaoReal
  );

  const scoreViabilidade = calcScoreViabilidade(resultadoLiquido, vgv);
  const scoreConformidade = calcScoreConformidade(
    percentualTerrenoReal,
    input.percentualTerrenoReferencia,
    input.percentualLucroUsado,
    input.percentualLucroReferencia,
    percentualConstrucaoReal
  );
  const scoreRiscoTecnico = calcScoreRiscoTecnico();

  // PRD §2.2: usuário informa o valor total de venda da UNIDADE; o preço
  // por m² é derivado (área média da unidade = área construída / unidades)
  // para comparar com o mock FipeZap, que é sempre R$/m².
  const areaUnidadeM2 =
    input.unidades > 0 ? input.areaConstruida / input.unidades : 0;
  const precoVendaM2 =
    areaUnidadeM2 > 0 ? input.precoVendaUnitario / areaUnidadeM2 : 0;
  const scorePotencialMercado = calcScorePotencialMercado(
    precoVendaM2,
    input.precoMercadoM2
  );

  const lastroScore = calcLastroScore(
    scoreViabilidade,
    scoreConformidade,
    scoreRiscoTecnico,
    scorePotencialMercado
  );
  const viavel = resultadoLiquido >= 0;
  const todosPercentuaisOk = alertas.length === 0;

  return {
    vgv,
    custoConstrucao,
    custoTerreno,
    lucroIncorporador,
    outrosCustos,
    resultadoLiquido,
    lastroScore,
    recomendacao: recomendacao(lastroScore, viavel, todosPercentuaisOk),
    precoMaximoRecomendado,
    alertas,
  };
}
