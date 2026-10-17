// Classificação CUB, aditivos e CUB Ajustado (PRD 3.1 e 3.2), puros e em inteiros exatos. Nenhum valor
// de CUB mora aqui: eles vêm da versão da base pelo repositório (dados/), e os percentuais, de
// parametros.ts. Lacuna da tabela é pendência explícita, nunca um número estimado (D-B4 e D-B5).
import type { ProjetoCub, RepositorioCub, VersaoCub } from '../../types/parametros';
import { PONTOS_BASE_CEM_POR_CENTO } from '../../types/parametros';
import type { DadosProduto, PadraoAcabamento, Tipologia } from '../../types/produto';
import type { DadosTerreno, FormatoLote, Topografia } from '../../types/terreno';
import { repositorioCubEmMemoria } from './dados';
import { dividirArredondando } from './formatacao';
import {
  ADITIVO_FORMATO,
  ADITIVO_FUNDACAO,
  ADITIVO_PADRAO,
  ADITIVO_TOPOGRAFIA,
  type FaixaFundacao,
} from './parametros';
import { calcularProgramaEfetivo } from './produto';

// PRD 3.1: Tipologia + faixa de pavimentos → projeto CUB; o padrão escolhe a coluna depois. Cada faixa é
// "até N pavimentos" (D-R21: o N está incluído); a última, sem teto, vale para o que passar.
const MAPEAMENTO_PROJETO_CUB: Readonly<Record<Tipologia, readonly { ate: number | null; projeto: ProjetoCub }[]>> = {
  casa: [{ ate: null, projeto: 'R-1' }],
  predio: [
    { ate: 8, projeto: 'R-8' },
    { ate: null, projeto: 'R-16' },
  ],
  salasLojas: [
    { ate: 8, projeto: 'CSL-8' },
    { ate: null, projeto: 'CSL-16' },
  ],
  andaresLivres: [
    { ate: 8, projeto: 'CAL-8' },
    // Sem linha na tabela Sinduscon-MG Ago/2026 (D-B5): a consulta devolve pendência.
    { ate: null, projeto: 'CAL-16' },
  ],
  galpao: [{ ate: null, projeto: 'GI' }],
};

export function classificarProjetoCub(tipologia: Tipologia, pavimentos: number): ProjetoCub {
  const faixas = MAPEAMENTO_PROJETO_CUB[tipologia];
  const faixa = faixas.find((candidata) => candidata.ate === null || pavimentos <= candidata.ate);
  return (faixa as { projeto: ProjetoCub }).projeto;
}

// PRD 3.2 A. Casa e galpão usam as linhas "1" e "2+"; os edifícios, as faixas por teto de pavimentos.
export function classificarFaixaFundacao(tipologia: Tipologia, pavimentos: number): FaixaFundacao {
  if (tipologia === 'casa' || tipologia === 'galpao') return pavimentos === 1 ? 'umPavimento' : 'doisOuMais';
  if (pavimentos <= 4) return 'ate4';
  if (pavimentos <= 8) return 'de5a8';
  if (pavimentos <= 16) return 'de9a16';
  return 'acima16';
}

export interface EntradaCub {
  tipologia: Tipologia | null;
  /** Já com as travas da tipologia aplicadas (galpão: 1). */
  pavimentos: number | null;
  padrao: PadraoAcabamento | null;
  topografia: Topografia | null;
  formatoLote: FormatoLote | null;
}

// Em pontos-base; cada um com a chave da tabela que o originou, para a tela discriminá-los um a um.
export interface AditivosCub {
  fundacao: { faixa: FaixaFundacao; pontosBase: number };
  padrao: { padrao: PadraoAcabamento; pontosBase: number };
  topografia: { topografia: Topografia; pontosBase: number };
  formato: { formato: FormatoLote; pontosBase: number };
  /** Aditivos SOMADOS e aplicados em uma única multiplicação (PRD 3.2): nunca em cadeia. */
  somaPontosBase: number;
}

// Qual versão da base valeu na conta: vai no snapshot do resultado exportado (PRD 3.4 e 10.5).
export type VersaoCubUsada = Omit<VersaoCub, 'valores'>;

// 'padraoSemValorPublicado' = D-B4 (a tabela não publica o padrão Baixo desse projeto);
// 'projetoSemTabela' = D-B5 (CAL-16 não existe na tabela).
export type MotivoPendenciaCub = 'padraoSemValorPublicado' | 'projetoSemTabela';

export type ResultadoCub =
  // Faltam escolhas para classificar: a tela diz o que falta, sem número.
  | { situacao: 'insuficiente' }
  | {
      situacao: 'pendente';
      motivo: MotivoPendenciaCub;
      projeto: ProjetoCub;
      padrao: PadraoAcabamento;
      aditivos: AditivosCub;
      versao: VersaoCubUsada;
    }
  | {
      situacao: 'calculado';
      projeto: ProjetoCub;
      padrao: PadraoAcabamento;
      cubBaseCentavos: number;
      aditivos: AditivosCub;
      cubAjustadoCentavos: number;
      versao: VersaoCubUsada;
    };

function inteiroPositivo(valor: number | null): valor is number {
  return valor !== null && Number.isSafeInteger(valor) && valor > 0;
}

export function calcularAditivos(
  tipologia: Tipologia,
  pavimentos: number,
  padrao: PadraoAcabamento,
  topografia: Topografia,
  formato: FormatoLote,
): AditivosCub | null {
  const faixa = classificarFaixaFundacao(tipologia, pavimentos);
  const fundacao = ADITIVO_FUNDACAO.valor[faixa];
  const aditivoPadrao = ADITIVO_PADRAO.valor[padrao];
  const aditivoTopografia = ADITIVO_TOPOGRAFIA.valor[topografia];
  const aditivoFormato = ADITIVO_FORMATO.valor[formato];
  // Chave fora das tabelas (entrada vinda da API) não vira aditivo zero: vira "sem número".
  if ([fundacao, aditivoPadrao, aditivoTopografia, aditivoFormato].some((valor) => valor === undefined)) return null;
  return {
    fundacao: { faixa, pontosBase: fundacao },
    padrao: { padrao, pontosBase: aditivoPadrao },
    topografia: { topografia, pontosBase: aditivoTopografia },
    formato: { formato, pontosBase: aditivoFormato },
    somaPontosBase: fundacao + aditivoPadrao + aditivoTopografia + aditivoFormato,
  };
}

// CUB Ajustado = CUB Base × (1 + Soma dos Aditivos), arredondado ao centavo, meio para cima, em inteiros:
// base × (10.000 + soma) ÷ 10.000. Uma multiplicação só: 2.554,58 × 1,235 = R$ 3.154,91.
export function calcularCubAjustadoCentavos(cubBaseCentavos: number, somaAditivosPontosBase: number): number {
  return dividirArredondando(
    cubBaseCentavos * (PONTOS_BASE_CEM_POR_CENTO + somaAditivosPontosBase),
    PONTOS_BASE_CEM_POR_CENTO,
  );
}

export function calcularCub(
  entrada: EntradaCub,
  repositorio: RepositorioCub = repositorioCubEmMemoria,
): ResultadoCub {
  const { tipologia, pavimentos, padrao, topografia, formatoLote } = entrada;
  if (!tipologia || !inteiroPositivo(pavimentos) || !padrao || !topografia || !formatoLote) {
    return { situacao: 'insuficiente' };
  }
  const aditivos = calcularAditivos(tipologia, pavimentos, padrao, topografia, formatoLote);
  if (aditivos === null) return { situacao: 'insuficiente' };

  const { valores, ...versao } = repositorio.obterVersaoVigente();
  const projeto = classificarProjetoCub(tipologia, pavimentos);
  const base = { projeto, padrao, aditivos, versao };

  const tabelaDoProjeto = valores[projeto];
  if (!tabelaDoProjeto) return { situacao: 'pendente', motivo: 'projetoSemTabela', ...base };

  const cubBaseCentavos =
    tabelaDoProjeto.tipo === 'unico'
      ? tabelaDoProjeto.valorCentavos
      : { baixo: tabelaDoProjeto.baixoCentavos, normal: tabelaDoProjeto.normalCentavos, alto: tabelaDoProjeto.altoCentavos }[padrao];
  if (cubBaseCentavos === null) return { situacao: 'pendente', motivo: 'padraoSemValorPublicado', ...base };

  return {
    situacao: 'calculado',
    ...base,
    cubBaseCentavos,
    cubAjustadoCentavos: calcularCubAjustadoCentavos(cubBaseCentavos, aditivos.somaPontosBase),
  };
}

// Une Etapa 1 (topografia, formato) e Etapa 2 (tipologia, padrão, pavimentos efetivos) na entrada do CUB,
// com as travas da tipologia já aplicadas: a mesma entrada que o motor econômico usará na F13.
export function calcularCubDaAnalise(
  terreno: Pick<DadosTerreno, 'topografia' | 'formatoLote'>,
  produto: DadosProduto,
  repositorio?: RepositorioCub,
): ResultadoCub {
  return calcularCub(
    {
      tipologia: produto.tipologia,
      pavimentos: calcularProgramaEfetivo(produto).pavimentos,
      padrao: produto.padrao,
      topografia: terreno.topografia,
      formatoLote: terreno.formatoLote,
    },
    repositorio,
  );
}
