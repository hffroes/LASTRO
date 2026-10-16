// Copy do Resultado, versão crua da F13: a apresentação final (veredito, hierarquia) é da F14, então este
// texto será refeito lá. Os números vêm do servidor, e aqui só ficam os rótulos.
export const TEXTOS_RESULTADO = {
  sobretitulo: 'Etapa 3 de 3',
  titulo: 'Resultado',
  introducao: 'Os números do cálculo, ainda sem apresentação final. Confira cada linha com a sua planilha.',
  carregando: 'Calculando a análise…',
  secaoNumeros: 'Método do resíduo do terreno',
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
