import { TEXTOS_CUB } from '../../content/produto';
import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { RespostaAnalise } from '../../types/analise';
import { PREMISSAS_AJUSTAVEIS, type PremissaAjustavel } from '../../types/parametros';
import { formatarMoeda, formatarNumeroBr } from '../../utils/motor/formatacao';
import { Expansivel } from '../ui/Expansivel';
import estilos from './PremissasUsadas.module.css';

type Calculado = Extract<RespostaAnalise, { situacao: 'calculado' }>;

const percentual = (pontosBase: number) => `${formatarNumeroBr(pontosBase)}%`;
const valorDaPremissa = (premissa: PremissaAjustavel, valor: number) =>
  premissa === 'precoUnidade' ? formatarMoeda(valor) : premissa === 'cubAjustado' ? `${formatarMoeda(valor)}/m²` : percentual(valor);
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// O snapshot que acompanha a resposta (PRD 2.10 e 10.5): quais premissas e qual versão de dados valeram.
export function PremissasUsadas({ dados }: { dados: Calculado }) {
  const { premissas: texto, provisorio } = TEXTOS_RESULTADO;
  const { premissas } = dados;
  const { versaoBase } = premissas.cub;
  const ajustadas = PREMISSAS_AJUSTAVEIS.filter((premissa) => premissas.ajustes.premissas[premissa].ajustada);
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
        {/* F17 (PRD 10.5): o que foi ajustado no cenário, com o original ao lado. */}
        <div>
          <dt>{texto.ajustes}</dt>
          <dd data-testid="premissas-ajustes">
            {ajustadas.length === 0 ? (
              texto.semAjustes
            ) : (
              <ul className={estilos.ajustes}>
                {ajustadas.map((premissa) => {
                  const { usado, original } = premissas.ajustes.premissas[premissa];
                  return (
                    <li key={premissa}>
                      {TEXTOS_RESULTADO.cenarios.premissas[premissa].rotulo}:{' '}
                      {texto.ajusteDe(valorDaPremissa(premissa, usado), valorDaPremissa(premissa, original))}
                    </li>
                  );
                })}
              </ul>
            )}
          </dd>
        </div>
      </dl>
    </Expansivel>
  );
}
