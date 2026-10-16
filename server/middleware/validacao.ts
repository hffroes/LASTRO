import type { RequestHandler } from 'express';
import type { Analise } from '../../src/types/analise';
import { lerAnaliseDoPayload } from '../../src/utils/validacao/analise';
import { responderErro } from './erros';

// Validação OBRIGATÓRIA no backend (PRD 6.3): nada que veio do navegador é confiado, mesmo que a tela
// já tenha validado. As regras e as mensagens são as de src/utils/validacao, as mesmas da tela.
export const validarCorpoDaAnalise: RequestHandler = (req, res, next) => {
  if (!req.is('application/json')) {
    responderErro(res, 415, 'TIPO_NAO_SUPORTADO', 'Envie o corpo como application/json.');
    return;
  }
  const { analise, erros } = lerAnaliseDoPayload(req.body);
  if (analise === null) {
    const corpoInvalido = erros.some((erro) => erro.etapa === 'corpo');
    responderErro(
      res,
      400,
      corpoInvalido ? 'CORPO_INVALIDO' : 'VALIDACAO_FALHOU',
      corpoInvalido ? 'O corpo da requisição não tem o formato esperado.' : 'Alguns dados da análise precisam de ajuste.',
      erros,
    );
    return;
  }
  res.locals.analise = analise satisfies Analise;
  next();
};
