import { OPCOES_TIPO_PROJETO, OPCOES_TIPOLOGIA, TEXTOS_PRODUTO } from '../../content/produto';
import { TIPOLOGIAS_POR_TIPO, TIPO_PROJETO_PENDENTE } from '../../data/tipologias';
import type { Tipologia, TipoProjeto } from '../../types/produto';
import { GrupoOpcoes } from '../ui/GrupoOpcoes';
import estilos from './SeletorTipologia.module.css';

interface PropriedadesSeletorTipologia {
  tipoProjeto: TipoProjeto | null;
  tipologia: Tipologia | null;
  aoMudarTipoProjeto: (tipoProjeto: TipoProjeto) => void;
  aoMudarTipologia: (tipologia: Tipologia) => void;
  erroTipoProjeto?: string;
  erroTipologia?: string;
}

// Cascata do PRD 3.1: as tipologias oferecidas são só as do tipo escolhido, então nenhuma
// combinação fora da tabela CUB é selecionável.
export function SeletorTipologia({
  tipoProjeto,
  tipologia,
  aoMudarTipoProjeto,
  aoMudarTipologia,
  erroTipoProjeto,
  erroTipologia,
}: PropriedadesSeletorTipologia) {
  const { campos } = TEXTOS_PRODUTO;

  return (
    <>
      <GrupoOpcoes
        nome="tipoProjeto"
        legenda={campos.tipoProjeto}
        opcoes={OPCOES_TIPO_PROJETO}
        valor={tipoProjeto}
        aoMudar={(valor) => {
          // A opção pendente é um radio desabilitado; a guarda só existe para o tipo fechar.
          if (valor !== TIPO_PROJETO_PENDENTE) aoMudarTipoProjeto(valor);
        }}
        erro={erroTipoProjeto}
      />
      {tipoProjeto ? (
        <GrupoOpcoes
          nome="tipologia"
          legenda={campos.tipologia}
          opcoes={TIPOLOGIAS_POR_TIPO[tipoProjeto].map((valor) => OPCOES_TIPOLOGIA[valor])}
          valor={tipologia}
          aoMudar={aoMudarTipologia}
          erro={erroTipologia}
        />
      ) : (
        <p className={estilos.aguardando}>{campos.tipologiaAguardando}</p>
      )}
    </>
  );
}
