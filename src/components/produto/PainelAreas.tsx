import { TEXTOS_PRODUTO } from '../../content/produto';
import type { DadosProduto } from '../../types/produto';
import type { EntradaAreas, ResultadoAreas } from '../../utils/motor/areas';
import {
  areaParaCentesimos,
  formatarArea,
  formatarInteiroBr,
  formatarNumeroBr,
  type LeituraNumero,
} from '../../utils/motor/formatacao';
import { TAXA_OCUPACAO_PADRAO } from '../../utils/motor/parametros';
import type { CampoEtapaProduto } from '../../utils/validacao/produto';
import { Botao } from '../ui/Botao';
import { Campo } from '../ui/Campo';
import { EntradaNumero } from '../ui/CampoNumero';
import estilos from './PainelAreas.module.css';

interface PropriedadesPainelAreas {
  produto: DadosProduto;
  entrada: EntradaAreas;
  resultado: ResultadoAreas;
  erroVisivel: (campo: CampoEtapaProduto) => string | undefined;
  aoMudar: (dados: Partial<Omit<DadosProduto, 'tipoProjeto'>>) => void;
  /** Registra a leitura (legível ou não) e devolve o número a guardar, ou null. */
  aoLer: (campo: 'taxaOcupacao', leitura: LeituraNumero) => number | null;
  aoSair: (campo: CampoEtapaProduto) => void;
}

interface Indicador {
  id: string;
  rotulo: string;
  /** Já formatado; null enquanto faltam insumos. */
  valor: string | null;
  formula: string;
  aguardando: string;
  nota?: string;
  /** Conta com os números do usuário; só existe com o indicador calculado. */
  comSeusDados: string | null;
}

const percentual = (pontosBase: number) => `${formatarNumeroBr(pontosBase)}%`;

function montarIndicadores(entrada: EntradaAreas, r: ResultadoAreas): Indicador[] {
  const { indicadores } = TEXTOS_PRODUTO;
  const terreno = entrada.areaTerrenoM2 === null ? null : formatarArea(areaParaCentesimos(entrada.areaTerrenoM2));
  const areaUnidade = entrada.areaUnidadeM2 === null ? null : formatarArea(areaParaCentesimos(entrada.areaUnidadeM2));
  const utilizada = r.areaUtilizadaCentesimos === null ? null : formatarArea(r.areaUtilizadaCentesimos);
  const construida = r.areaConstruidaCentesimos === null ? null : formatarArea(r.areaConstruidaCentesimos);
  const comercializavel = r.areaComercializavelCentesimos === null ? null : formatarArea(r.areaComercializavelCentesimos);
  const ca = r.coeficienteAproveitamentoCentesimos === null ? null : formatarNumeroBr(r.coeficienteAproveitamentoCentesimos);
  const coeficiente = r.coeficienteUnidadesPontosBase === null ? null : percentual(r.coeficienteUnidadesPontosBase);

  const lista: Indicador[] = [
    {
      id: 'area-utilizada',
      ...indicadores.areaUtilizada,
      valor: utilizada,
      comSeusDados:
        utilizada && terreno && entrada.taxaOcupacaoPontosBase !== null
          ? `${terreno} × ${percentual(entrada.taxaOcupacaoPontosBase)} = ${utilizada}`
          : null,
    },
    {
      id: 'area-construida',
      ...indicadores.areaConstruida,
      valor: construida,
      comSeusDados:
        construida && utilizada && entrada.pavimentos !== null
          ? `${utilizada} × ${formatarInteiroBr(entrada.pavimentos)} pavimento${entrada.pavimentos === 1 ? '' : 's'} = ${construida}`
          : null,
    },
    {
      id: 'area-comercializavel',
      ...indicadores.areaComercializavel,
      valor: comercializavel,
      comSeusDados:
        comercializavel && areaUnidade && entrada.totalUnidades !== null
          ? `${formatarInteiroBr(entrada.totalUnidades)} unidade${entrada.totalUnidades === 1 ? '' : 's'} × ${areaUnidade} = ${comercializavel}`
          : null,
    },
    {
      id: 'coeficiente-aproveitamento',
      ...indicadores.coeficienteAproveitamento,
      valor: ca,
      comSeusDados: ca && construida && terreno ? `${construida} ÷ ${terreno} = ${ca}` : null,
    },
  ];

  // Casa não tem o coeficiente das unidades (PRD 3.3): o indicador some, em vez de aparecer vazio.
  if (entrada.aplicaCoeficienteUnidades) {
    const somaUnidades =
      entrada.unidadesPorPavimento !== null && entrada.areaUnidadeM2 !== null
        ? formatarArea(entrada.unidadesPorPavimento * areaParaCentesimos(entrada.areaUnidadeM2))
        : null;
    lista.push({
      id: 'coeficiente-unidades',
      ...indicadores.coeficienteUnidades,
      valor: coeficiente,
      comSeusDados:
        coeficiente && somaUnidades && utilizada && entrada.unidadesPorPavimento !== null && areaUnidade
          ? `${formatarInteiroBr(entrada.unidadesPorPavimento)} × ${areaUnidade} = ${somaUnidades}; ${somaUnidades} ÷ ${utilizada} = ${coeficiente}`
          : null,
    });
  }
  return lista;
}

// PRD 2.2 e 3.3: taxa de ocupação ajustável e os indicadores que o usuário valida contra o plano
// diretor. Cada número traz a fórmula, e, calculado, a conta com os dados dele.
export function PainelAreas({ produto, entrada, resultado, erroVisivel, aoMudar, aoLer, aoSair }: PropriedadesPainelAreas) {
  const { campos, indicadores } = TEXTOS_PRODUTO;
  const indicadoresVisiveis = montarIndicadores(entrada, resultado);
  const noPadrao = produto.taxaOcupacaoPontosBase === TAXA_OCUPACAO_PADRAO.valor;

  return (
    <>
      <Campo id="campo-taxaOcupacao" rotulo={campos.taxaOcupacao} erro={erroVisivel('taxaOcupacao')} dica={campos.dicaTaxaOcupacao}>
        {(controle) => (
          <EntradaNumero
            {...controle}
            name="taxaOcupacao"
            sufixo="%"
            placeholder="0,00"
            obrigatorio
            valor={produto.taxaOcupacaoPontosBase}
            aoMudar={(leitura) => aoMudar({ taxaOcupacaoPontosBase: aoLer('taxaOcupacao', leitura) })}
            aoSair={() => aoSair('taxaOcupacao')}
          />
        )}
      </Campo>
      {!noPadrao && (
        <div className={estilos.restaurar}>
          <Botao
            variante="fantasma"
            onClick={() => {
              aoLer('taxaOcupacao', { tipo: 'valido', unidadesMenores: TAXA_OCUPACAO_PADRAO.valor });
              aoMudar({ taxaOcupacaoPontosBase: TAXA_OCUPACAO_PADRAO.valor });
            }}
          >
            {campos.restaurarTaxa}
          </Botao>
        </div>
      )}

      <dl className={estilos.lista}>
        {indicadoresVisiveis.map((indicador) => (
          <div key={indicador.id} className={estilos.item} data-vazio={indicador.valor === null ? 'true' : undefined}>
            <dt className={estilos.rotulo}>{indicador.rotulo}</dt>
            <dd className={estilos.valor} data-testid={indicador.id}>
              {indicador.valor ?? '—'}
            </dd>
            <dd className={estilos.detalhe}>
              {indicador.valor === null && <span className={estilos.aguardando}>{indicador.aguardando}</span>}
              {indicador.nota && <span className={estilos.nota}>{indicador.nota}</span>}
              <details className={estilos.formula}>
                <summary>{indicadores.comoCalculado}</summary>
                <p>{indicador.formula}</p>
                {indicador.comSeusDados && (
                  <p>
                    {indicadores.comSeusDados} <span className={estilos.conta}>{indicador.comSeusDados}</span>
                  </p>
                )}
              </details>
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
