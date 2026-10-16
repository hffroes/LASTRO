// Regras da etapa Produto em funções puras, como as do Terreno: o backend importa este mesmo módulo
// quando a API de análise existir (F13), para a regra não ser escrita duas vezes.
import { ehTipologia, ehTipoProjeto, ehUnidadeUnica, pavimentosFixos, tipologiaPertenceAoTipo } from '../../data/tipologias';
import type { Analise } from '../../types/analise';
import { PADROES_ACABAMENTO, type DadosProduto } from '../../types/produto';
import { areaParaCentesimos, formatarArea, formatarInteiroBr, formatarMoeda } from '../motor/formatacao';
import { LIMITE_AREA_TERRENO_M2, LIMITE_PRECO_TERRENO_CENTAVOS } from './terreno';

// Tetos técnicos provisórios, não regra de negócio (como os do terreno, F07): barram erro de
// digitação (um zero a mais). 200 pavimentos passa com folga do prédio mais alto do país, e 1.000
// unidades por pavimento cobre qualquer lâmina de salas. Área e preço da unidade usam os tetos do
// terreno: um galpão é uma unidade só e pode ter a escala do lote inteiro.
// Atenção para a F13: no teto, unidades × preço passa de 2^53; o VGV precisa conferir o limite.
export const LIMITE_PAVIMENTOS = 200;
export const LIMITE_UNIDADES_POR_PAVIMENTO = 1_000;
export const LIMITE_AREA_UNIDADE_M2 = LIMITE_AREA_TERRENO_M2;
export const LIMITE_PRECO_UNIDADE_CENTAVOS = LIMITE_PRECO_TERRENO_CENTAVOS;

export type CampoEtapaProduto =
  | 'tipoProjeto'
  | 'tipologia'
  | 'padrao'
  | 'pavimentos'
  | 'unidadesPorPavimento'
  | 'areaUnidade'
  | 'precoUnidade';

export type ErrosEtapaProduto = Partial<Record<CampoEtapaProduto, string>>;

// Ordem em que as pendências aparecem no resumo: a mesma da página.
export const ORDEM_CAMPOS_PRODUTO: readonly CampoEtapaProduto[] = [
  'tipoProjeto',
  'tipologia',
  'padrao',
  'pavimentos',
  'unidadesPorPavimento',
  'areaUnidade',
  'precoUnidade',
];

export const MENSAGENS_PRODUTO = {
  tipoProjetoAusente: 'Escolha o tipo de projeto.',
  tipologiaAusente: 'Escolha a tipologia do empreendimento.',
  // Só chega pela API: na tela, a tipologia é escolhida entre as do tipo.
  tipologiaForaDoTipo: 'Essa tipologia não pertence ao tipo de projeto escolhido.',
  padraoAusente: 'Escolha o padrão de acabamento.',
  pavimentosAusente: 'Informe o número de pavimentos.',
  // Também usada pela tela quando o texto não pôde ser lido como número inteiro.
  pavimentosNaoInteiro: 'Use um número inteiro de pavimentos. Ex.: 4',
  pavimentosNaoPositivo: 'O empreendimento precisa ter ao menos 1 pavimento.',
  pavimentosAcimaDoLimite: `Use no máximo ${formatarInteiroBr(LIMITE_PAVIMENTOS)} pavimentos. Confira o valor digitado.`,
  unidadesAusente: 'Informe quantas unidades há em cada pavimento.',
  unidadesNaoInteiro: 'Use um número inteiro de unidades. Ex.: 4',
  unidadesNaoPositivo: 'Cada pavimento precisa ter ao menos 1 unidade.',
  unidadesAcimaDoLimite: `Use no máximo ${formatarInteiroBr(LIMITE_UNIDADES_POR_PAVIMENTO)} unidades por pavimento. Confira o valor digitado.`,
  areaUnidadeAusente: 'Informe a área da unidade vendida, em m².',
  areaUnidadeIlegivel: 'Escreva a área só com números e até 2 casas decimais. Ex.: 68,50',
  areaUnidadeNaoPositiva: 'A área da unidade precisa ser maior que zero.',
  areaUnidadeAcimaDoLimite: `A área da unidade passa de ${formatarArea(LIMITE_AREA_UNIDADE_M2 * 100)}. Confira o valor digitado.`,
  precoUnidadeAusente: 'Informe o preço de venda da unidade, em reais.',
  precoUnidadeIlegivel: 'Escreva o preço só com números e até 2 casas para os centavos. Ex.: 450.000,00',
  precoUnidadeNaoPositivo: 'O preço de venda precisa ser maior que zero.',
  precoUnidadeAcimaDoLimite: `O preço da unidade passa de ${formatarMoeda(LIMITE_PRECO_UNIDADE_CENTAVOS)}. Confira o valor digitado.`,
} as const;

// Uso Misto (D-B6) também cai aqui: não é tipo de projeto aceito enquanto não tiver projeto CUB.
export function validarTipoProjeto(tipoProjeto: unknown): string | undefined {
  return ehTipoProjeto(tipoProjeto) ? undefined : MENSAGENS_PRODUTO.tipoProjetoAusente;
}

// Sem tipo, a falta é dele: as tipologias só existem depois do tipo, e acusar as duas repetiria o
// mesmo problema no resumo de pendências.
export function validarTipologia(tipoProjeto: unknown, tipologia: unknown): string | undefined {
  if (!ehTipoProjeto(tipoProjeto)) return undefined;
  if (!ehTipologia(tipologia)) return MENSAGENS_PRODUTO.tipologiaAusente;
  return tipologiaPertenceAoTipo(tipoProjeto, tipologia) ? undefined : MENSAGENS_PRODUTO.tipologiaForaDoTipo;
}

// Sem valor padrão: o padrão muda o CUB e os percentuais de terreno e lucro, então a escolha é sempre
// do usuário.
export function validarPadrao(padrao: unknown): string | undefined {
  return PADROES_ACABAMENTO.includes(padrao as never) ? undefined : MENSAGENS_PRODUTO.padraoAusente;
}

interface MensagensContagem {
  ausente: string;
  naoInteiro: string;
  naoPositivo: string;
  acimaDoLimite: string;
}

// O backend recebe JSON: só número finito conta como informado; fração é recusada, não arredondada.
function validarContagem(valor: unknown, limite: number, mensagens: MensagensContagem): string | undefined {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return mensagens.ausente;
  if (!Number.isInteger(valor)) return mensagens.naoInteiro;
  if (valor <= 0) return mensagens.naoPositivo;
  if (valor > limite) return mensagens.acimaDoLimite;
  return undefined;
}

// Travado pela tipologia (galpão), não há o que validar: o valor efetivo é o da regra.
export function validarPavimentos(produto: Pick<DadosProduto, 'tipologia' | 'pavimentos'>): string | undefined {
  if (pavimentosFixos(produto.tipologia) !== null) return undefined;
  return validarContagem(produto.pavimentos, LIMITE_PAVIMENTOS, {
    ausente: MENSAGENS_PRODUTO.pavimentosAusente,
    naoInteiro: MENSAGENS_PRODUTO.pavimentosNaoInteiro,
    naoPositivo: MENSAGENS_PRODUTO.pavimentosNaoPositivo,
    acimaDoLimite: MENSAGENS_PRODUTO.pavimentosAcimaDoLimite,
  });
}

// Casa e Galpões têm 1 unidade fixa (PRD 2.2): o campo nem é pedido.
export function validarUnidadesPorPavimento(
  produto: Pick<DadosProduto, 'tipologia' | 'unidadesPorPavimento'>,
): string | undefined {
  if (ehUnidadeUnica(produto.tipologia)) return undefined;
  return validarContagem(produto.unidadesPorPavimento, LIMITE_UNIDADES_POR_PAVIMENTO, {
    ausente: MENSAGENS_PRODUTO.unidadesAusente,
    naoInteiro: MENSAGENS_PRODUTO.unidadesNaoInteiro,
    naoPositivo: MENSAGENS_PRODUTO.unidadesNaoPositivo,
    acimaDoLimite: MENSAGENS_PRODUTO.unidadesAcimaDoLimite,
  });
}

// Mesma regra da área do terreno: mais de duas casas, vindo da API, seria precisão que o cálculo
// descartaria em silêncio.
export function validarAreaUnidade(areaM2: unknown): string | undefined {
  if (typeof areaM2 !== 'number' || !Number.isFinite(areaM2)) return MENSAGENS_PRODUTO.areaUnidadeAusente;
  if (areaM2 <= 0) return MENSAGENS_PRODUTO.areaUnidadeNaoPositiva;
  if (areaM2 > LIMITE_AREA_UNIDADE_M2) return MENSAGENS_PRODUTO.areaUnidadeAcimaDoLimite;
  if (Math.abs(areaParaCentesimos(areaM2) - areaM2 * 100) > 1e-6) return MENSAGENS_PRODUTO.areaUnidadeIlegivel;
  return undefined;
}

export function validarPrecoUnidade(precoCentavos: unknown): string | undefined {
  if (typeof precoCentavos !== 'number' || !Number.isFinite(precoCentavos)) return MENSAGENS_PRODUTO.precoUnidadeAusente;
  if (!Number.isInteger(precoCentavos)) return MENSAGENS_PRODUTO.precoUnidadeIlegivel;
  if (precoCentavos <= 0) return MENSAGENS_PRODUTO.precoUnidadeNaoPositivo;
  if (precoCentavos > LIMITE_PRECO_UNIDADE_CENTAVOS) return MENSAGENS_PRODUTO.precoUnidadeAcimaDoLimite;
  return undefined;
}

export function validarEtapaProduto(analise: Pick<Analise, 'produto'>): ErrosEtapaProduto {
  const { produto } = analise;
  const resultados: ErrosEtapaProduto = {
    tipoProjeto: validarTipoProjeto(produto.tipoProjeto),
    tipologia: validarTipologia(produto.tipoProjeto, produto.tipologia),
    padrao: validarPadrao(produto.padrao),
    pavimentos: validarPavimentos(produto),
    unidadesPorPavimento: validarUnidadesPorPavimento(produto),
    areaUnidade: validarAreaUnidade(produto.areaUnidadeM2),
    precoUnidade: validarPrecoUnidade(produto.precoUnidadeCentavos),
  };
  const erros: ErrosEtapaProduto = {};
  for (const campo of ORDEM_CAMPOS_PRODUTO) {
    const mensagem = resultados[campo];
    if (mensagem) erros[campo] = mensagem;
  }
  return erros;
}

export function etapaProdutoValida(analise: Pick<Analise, 'produto'>): boolean {
  return Object.keys(validarEtapaProduto(analise)).length === 0;
}
