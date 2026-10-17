import { TEXTOS_CUB } from '../../content/produto';
import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { RespostaAnalise } from '../../types/analise';
import { formatarNumeroBr } from '../../utils/motor/formatacao';
import { Expansivel } from '../ui/Expansivel';
import estilos from './PremissasUsadas.module.css';

type Calculado = Extract<RespostaAnalise, { situacao: 'calculado' }>;

const percentual = (pontosBase: number) => `${formatarNumeroBr(pontosBase)}%`;
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// O snapshot que acompanha a resposta (PRD 2.10 e 10.5): quais premissas e qual versão de dados valeram.
export function PremissasUsadas({ dados }: { dados: Calculado }) {
  const { premissas: texto, provisorio } = TEXTOS_RESULTADO;
  const { premissas } = dados;
  const { versaoBase } = premissas.cub;
  return (
    <Expansivel titulo={texto.titulo}>
      <dl className={estilos.lista}>
        <div>
          <dt>{texto.baseCub}</dt>
          <dd>
            Sinduscon-MG, competência {MESES[versaoBase.competencia.mes - 1]}/{versaoBase.competencia.ano} · versão {versaoBase.id}
            {versaoBase.dataEmissao === null && ` · ${TEXTOS_CUB.emissaoNaoInformada}`}
          </dd>
        </div>
        <div>
          <dt>{texto.taxaOcupacao}</dt>
          <dd>
            {percentual(premissas.taxaOcupacao.pontosBase)} (
            {premissas.taxaOcupacao.ajustadaPeloUsuario ? texto.taxaAjustada : texto.taxaPadrao}
            {premissas.taxaOcupacao.provisorio && !premissas.taxaOcupacao.ajustadaPeloUsuario ? `, ${provisorio}` : ''})
          </dd>
        </div>
        <div>
          <dt>{texto.lucro}</dt>
          <dd>
            {percentual(premissas.lucroIncorporador.pontosBase)} do VGV, padrão {premissas.lucroIncorporador.padrao}
            {premissas.lucroIncorporador.provisorio ? ` (${provisorio})` : ''}
          </dd>
        </div>
        <div>
          <dt>{texto.despesas}</dt>
          <dd>
            {percentual(premissas.despesasGerais.pontosBase)} do VGV{premissas.despesasGerais.provisorio ? ` (${provisorio})` : ''}
          </dd>
        </div>
        <div>
          <dt>{texto.versaoMotor}</dt>
          <dd>{premissas.versaoMotor}</dd>
        </div>
      </dl>
    </Expansivel>
  );
}
