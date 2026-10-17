import type { Analise, RespostaAnalise } from '../../src/types/analise';
import type { AjustesPremissas } from '../../src/types/parametros';
import { gerarAnalise, type OpcoesGerarAnalise } from '../../src/utils/motor/analise';

// O servidor não tem regra econômica própria: o motor puro de src/utils/motor é a única definição (D-B1),
// o mesmo que a tela usa para mostrar áreas e CUB em tempo real. Este adaptador só liga o pedido
// (já validado) ao motor e entrega o resultado no formato da API. Os ajustes de premissa (F17) são do
// pedido: valem só para esta resposta e nunca alteram as opções nem os parâmetros do servidor.
export function processarAnalise(analise: Analise, ajustes: AjustesPremissas, opcoes?: OpcoesGerarAnalise): RespostaAnalise {
  return gerarAnalise(analise, opcoes, ajustes);
}
