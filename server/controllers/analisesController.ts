import type { RequestHandler } from 'express';
import type { Analise, CorpoApi, RespostaAnalise } from '../../src/types/analise';
import type { AjustesPremissas } from '../../src/types/parametros';
import type { OpcoesGerarAnalise } from '../../src/utils/motor/analise';
import { processarAnalise } from '../domain/motorAdapter';
import { responderErro } from '../middleware/erros';

interface DependenciasAnalises {
  // Testes injetam parâmetros ou uma base de CUB diferentes, sem tocar nos padrões do motor.
  opcoes?: OpcoesGerarAnalise;
}

export function criarControladorAnalises({ opcoes }: DependenciasAnalises = {}): RequestHandler {
  return (_req, res) => {
    const analise = res.locals.analise as Analise;
    const ajustes = (res.locals.ajustes ?? {}) as AjustesPremissas;
    const resposta = processarAnalise(analise, ajustes, opcoes);
    if (resposta.situacao === 'foraDoLimite') {
      // Pedido válido, mas com valores acima do que o cálculo representa com exatidão.
      responderErro(res, 422, 'VALIDACAO_FALHOU', 'Os valores informados passam do limite que o cálculo comporta. Confira os números.');
      return;
    }
    const corpo: CorpoApi<RespostaAnalise> = { dados: resposta };
    res.json(corpo);
  };
}
