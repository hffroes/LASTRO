import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { ResultadoEconomiaDto, SnapshotPremissas } from '../../types/analise';
import { formatarMoedaComSinal, formatarNumeroBr } from '../../utils/motor/formatacao';
import { Alerta } from '../ui/Alerta';
import { Expansivel } from '../ui/Expansivel';
import estilos from './DetalheDespesas.module.css';

interface PropriedadesDetalheDespesas {
  economia: ResultadoEconomiaDto;
  premissas: SnapshotPremissas;
}

const percentual = (pontosBase: number) => `${formatarNumeroBr(pontosBase)}%`;

// O detalhe das despesas gerais: a tabela mostra uma linha só ("Despesas gerais (11,00%)") e aqui estão
// os itens que a compõem (D-R26), mais o item que a fonte lista fora do total e a divergência de 12,0%
// contra 11,0% (D-B2). Os itens vão em percentual: o valor em reais é o da linha da tabela, e somar itens
// arredondados um a um poderia divergir dele por centavos.
export function DetalheDespesas({ economia, premissas }: PropriedadesDetalheDespesas) {
  const { despesas: texto } = TEXTOS_RESULTADO;
  const { despesasGerais } = premissas;
  // F17: com as despesas ajustadas, os itens e a divergência continuam sendo os do padrão da lastro; o
  // total do cenário é o ajustado, e a tela diz que os itens não o compõem.
  const cenario = premissas.ajustes.premissas.despesasGerais;
  const totalPadrao = cenario.original;
  const rotulo = (chave: string) => texto.rotulos[chave] ?? chave;
  const divergencia = texto.divergencia
    .replace('{soma}', percentual(despesasGerais.somaItemizacaoPontosBase))
    .replace('{total}', percentual(totalPadrao));
  const temDivergencia = despesasGerais.somaItemizacaoPontosBase !== totalPadrao;

  return (
    <Expansivel titulo={texto.titulo}>
      {cenario.ajustada && (
        <Alerta tom="info" titulo={texto.ajustadaTitulo}>
          {texto.ajustada(percentual(cenario.usado), percentual(totalPadrao))}
        </Alerta>
      )}
      <p className={estilos.introducao}>{texto.introducao}</p>
      <dl className={estilos.lista} data-testid="detalhe-despesas">
        {Object.entries(despesasGerais.componentesAplicados).map(([chave, pontosBase]) => (
          <div key={chave} className={estilos.item}>
            <dt>{rotulo(chave)}</dt>
            <dd data-testid={`despesa-${chave}`}>{percentual(pontosBase)}</dd>
          </div>
        ))}
        <div className={`${estilos.item} ${estilos.total}`}>
          <dt>{texto.total}</dt>
          <dd data-testid="despesa-total">
            {cenario.ajustada
              ? percentual(totalPadrao)
              : `${percentual(despesasGerais.pontosBase)} · ${formatarMoedaComSinal(economia.despesasGeraisCentavos)}`}
          </dd>
        </div>
      </dl>

      {Object.keys(despesasGerais.foraDoTotal).length > 0 && (
        <div>
          <p className={estilos.subtitulo}>{texto.foraDoTotal}</p>
          <dl className={estilos.lista}>
            {Object.entries(despesasGerais.foraDoTotal).map(([chave, pontosBase]) => (
              <div key={chave} className={estilos.item}>
                <dt>{rotulo(chave)}</dt>
                <dd data-testid={`despesa-fora-${chave}`}>
                  {percentual(pontosBase)} · {texto.foraDoTotalNota}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {temDivergencia && (
        <Alerta tom="atencao" titulo={texto.divergenciaTitulo}>
          {divergencia}
        </Alerta>
      )}
    </Expansivel>
  );
}
