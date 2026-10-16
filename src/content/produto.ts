// Copy da etapa Produto fora do componente, como no Terreno: a revisão de texto (D-A8) mexe só aqui.
// As mensagens de erro ficam em utils/validacao, porque o backend também as usa.
import type { OpcaoEscolha } from '../components/ui/GrupoOpcoes';
import type { TipoProjetoPendente } from '../data/tipologias';
import type { PadraoAcabamento, Tipologia, TipoProjeto } from '../types/produto';

export const TEXTOS_PRODUTO = {
  sobretitulo: 'Etapa 2 de 3',
  titulo: 'Produto',
  introducao: 'Agora, o que você quer construir no terreno.',
  secoes: {
    classificacao: {
      titulo: 'Tipo e tipologia',
      descricao: 'Junto com o número de pavimentos, definem qual tabela de custo de obra (CUB Sinduscon-MG) vale para o projeto.',
    },
    padrao: {
      titulo: 'Padrão de acabamento',
      descricao:
        'Muda o custo da obra por m² e as fatias do VGV reservadas ao terreno e ao lucro, da mesma forma para qualquer tipologia.',
    },
    programa: {
      titulo: 'Programa do empreendimento',
      descricao: 'Quantas unidades, de que tamanho e a que preço. O VGV sai daqui: unidades × preço de venda de cada uma.',
    },
  },
  campos: {
    tipoProjeto: 'Tipo de projeto',
    tipologia: 'Tipologia do empreendimento',
    tipologiaAguardando: 'Escolha o tipo de projeto para ver as tipologias.',
    padrao: 'Padrão de acabamento',
    pavimentos: 'Número de pavimentos',
    dicaPavimentos: 'Contando o térreo. Ex.: 4',
    unidadesPorPavimento: 'Unidades por pavimento',
    dicaUnidadesPorPavimento: 'Apartamentos, salas ou lojas em cada pavimento.',
    totalUnidades: 'Total de unidades',
    formulaTotalUnidades: 'Calculado: pavimentos × unidades por pavimento.',
    totalUnidadesAguardando: 'Aparece quando os pavimentos e as unidades por pavimento estiverem preenchidos.',
    totalUnidadesUnica: 'Uma unidade só, pela tipologia escolhida.',
    // A unidade vai no rótulo, e não só no afixo visual, para o leitor de tela também a anunciar.
    areaUnidade: 'Área da unidade vendida (m²)',
    dicaAreaUnidade: 'A área de uma unidade — casa, apartamento, sala, loja ou galpão —, não a área construída do empreendimento.',
    precoUnidade: 'Preço de venda da unidade (R$)',
    dicaPrecoUnidade: 'O preço de uma unidade, não o total do empreendimento.',
    precoM2Vendido: 'Preço por m² vendido',
    // PRD 2.2 e 3.4: o número volta para o usuário confrontar com o mercado; a lastro não o julga.
    formulaPrecoM2Vendido:
      'Calculado: preço da unidade ÷ área da unidade, arredondado ao centavo. Compare com o mercado da região: a lastro não consulta base de preços.',
    precoM2VendidoAguardando: 'Aparece quando a área e o preço da unidade estiverem preenchidos.',
  },
} as const;

// Campos travados pela tipologia explicam o motivo em vez de só desabilitar (aceite de UX da F10).
// PRD 2.2: Casa e Galpões são uma unidade só.
export const MOTIVO_UNIDADE_UNICA: Readonly<Partial<Record<Tipologia, string>>> = {
  casa: 'Casa (unifamiliar) é uma moradia só: 1 unidade, qualquer que seja o número de pavimentos.',
  galpao: 'Galpão é uma edificação só: 1 unidade.',
};

// D-R19: o PRD 3.1 só tem custo de obra (CUB) de galpão com 1 pavimento.
export const MOTIVO_PAVIMENTOS_FIXOS: Readonly<Partial<Record<Tipologia, string>>> = {
  galpao: 'Galpão tem 1 pavimento: é a única faixa com custo de obra (CUB) para galpões.',
};

// PRD 2.2 e 3.1. Uso Misto entra desabilitado, com o motivo à vista (D-B6, decidido na F09).
export const OPCOES_TIPO_PROJETO: readonly OpcaoEscolha<TipoProjeto | TipoProjetoPendente>[] = [
  { valor: 'residencial', rotulo: 'Residencial', descricao: 'Casa ou prédio de apartamentos.' },
  { valor: 'comercial', rotulo: 'Comercial', descricao: 'Edifício de salas e lojas ou de andares livres.' },
  { valor: 'galpoes', rotulo: 'Galpões', descricao: 'Galpão industrial, comercial ou logístico.' },
  {
    valor: 'usoMisto',
    rotulo: 'Uso misto',
    descricao: 'Em definição: ainda não há tabela de custo (CUB) para uso misto. Disponível numa próxima versão.',
    desabilitada: true,
  },
];

// Rótulos da tabela de mapeamento do PRD 3.1; dentro do tipo, o prefixo "Comercial —" é redundante.
export const OPCOES_TIPOLOGIA: Readonly<Record<Tipologia, OpcaoEscolha<Tipologia>>> = {
  casa: { valor: 'casa', rotulo: 'Casa (unifamiliar)', descricao: 'Uma única moradia, térrea ou sobrado.' },
  predio: { valor: 'predio', rotulo: 'Prédio (multifamiliar)', descricao: 'Vários apartamentos no mesmo edifício.' },
  salasLojas: {
    valor: 'salasLojas',
    rotulo: 'Salas e lojas',
    descricao: 'Pavimentos divididos em salas e lojas independentes.',
  },
  andaresLivres: {
    valor: 'andaresLivres',
    rotulo: 'Andares livres',
    descricao: 'Andares corridos, sem divisões internas.',
  },
  galpao: {
    valor: 'galpao',
    rotulo: 'Galpões industriais, comerciais e logísticos',
    descricao: 'Única tipologia deste tipo de projeto.',
  },
};

// PRD 3.2 B, coluna "Escopo coberto": o que cada padrão prevê, nas palavras da tabela, sem os
// percentuais (que entram com o cálculo, na F12).
export const OPCOES_PADRAO: readonly OpcaoEscolha<PadraoAcabamento>[] = [
  { valor: 'baixo', rotulo: 'Baixo', descricao: 'Prevê projetos e especialidades mínimas.' },
  { valor: 'normal', rotulo: 'Normal', descricao: 'Prevê projetos, elevadores, urbanismo e afins.' },
  {
    valor: 'alto',
    rotulo: 'Alto',
    descricao: 'Prevê projetos, múltiplos elevadores, lazer, sistemas especiais e acabamentos premium.',
  },
];
