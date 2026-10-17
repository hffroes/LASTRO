// Validação dos ajustes de premissa (F17), em funções puras usadas pela tela e pelo backend (D-B1, PRD
// 6.3). Os limites aqui são técnicos, não de negócio: barram o que não tem sentido como número (preço
// zero, percentual acima de 100%) ou o que a conta não representa. O que é só incomum passa, com aviso
// (utils/motor/premissas.ts): explorar um cenário fora do usual é direito do usuário.
import type { Analise, ErroValidacao } from '../../types/analise';
import { PONTOS_BASE_CEM_POR_CENTO, PREMISSAS_AJUSTAVEIS, type AjustesPremissas, type PremissaAjustavel } from '../../types/parametros';
import { calcularVgvCentavos } from '../motor/economia';
import { formatarMoeda } from '../motor/formatacao';
import { calcularProgramaEfetivo } from '../motor/produto';
import { MENSAGENS_PRODUTO, validarPrecoUnidade, validarTaxaOcupacao } from './produto';

// Teto técnico provisório do CUB ajustado, como os tetos das etapas: barra um zero a mais. R$ 100 mil por
// m² passa com folga de qualquer CUB publicado; não é regra de negócio nem estimativa de custo.
export const LIMITE_CUB_AJUSTADO_CENTAVOS = 10_000_000;

export type ErrosAjustes = Partial<Record<PremissaAjustavel, string>>;

export const MENSAGENS_AJUSTES = {
  ausente: 'Informe um valor, ou volte ao padrão.',
  percentualIlegivel: 'Escreva o percentual só com números e até 2 casas decimais. Ex.: 22',
  percentualNegativo: 'O percentual não pode ser negativo.',
  percentualAcimaDeCem: 'O percentual não pode passar de 100%.',
  cubIlegivel: 'Escreva o valor só com números e até 2 casas para os centavos. Ex.: 3.154,91',
  cubNaoPositivo: 'O CUB ajustado precisa ser maior que zero.',
  cubAcimaDoLimite: `O CUB ajustado passa de ${formatarMoeda(LIMITE_CUB_AJUSTADO_CENTAVOS)}/m². Confira o valor digitado.`,
} as const;

// Lucro e despesas: de 0% a 100%, os dois inclusive. Zero é um "e se" possível (sem lucro, sem despesa).
function validarPercentual(pontosBase: unknown): string | undefined {
  if (typeof pontosBase !== 'number' || !Number.isFinite(pontosBase)) return MENSAGENS_AJUSTES.ausente;
  if (!Number.isInteger(pontosBase)) return MENSAGENS_AJUSTES.percentualIlegivel;
  if (pontosBase < 0) return MENSAGENS_AJUSTES.percentualNegativo;
  if (pontosBase > PONTOS_BASE_CEM_POR_CENTO) return MENSAGENS_AJUSTES.percentualAcimaDeCem;
  return undefined;
}

function validarCubAjustado(centavos: unknown): string | undefined {
  if (typeof centavos !== 'number' || !Number.isFinite(centavos)) return MENSAGENS_AJUSTES.ausente;
  if (!Number.isInteger(centavos)) return MENSAGENS_AJUSTES.cubIlegivel;
  if (centavos <= 0) return MENSAGENS_AJUSTES.cubNaoPositivo;
  if (centavos > LIMITE_CUB_AJUSTADO_CENTAVOS) return MENSAGENS_AJUSTES.cubAcimaDoLimite;
  return undefined;
}

// Preço e taxa seguem as mesmas regras e mensagens da Etapa 2: são os mesmos campos, só que num cenário.
export function validarAjuste(premissa: PremissaAjustavel, valor: unknown, analise: Pick<Analise, 'produto'>): string | undefined {
  switch (premissa) {
    case 'precoUnidade': {
      const erro = validarPrecoUnidade(valor);
      if (erro) return erro;
      const { totalUnidades } = calcularProgramaEfetivo(analise.produto);
      if (totalUnidades !== null && calcularVgvCentavos(totalUnidades, valor as number) === null) {
        return MENSAGENS_PRODUTO.vgvAcimaDoLimite;
      }
      return undefined;
    }
    case 'taxaOcupacao':
      return validarTaxaOcupacao(valor);
    case 'lucroIncorporador':
    case 'despesasGerais':
      return validarPercentual(valor);
    case 'cubAjustado':
      return validarCubAjustado(valor);
  }
}

export function validarAjustes(ajustes: AjustesPremissas, analise: Pick<Analise, 'produto'>): ErrosAjustes {
  const erros: ErrosAjustes = {};
  for (const premissa of PREMISSAS_AJUSTAVEIS) {
    if (!(premissa in ajustes)) continue;
    const erro = validarAjuste(premissa, ajustes[premissa], analise);
    if (erro) erros[premissa] = erro;
  }
  return erros;
}

export interface ResultadoLeituraAjustes {
  ajustes: AjustesPremissas | null;
  erros: ErroValidacao[];
}

// O campo "ajustes" do pedido, tratado como hostil: ausente (ou null) é cenário sem ajuste; só as premissas
// conhecidas são lidas, e cada uma passa pelas regras acima. Chave desconhecida é ignorada, como nos outros
// leitores: nada além do previsto chega ao cálculo.
export function lerAjustesDoPayload(bruto: unknown, analise: Pick<Analise, 'produto'>): ResultadoLeituraAjustes {
  if (bruto === undefined || bruto === null) return { ajustes: {}, erros: [] };
  if (typeof bruto !== 'object' || Array.isArray(bruto)) {
    return { ajustes: null, erros: [{ etapa: 'corpo', campo: 'ajustes', mensagem: 'O campo "ajustes" precisa ser um objeto.' }] };
  }
  const registro = bruto as Record<string, unknown>;
  const ajustes: AjustesPremissas = {};
  const erros: ErroValidacao[] = [];
  for (const premissa of PREMISSAS_AJUSTAVEIS) {
    // Só a chave própria: uma herdada pelo protótipo não é ajuste que o usuário enviou.
    const valor = Object.prototype.hasOwnProperty.call(registro, premissa) ? registro[premissa] : undefined;
    if (valor === undefined || valor === null) continue;
    const erro = validarAjuste(premissa, valor, analise);
    if (erro) erros.push({ etapa: 'ajustes', campo: premissa, mensagem: erro });
    else ajustes[premissa] = valor as number;
  }
  return { ajustes: erros.length === 0 ? ajustes : null, erros };
}
