// Texto da metodologia fica fora dos componentes para a revisão de copy (D-A8) mexer só aqui.
// Fiel ao PRD 4.1 e 3.3. Nenhum percentual é citado de propósito: despesas gerais (D-B2) e
// lucro do padrão Normal (D-B3) ainda estão em aberto, e o onboarding não pode antecipá-los.

export interface ItemExplicativo {
  rotulo: string;
  descricao: string;
}

export interface LinhaFormula {
  operador: '' | '−' | '=';
  rotulo: string;
}

export interface PassoMetodologia {
  id: string;
  titulo: string;
  introducao: string;
  itens?: ItemExplicativo[];
  // Diagrama entra antes da fórmula: primeiro a ideia de partes de um todo, depois a conta.
  diagrama?: 'residuo';
  formula?: LinhaFormula[];
  nota?: string;
}

// Rótulos do diagrama ficam aqui, junto do resto da copy, para a revisão (D-A8) mexer num lugar só.
// As partes têm a mesma largura de propósito: qualquer proporção sugeriria percentuais que ainda
// dependem de D-B2 e D-B3, e números no diagrama poderiam ser lidos como resultado real.
export const DIAGRAMA_RESIDUO = {
  aviso: 'Exemplo ilustrativo · fora de escala',
  rotuloTodo: 'VGV',
  descricaoTodo: 'o que o empreendimento vende',
  rotuloPartes: 'Para onde vai',
  partes: [
    { id: 'obra', rotulo: 'Custo de obra' },
    { id: 'despesas', rotulo: 'Despesas gerais' },
    { id: 'lucro', rotulo: 'Lucro do incorporador' },
    { id: 'terreno', rotulo: 'Resultado do terreno' },
  ],
} as const;

export const PASSOS_ONBOARDING: PassoMetodologia[] = [
  {
    id: 'perguntas',
    titulo: 'Você descreve o terreno e o que pretende construir',
    introducao:
      'Primeiro você diz o que quer decidir. Depois, em duas etapas curtas, entra com os dados do terreno e do que pretende construir. O custo de construção de referência a lastro faz por você.',
    itens: [
      // Objetivo da análise (D-R6, PRD 2.6): é escolha do usuário, e o texto não pode sugerir o contrário.
      {
        rotulo: 'Objetivo',
        descricao: 'Comprar o terreno ou executar o empreendimento. A escolha é sua; a lastro não presume.',
      },
      {
        rotulo: 'Terreno',
        descricao: 'Cidade, CEP, área, preço pedido, formato do lote e topografia.',
      },
      {
        rotulo: 'Produto',
        descricao:
          'Tipologia, padrão de acabamento, pavimentos, unidades por pavimento, e a área e o preço de venda de cada unidade.',
      },
    ],
    // Cobertura geográfica do MVP (PRD 3.5, CLAUDE.md): precisa ficar explícita para o usuário,
    // não só nos documentos internos.
    nota: 'Hoje a lastro cobre apenas Minas Gerais. Outros estados chegam em versões futuras.',
  },
  {
    id: 'vgv',
    titulo: 'A lastro calcula quanto o empreendimento vende',
    introducao:
      'O ponto de partida é o VGV, o valor geral de venda: o número de unidades multiplicado pelo preço de venda de cada uma.',
    itens: [
      {
        rotulo: 'Área construída',
        descricao:
          'Área do terreno × taxa de ocupação × pavimentos. Inclui hall, corredores e escadas, e é sobre ela que incide o custo de obra.',
      },
      {
        rotulo: 'Área comercializável',
        descricao: 'A soma das unidades vendidas. É ela que gera o VGV.',
      },
      {
        rotulo: 'Coeficiente de Aproveitamento (CA)',
        descricao:
          'Área construída ÷ área do terreno. A lastro mostra o coeficiente atingido para você conferir com o plano diretor do município.',
      },
    ],
  },
  {
    id: 'custos',
    titulo: 'Do VGV saem os custos e o lucro de quem incorpora',
    introducao: 'Três parcelas são descontadas do que o empreendimento vende.',
    itens: [
      {
        rotulo: 'Custo de obra',
        descricao:
          'O CUB do Sinduscon-MG para a sua tipologia, ajustado por fundação, padrão, topografia e formato do lote, vezes a área construída.',
      },
      {
        rotulo: 'Despesas gerais',
        descricao: 'Venda e marketing, comissões, impostos e despesas financeiras, como percentual do VGV.',
      },
      {
        rotulo: 'Lucro do incorporador',
        descricao: 'Um percentual do VGV que varia com o padrão de acabamento.',
      },
    ],
  },
  {
    id: 'residuo',
    titulo: 'O que sobra é quanto o terreno pode valer',
    introducao:
      'É o método do resíduo do terreno. A lastro compara esse valor com o preço pedido: se ele cobre o preço, o terreno é viável para o cenário informado.',
    diagrama: 'residuo',
    formula: [
      { operador: '', rotulo: 'VGV' },
      { operador: '−', rotulo: 'Custo de obra' },
      { operador: '−', rotulo: 'Despesas gerais' },
      { operador: '−', rotulo: 'Lucro do incorporador' },
      { operador: '=', rotulo: 'Resultado do terreno' },
    ],
    nota: 'A mesma conta pode ser lida de dois lados: como terrenista, vendo quanto o terreno pode valer; ou como incorporador, fixando o preço pedido e vendo o lucro que sobra. O objetivo que você escolher define por qual lado a leitura começa.',
  },
  {
    id: 'resultado',
    titulo: 'Você recebe um estudo de viabilidade preliminar',
    // Vocabulário da recomendação acompanha o objetivo (D-R6, PRD 4.4): só "comprar" deixaria de fora
    // quem já tem o terreno e quer saber se executa o empreendimento.
    introducao:
      'Uma recomendação direta, na linguagem do seu objetivo — comprar ou não o terreno, fazer ou não o empreendimento, com ou sem ressalvas —, com uma nota de 0 a 100 e a composição completa da conta.',
    itens: [
      {
        rotulo: 'Premissas ajustáveis',
        descricao: 'Mude preço de venda, lucro ou custos e veja o resultado se recalcular na hora.',
      },
      {
        rotulo: 'O que confirmar antes da proposta',
        descricao:
          'Alertas apontam a due diligence de cada caso: zoneamento, plano diretor, matrícula e documentação, capacidade do solo.',
      },
      {
        rotulo: 'Exportação',
        descricao: 'PDF ou HTML, a única forma de guardar a análise.',
      },
    ],
    nota: 'É a base para avançar com segurança para a validação urbanística, técnica e legal do terreno.',
  },
];
