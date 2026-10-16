import { MOTIVO_PAVIMENTOS_FIXOS, MOTIVO_UNIDADE_UNICA, TEXTOS_PRODUTO } from '../../content/produto';
import { ehUnidadeUnica, pavimentosFixos } from '../../data/tipologias';
import type { DadosProduto } from '../../types/produto';
import { areaParaCentesimos, formatarInteiroBr, formatarMoeda, type LeituraNumero } from '../../utils/motor/formatacao';
import type { CampoEtapaProduto } from '../../utils/validacao/produto';
import { Campo } from '../ui/Campo';
import { CampoCalculado } from '../ui/CampoCalculado';
import { EntradaMoeda } from '../ui/CampoMoeda';
import { EntradaNumero } from '../ui/CampoNumero';

export type CampoNumericoProduto = 'pavimentos' | 'unidadesPorPavimento' | 'areaUnidade' | 'precoUnidade';

interface PropriedadesProgramaEmpreendimento {
  produto: DadosProduto;
  /** Já calculados pela página, que sabe se os insumos são válidos; null = faltam insumos. */
  totalUnidades: number | null;
  precoM2VendidoCentavos: number | null;
  erroVisivel: (campo: CampoEtapaProduto) => string | undefined;
  aoMudar: (dados: Partial<Omit<DadosProduto, 'tipoProjeto'>>) => void;
  /** Registra a leitura (legível ou não) e devolve o número a guardar, ou null. */
  aoLer: (campo: CampoNumericoProduto, leitura: LeituraNumero) => number | null;
  aoSair: (campo: CampoEtapaProduto) => void;
}

// PRD 2.2, Etapa 2: o programa e os dois derivados (total de unidades e preço por m² vendido). O que
// a tipologia trava aparece como valor fixo com o motivo, nunca como campo desabilitado mudo.
export function ProgramaEmpreendimento({
  produto,
  totalUnidades,
  precoM2VendidoCentavos,
  erroVisivel,
  aoMudar,
  aoLer,
  aoSair,
}: PropriedadesProgramaEmpreendimento) {
  const { campos } = TEXTOS_PRODUTO;
  const pavimentosTravados = pavimentosFixos(produto.tipologia);
  const unidadeUnica = ehUnidadeUnica(produto.tipologia);
  const motivoUnidadeUnica = produto.tipologia ? MOTIVO_UNIDADE_UNICA[produto.tipologia] : undefined;
  const motivoPavimentos = produto.tipologia ? MOTIVO_PAVIMENTOS_FIXOS[produto.tipologia] : undefined;

  return (
    <>
      {pavimentosTravados !== null ? (
        <CampoCalculado
          id="campo-pavimentos"
          rotulo={campos.pavimentos}
          valor={formatarInteiroBr(pavimentosTravados)}
          formula={motivoPavimentos ?? ''}
          textoAguardando=""
          travado
        />
      ) : (
        <Campo id="campo-pavimentos" rotulo={campos.pavimentos} erro={erroVisivel('pavimentos')} dica={campos.dicaPavimentos}>
          {(controle) => (
            <EntradaNumero
              {...controle}
              name="pavimentos"
              inteiro
              obrigatorio
              placeholder="0"
              valor={produto.pavimentos}
              aoMudar={(leitura) => aoMudar({ pavimentos: aoLer('pavimentos', leitura) })}
              aoSair={() => aoSair('pavimentos')}
            />
          )}
        </Campo>
      )}

      {unidadeUnica ? (
        <CampoCalculado
          id="campo-unidadesPorPavimento"
          rotulo={campos.unidadesPorPavimento}
          valor={formatarInteiroBr(1)}
          formula={motivoUnidadeUnica ?? ''}
          textoAguardando=""
          travado
        />
      ) : (
        <Campo
          id="campo-unidadesPorPavimento"
          rotulo={campos.unidadesPorPavimento}
          erro={erroVisivel('unidadesPorPavimento')}
          dica={campos.dicaUnidadesPorPavimento}
        >
          {(controle) => (
            <EntradaNumero
              {...controle}
              name="unidadesPorPavimento"
              inteiro
              obrigatorio
              placeholder="0"
              valor={produto.unidadesPorPavimento}
              aoMudar={(leitura) => aoMudar({ unidadesPorPavimento: aoLer('unidadesPorPavimento', leitura) })}
              aoSair={() => aoSair('unidadesPorPavimento')}
            />
          )}
        </Campo>
      )}

      <CampoCalculado
        id="campo-total-unidades"
        rotulo={campos.totalUnidades}
        valor={totalUnidades === null ? null : formatarInteiroBr(totalUnidades)}
        formula={unidadeUnica ? campos.totalUnidadesUnica : campos.formulaTotalUnidades}
        textoAguardando={campos.totalUnidadesAguardando}
      />

      <Campo id="campo-areaUnidade" rotulo={campos.areaUnidade} erro={erroVisivel('areaUnidade')} dica={campos.dicaAreaUnidade}>
        {(controle) => (
          <EntradaNumero
            {...controle}
            name="areaUnidade"
            sufixo="m²"
            placeholder="0,00"
            obrigatorio
            valor={produto.areaUnidadeM2 === null ? null : areaParaCentesimos(produto.areaUnidadeM2)}
            aoMudar={(leitura) => {
              const centesimos = aoLer('areaUnidade', leitura);
              aoMudar({ areaUnidadeM2: centesimos === null ? null : centesimos / 100 });
            }}
            aoSair={() => aoSair('areaUnidade')}
          />
        )}
      </Campo>

      <Campo id="campo-precoUnidade" rotulo={campos.precoUnidade} erro={erroVisivel('precoUnidade')} dica={campos.dicaPrecoUnidade}>
        {(controle) => (
          <EntradaMoeda
            {...controle}
            name="precoUnidade"
            obrigatorio
            valor={produto.precoUnidadeCentavos}
            aoMudar={(leitura) => aoMudar({ precoUnidadeCentavos: aoLer('precoUnidade', leitura) })}
            aoSair={() => aoSair('precoUnidade')}
          />
        )}
      </Campo>

      <CampoCalculado
        id="campo-preco-m2-vendido"
        rotulo={campos.precoM2Vendido}
        valor={precoM2VendidoCentavos === null ? null : `${formatarMoeda(precoM2VendidoCentavos)}/m²`}
        formula={campos.formulaPrecoM2Vendido}
        textoAguardando={campos.precoM2VendidoAguardando}
      />
    </>
  );
}
