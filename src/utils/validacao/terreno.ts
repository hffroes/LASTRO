// Regras da etapa Terreno em funções puras, sem React nem DOM: o backend vai importar este mesmo
// módulo quando a API existir (F13, junto com D-B1), para a regra não ser escrita duas vezes.
import { OBJETIVOS_ANALISE, type Analise } from '../../types/analise';

// Decidido na F05: cabe numa linha do cabeçalho do relatório exportado (F20/F21).
export const LIMITE_NOME_TERRENO = 80;

export type CampoEtapaTerreno = 'objetivo' | 'nome';

export type ErrosEtapaTerreno = Partial<Record<CampoEtapaTerreno, string>>;

// Ordem em que as pendências aparecem no resumo: a mesma da página.
export const ORDEM_CAMPOS_TERRENO: readonly CampoEtapaTerreno[] = ['objetivo', 'nome'];

export const MENSAGENS_TERRENO = {
  objetivoAusente: 'Escolha o objetivo da análise.',
  nomeVazio: 'Informe um nome ou identificação para o terreno.',
  nomeLongo: (tamanho: number) =>
    `Use no máximo ${LIMITE_NOME_TERRENO} caracteres (agora são ${tamanho}).`,
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

export function validarEtapaTerreno(analise: Pick<Analise, 'objetivo' | 'terreno'>): ErrosEtapaTerreno {
  const erros: ErrosEtapaTerreno = {};
  const erroObjetivo = validarObjetivo(analise.objetivo);
  const erroNome = validarNomeTerreno(analise.terreno.nome);
  if (erroObjetivo) erros.objetivo = erroObjetivo;
  if (erroNome) erros.nome = erroNome;
  return erros;
}

export function etapaTerrenoValida(analise: Pick<Analise, 'objetivo' | 'terreno'>): boolean {
  return Object.keys(validarEtapaTerreno(analise)).length === 0;
}
