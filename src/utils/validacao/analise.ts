// Leitura e validação da análise recebida por JSON, em funções puras: é o que o backend executa ao
// receber o pedido (validação obrigatória, PRD 6.3), reaproveitando as MESMAS regras e mensagens da
// tela (D-B1). A entrada é tratada como hostil: só os campos conhecidos são lidos, cada um com o tipo
// esperado, e nada além deles chega ao cálculo.
import type { Analise, ErroValidacao } from '../../types/analise';
import type { DadosProduto } from '../../types/produto';
import type { DadosTerreno } from '../../types/terreno';
import { ORDEM_CAMPOS_TERRENO, validarEtapaTerreno } from './terreno';
import { ORDEM_CAMPOS_PRODUTO, validarEtapaProduto } from './produto';

type Registro = Record<string, unknown>;

function ehRegistro(valor: unknown): valor is Registro {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

const MENSAGEM_TIPO: Record<'texto' | 'numero' | 'booleano', string> = {
  texto: 'Esperado um texto.',
  numero: 'Esperado um número.',
  booleano: 'Esperado verdadeiro ou falso.',
};

class Leitor {
  readonly erros: ErroValidacao[] = [];

  constructor(
    private readonly etapa: ErroValidacao['etapa'],
    private readonly bruto: Registro,
  ) {}

  private ler<Valor>(
    campo: string,
    tipo: 'texto' | 'numero' | 'booleano',
    conferir: (valor: unknown) => valor is Valor,
  ): Valor | undefined {
    const valor = this.bruto[campo];
    if (valor === undefined || valor === null) return undefined;
    if (conferir(valor)) return valor;
    this.erros.push({ etapa: this.etapa, campo, mensagem: MENSAGEM_TIPO[tipo] });
    return undefined;
  }

  texto(campo: string): string | undefined {
    return this.ler(campo, 'texto', (v): v is string => typeof v === 'string');
  }

  // NaN e Infinity não existem em JSON, mas o leitor é puro e pode receber objetos de qualquer origem.
  numero(campo: string): number | undefined {
    return this.ler(campo, 'numero', (v): v is number => typeof v === 'number' && Number.isFinite(v));
  }

  booleano(campo: string): boolean | undefined {
    return this.ler(campo, 'booleano', (v): v is boolean => typeof v === 'boolean');
  }
}

export interface ResultadoLeituraAnalise {
  analise: Analise | null;
  erros: ErroValidacao[];
}

// Valor desconhecido de um campo de opções vira "não escolhido": quem o valida (validarEtapa*) acusa
// com a mensagem da tela, em vez de deixar texto arbitrário chegar ao cálculo.
function opcaoOuNulo(valor: string | undefined): string | null {
  return valor ?? null;
}

export function lerAnaliseDoPayload(bruto: unknown): ResultadoLeituraAnalise {
  if (!ehRegistro(bruto)) {
    return { analise: null, erros: [{ etapa: 'corpo', campo: 'corpo', mensagem: 'Envie um objeto JSON com objetivo, terreno e produto.' }] };
  }
  const erros: ErroValidacao[] = [];
  for (const parte of ['terreno', 'produto'] as const) {
    if (!ehRegistro(bruto[parte])) {
      erros.push({ etapa: 'corpo', campo: parte, mensagem: `O campo "${parte}" precisa ser um objeto.` });
    }
  }
  if (erros.length > 0) return { analise: null, erros };

  const raiz = new Leitor('objetivo', bruto);
  const t = new Leitor('terreno', bruto.terreno as Registro);
  const p = new Leitor('produto', bruto.produto as Registro);

  const terreno: DadosTerreno = {
    nome: t.texto('nome') ?? '',
    codigoMunicipioIbge: t.numero('codigoMunicipioIbge') ?? null,
    cep: t.texto('cep') ?? '',
    logradouro: t.texto('logradouro') ?? '',
    bairro: t.texto('bairro') ?? '',
    ufCep: t.texto('ufCep') ?? null,
    enderecoPeloCep: t.booleano('enderecoPeloCep') ?? false,
    areaTotalM2: t.numero('areaTotalM2') ?? null,
    precoPedidoCentavos: t.numero('precoPedidoCentavos') ?? null,
    formatoLote: opcaoOuNulo(t.texto('formatoLote')) as DadosTerreno['formatoLote'],
    topografia: opcaoOuNulo(t.texto('topografia')) as DadosTerreno['topografia'],
  };
  const produto: DadosProduto = {
    tipoProjeto: opcaoOuNulo(p.texto('tipoProjeto')) as DadosProduto['tipoProjeto'],
    tipologia: opcaoOuNulo(p.texto('tipologia')) as DadosProduto['tipologia'],
    padrao: opcaoOuNulo(p.texto('padrao')) as DadosProduto['padrao'],
    pavimentos: p.numero('pavimentos') ?? null,
    unidadesPorPavimento: p.numero('unidadesPorPavimento') ?? null,
    areaUnidadeM2: p.numero('areaUnidadeM2') ?? null,
    precoUnidadeCentavos: p.numero('precoUnidadeCentavos') ?? null,
    taxaOcupacaoPontosBase: p.numero('taxaOcupacaoPontosBase') ?? null,
  };
  const analise: Analise = {
    objetivo: opcaoOuNulo(raiz.texto('objetivo')) as Analise['objetivo'],
    terreno,
    produto,
  };

  erros.push(...raiz.erros, ...t.erros, ...p.erros);

  // As regras são as da tela, na ordem da página: as mensagens que o usuário já conhece.
  const errosTerreno = validarEtapaTerreno(analise);
  for (const campo of ORDEM_CAMPOS_TERRENO) {
    const mensagem = errosTerreno[campo];
    if (mensagem) erros.push({ etapa: campo === 'objetivo' ? 'objetivo' : 'terreno', campo, mensagem });
  }
  const errosProduto = validarEtapaProduto(analise);
  for (const campo of ORDEM_CAMPOS_PRODUTO) {
    const mensagem = errosProduto[campo];
    if (mensagem) erros.push({ etapa: 'produto', campo, mensagem });
  }

  return { analise: erros.length === 0 ? analise : null, erros };
}
