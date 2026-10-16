// Copy do Resultado, versão crua da F13: a apresentação final (veredito, hierarquia) é da F14, então este
// texto será refeito lá. Os números vêm do servidor, e aqui só ficam os rótulos.
export const TEXTOS_RESULTADO = {
  sobretitulo: 'Etapa 3 de 3',
  titulo: 'Resultado',
  introducao: 'Uma primeira leitura, calculada com o que você informou.',
  carregando: 'Calculando a análise…',
  secaoNumeros: 'Método do resíduo do terreno',
  // F14: primeira dobra. Palavras do dia a dia; os termos técnicos (VGV, CUB, resíduo) ficam na conta completa.
  precoMaximo: {
    titulo: 'Preço máximo recomendado para o terreno',
    explicacao: 'Quanto você pode pagar pelo terreno, depois da obra, das despesas e do lucro de quem constrói.',
    preco: 'Preço pedido pelo terreno',
    // Quando o resultado do terreno é negativo, o projeto não se paga nem com o terreno de graça.
    semMargem: 'Mesmo sem pagar nada pelo terreno, este projeto não cobre o seu custo e o lucro esperado.',
    leitura: {
      sobra: 'Sobra',
      deficit: 'Déficit',
      empate: 'Empate',
    },
    // Descritivas e neutras: ainda não existem nota nem alertas (F18 e F19), então nada aqui é veredito.
    frase: {
      sobra: (valor: string) => `O preço pedido está ${valor} abaixo do máximo que este cenário comporta.`,
      deficit: (valor: string) => `O preço pedido está ${valor} acima do máximo que este cenário comporta.`,
      empate: 'O preço pedido é igual ao máximo que este cenário comporta.',
    },
    preliminar: 'Resultado preliminar: ainda não considera a nota da análise nem os alertas, que chegam depois.',
  },
  potencial: {
    titulo: 'O que o projeto entrega',
    construida: { rotulo: 'Área construída', nota: 'Tudo o que se constrói, incluindo hall, corredores e escadas.' },
    comercializavel: { rotulo: 'Área para vender', nota: 'A soma da área de todas as unidades vendidas.' },
    unidades: { rotulo: 'Unidades', nota: 'Quantas unidades serão vendidas.' },
  },
  projeto: {
    titulo: 'Projeto analisado',
    objetivo: 'O que você quer decidir',
    terreno: 'Terreno',
    cidade: 'Cidade',
    areaTerreno: 'Área do terreno',
    tipologia: 'Tipologia',
    padrao: 'Padrão de acabamento',
    pavimentos: 'Pavimentos',
    unidades: 'Unidades',
    areaUnidade: 'Área de cada unidade',
    precoUnidade: 'Preço de venda de cada unidade',
  },
  contaCompleta: 'Ver a conta completa',
  linhas: {
    vgv: { rotulo: 'VGV (valor geral de vendas)', formula: 'Total de unidades × preço de venda da unidade' },
    custoObra: { rotulo: 'Custo de obra', formula: 'CUB ajustado × área total construída' },
    despesasGerais: { rotulo: 'Despesas gerais', formula: 'Percentual do VGV' },
    lucro: { rotulo: 'Lucro do incorporador', formula: 'Percentual do VGV, definido pelo padrão' },
    resultadoTerreno: {
      rotulo: 'Resultado do terreno',
      formula: 'VGV − custo de obra − despesas gerais − lucro: o quanto o terreno pode valer neste cenário',
    },
    precoPedido: { rotulo: 'Preço pedido pelo terreno', formula: 'O valor informado na Etapa 1' },
    resultadoLiquido: { rotulo: 'Resultado líquido', formula: 'Resultado do terreno − preço pedido' },
    viavel: { rotulo: 'Viável pelo método do resíduo', formula: 'Sim quando o resultado líquido é maior ou igual a zero' },
  },
  sim: 'Sim',
  nao: 'Não',
  provisorio: 'parâmetro provisório',
  premissas: {
    titulo: 'Premissas e versão de dados usadas',
    baseCub: 'Base CUB',
    projetoCub: 'Projeto CUB',
    cubBase: 'CUB base',
    somaAditivos: 'Soma dos aditivos',
    cubAjustado: 'CUB ajustado',
    taxaOcupacao: 'Taxa de ocupação',
    taxaAjustada: 'ajustada por você',
    taxaPadrao: 'padrão da lastro',
    lucro: 'Lucro do incorporador',
    despesas: 'Despesas gerais',
    itemizacao: 'A itemização da fonte soma {soma}; a análise aplica o total acima.',
    versaoMotor: 'Versão do cálculo',
  },
  erroValidacao: {
    titulo: 'Alguns dados precisam de ajuste',
    introducao: 'O servidor conferiu a análise e encontrou o que segue.',
    voltarProduto: 'Voltar ao produto',
    voltarTerreno: 'Voltar ao terreno',
  },
  erroServidor: {
    titulo: 'Não foi possível gerar a análise',
    tentarDeNovo: 'Tentar de novo',
    voltar: 'Voltar ao produto',
  },
  cubPendente: {
    voltar: 'Voltar e revisar o produto',
  },
} as const;
