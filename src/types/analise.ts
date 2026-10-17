import type { PremissaAjustavel } from './parametros';
import { criarProdutoVazio, type DadosProduto } from './produto';
import { criarTerrenoVazio, type DadosTerreno } from './terreno';

// PRD 2.6 e D-R6: escolha explícita do usuário, nunca inferida. Decide a perspectiva padrão (F16)
// e o rótulo da recomendação (F19); aqui ela só é capturada.
export type ObjetivoAnalise = 'comprarTerreno' | 'executarEmpreendimento';

export const OBJETIVOS_ANALISE: readonly ObjetivoAnalise[] = ['comprarTerreno', 'executarEmpreendimento'];

export interface Analise {
  // null até o usuário escolher: não existe objetivo padrão.
  objetivo: ObjetivoAnalise | null;
  terreno: DadosTerreno;
  produto: DadosProduto;
}

export function criarAnaliseVazia(): Analise {
  return { objetivo: null, terreno: criarTerrenoVazio(), produto: criarProdutoVazio() };
}

// ——— Contrato da API de análise (POST /api/v1/analises) ———
// Vive junto da Analise porque é o formato que o front e o back compartilham (D-B1).

// Um problema encontrado na validação do backend, no mesmo vocabulário da tela: a etapa e o campo são
// os que o formulário usa, e a mensagem é a mesma de utils/validacao.
export interface ErroValidacao {
  // 'ajustes': premissas ajustadas no resultado (F17), validadas depois da análise.
  etapa: 'corpo' | 'objetivo' | 'terreno' | 'produto' | 'ajustes';
  campo: string;
  mensagem: string;
}

// Parâmetro de negócio como valeram na conta, com a versão e a origem: o snapshot que acompanha o
// resultado (PRD 2.10 e 10.5). "provisorio" vem do próprio parâmetro (TBD aguardando validação).
export interface ParametroUsado {
  pontosBase: number;
  provisorio: boolean;
  fonte: string;
  versao: string;
}

// F17: uma premissa ajustável como valeu na conta. "original" é o valor da análise sem ajuste (o que o
// usuário informou nas etapas, ou o parâmetro da lastro), "usado" é o que entrou na conta; ajustada = os
// dois diferem. Mesma unidade da premissa: centavos para preço e CUB por m², pontos-base para percentuais.
export interface PremissaDoCenario {
  original: number;
  usado: number;
  ajustada: boolean;
}

// Premissas e versão de dados usadas no cálculo, preservadas junto do resultado.
export interface SnapshotPremissas {
  versaoMotor: string;
  cub: {
    versaoBase: { id: string; competencia: { ano: number; mes: number }; dataEmissao: string | null; origem: string };
    projeto: string;
    padrao: string;
    cubBaseCentavos: number;
    cubAjustadoCentavos: number;
    aditivos: {
      fundacaoPontosBase: number;
      faixaFundacao: string;
      padraoPontosBase: number;
      topografia: string;
      topografiaPontosBase: number;
      formato: string;
      formatoPontosBase: number;
      somaPontosBase: number;
    };
  };
  taxaOcupacao: ParametroUsado & { padraoPontosBase: number; ajustadaPeloUsuario: boolean };
  lucroIncorporador: ParametroUsado & { padrao: string };
  despesasGerais: ParametroUsado & {
    // O que compõe o total aplicado (D-R26), em pontos-base, e o que a fonte lista mas não aplica.
    componentesAplicados: Record<string, number>;
    foraDoTotal: Record<string, number>;
    // A soma de TODOS os itens da fonte: maior que o total aplicado (D-B2), e a tela sinaliza.
    somaItemizacaoPontosBase: number;
  };
  // F17 (PRD 10.5): o snapshot distingue premissa padrão de premissa ajustada, para auditoria.
  ajustes: {
    quantidade: number;
    premissas: Record<PremissaAjustavel, PremissaDoCenario>;
  };
}

// Cada valor como % do VGV, em pontos-base (10.000 = 100%); null = sem base (VGV zero ou valor grande demais).
export interface PercentuaisDoVgvDto {
  custoObra: number | null;
  despesasGerais: number | null;
  lucroIncorporador: number | null;
  resultadoTerreno: number | null;
  precoPedido: number | null;
  resultadoLiquido: number | null;
  lucroResultante: number | null;
}

export interface ResultadoEconomiaDto {
  vgvCentavos: number;
  custoObraCentavos: number;
  despesasGeraisCentavos: number;
  lucroIncorporadorCentavos: number;
  precoPedidoCentavos: number;
  resultadoTerrenoCentavos: number;
  resultadoLiquidoCentavos: number;
  lucroResultanteCentavos: number;
  percentuaisDoVgvPontosBase: PercentuaisDoVgvDto;
  viavel: boolean;
}

// Programa efetivo do empreendimento, com as travas da tipologia já aplicadas (casa e galpão: 1 unidade).
export interface ProgramaDto {
  pavimentos: number;
  unidadesPorPavimento: number;
  totalUnidades: number;
}

export interface AreasDto {
  areaUtilizadaCentesimos: number | null;
  areaConstruidaCentesimos: number | null;
  areaComercializavelCentesimos: number | null;
  coeficienteAproveitamentoCentesimos: number | null;
  coeficienteUnidadesPontosBase: number | null;
}

// Pedido válido que o cálculo não conclui. Não é erro de validação nem de servidor: é um estado do
// resultado (D-R22: a lacuna do CUB é pendência, nunca um valor estimado).
export type RespostaAnalise =
  | {
      situacao: 'calculado';
      programa: ProgramaDto;
      areas: AreasDto;
      economia: ResultadoEconomiaDto;
      premissas: SnapshotPremissas;
    }
  | {
      situacao: 'cubPendente';
      motivo: 'padraoSemValorPublicado' | 'projetoSemTabela';
      projeto: string;
      areas: AreasDto;
    }
  // Valores que passam do que o cálculo representa com exatidão (tetos somados).
  | { situacao: 'foraDoLimite' };

// As duas leituras da mesma base de cálculo (PRD 2.6 e 4.1): na Terrenista o lucro do incorporador é fixo e
// o resolvido é quanto o terreno pode custar; na Incorporador o preço pedido é fixo e o resolvido é o lucro.
export type Perspectiva = 'terrenista' | 'incorporador';
export const PERSPECTIVAS: readonly Perspectiva[] = ['terrenista', 'incorporador'];

export type CodigoErroApi =
  | 'VALIDACAO_FALHOU'
  | 'CORPO_INVALIDO'
  | 'TIPO_NAO_SUPORTADO'
  | 'PAYLOAD_GRANDE_DEMAIS'
  | 'ROTA_NAO_ENCONTRADA'
  | 'ERRO_INTERNO';

export interface ErroApi {
  codigo: CodigoErroApi;
  mensagem: string;
  detalhes?: ErroValidacao[];
}

// Formato único das respostas da API: { dados } no sucesso, { erro } na falha.
export type CorpoApi<Dados> = { dados: Dados } | { erro: ErroApi };
