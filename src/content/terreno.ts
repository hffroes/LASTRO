// Copy da etapa Terreno fora do componente, como no onboarding: a revisão de texto (D-A8) mexe só
// aqui. As mensagens de erro ficam em utils/validacao, porque o backend também as usa.
import type { ObjetivoAnalise } from '../types/analise';
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
      pendente: 'Área, preço pedido e preço por m² entram aqui nas próximas versões do formulário.',
    },
    lote: {
      titulo: 'Características do lote',
      pendente: 'Formato do lote e topografia entram aqui nas próximas versões do formulário.',
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
