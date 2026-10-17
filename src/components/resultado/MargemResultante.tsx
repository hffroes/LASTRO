import { Equal, TrendingDown, TrendingUp } from 'lucide-react';
import { OPCOES_PADRAO } from '../../content/produto';
import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { ResultadoEconomiaDto, SnapshotPremissas } from '../../types/analise';
import { formatarMoeda, formatarMoedaComSinal, formatarNumeroBr } from '../../utils/motor/formatacao';
// O mesmo cartão da leitura Terrenista: trocar a perspectiva troca o conteúdo, não o desenho nem a altura
// da primeira dobra.
import estilos from './PrecoMaximo.module.css';
import { FraseFixoResolvido } from './TogglePerspectiva';

type Leitura = 'acima' | 'abaixo' | 'igual';

const ICONES = { acima: TrendingUp, abaixo: TrendingDown, igual: Equal } as const;
// Os tons do cartão já existem para sobra, déficit e empate; acima, abaixo e igual são a mesma leitura.
const TOM: Record<Leitura, 'sobra' | 'deficit' | 'empate'> = { acima: 'sobra', abaixo: 'deficit', igual: 'empate' };

interface PropriedadesMargemResultante {
  economia: Pick<
    ResultadoEconomiaDto,
    'lucroResultanteCentavos' | 'lucroIncorporadorCentavos' | 'precoPedidoCentavos' | 'resultadoLiquidoCentavos' | 'percentuaisDoVgvPontosBase'
  >;
  premissas: Pick<SnapshotPremissas, 'lucroIncorporador'>;
}

// A primeira dobra na leitura Incorporador (PRD 2.6 e 4.1): o preço pedido fica fixo e a resposta é o lucro
// que sobra, Lucro Resultante = VGV − Obra − Despesas − Preço Pedido, vindo do servidor sem reinterpretar.
// A comparação com o lucro esperado do padrão é a sobra ou o déficit da outra leitura, com o mesmo valor:
// as duas perspectivas não podem contar histórias diferentes sobre a mesma conta.
export function MargemResultante({ economia, premissas }: PropriedadesMargemResultante) {
  const { margem: texto } = TEXTOS_RESULTADO;
  const diferencaCentavos = economia.resultadoLiquidoCentavos;
  const leitura: Leitura = diferencaCentavos > 0 ? 'acima' : diferencaCentavos < 0 ? 'abaixo' : 'igual';
  const Icone = ICONES[leitura];
  const margemPontosBase = economia.percentuaisDoVgvPontosBase.lucroResultante;
  const padrao = OPCOES_PADRAO.find((opcao) => opcao.valor === premissas.lucroIncorporador.padrao)?.rotulo ?? '—';
  const esperado = texto.esperado(
    padrao,
    formatarNumeroBr(premissas.lucroIncorporador.pontosBase),
    formatarMoeda(economia.lucroIncorporadorCentavos),
  );
  const prejuizo = economia.lucroResultanteCentavos < 0;

  return (
    <section className={estilos.bloco} aria-labelledby="titulo-margem-resultante" data-leitura={TOM[leitura]}>
      <h2 id="titulo-margem-resultante" className={estilos.titulo}>
        {texto.titulo}
      </h2>
      <FraseFixoResolvido perspectiva="incorporador" className={estilos.explicacao} />

      <p className={estilos.valorMaximo} data-testid="lucro-resultante" data-negativo={prejuizo ? 'true' : undefined}>
        {formatarMoedaComSinal(economia.lucroResultanteCentavos)}
      </p>

      <dl className={estilos.comparacao}>
        {margemPontosBase !== null && (
          <div>
            <dt>{texto.margem}</dt>
            <dd data-testid="margem-resultante">{formatarNumeroBr(margemPontosBase)}%</dd>
          </div>
        )}
        <div>
          <dt>{texto.preco}</dt>
          <dd data-testid="preco-pedido">{formatarMoeda(economia.precoPedidoCentavos)}</dd>
        </div>
      </dl>

      <div className={estilos.leitura} data-testid="leitura-margem">
        <Icone className={estilos.icone} size={22} strokeWidth={1.75} aria-hidden="true" />
        <div className={estilos.textosLeitura}>
          <p className={estilos.rotuloLeitura}>
            <strong data-testid="leitura-rotulo">{texto.leitura[leitura]}</strong>
            {leitura !== 'igual' && (
              <>
                {': '}
                <span className={estilos.valorLeitura} data-testid="leitura-valor">
                  {formatarMoeda(Math.abs(diferencaCentavos))}
                </span>
              </>
            )}
          </p>
          <p className={estilos.fraseLeitura}>{esperado}</p>
        </div>
      </div>

      {prejuizo && <p className={estilos.semMargem}>{texto.prejuizo}</p>}
      <p className={estilos.preliminar}>{TEXTOS_RESULTADO.precoMaximo.preliminar}</p>
    </section>
  );
}
