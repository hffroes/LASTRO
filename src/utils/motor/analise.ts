// Gera a análise completa a partir do que o usuário informou: áreas, CUB, economia e o snapshot das
// premissas. Pura e sem React nem Express: é o que o servidor executa (server/domain/motorAdapter.ts) e
// o que a F16 e a F17 reaproveitarão para recalcular. Espera uma análise já validada (utils/validacao).
import type {
  Analise,
  AreasDto,
  RespostaAnalise,
  ResultadoEconomiaDto,
  SnapshotPremissas,
} from '../../types/analise';
import { calcularAreasDoProduto } from './areas';
import { calcularCubDaAnalise } from './cub';
import type { RepositorioCub } from '../../types/parametros';
import { calcularEconomia, PARAMETROS_ECONOMIA_PADRAO, type ParametrosEconomia } from './economia';
import {
  DESPESAS_GERAIS_ITEMIZACAO_DA_FONTE,
  DESPESAS_GERAIS_TOTAL,
  LUCRO_INCORPORADOR_POR_PADRAO,
  SOMA_ITEMIZACAO_DESPESAS_GERAIS,
  TAXA_OCUPACAO_PADRAO,
  VERSAO_MOTOR,
} from './parametros';
import { calcularProgramaEfetivo } from './produto';

export interface OpcoesGerarAnalise {
  repositorioCub?: RepositorioCub;
  parametros?: ParametrosEconomia;
}

export function gerarAnalise(analise: Analise, opcoes: OpcoesGerarAnalise = {}): RespostaAnalise {
  const { terreno, produto } = analise;
  const areas: AreasDto = calcularAreasDoProduto(terreno.areaTotalM2, produto);
  const cub = calcularCubDaAnalise(terreno, produto, opcoes.repositorioCub);

  if (cub.situacao === 'pendente') {
    return { situacao: 'cubPendente', motivo: cub.motivo, projeto: cub.projeto, areas };
  }
  const programa = calcularProgramaEfetivo(produto);
  if (
    cub.situacao !== 'calculado' ||
    programa.totalUnidades === null ||
    areas.areaConstruidaCentesimos === null ||
    produto.precoUnidadeCentavos === null ||
    terreno.precoPedidoCentavos === null ||
    produto.padrao === null
  ) {
    // Análise validada não chega aqui; se chegar, é entrada que a validação deixou passar.
    return { situacao: 'foraDoLimite' };
  }

  if (programa.pavimentos === null || programa.unidadesPorPavimento === null) return { situacao: 'foraDoLimite' };

  const economia = calcularEconomia(
    {
      totalUnidades: programa.totalUnidades,
      precoUnidadeCentavos: produto.precoUnidadeCentavos,
      areaConstruidaCentesimos: areas.areaConstruidaCentesimos,
      cubAjustadoCentavos: cub.cubAjustadoCentavos,
      padrao: produto.padrao,
      precoPedidoCentavos: terreno.precoPedidoCentavos,
    },
    opcoes.parametros ?? PARAMETROS_ECONOMIA_PADRAO,
  );
  if (economia === null) return { situacao: 'foraDoLimite' };

  const economiaDto: ResultadoEconomiaDto = economia;
  const parametros = opcoes.parametros ?? PARAMETROS_ECONOMIA_PADRAO;
  const taxa = produto.taxaOcupacaoPontosBase ?? TAXA_OCUPACAO_PADRAO.valor;
  const premissas: SnapshotPremissas = {
    versaoMotor: VERSAO_MOTOR,
    cub: {
      versaoBase: cub.versao,
      projeto: cub.projeto,
      padrao: cub.padrao,
      cubBaseCentavos: cub.cubBaseCentavos,
      cubAjustadoCentavos: cub.cubAjustadoCentavos,
      aditivos: {
        fundacaoPontosBase: cub.aditivos.fundacao.pontosBase,
        faixaFundacao: cub.aditivos.fundacao.faixa,
        padraoPontosBase: cub.aditivos.padrao.pontosBase,
        topografiaPontosBase: cub.aditivos.topografia.pontosBase,
        formatoPontosBase: cub.aditivos.formato.pontosBase,
        somaPontosBase: cub.aditivos.somaPontosBase,
      },
    },
    taxaOcupacao: {
      pontosBase: taxa,
      padraoPontosBase: TAXA_OCUPACAO_PADRAO.valor,
      ajustadaPeloUsuario: taxa !== TAXA_OCUPACAO_PADRAO.valor,
      provisorio: TAXA_OCUPACAO_PADRAO.provisorio,
      fonte: TAXA_OCUPACAO_PADRAO.fonte,
      versao: TAXA_OCUPACAO_PADRAO.versao,
    },
    lucroIncorporador: {
      padrao: produto.padrao,
      pontosBase: parametros.lucroIncorporadorPontosBase[produto.padrao],
      provisorio: LUCRO_INCORPORADOR_POR_PADRAO.provisorio,
      fonte: LUCRO_INCORPORADOR_POR_PADRAO.fonte,
      versao: LUCRO_INCORPORADOR_POR_PADRAO.versao,
    },
    despesasGerais: {
      pontosBase: parametros.despesasGeraisPontosBase,
      provisorio: DESPESAS_GERAIS_TOTAL.provisorio,
      fonte: DESPESAS_GERAIS_TOTAL.fonte,
      versao: DESPESAS_GERAIS_TOTAL.versao,
      itemizacaoDaFonte: { ...DESPESAS_GERAIS_ITEMIZACAO_DA_FONTE },
      somaItemizacaoPontosBase: SOMA_ITEMIZACAO_DESPESAS_GERAIS,
    },
  };

  return {
    situacao: 'calculado',
    programa: {
      pavimentos: programa.pavimentos,
      unidadesPorPavimento: programa.unidadesPorPavimento,
      totalUnidades: programa.totalUnidades,
    },
    areas,
    economia: economiaDto,
    premissas,
  };
}
