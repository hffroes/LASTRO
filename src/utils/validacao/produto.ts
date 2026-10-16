// Regras da etapa Produto em funções puras, como as do Terreno: o backend importa este mesmo módulo
// quando a API de análise existir (F13), para a regra não ser escrita duas vezes.
import { ehTipologia, ehTipoProjeto, tipologiaPertenceAoTipo } from '../../data/tipologias';
import type { Analise } from '../../types/analise';
import { PADROES_ACABAMENTO } from '../../types/produto';

export type CampoEtapaProduto = 'tipoProjeto' | 'tipologia' | 'padrao';

export type ErrosEtapaProduto = Partial<Record<CampoEtapaProduto, string>>;

// Ordem em que as pendências aparecem no resumo: a mesma da página.
export const ORDEM_CAMPOS_PRODUTO: readonly CampoEtapaProduto[] = ['tipoProjeto', 'tipologia', 'padrao'];

export const MENSAGENS_PRODUTO = {
  tipoProjetoAusente: 'Escolha o tipo de projeto.',
  tipologiaAusente: 'Escolha a tipologia do empreendimento.',
  // Só chega pela API: na tela, a tipologia é escolhida entre as do tipo.
  tipologiaForaDoTipo: 'Essa tipologia não pertence ao tipo de projeto escolhido.',
  padraoAusente: 'Escolha o padrão de acabamento.',
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

export function validarEtapaProduto(analise: Pick<Analise, 'produto'>): ErrosEtapaProduto {
  const { produto } = analise;
  const resultados: ErrosEtapaProduto = {
    tipoProjeto: validarTipoProjeto(produto.tipoProjeto),
    tipologia: validarTipologia(produto.tipoProjeto, produto.tipologia),
    padrao: validarPadrao(produto.padrao),
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
