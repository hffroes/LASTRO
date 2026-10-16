// Etapa 2 do PRD (2.2): classificação do empreendimento. Tipo + tipologia (+ faixa de pavimentos, na
// F10) são a chave do projeto CUB; o padrão é a coluna da tabela (PRD 3.1). Nenhuma opção existe aqui
// sem linha correspondente lá, e nenhum percentual mora aqui.
export type TipoProjeto = 'residencial' | 'comercial' | 'galpoes';
export const TIPOS_PROJETO: readonly TipoProjeto[] = ['residencial', 'comercial', 'galpoes'];

export type Tipologia = 'casa' | 'predio' | 'salasLojas' | 'andaresLivres' | 'galpao';
export const TIPOLOGIAS: readonly Tipologia[] = ['casa', 'predio', 'salasLojas', 'andaresLivres', 'galpao'];

// Decide os percentuais de terreno e lucro sobre o VGV e o aditivo de padrão, iguais para todas as
// tipologias (PRD 3.1 e 3.2 B).
export type PadraoAcabamento = 'baixo' | 'normal' | 'alto';
export const PADROES_ACABAMENTO: readonly PadraoAcabamento[] = ['baixo', 'normal', 'alto'];

export interface DadosProduto {
  // null até o usuário escolher: não existe tipo, tipologia nem padrão padrão.
  tipoProjeto: TipoProjeto | null;
  // Só vale se pertencer ao tipo (data/tipologias.ts); trocar o tipo a apaga.
  tipologia: Tipologia | null;
  padrao: PadraoAcabamento | null;
}

export function criarProdutoVazio(): DadosProduto {
  return { tipoProjeto: null, tipologia: null, padrao: null };
}
