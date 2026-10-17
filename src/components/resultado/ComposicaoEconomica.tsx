import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { ResultadoEconomiaDto, SnapshotPremissas } from '../../types/analise';
import { formatarMoedaComSinal, formatarNumeroBr } from '../../utils/motor/formatacao';
import { Expansivel } from '../ui/Expansivel';
import estilos from './ComposicaoEconomica.module.css';

interface PropriedadesComposicaoEconomica {
  economia: ResultadoEconomiaDto;
  premissas: SnapshotPremissas;
}

type Sinal = 'mais' | 'menos' | 'igual';

interface Linha {
  id: string;
  sinal: Sinal;
  rotulo: string;
  formula: string;
  valorCentavos: number;
  /** Em pontos-base; null = sem base (VGV zero). */
  percentual: number | null;
  destaque?: boolean;
}

const percentual = (pontosBase: number | null) =>
  pontosBase === null ? TEXTOS_RESULTADO.composicao.semBase : `${formatarNumeroBr(pontosBase)}%`;

// A tabela de composição de custos do PRD 2.5: VGV → obra → despesas → lucro → Resultado do terreno →
// preço pedido → sobra/déficit, em reais e em % do VGV. Os valores e os percentuais vêm do servidor. Cada
// linha traz a sua fórmula sob demanda, e a tabela vira uma lista de pares no celular.
export function ComposicaoEconomica({ economia, premissas }: PropriedadesComposicaoEconomica) {
  const { composicao: texto } = TEXTOS_RESULTADO;
  const { linhas } = texto;
  const p = economia.percentuaisDoVgvPontosBase;
  const itens: Linha[] = [
    { id: 'vgv', sinal: 'mais', ...linhas.vgv, valorCentavos: economia.vgvCentavos, percentual: 10_000 },
    { id: 'custo-obra', sinal: 'menos', ...linhas.custoObra, valorCentavos: economia.custoObraCentavos, percentual: p.custoObra },
    {
      id: 'despesas-gerais',
      sinal: 'menos',
      ...linhas.despesasGerais,
      rotulo: `${linhas.despesasGerais.rotulo} (${formatarNumeroBr(premissas.despesasGerais.pontosBase)}%)`,
      valorCentavos: economia.despesasGeraisCentavos,
      percentual: p.despesasGerais,
    },
    {
      id: 'lucro',
      sinal: 'menos',
      ...linhas.lucro,
      rotulo: `${linhas.lucro.rotulo} (${formatarNumeroBr(premissas.lucroIncorporador.pontosBase)}%)`,
      valorCentavos: economia.lucroIncorporadorCentavos,
      percentual: p.lucroIncorporador,
    },
    {
      id: 'resultado-terreno',
      sinal: 'igual',
      ...linhas.resultadoTerreno,
      valorCentavos: economia.resultadoTerrenoCentavos,
      percentual: p.resultadoTerreno,
      destaque: true,
    },
    { id: 'preco-pedido', sinal: 'menos', ...linhas.precoPedido, valorCentavos: economia.precoPedidoCentavos, percentual: p.precoPedido },
    {
      id: 'sobra-deficit',
      sinal: 'igual',
      ...linhas.sobraDeficit,
      valorCentavos: economia.resultadoLiquidoCentavos,
      percentual: p.resultadoLiquido,
      destaque: true,
    },
  ];

  // Os papéis ARIA são explícitos porque no celular a tabela vira lista de pares por CSS (display), e
  // alguns navegadores descartam a semântica de tabela quando o display muda.
  return (
    <div className={estilos.envoltorio}>
      <table className={estilos.tabela} role="table">
        <caption className={estilos.legenda}>{texto.legenda}</caption>
        <thead className={estilos.cabecalho}>
          <tr role="row">
            <th scope="col" role="columnheader">
              {texto.colunas.componente}
            </th>
            <th scope="col" role="columnheader" className={estilos.numerica}>
              {texto.colunas.valor}
            </th>
            <th scope="col" role="columnheader" className={estilos.numerica}>
              {texto.colunas.percentual}
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {itens.map((item) => (
            <tr key={item.id} role="row" className={estilos.linha} data-destaque={item.destaque ? 'true' : undefined}>
              <th scope="row" role="rowheader" className={estilos.rotulo}>
                <span className={estilos.nome}>
                  {item.sinal !== 'mais' && (
                    <>
                      <span aria-hidden="true" className={estilos.sinal}>
                        {texto.sinais[item.sinal]}
                      </span>
                      <span className={estilos.apenasLeitor}>{texto.leituraSinal[item.sinal]}</span>
                    </>
                  )}
                  {item.rotulo}
                </span>
                <Expansivel titulo={TEXTOS_RESULTADO.comoCalculado} variante="discreta">
                  <p className={estilos.formula}>{item.formula}</p>
                </Expansivel>
              </th>
              <td
                role="cell"
                className={`${estilos.numerica} ${estilos.valor}`}
                data-testid={`composicao-${item.id}-valor`}
                data-negativo={item.valorCentavos < 0 ? 'true' : undefined}
              >
                {formatarMoedaComSinal(item.valorCentavos)}
              </td>
              <td
                role="cell"
                className={`${estilos.numerica} ${estilos.pct}`}
                data-testid={`composicao-${item.id}-pct`}
                data-negativo={item.percentual !== null && item.percentual < 0 ? 'true' : undefined}
              >
                {percentual(item.percentual)}
                {/* No celular a coluna vira texto corrido; o "do VGV" diz a que base o percentual se refere. */}
                {item.percentual !== null && (
                  <span aria-hidden="true" className={estilos.apenasCelular}>
                    {' '}
                    {texto.doVgv}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={estilos.fechamento}>{texto.fechamento}</p>
    </div>
  );
}
