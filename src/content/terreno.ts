// Copy da etapa Terreno fora do componente, como no onboarding: a revisão de texto (D-A8) mexe só
// aqui. As mensagens de erro ficam em utils/validacao, porque o backend também as usa.
import type { ObjetivoAnalise } from '../types/analise';
import type { FormatoLote, Topografia } from '../types/terreno';
import type { OpcaoEscolha } from '../components/ui/GrupoOpcoes';

export const TEXTOS_TERRENO = {
  sobretitulo: 'Etapa 1 de 3',
  titulo: 'Terreno',
  introducao: 'Comece pelo que você quer decidir. Depois, identifique o terreno.',
  secoes: {
    objetivo: {
      titulo: 'Objetivo da análise',
      descricao: 'Define por qual lado a lastro lê a conta e como a recomendação é escrita.',
    },
    identificacao: {
      titulo: 'Identificação e localização',
    },
    fisicos: {
      titulo: 'Dados físicos e financeiros',
      descricao: 'A área e o preço pedido. O preço por m² é calculado a partir deles.',
    },
    lote: {
      titulo: 'Características do lote',
      descricao:
        'Os dois ajustam a estimativa de custo da obra. Os desenhos são esquemáticos: escolha o que mais se aproxima do seu terreno.',
    },
  },
  campos: {
    objetivo: 'O que você quer decidir?',
    nome: 'Nome ou identificação do terreno',
    dicaNome: 'Aparece no relatório exportado. Ex.: Lote 12, Qd. 4 — Rua Alagoas.',
    cidade: 'Cidade',
    dicaCidade: 'Digite para buscar entre os municípios de Minas Gerais.',
    cidadeSemResultado: 'Nenhum município de Minas Gerais com esse nome.',
    cep: 'CEP (opcional)',
    dicaCep: 'Com os 8 dígitos, a lastro preenche cidade, logradouro e bairro.',
    logradouro: 'Logradouro (opcional)',
    bairro: 'Bairro (opcional)',
    // A unidade vai no rótulo, e não só no afixo visual, para o leitor de tela também a anunciar.
    area: 'Área total do terreno (m²)',
    dicaArea: 'A área do lote inteiro, como na matrícula ou no levantamento. Ex.: 1.250,50',
    preco: 'Preço pedido pelo terreno (R$)',
    dicaPreco: 'O valor total pedido pelo terreno, não o valor por m².',
    precoUnitario: 'Preço por m² do terreno',
    formulaPrecoUnitario: 'Calculado: preço pedido ÷ área total, arredondado ao centavo.',
    precoUnitarioAguardando: 'Aparece quando a área e o preço estiverem preenchidos.',
    // O ponto de vista vai na legenda: planta e corte são leituras diferentes do mesmo desenho.
    formato: 'Formato do lote (visto de cima)',
    topografia: 'Topografia (perfil do terreno em corte)',
  },
  // Situação da consulta do CEP (PRD 3.4): nenhuma delas impede avançar.
  statusCep: {
    consultando: 'Consultando o CEP…',
    preenchido: 'Endereço preenchido pelo CEP. Confira e ajuste se precisar.',
    naoEncontrado: 'CEP não encontrado. Confira os números ou preencha o endereço à mão.',
    indisponivel: 'A consulta de CEP não respondeu agora. Preencha o endereço à mão; isso não impede a análise.',
  },
} as const;

// PRD 2.6: as duas perguntas do produto, na voz do usuário.
export const OPCOES_OBJETIVO: readonly OpcaoEscolha<ObjetivoAnalise>[] = [
  {
    valor: 'comprarTerreno',
    rotulo: 'Comprar o terreno',
    descricao: 'Quero saber se vale adquirir o terreno pelo preço pedido.',
  },
  {
    valor: 'executarEmpreendimento',
    rotulo: 'Executar o empreendimento',
    descricao: 'Já tenho o terreno, ou o preço está definido, e quero saber se vale construir.',
  },
];

// PRD 3.2 D e C: os rótulos são os da tabela de aditivos, sem sinônimos. As frases são qualitativas
// de propósito: o PRD não define limiar de desnível nem de ângulo, e a lastro não inventa um.
export const OPCOES_FORMATO: readonly OpcaoEscolha<FormatoLote>[] = [
  {
    valor: 'regular',
    rotulo: 'Regular',
    descricao: 'Retângulo ou quadrado, com lados retos e cantos em ângulo reto.',
  },
  {
    valor: 'irregular',
    rotulo: 'Irregular',
    descricao: 'Foge do retângulo: lados inclinados ou de tamanhos diferentes, em L, trapézio ou com recortes.',
  },
];

export const OPCOES_TOPOGRAFIA: readonly OpcaoEscolha<Topografia>[] = [
  {
    valor: 'plana',
    rotulo: 'Plana',
    descricao: 'Praticamente sem desnível: o terreno fica no mesmo nível de ponta a ponta.',
  },
  {
    valor: 'regular',
    rotulo: 'Regular',
    descricao: 'Desnível suave e contínuo, numa só direção: um aclive ou declive leve.',
  },
  {
    valor: 'irregular',
    rotulo: 'Irregular',
    descricao: 'Desníveis variados, com trechos mais altos e mais baixos ao longo do terreno.',
  },
  {
    valor: 'acidentada',
    rotulo: 'Acidentada',
    descricao: 'Desnível forte, com encosta íngreme, que costuma exigir cortes, aterros ou contenções.',
  },
];
