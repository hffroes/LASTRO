import { OPCOES_PADRAO, TEXTOS_PRODUTO } from '../../content/produto';
import type { PadraoAcabamento } from '../../types/produto';
import { GrupoOpcoes } from '../ui/GrupoOpcoes';

interface PropriedadesSeletorPadrao {
  valor: PadraoAcabamento | null;
  aoMudar: (padrao: PadraoAcabamento) => void;
  erro?: string;
}

export function SeletorPadrao({ valor, aoMudar, erro }: PropriedadesSeletorPadrao) {
  return (
    <GrupoOpcoes
      nome="padrao"
      legenda={TEXTOS_PRODUTO.campos.padrao}
      opcoes={OPCOES_PADRAO}
      valor={valor}
      aoMudar={aoMudar}
      erro={erro}
    />
  );
}
