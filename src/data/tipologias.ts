// Taxonomia do PRD 3.1 em funções puras: a tela e, a partir da F13, o backend consultam o mesmo
// mapa, para uma combinação inexistente na tabela CUB nunca chegar ao cálculo.
import { TIPOLOGIAS, TIPOS_PROJETO, type DadosProduto, type Tipologia, type TipoProjeto } from '../types/produto';

export const TIPOLOGIAS_POR_TIPO: Readonly<Record<TipoProjeto, readonly Tipologia[]>> = {
  residencial: ['casa', 'predio'],
  comercial: ['salasLojas', 'andaresLivres'],
  galpoes: ['galpao'],
};

// D-B6 (pendente): o PRD 3.1 lista Uso Misto como tipo de projeto, mas nenhuma fonte o liga a um
// projeto CUB. Decidido na F09: aparece na tela desabilitado, com o motivo, e fica fora de
// TipoProjeto, para não haver como chegar ao cálculo sem custo de obra definido.
export const TIPO_PROJETO_PENDENTE = 'usoMisto';
export type TipoProjetoPendente = typeof TIPO_PROJETO_PENDENTE;

export function ehTipoProjeto(valor: unknown): valor is TipoProjeto {
  return TIPOS_PROJETO.includes(valor as TipoProjeto);
}

export function ehTipologia(valor: unknown): valor is Tipologia {
  return TIPOLOGIAS.includes(valor as Tipologia);
}

export function tipologiaPertenceAoTipo(tipoProjeto: TipoProjeto, tipologia: Tipologia): boolean {
  return TIPOLOGIAS_POR_TIPO[tipoProjeto].includes(tipologia);
}

// A tipologia depende do tipo, então trocar o tipo a invalida; o padrão é independente e fica.
// Tipo com uma tipologia só (Galpões) já a traz escolhida: não há o que o usuário decidir.
export function escolherTipoProjeto(produto: DadosProduto, tipoProjeto: TipoProjeto): DadosProduto {
  if (produto.tipoProjeto === tipoProjeto) return produto;
  const tipologias = TIPOLOGIAS_POR_TIPO[tipoProjeto];
  return { ...produto, tipoProjeto, tipologia: tipologias.length === 1 ? tipologias[0] : null };
}
