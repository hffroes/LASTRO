import { OPCOES_TOPOGRAFIA, TEXTOS_TERRENO } from '../../content/terreno';
import type { Topografia } from '../../types/terreno';
import { GrupoOpcoes } from '../ui/GrupoOpcoes';
import { IlustracaoTopografia } from './ilustracoes/IlustracaoTopografia';

interface PropriedadesSeletorTopografia {
  valor: Topografia | null;
  aoMudar: (topografia: Topografia) => void;
  erro?: string;
}

export function SeletorTopografia({ valor, aoMudar, erro }: PropriedadesSeletorTopografia) {
  return (
    <GrupoOpcoes
      nome="topografia"
      legenda={TEXTOS_TERRENO.campos.topografia}
      opcoes={OPCOES_TOPOGRAFIA}
      valor={valor}
      aoMudar={aoMudar}
      erro={erro}
      ilustracao={(topografia) => <IlustracaoTopografia topografia={topografia} />}
    />
  );
}
