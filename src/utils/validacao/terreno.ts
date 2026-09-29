// Regras da etapa Terreno em funções puras, sem React nem DOM: o backend vai importar este mesmo
// módulo quando a API de análise existir (F13, junto com D-B1), para a regra não ser escrita duas vezes.
import { buscarMunicipioPorCodigo } from '../../data/municipios-mg';
import { OBJETIVOS_ANALISE, type Analise } from '../../types/analise';
import { somenteDigitos } from '../texto';

// Decidido na F05: cabe numa linha do cabeçalho do relatório exportado (F20/F21).
export const LIMITE_NOME_TERRENO = 80;
// Folga para logradouros longos ("Avenida Presidente Juscelino Kubitschek de Oliveira") sem aceitar
// texto arbitrário no payload; provisório, revisável na exportação (F20).
export const LIMITE_ENDERECO = 120;
export const DIGITOS_CEP = 8;
// Cobertura do MVP (PRD 3.5): o CUB aplicado é o do Sinduscon-MG.
export const UF_COBERTA = 'MG';

export type CampoEtapaTerreno = 'objetivo' | 'nome' | 'cidade' | 'cep' | 'logradouro' | 'bairro';

export type ErrosEtapaTerreno = Partial<Record<CampoEtapaTerreno, string>>;

// Ordem em que as pendências aparecem no resumo: a mesma da página.
export const ORDEM_CAMPOS_TERRENO: readonly CampoEtapaTerreno[] = [
  'objetivo',
  'nome',
  'cidade',
  'cep',
  'logradouro',
  'bairro',
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

export function validarEtapaTerreno(analise: Pick<Analise, 'objetivo' | 'terreno'>): ErrosEtapaTerreno {
  const { terreno } = analise;
  const resultados: ErrosEtapaTerreno = {
    objetivo: validarObjetivo(analise.objetivo),
    nome: validarNomeTerreno(terreno.nome),
    cidade: validarCidade(terreno.codigoMunicipioIbge),
    cep: validarCep(terreno.cep, terreno.ufCep),
    logradouro: validarTrechoEndereco(terreno.logradouro, 'Logradouro'),
    bairro: validarTrechoEndereco(terreno.bairro, 'Bairro'),
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
