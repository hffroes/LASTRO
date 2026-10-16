import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { RespostaAnalise } from '../../types/analise';
import { formatarMoedaComSinal, formatarNumeroBr } from '../../utils/motor/formatacao';
import estilos from './ContaCompleta.module.css';

type Calculado = Extract<RespostaAnalise, { situacao: 'calculado' }>;

const percentual = (pontosBase: number) => `${formatarNumeroBr(pontosBase)}%`;

// A conta linha a linha do método do resíduo (PRD 4.1), com os termos técnicos e as fórmulas. Vem da F13
// e fica recolhida: a primeira dobra é o resumo, e a composição detalhada é da F15.
export function ContaCompleta({ dados }: { dados: Calculado }) {
  const { linhas, provisorio, sim, nao } = TEXTOS_RESULTADO;
  const { economia, premissas } = dados;
  const itens = [
    { id: 'vgv', ...linhas.vgv, valor: formatarMoedaComSinal(economia.vgvCentavos) },
    { id: 'custo-obra', ...linhas.custoObra, valor: formatarMoedaComSinal(economia.custoObraCentavos) },
    {
      id: 'despesas-gerais',
      ...linhas.despesasGerais,
      rotulo: `${linhas.despesasGerais.rotulo} (${percentual(premissas.despesasGerais.pontosBase)})`,
      nota: premissas.despesasGerais.provisorio ? provisorio : null,
      valor: formatarMoedaComSinal(economia.despesasGeraisCentavos),
    },
    {
      id: 'lucro',
      ...linhas.lucro,
      rotulo: `${linhas.lucro.rotulo} (${percentual(premissas.lucroIncorporador.pontosBase)})`,
      nota: premissas.lucroIncorporador.provisorio ? provisorio : null,
      valor: formatarMoedaComSinal(economia.lucroIncorporadorCentavos),
    },
    {
      id: 'resultado-terreno',
      ...linhas.resultadoTerreno,
      destaque: true,
      negativo: economia.resultadoTerrenoCentavos < 0,
      valor: formatarMoedaComSinal(economia.resultadoTerrenoCentavos),
    },
    { id: 'preco-pedido', ...linhas.precoPedido, valor: formatarMoedaComSinal(economia.precoPedidoCentavos) },
    {
      id: 'resultado-liquido',
      ...linhas.resultadoLiquido,
      destaque: true,
      negativo: economia.resultadoLiquidoCentavos < 0,
      valor: formatarMoedaComSinal(economia.resultadoLiquidoCentavos),
    },
    { id: 'viavel', ...linhas.viavel, valor: economia.viavel ? sim : nao },
  ];
  return (
    <dl className={estilos.linhas}>
      {itens.map((item) => (
        <div key={item.id} className={estilos.linha} data-destaque={'destaque' in item && item.destaque ? 'true' : undefined}>
          <dt className={estilos.rotulo}>
            {item.rotulo}
            {'nota' in item && item.nota && <span className={estilos.provisorio}> · {item.nota}</span>}
          </dt>
          <dd
            className={estilos.valor}
            data-testid={`resultado-${item.id}`}
            data-negativo={'negativo' in item && item.negativo ? 'true' : undefined}
          >
            {item.valor}
          </dd>
          <dd className={estilos.formula}>{item.formula}</dd>
        </div>
      ))}
    </dl>
  );
}
