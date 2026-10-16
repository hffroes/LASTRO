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
  // Programa do empreendimento (F10). Contagens inteiras; área em m² com até duas casas; dinheiro em
  // centavos inteiros, como no terreno. null = não informado (ou digitado num formato ilegível).
  // O que a tipologia trava (unidades da casa, pavimentos do galpão) não é lido daqui: vem de
  // utils/motor/produto.ts, e o que o usuário digitou antes da trava fica guardado para quando ela sair.
  pavimentos: number | null;
  unidadesPorPavimento: number | null;
  areaUnidadeM2: number | null;
  precoUnidadeCentavos: number | null;
}

export function criarProdutoVazio(): DadosProduto {
  return {
    tipoProjeto: null,
    tipologia: null,
    padrao: null,
    pavimentos: null,
    unidadesPorPavimento: null,
    areaUnidadeM2: null,
    precoUnidadeCentavos: null,
  };
}
