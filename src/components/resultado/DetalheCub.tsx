import { OPCOES_PADRAO, ROTULO_FAIXA_FUNDACAO } from '../../content/produto';
import { TEXTOS_RESULTADO } from '../../content/resultado';
import { OPCOES_FORMATO, OPCOES_TOPOGRAFIA } from '../../content/terreno';
import type { AreasDto, ResultadoEconomiaDto, SnapshotPremissas } from '../../types/analise';
import { formatarArea, formatarMoedaComSinal, formatarNumeroBr } from '../../utils/motor/formatacao';
import { Expansivel } from '../ui/Expansivel';
import estilos from './DetalheCub.module.css';

interface PropriedadesDetalheCub {
  economia: ResultadoEconomiaDto;
  areas: AreasDto;
  premissas: SnapshotPremissas;
}

const percentual = (pontosBase: number) => `${formatarNumeroBr(pontosBase)}%`;
const porM2 = (centavos: number) => `${formatarMoedaComSinal(centavos)}/m²`;

function rotuloDe(opcoes: readonly { valor: string; rotulo: string }[], valor: string): string {
  return opcoes.find((opcao) => opcao.valor === valor)?.rotulo ?? valor;
}

// O custo de obra por dentro: o projeto CUB, o valor base, os quatro aditivos (cada um com a opção que o
// originou), o CUB ajustado e a área em que ele incide. Tudo do snapshot que o servidor devolveu.
export function DetalheCub({ economia, areas, premissas }: PropriedadesDetalheCub) {
  const { cub: texto } = TEXTOS_RESULTADO;
  const { cub } = premissas;
  // F17: o CUB ajustado pelo usuário substitui o calculado no custo de obra; os dois ficam à vista.
  const cubDoCenario = premissas.ajustes.premissas.cubAjustado;
  const faixa = ROTULO_FAIXA_FUNDACAO[cub.aditivos.faixaFundacao as keyof typeof ROTULO_FAIXA_FUNDACAO] ?? cub.aditivos.faixaFundacao;
  const aditivos = [
    { id: 'fundacao', rotulo: texto.fundacao, detalhe: faixa, pontosBase: cub.aditivos.fundacaoPontosBase },
    { id: 'padrao', rotulo: texto.padrao, detalhe: rotuloDe(OPCOES_PADRAO, cub.padrao), pontosBase: cub.aditivos.padraoPontosBase },
    {
      id: 'topografia',
      rotulo: texto.topografia,
      detalhe: rotuloDe(OPCOES_TOPOGRAFIA, cub.aditivos.topografia),
      pontosBase: cub.aditivos.topografiaPontosBase,
    },
    { id: 'formato', rotulo: texto.formato, detalhe: rotuloDe(OPCOES_FORMATO, cub.aditivos.formato), pontosBase: cub.aditivos.formatoPontosBase },
  ];

  return (
    <Expansivel titulo={texto.titulo}>
      <dl className={estilos.resumo}>
        <div className={estilos.linha}>
          <dt>{texto.projeto}</dt>
          <dd data-testid="detalhe-cub-projeto">{cub.projeto}</dd>
        </div>
        <div className={estilos.linha}>
          <dt>{texto.cubBase}</dt>
          <dd data-testid="detalhe-cub-base">{porM2(cub.cubBaseCentavos)}</dd>
        </div>
      </dl>

      <table className={estilos.tabela}>
        <caption className={estilos.legenda}>{texto.aditivo}</caption>
        <tbody>
          {aditivos.map((aditivo) => (
            <tr key={aditivo.id}>
              <th scope="row" className={estilos.rotulo}>
                {aditivo.rotulo}
                <span className={estilos.detalhe}>{aditivo.detalhe}</span>
              </th>
              <td className={estilos.valor} data-testid={`detalhe-cub-${aditivo.id}`}>
                {percentual(aditivo.pontosBase)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className={estilos.rotulo}>
              {texto.somaAditivos}
            </th>
            <td className={estilos.valor} data-testid="detalhe-cub-soma">
              {percentual(cub.aditivos.somaPontosBase)}
            </td>
          </tr>
        </tfoot>
      </table>

      <dl className={estilos.resumo}>
        <div className={estilos.linha}>
          <dt>{texto.cubAjustado}</dt>
          <dd data-testid="detalhe-cub-ajustado">{porM2(cub.cubAjustadoCentavos)}</dd>
        </div>
        {cubDoCenario.ajustada && (
          <div className={estilos.linha}>
            <dt>{texto.cubUsado}</dt>
            <dd data-testid="detalhe-cub-usado">{porM2(cubDoCenario.usado)}</dd>
          </div>
        )}
        {areas.areaConstruidaCentesimos !== null && (
          <div className={estilos.linha}>
            <dt>{texto.areaConstruida}</dt>
            <dd data-testid="detalhe-cub-area">{formatarArea(areas.areaConstruidaCentesimos)}</dd>
          </div>
        )}
        <div className={estilos.linha}>
          <dt>{texto.custoObra}</dt>
          <dd data-testid="detalhe-cub-custo-obra">{formatarMoedaComSinal(economia.custoObraCentavos)}</dd>
        </div>
      </dl>
    </Expansivel>
  );
}
