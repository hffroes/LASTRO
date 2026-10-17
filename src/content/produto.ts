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
    cub: {
      titulo: 'Custo unitário da obra (CUB)',
      descricao:
        'O custo por m² vem da tabela CUB do Sinduscon-MG para o projeto que você descreveu, somado a quatro aditivos. O custo total da obra aparece no resultado.',
    },
    areas: {
      titulo: 'Áreas e indicadores urbanísticos',
      descricao:
        'Calculados a partir do que você informou, para conferir com o plano diretor e a lei de uso e ocupação do solo do seu município. A lastro não traz os limites de cada zona: valide estes números na legislação local.',
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
    taxaOcupacao: 'Taxa de ocupação (%)',
    dicaTaxaOcupacao:
      'Quanto do terreno a construção ocupa. O padrão da lastro é 60% (0,6) e é provisório: confira o do seu município. Escreva em porcentagem: 60, e não 0,6.',
    restaurarTaxa: 'Voltar ao padrão (60%)',
  },
  // PRD 3.3: as quatro áreas são distintas. Cada indicador traz a fórmula e, calculado, os números do usuário.
  indicadores: {
    areaUtilizada: {
      rotulo: 'Área utilizada do terreno',
      formula: 'Área total do terreno × taxa de ocupação',
      aguardando: 'Aparece com a taxa de ocupação válida.',
    },
    areaConstruida: {
      rotulo: 'Área total construída',
      formula: 'Área utilizada × número de pavimentos',
      aguardando: 'Aparece quando os pavimentos estiverem preenchidos.',
      nota: 'É nela que incide o custo de obra: inclui hall, corredores, escadas e elevadores.',
    },
    areaComercializavel: {
      rotulo: 'Área comercializável',
      formula: 'Total de unidades × área da unidade vendida',
      aguardando: 'Aparece quando as unidades e a área da unidade estiverem preenchidas.',
      nota: 'É a área que gera o VGV. Não é a área construída.',
    },
    coeficienteAproveitamento: {
      rotulo: 'Coeficiente de aproveitamento (CA) atingido',
      formula: 'Área total construída ÷ área total do terreno',
      aguardando: 'Aparece quando a área construída estiver calculada.',
      nota: 'Compare com o CA máximo que o plano diretor permite para a zona do terreno.',
    },
    coeficienteUnidades: {
      rotulo: 'Soma das unidades por pavimento ÷ área utilizada',
      formula: '(unidades por pavimento × área da unidade) ÷ área utilizada',
      aguardando: 'Aparece quando as unidades por pavimento e a área da unidade estiverem preenchidas.',
      nota: 'Soma a área de todas as unidades do pavimento, não de uma só. A referência é de 80% a 85%; o restante é hall, corredores, escadas e elevadores.',
    },
    comoCalculado: 'Como é calculado',
    comSeusDados: 'Com os seus dados:',
  },
} as const;

// PRD 3.1 e 3.2. O CUB Ajustado é CUB base × (1 + soma dos aditivos): uma multiplicação só.
export const TEXTOS_CUB = {
  aguardando: 'Aparece quando a tipologia, os pavimentos e o padrão estiverem preenchidos.',
  projeto: 'Projeto CUB',
  cubBase: 'CUB base',
  aditivos: 'Aditivos',
  somaAditivos: 'Soma dos aditivos',
  cubAjustado: 'CUB ajustado',
  formula: 'CUB base × (1 + soma dos aditivos)',
  formulaNota: 'Os quatro aditivos são somados e aplicados de uma vez sobre o CUB base, não um sobre o outro.',
  comSeusDados: 'Com os seus dados:',
  competencia: 'Base Sinduscon-MG, competência',
  versaoBase: 'versão',
  emissaoNaoInformada: 'data de emissão do boletim não informada',
  aditivoFundacao: 'Fundação',
  aditivoPadrao: 'Padrão de acabamento',
  aditivoTopografia: 'Topografia',
  aditivoFormato: 'Formato do lote',
  tituloPendencia: 'Sem CUB publicado para esta combinação',
  rotuloProjeto: (projeto: string, tipologia: string) => `${tipologia} → projeto ${projeto}`,
  // D-B4: a tabela não publica o padrão Baixo. A lastro não estima o valor.
  pendenciaPadraoSemValor: (projeto: string) =>
    `A tabela CUB do Sinduscon-MG não publica valor do padrão Baixo para o projeto ${projeto}. A lastro não estima um valor que o boletim não traz: com o padrão Normal ou Alto há CUB publicado.`,
  // D-B5: CAL-16 não existe na tabela.
  pendenciaProjetoSemTabela: (projeto: string) =>
    `A tabela CUB do Sinduscon-MG não tem o projeto ${projeto} (andares livres com mais de 8 pavimentos). A lastro não estima um valor que o boletim não traz.`,
  pendenciaRodape: 'Isso não é um erro no que você preencheu. As áreas e o programa seguem válidos.',
} as const;

// Faixas do aditivo de fundação, no vocabulário da tabela do PRD 3.2 A (D-R21: "até N" inclui N).
export const ROTULO_FAIXA_FUNDACAO = {
  umPavimento: '1 pavimento',
  doisOuMais: '2 ou mais pavimentos',
  ate4: 'até 4 pavimentos',
  de5a8: 'de 5 a 8 pavimentos',
  de9a16: 'de 9 a 16 pavimentos',
  acima16: 'mais de 16 pavimentos',
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
