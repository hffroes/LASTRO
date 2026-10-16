import type { Analise, RespostaAnalise } from '../../src/types/analise';
import { gerarAnalise, type OpcoesGerarAnalise } from '../../src/utils/motor/analise';

// O servidor não tem regra econômica própria: o motor puro de src/utils/motor é a única definição (D-B1),
// o mesmo que a tela usa para mostrar áreas e CUB em tempo real. Este adaptador só liga o pedido
// (já validado) ao motor e entrega o resultado no formato da API.
export function processarAnalise(analise: Analise, opcoes?: OpcoesGerarAnalise): RespostaAnalise {
  return gerarAnalise(analise, opcoes);
}
