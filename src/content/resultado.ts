// Copy do Resultado, versão crua da F13: a apresentação final (veredito, hierarquia) é da F14, então este
// texto será refeito lá. Os números vêm do servidor, e aqui só ficam os rótulos.
export const TEXTOS_RESULTADO = {
  sobretitulo: 'Etapa 3 de 3',
  titulo: 'Resultado',
  introducao: 'Uma primeira leitura, calculada com o que você informou.',
  carregando: 'Calculando a análise…',
  secaoNumeros: 'Composição de custos',
  // F14: primeira dobra. Palavras do dia a dia; os termos técnicos (VGV, CUB, resíduo) ficam na conta completa.
  precoMaximo: {
    titulo: 'Preço máximo recomendado para o terreno',
    // F16: a explicação do cartão é a frase de fixo e resolvido da perspectiva (TogglePerspectiva).
    // "Preço pedido" curto: com o valor, cabe numa linha no celular.
    preco: 'Preço pedido',
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
  // F16: as duas leituras da mesma conta (PRD 2.6). Cada uma diz em uma frase o que está fixo e o que é
  // resolvido (dentro do cartão de destaque), e a nota lembra que trocar a leitura não muda o cenário
  // (risco 21 da fase).
  perspectiva: {
    rotulo: 'Ler como',
    opcoes: { terrenista: 'Terrenista', incorporador: 'Incorporador' },
    fixoResolvido: {
      terrenista: { fixo: 'o lucro do incorporador', resolvido: 'o preço máximo do terreno' },
      incorporador: { fixo: 'o preço pedido pelo terreno', resolvido: 'o lucro do incorporador' },
    },
    fixo: 'Fixo',
    resolvido: 'Resolvido',
    mesmaConta: 'Trocar a leitura não altera nenhum dado da análise.',
    anuncio: (opcao: string, frase: string) => `Leitura ${opcao}. ${frase}`,
  },
  // F16, leitura Incorporador: o preço pedido fica fixo e a resposta é o lucro que sobra (PRD 4.1).
  margem: {
    titulo: 'Lucro ao preço pedido',
    margem: 'Margem sobre as vendas',
    preco: 'Preço pedido',
    // Mesma conta de sempre: o lucro a este preço menos o esperado é a sobra ou o déficit da outra leitura.
    leitura: {
      acima: 'Acima do esperado',
      abaixo: 'Abaixo do esperado',
      igual: 'Igual ao esperado',
    },
    esperado: (padrao: string, percentual: string, valor: string) => `Esperado no padrão ${padrao} (${percentual}%): ${valor}.`,
    prejuizo: 'A este preço, as vendas não cobrem a obra, as despesas e o terreno: o resultado é prejuízo.',
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
  verDetalhes: 'Ver detalhes',
  comoCalculado: 'Como é calculado',
  // F15: a tabela do PRD 2.5.
  composicao: {
    legenda: 'Composição de custos sobre o VGV',
    colunas: { componente: 'Componente', valor: 'Valor', percentual: '% do VGV' },
    doVgv: 'do VGV',
    sinais: { mais: '', menos: '−', igual: '=' },
    leituraSinal: { mais: '', menos: 'menos ', igual: 'igual a ' },
    semBase: '—',
    linhas: {
      vgv: { rotulo: 'VGV total', formula: 'Total de unidades × preço de venda da unidade' },
      custoObra: { rotulo: 'Custo de obra', formula: 'CUB ajustado × área total construída' },
      despesasGerais: { rotulo: 'Despesas gerais', formula: 'Percentual do VGV. Os itens que o compõem estão no detalhe "Despesas gerais", mais abaixo.' },
      lucro: { rotulo: 'Lucro do incorporador', formula: 'Percentual do VGV, definido pelo padrão de acabamento' },
      resultadoTerreno: {
        rotulo: 'Resultado do terreno',
        formula: 'VGV − custo de obra − despesas gerais − lucro: o quanto o terreno pode valer neste cenário',
      },
      precoPedido: { rotulo: 'Preço pedido pelo terreno', formula: 'O valor informado na Etapa 1' },
      sobraDeficit: { rotulo: 'Sobra/déficit', formula: 'Resultado do terreno − preço pedido' },
    },
    fechamento: 'Os percentuais são calculados sobre o VGV e a coluna fecha: o resultado do terreno é 100% menos as três deduções.',
    // Leitura Incorporador: o preço pedido entra no lugar do lucro, e o lucro é o que sobra.
    legendaIncorporador: 'Composição de custos sobre o VGV, com o preço pedido fixo',
    linhasIncorporador: {
      lucroResultante: {
        rotulo: 'Lucro resultante',
        formula: 'VGV − custo de obra − despesas gerais − preço pedido: o que sobra para o incorporador a este preço',
      },
      lucroEsperado: { rotulo: 'Lucro esperado', formula: 'Percentual do VGV, definido pelo padrão de acabamento' },
      diferenca: {
        rotulo: 'Diferença para o esperado',
        formula: 'Lucro resultante − lucro esperado. É a mesma sobra/déficit da leitura Terrenista',
      },
    },
    fechamentoIncorporador:
      'Os percentuais são calculados sobre o VGV e a coluna fecha: o lucro resultante é 100% menos a obra, as despesas e o preço pedido.',
  },
  despesas: {
    titulo: 'Despesas gerais',
    introducao: 'Os itens que compõem o percentual aplicado sobre o VGV:',
    total: 'Total aplicado',
    foraDoTotal: 'Listado na fonte, mas fora do total aplicado',
    foraDoTotalNota: 'Não entra na conta.',
    divergenciaTitulo: 'Divergência na fonte',
    divergencia:
      'Somando todos os itens da fonte, o total seria {soma}, mas a análise aplica {total}: o item de venda e marketing fica de fora. A composição está provisória, à espera de validação.',
    rotulos: {
      comissoes: 'Comissões',
      impostosETaxas: 'Impostos e taxas',
      despesasFinanceiras: 'Despesas financeiras',
      vendaEMarketing: 'Venda e marketing',
    } as Record<string, string>,
  },
  cub: {
    titulo: 'Custo de obra e CUB',
    aditivo: 'Aditivo',
    cubBase: 'CUB base',
    cubAjustado: 'CUB ajustado',
    areaConstruida: 'Área total construída',
    custoObra: 'Custo de obra',
    somaAditivos: 'Soma dos aditivos',
    projeto: 'Projeto CUB',
    fundacao: 'Fundação',
    padrao: 'Padrão de acabamento',
    topografia: 'Topografia',
    formato: 'Formato do lote',
  },
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
    taxaOcupacao: 'Taxa de ocupação',
    taxaAjustada: 'ajustada por você',
    taxaPadrao: 'padrão da lastro',
    lucro: 'Lucro do incorporador',
    despesas: 'Despesas gerais',
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
