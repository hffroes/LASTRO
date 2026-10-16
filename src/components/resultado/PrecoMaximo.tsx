import { Equal, TrendingDown, TrendingUp } from 'lucide-react';
import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { ResultadoEconomiaDto } from '../../types/analise';
import { formatarMoeda, formatarMoedaComSinal } from '../../utils/motor/formatacao';
import estilos from './PrecoMaximo.module.css';

type Leitura = 'sobra' | 'deficit' | 'empate';

const ICONES = { sobra: TrendingUp, deficit: TrendingDown, empate: Equal } as const;

interface PropriedadesPrecoMaximo {
  economia: Pick<ResultadoEconomiaDto, 'resultadoTerrenoCentavos' | 'precoPedidoCentavos' | 'resultadoLiquidoCentavos'>;
}

// O essencial da análise, na primeira dobra (F14): quanto o terreno pode custar e como o preço pedido se
// compara. O preço máximo recomendado é exatamente o Resultado do Terreno da perspectiva Terrenista, e a
// sobra ou o déficit é o Resultado Líquido (PRD 4.1), sem arredondar nem reinterpretar. A diferença entre
// sobra e déficit vem de palavra, ícone e cor juntos: a cor nunca é o único sinal.
export function PrecoMaximo({ economia }: PropriedadesPrecoMaximo) {
  const { precoMaximo } = TEXTOS_RESULTADO;
  const liquido = economia.resultadoLiquidoCentavos;
  const leitura: Leitura = liquido > 0 ? 'sobra' : liquido < 0 ? 'deficit' : 'empate';
  const Icone = ICONES[leitura];
  const diferenca = formatarMoeda(Math.abs(liquido));
  const frase =
    leitura === 'empate' ? precoMaximo.frase.empate : precoMaximo.frase[leitura](diferenca);

  return (
    <section className={estilos.bloco} aria-labelledby="titulo-preco-maximo" data-leitura={leitura}>
      <h2 id="titulo-preco-maximo" className={estilos.titulo}>
        {precoMaximo.titulo}
      </h2>
      <p className={estilos.explicacao}>{precoMaximo.explicacao}</p>

      <p
        className={estilos.valorMaximo}
        data-testid="preco-maximo"
        data-negativo={economia.resultadoTerrenoCentavos < 0 ? 'true' : undefined}
      >
        {formatarMoedaComSinal(economia.resultadoTerrenoCentavos)}
      </p>

      <dl className={estilos.comparacao}>
        <div>
          <dt>{precoMaximo.preco}</dt>
          <dd data-testid="preco-pedido">{formatarMoeda(economia.precoPedidoCentavos)}</dd>
        </div>
      </dl>

      <div className={estilos.leitura} data-testid="leitura-sobra-deficit">
        <Icone className={estilos.icone} size={22} strokeWidth={1.75} aria-hidden="true" />
        <div className={estilos.textosLeitura}>
          <p className={estilos.rotuloLeitura}>
            <strong data-testid="leitura-rotulo">{precoMaximo.leitura[leitura]}</strong>
            {leitura !== 'empate' && (
              <>
                {': '}
                <span className={estilos.valorLeitura} data-testid="leitura-valor">
                  {diferenca}
                </span>
              </>
            )}
          </p>
          <p className={estilos.fraseLeitura}>{frase}</p>
        </div>
      </div>

      {/* Depois da leitura, para o preço máximo e a sobra ou o déficit ficarem juntos na primeira dobra. */}
      {economia.resultadoTerrenoCentavos < 0 && <p className={estilos.semMargem}>{precoMaximo.semMargem}</p>}
      <p className={estilos.preliminar}>{precoMaximo.preliminar}</p>
    </section>
  );
}
