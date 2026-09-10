import type { AnalysisInput, AnalysisResult } from '../../shared/schemas';
import type { CalculatorInput } from '../types/analysis';
import { calcularAnalise } from '../utils/calculator';
import { findAjusteCub, findTipologia } from '../models/Parametro';
import { getCubDataAdapter, getMarketDataAdapter } from '../services/adapters';
import { ErroDominio } from '../utils/erros';

export interface ResultadoResolucao {
  resultado: AnalysisResult;
  parametrosSnapshot: Record<string, unknown>;
}

// Camada que resolve tipologia/CUB/ajustes/preço de mercado (Fase 2) em
// números concretos e chama o motor de cálculo puro (Fase 3). Usada tanto
// pelo cálculo efêmero (POST /calcular) quanto pela persistência (POST /) —
// o backend NUNCA confia em um resultado calculado pelo frontend.
export async function resolverEAnalisar(
  input: AnalysisInput
): Promise<ResultadoResolucao> {
  const tipologia = await findTipologia(input.tipologia, input.padrao);
  if (!tipologia) {
    throw new ErroDominio(
      `Tipologia/padrão não encontrado: "${input.tipologia}" / "${input.padrao}"`,
      400
    );
  }

  // Combinações sem código CUB mapeado (Comercial Baixo, Uso Misto — ver
  // server/utils/parameterConstants.ts) não têm como estimar custo de
  // construção real; recusar em vez de mostrar um resultado enganoso
  // (regra CLAUDE.md #8: não inventar CUB).
  if (!tipologia.cubCodigo) {
    throw new ErroDominio(
      `Não é possível calcular esta combinação (${input.tipologia}/${input.padrao}): código CUB Sinduscon-MG ainda não mapeado para esse caso (ver PRD §3.1)`,
      422
    );
  }

  const cubBase = await getCubDataAdapter().getCubBase(tipologia.cubCodigo);
  if (!cubBase) {
    throw new ErroDominio(
      `Valor base de CUB não encontrado para o código "${tipologia.cubCodigo}"`,
      422
    );
  }

  const [ajusteTopografia, ajusteFormato] = await Promise.all([
    findAjusteCub('topografia', input.topografia),
    findAjusteCub('formato', input.formatoLote),
  ]);
  if (!ajusteTopografia || !ajusteFormato) {
    throw new ErroDominio(
      'Ajuste de CUB não encontrado para a topografia/formato de lote informados',
      400
    );
  }

  const precoMercado = await getMarketDataAdapter().getPrecoMercado(
    input.tipologia,
    'MG'
  );

  const percentualLucroUsado =
    input.percentualLucro ?? tipologia.percentualLucro;

  const calculatorInput: CalculatorInput = {
    unidades: input.unidades,
    precoVendaUnitario: input.precoVendaUnitario,
    areaConstruida: input.areaConstruida,
    cubBase: cubBase.valorM2,
    ajusteTipologiaCub: tipologia.ajusteTipologiaCub ?? 0,
    ajusteTopografia: ajusteTopografia.percentual,
    ajusteFormato: ajusteFormato.percentual,
    valorTerrenoR: input.valorTerrenoR,
    percentualTerrenoReferencia: tipologia.percentualTerreno,
    percentualLucroUsado,
    percentualLucroReferencia: tipologia.percentualLucro,
    precoMercadoM2: precoMercado?.precoM2 ?? null,
  };

  const resultado = calcularAnalise(calculatorInput);

  // Tipologias com CUB mapeado mas sem ajuste de complexidade definido
  // (Galpão — ver server/utils/parameterConstants.ts) ainda calculam, mas
  // com um alerta explícito de que o custo pode estar subestimado.
  if (tipologia.ajusteTipologiaCub === null) {
    resultado.alertas.push({
      tipo: 'ajuste_cub_nao_definido',
      mensagem:
        'Ajuste de complexidade CUB não definido para esta tipologia/padrão; custo de construção pode estar subestimado.',
      severidade: 'warning',
    });
  }

  const parametrosSnapshot = {
    tipologia: {
      tipologia: tipologia.tipologia,
      padrao: tipologia.padrao,
      percentualTerreno: tipologia.percentualTerreno,
      percentualLucro: tipologia.percentualLucro,
      cubCodigo: tipologia.cubCodigo,
      ajusteTipologiaCub: tipologia.ajusteTipologiaCub,
    },
    ajusteTopografia: {
      chave: input.topografia,
      percentual: ajusteTopografia.percentual,
    },
    ajusteFormato: {
      chave: input.formatoLote,
      percentual: ajusteFormato.percentual,
    },
    cubBase,
    precoMercado,
    percentualLucroUsado,
  };

  return { resultado, parametrosSnapshot };
}
