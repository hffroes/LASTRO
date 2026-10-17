import type { ObjetivoAnalise, Perspectiva } from '../../types/analise';

// D-R6 e PRD 2.6: a perspectiva padrão vem do objetivo que o usuário escolheu, nunca é inferida. Comprar o
// terreno é a pergunta do Terrenista (quanto posso pagar?); executar o empreendimento é a do Incorporador
// (quanto vou lucrar a este preço?). O toggle depois só troca a leitura: não muda o objetivo nem os insumos.
export function perspectivaPadrao(objetivo: ObjetivoAnalise | null): Perspectiva {
  return objetivo === 'executarEmpreendimento' ? 'incorporador' : 'terrenista';
}
