// Regras da etapa Terreno em funções puras, sem React nem DOM: o backend vai importar este mesmo
// módulo quando a API de análise existir (F13, junto com D-B1), para a regra não ser escrita duas vezes.
import { buscarMunicipioPorCodigo } from '../../data/municipios-mg';
import { OBJETIVOS_ANALISE, type Analise } from '../../types/analise';
import { FORMATOS_LOTE, TOPOGRAFIAS } from '../../types/terreno';
import { areaParaCentesimos, formatarArea, formatarMoeda } from '../motor/formatacao';
import { somenteDigitos } from '../texto';

// Decidido na F05: cabe numa linha do cabeçalho do relatório exportado (F20/F21).
export const LIMITE_NOME_TERRENO = 80;
// Folga para logradouros longos ("Avenida Presidente Juscelino Kubitschek de Oliveira") sem aceitar
// texto arbitrário no payload; provisório, revisável na exportação (F20).
export const LIMITE_ENDERECO = 120;
export const DIGITOS_CEP = 8;
// Cobertura do MVP (PRD 3.5): o CUB aplicado é o do Sinduscon-MG.
export const UF_COBERTA = 'MG';
// Tetos técnicos provisórios, não regra de negócio: barram erro de digitação (um zero a mais) e
// mantêm a conta do preço por m² em inteiros exatos (centavos × 100 abaixo de 2^53).
// 10.000.000 m² = 1.000 ha; R$ 10 bilhões.
export const LIMITE_AREA_TERRENO_M2 = 10_000_000;
export const LIMITE_PRECO_TERRENO_CENTAVOS = 1_000_000_000_000;

export type CampoEtapaTerreno =
  | 'objetivo'
  | 'nome'
  | 'cidade'
  | 'cep'
  | 'logradouro'
  | 'bairro'
  | 'area'
  | 'preco'
  | 'formato'
  | 'topografia';

export type ErrosEtapaTerreno = Partial<Record<CampoEtapaTerreno, string>>;

// Ordem em que as pendências aparecem no resumo: a mesma da página.
export const ORDEM_CAMPOS_TERRENO: readonly CampoEtapaTerreno[] = [
  'objetivo',
  'nome',
  'cidade',
  'cep',
  'logradouro',
  'bairro',
  'area',
  'preco',
  'formato',
  'topografia',
];

export const MENSAGENS_TERRENO = {
  objetivoAusente: 'Escolha o objetivo da análise.',
  nomeVazio: 'Informe um nome ou identificação para o terreno.',
  nomeLongo: (tamanho: number) =>
    `Use no máximo ${LIMITE_NOME_TERRENO} caracteres (agora são ${tamanho}).`,
  cidadeAusente: 'Escolha a cidade na lista de municípios de Minas Gerais.',
  cepIncompleto: `Informe o CEP com ${DIGITOS_CEP} dígitos, ou deixe em branco.`,
  cepForaDaCobertura: (uf: string) =>
    `Este CEP é de ${uf}. A lastro cobre só Minas Gerais por enquanto: corrija ou apague o CEP.`,
  enderecoLongo: (rotulo: string, tamanho: number) =>
    `${rotulo}: use no máximo ${LIMITE_ENDERECO} caracteres (agora são ${tamanho}).`,
  areaAusente: 'Informe a área total do terreno, em m².',
  // Usada pela tela quando o texto digitado não pôde ser lido como número.
  areaIlegivel: 'Escreva a área só com números e até 2 casas decimais. Ex.: 1.250,50',
  areaNaoPositiva: 'A área precisa ser maior que zero.',
  areaAcimaDoLimite: `A área passa de ${formatarArea(LIMITE_AREA_TERRENO_M2 * 100)}. Confira o valor digitado.`,
  precoAusente: 'Informe o preço pedido pelo terreno, em reais.',
  precoIlegivel: 'Escreva o preço só com números e até 2 casas para os centavos. Ex.: 1.200.000,00',
  precoNaoPositivo: 'O preço precisa ser maior que zero.',
  precoAcimaDoLimite: `O preço passa de ${formatarMoeda(LIMITE_PRECO_TERRENO_CENTAVOS)}. Confira o valor digitado.`,
  formatoAusente: 'Escolha o formato do lote.',
  topografiaAusente: 'Escolha a topografia do terreno.',
} as const;

export function validarObjetivo(objetivo: unknown): string | undefined {
  return OBJETIVOS_ANALISE.includes(objetivo as never) ? undefined : MENSAGENS_TERRENO.objetivoAusente;
}

// Espaços nas pontas não contam: "   " é vazio, e o limite vale para o que vai ao relatório.
export function validarNomeTerreno(nome: unknown): string | undefined {
  const texto = typeof nome === 'string' ? nome.trim() : '';
  if (texto.length === 0) return MENSAGENS_TERRENO.nomeVazio;
  if (texto.length > LIMITE_NOME_TERRENO) return MENSAGENS_TERRENO.nomeLongo(texto.length);
  return undefined;
}

// Obrigatória (D-R14): só vale código que exista na lista de MG, nunca texto livre.
export function validarCidade(codigoMunicipioIbge: unknown): string | undefined {
  return typeof codigoMunicipioIbge === 'number' && buscarMunicipioPorCodigo(codigoMunicipioIbge)
    ? undefined
    : MENSAGENS_TERRENO.cidadeAusente;
}

// Opcional (D-R14), mas se preenchido precisa ter 8 dígitos; e, se a consulta disse que é de
// outro estado, bloqueia (D-R15). Sem resposta da consulta (API fora), não há o que bloquear.
export function validarCep(cep: unknown, ufCep: unknown): string | undefined {
  const digitos = typeof cep === 'string' ? somenteDigitos(cep) : '';
  if (digitos.length === 0) return undefined;
  if (digitos.length !== DIGITOS_CEP) return MENSAGENS_TERRENO.cepIncompleto;
  if (typeof ufCep === 'string' && ufCep !== UF_COBERTA) return MENSAGENS_TERRENO.cepForaDaCobertura(ufCep);
  return undefined;
}

export function validarTrechoEndereco(valor: unknown, rotulo: string): string | undefined {
  const texto = typeof valor === 'string' ? valor.trim() : '';
  return texto.length > LIMITE_ENDERECO ? MENSAGENS_TERRENO.enderecoLongo(rotulo, texto.length) : undefined;
}

// O backend recebe JSON: só número finito conta como informado. Mais de duas casas não chega pela
// tela (a leitura recusa) e, vindo da API, seria precisão que o cálculo descartaria em silêncio.
export function validarAreaTerreno(areaM2: unknown): string | undefined {
  if (typeof areaM2 !== 'number' || !Number.isFinite(areaM2)) return MENSAGENS_TERRENO.areaAusente;
  if (areaM2 <= 0) return MENSAGENS_TERRENO.areaNaoPositiva;
  if (areaM2 > LIMITE_AREA_TERRENO_M2) return MENSAGENS_TERRENO.areaAcimaDoLimite;
  if (Math.abs(areaParaCentesimos(areaM2) - areaM2 * 100) > 1e-6) return MENSAGENS_TERRENO.areaIlegivel;
  return undefined;
}

export function validarPrecoTerreno(precoCentavos: unknown): string | undefined {
  if (typeof precoCentavos !== 'number' || !Number.isFinite(precoCentavos)) return MENSAGENS_TERRENO.precoAusente;
  if (!Number.isInteger(precoCentavos)) return MENSAGENS_TERRENO.precoIlegivel;
  if (precoCentavos <= 0) return MENSAGENS_TERRENO.precoNaoPositivo;
  if (precoCentavos > LIMITE_PRECO_TERRENO_CENTAVOS) return MENSAGENS_TERRENO.precoAcimaDoLimite;
  return undefined;
}

// Sem valor padrão (PRD 3.2): cada opção muda o aditivo do custo da obra, então a escolha é sempre
// do usuário. Valor fora da tabela (vindo da API) conta como não escolhido.
export function validarFormatoLote(formato: unknown): string | undefined {
  return FORMATOS_LOTE.includes(formato as never) ? undefined : MENSAGENS_TERRENO.formatoAusente;
}

export function validarTopografia(topografia: unknown): string | undefined {
  return TOPOGRAFIAS.includes(topografia as never) ? undefined : MENSAGENS_TERRENO.topografiaAusente;
}

export function validarEtapaTerreno(analise: Pick<Analise, 'objetivo' | 'terreno'>): ErrosEtapaTerreno {
  const { terreno } = analise;
  const resultados: ErrosEtapaTerreno = {
    objetivo: validarObjetivo(analise.objetivo),
    nome: validarNomeTerreno(terreno.nome),
    cidade: validarCidade(terreno.codigoMunicipioIbge),
    cep: validarCep(terreno.cep, terreno.ufCep),
    logradouro: validarTrechoEndereco(terreno.logradouro, 'Logradouro'),
    bairro: validarTrechoEndereco(terreno.bairro, 'Bairro'),
    area: validarAreaTerreno(terreno.areaTotalM2),
    preco: validarPrecoTerreno(terreno.precoPedidoCentavos),
    formato: validarFormatoLote(terreno.formatoLote),
    topografia: validarTopografia(terreno.topografia),
  };
  const erros: ErrosEtapaTerreno = {};
  for (const campo of ORDEM_CAMPOS_TERRENO) {
    const mensagem = resultados[campo];
    if (mensagem) erros[campo] = mensagem;
  }
  return erros;
}

export function etapaTerrenoValida(analise: Pick<Analise, 'objetivo' | 'terreno'>): boolean {
  return Object.keys(validarEtapaTerreno(analise)).length === 0;
}
