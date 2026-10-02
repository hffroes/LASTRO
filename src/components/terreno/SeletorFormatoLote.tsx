import { OPCOES_FORMATO, TEXTOS_TERRENO } from '../../content/terreno';
import type { FormatoLote } from '../../types/terreno';
import { GrupoOpcoes } from '../ui/GrupoOpcoes';
import { IlustracaoFormatoLote } from './ilustracoes/IlustracaoFormatoLote';

interface PropriedadesSeletorFormatoLote {
  valor: FormatoLote | null;
  aoMudar: (formato: FormatoLote) => void;
  erro?: string;
}

export function SeletorFormatoLote({ valor, aoMudar, erro }: PropriedadesSeletorFormatoLote) {
  return (
    <GrupoOpcoes
      nome="formato"
      legenda={TEXTOS_TERRENO.campos.formato}
      opcoes={OPCOES_FORMATO}
      valor={valor}
      aoMudar={aoMudar}
      erro={erro}
      ilustracao={(formato) => <IlustracaoFormatoLote formato={formato} />}
    />
  );
}
