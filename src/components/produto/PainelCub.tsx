import { OPCOES_PADRAO, OPCOES_TIPOLOGIA, ROTULO_FAIXA_FUNDACAO, TEXTOS_CUB } from '../../content/produto';
import { OPCOES_TOPOGRAFIA, OPCOES_FORMATO } from '../../content/terreno';
import type { Tipologia } from '../../types/produto';
import type { ResultadoCub } from '../../utils/motor/cub';
import { formatarMoeda, formatarNumeroBr } from '../../utils/motor/formatacao';
import { Alerta } from '../ui/Alerta';
import estilos from './PainelCub.module.css';

interface PropriedadesPainelCub {
  resultado: ResultadoCub;
  tipologia: Tipologia | null;
  pavimentos: number | null;
}

const percentual = (pontosBase: number) => `${formatarNumeroBr(pontosBase)}%`;
const porM2 = (centavos: number) => `${formatarMoeda(centavos)}/m²`;
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function rotuloDe<Valor extends string>(opcoes: readonly { valor: Valor; rotulo: string }[], valor: Valor): string {
  return opcoes.find((opcao) => opcao.valor === valor)?.rotulo ?? valor;
}

// PRD 3.1 e 3.2: classificação do projeto CUB, o valor base, os quatro aditivos discriminados um a um,
// a soma e o CUB ajustado. Lacuna da tabela vira aviso, nunca número, e deixa claro que não é erro dele.
export function PainelCub({ resultado, tipologia, pavimentos }: PropriedadesPainelCub) {
  if (resultado.situacao === 'insuficiente') {
    return <p className={estilos.aguardando}>{TEXTOS_CUB.aguardando}</p>;
  }

  const { aditivos, versao, projeto } = resultado;
  const competencia = `${MESES[versao.competencia.mes - 1]}/${versao.competencia.ano}`;
  const nomeTipologia = tipologia ? OPCOES_TIPOLOGIA[tipologia].rotulo : '';
  const classificacao = TEXTOS_CUB.rotuloProjeto(
    projeto,
    `${nomeTipologia}, ${pavimentos} pavimento${pavimentos === 1 ? '' : 's'}`,
  );
  const linhas = [
    { rotulo: TEXTOS_CUB.aditivoFundacao, detalhe: ROTULO_FAIXA_FUNDACAO[aditivos.fundacao.faixa], valor: aditivos.fundacao.pontosBase },
    { rotulo: TEXTOS_CUB.aditivoPadrao, detalhe: rotuloDe(OPCOES_PADRAO, aditivos.padrao.padrao), valor: aditivos.padrao.pontosBase },
    { rotulo: TEXTOS_CUB.aditivoTopografia, detalhe: rotuloDe(OPCOES_TOPOGRAFIA, aditivos.topografia.topografia), valor: aditivos.topografia.pontosBase },
    { rotulo: TEXTOS_CUB.aditivoFormato, detalhe: rotuloDe(OPCOES_FORMATO, aditivos.formato.formato), valor: aditivos.formato.pontosBase },
  ];

  return (
    <div className={estilos.painel}>
      <dl className={estilos.resumo}>
        <div className={estilos.linhaResumo}>
          <dt className={estilos.rotulo}>{TEXTOS_CUB.projeto}</dt>
          <dd className={estilos.valor} data-testid="cub-projeto">
            {projeto}
          </dd>
          <dd className={estilos.detalhe}>{classificacao}</dd>
        </div>
        {resultado.situacao === 'calculado' && (
          <div className={estilos.linhaResumo}>
            <dt className={estilos.rotulo}>{TEXTOS_CUB.cubBase}</dt>
            <dd className={estilos.valor} data-testid="cub-base">
              {porM2(resultado.cubBaseCentavos)}
            </dd>
            <dd className={estilos.detalhe}>
              {TEXTOS_CUB.competencia} {competencia}
            </dd>
          </div>
        )}
      </dl>

      {resultado.situacao === 'pendente' && (
        <Alerta tom="atencao" titulo={TEXTOS_CUB.tituloPendencia}>
          <p className={estilos.paragrafo}>
            {resultado.motivo === 'padraoSemValorPublicado'
              ? TEXTOS_CUB.pendenciaPadraoSemValor(projeto)
              : TEXTOS_CUB.pendenciaProjetoSemTabela(projeto)}
          </p>
          <p className={estilos.paragrafo}>{TEXTOS_CUB.pendenciaRodape}</p>
        </Alerta>
      )}

      <table className={estilos.tabela}>
        <caption className={estilos.legenda}>{TEXTOS_CUB.aditivos}</caption>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.rotulo}>
              <th scope="row" className={estilos.celulaRotulo}>
                {linha.rotulo}
                <span className={estilos.celulaDetalhe}>{linha.detalhe}</span>
              </th>
              <td className={estilos.celulaValor}>{percentual(linha.valor)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className={estilos.celulaRotulo}>
              {TEXTOS_CUB.somaAditivos}
            </th>
            <td className={estilos.celulaValor} data-testid="cub-soma">
              {percentual(aditivos.somaPontosBase)}
            </td>
          </tr>
        </tfoot>
      </table>

      {resultado.situacao === 'calculado' && (
        <div className={estilos.ajustado}>
          <span className={estilos.rotulo}>{TEXTOS_CUB.cubAjustado}</span>
          <span className={estilos.valorDestaque} data-testid="cub-ajustado">
            {porM2(resultado.cubAjustadoCentavos)}
          </span>
          <details className={estilos.formula}>
            <summary>{TEXTOS_CUB.formula}</summary>
            <p>{TEXTOS_CUB.formulaNota}</p>
            <p>
              {TEXTOS_CUB.comSeusDados}{' '}
              <span className={estilos.conta}>
                {formatarMoeda(resultado.cubBaseCentavos)} × (1 + {percentual(aditivos.somaPontosBase)}) ={' '}
                {formatarMoeda(resultado.cubAjustadoCentavos)}
              </span>
            </p>
          </details>
        </div>
      )}

      <p className={estilos.competencia}>
        {TEXTOS_CUB.competencia} {competencia} · {TEXTOS_CUB.versaoBase} {versao.id}
        {versao.dataEmissao === null && ` · ${TEXTOS_CUB.emissaoNaoInformada}`}
      </p>
    </div>
  );
}
