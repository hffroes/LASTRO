// Gera a análise completa a partir do que o usuário informou: áreas, CUB, economia e o snapshot das
// premissas. Pura e sem React nem Express: é o que o servidor executa (server/domain/motorAdapter.ts).
// Espera uma análise já validada (utils/validacao), e os ajustes de premissa (F17) também validados.
import type {
  Analise,
  AreasDto,
  RespostaAnalise,
  ResultadoEconomiaDto,
  SnapshotPremissas,
} from '../../types/analise';
import { calcularAreasDoProduto } from './areas';
import { calcularCubDaAnalise } from './cub';
import type { AjustesPremissas, RepositorioCub } from '../../types/parametros';
import { calcularEconomia, PARAMETROS_ECONOMIA_PADRAO, type ParametrosEconomia } from './economia';
import {
  DESPESAS_GERAIS_COMPONENTES_APLICADOS,
  DESPESAS_GERAIS_FORA_DO_TOTAL,
  DESPESAS_GERAIS_TOTAL,
  LUCRO_INCORPORADOR_POR_PADRAO,
  SOMA_ITEMIZACAO_DESPESAS_GERAIS,
  TAXA_OCUPACAO_PADRAO,
  VERSAO_MOTOR,
} from './parametros';
import {
  aplicarAjustes,
  descreverCenario,
  parametrosDoCenario,
  produtoDoCenario,
  valoresOriginais,
} from './premissas';
import { calcularProgramaEfetivo } from './produto';

export interface OpcoesGerarAnalise {
  repositorioCub?: RepositorioCub;
  parametros?: ParametrosEconomia;
}

// Sem ajustes, é a análise como o usuário a informou. Com ajustes, as premissas ajustadas entram por cima
// (utils/motor/premissas.ts) e a conta é a mesma; o padrão global nunca é tocado (PRD 2.10).
export function gerarAnalise(
  analise: Analise,
  opcoes: OpcoesGerarAnalise = {},
  ajustes: AjustesPremissas = {},
): RespostaAnalise {
  const { terreno, produto } = analise;
  const cub = calcularCubDaAnalise(terreno, produto, opcoes.repositorioCub);

  if (cub.situacao === 'pendente') {
    // Sem CUB não há conta a ajustar (D-R22): a pendência é a da análise informada.
    const areas = calcularAreasDoProduto(terreno.areaTotalM2, produto);
    return { situacao: 'cubPendente', motivo: cub.motivo, projeto: cub.projeto, areas };
  }
  const programa = calcularProgramaEfetivo(produto);
  if (
    cub.situacao !== 'calculado' ||
    programa.totalUnidades === null ||
    produto.precoUnidadeCentavos === null ||
    produto.taxaOcupacaoPontosBase === null ||
    terreno.precoPedidoCentavos === null ||
    produto.padrao === null
  ) {
    // Análise validada não chega aqui; se chegar, é entrada que a validação deixou passar.
    return { situacao: 'foraDoLimite' };
  }

  if (programa.pavimentos === null || programa.unidadesPorPavimento === null) return { situacao: 'foraDoLimite' };

  const parametrosBase = opcoes.parametros ?? PARAMETROS_ECONOMIA_PADRAO;
  const originais = valoresOriginais({
    precoUnidadeCentavos: produto.precoUnidadeCentavos,
    taxaOcupacaoPontosBase: produto.taxaOcupacaoPontosBase,
    padrao: produto.padrao,
    parametros: parametrosBase,
    cubAjustadoCentavos: cub.cubAjustadoCentavos,
  });
  const usados = aplicarAjustes(originais, ajustes);
  const parametros = parametrosDoCenario(parametrosBase, produto.padrao, usados);
  // A taxa de ocupação muda a área construída; o preço, o VGV. As áreas saem do produto do cenário.
  const areas: AreasDto = calcularAreasDoProduto(terreno.areaTotalM2, produtoDoCenario(produto, usados));
  if (areas.areaConstruidaCentesimos === null) return { situacao: 'foraDoLimite' };

  const economia = calcularEconomia(
    {
      totalUnidades: programa.totalUnidades,
      precoUnidadeCentavos: usados.precoUnidade,
      areaConstruidaCentesimos: areas.areaConstruidaCentesimos,
      cubAjustadoCentavos: usados.cubAjustado,
      padrao: produto.padrao,
      precoPedidoCentavos: terreno.precoPedidoCentavos,
    },
    parametros,
  );
  if (economia === null) return { situacao: 'foraDoLimite' };

  const economiaDto: ResultadoEconomiaDto = economia;
  const taxa = usados.taxaOcupacao;
  const premissas: SnapshotPremissas = {
    versaoMotor: VERSAO_MOTOR,
    cub: {
      versaoBase: cub.versao,
      projeto: cub.projeto,
      padrao: cub.padrao,
      cubBaseCentavos: cub.cubBaseCentavos,
      // O calculado pela base e pelos aditivos; o que valeu na conta, se o usuário o ajustou, está em ajustes.
      cubAjustadoCentavos: cub.cubAjustadoCentavos,
      aditivos: {
        fundacaoPontosBase: cub.aditivos.fundacao.pontosBase,
        faixaFundacao: cub.aditivos.fundacao.faixa,
        padraoPontosBase: cub.aditivos.padrao.pontosBase,
        topografia: cub.aditivos.topografia.topografia,
        topografiaPontosBase: cub.aditivos.topografia.pontosBase,
        formato: cub.aditivos.formato.formato,
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
      componentesAplicados: { ...DESPESAS_GERAIS_COMPONENTES_APLICADOS },
      foraDoTotal: { ...DESPESAS_GERAIS_FORA_DO_TOTAL },
      somaItemizacaoPontosBase: SOMA_ITEMIZACAO_DESPESAS_GERAIS,
    },
    ajustes: descreverCenario(originais, usados),
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
