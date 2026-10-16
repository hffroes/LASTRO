import type { ErrorRequestHandler, RequestHandler, Response } from 'express';
import type { CodigoErroApi, CorpoApi, ErroValidacao } from '../../src/types/analise';

// Formato único de erro da API (CLAUDE.md: "respostas em formato consistente"): { erro: { codigo,
// mensagem, detalhes? } }, o mesmo do CEP. A mensagem é para a pessoa, em pt-BR; nunca vaza pilha de
// chamadas nem detalhe interno.
export function responderErro(
  res: Response,
  status: number,
  codigo: CodigoErroApi,
  mensagem: string,
  detalhes?: ErroValidacao[],
): void {
  const corpo: CorpoApi<never> = { erro: { codigo, mensagem, ...(detalhes ? { detalhes } : {}) } };
  res.status(status).json(corpo);
}

// Rota de /api/v1 que não existe: JSON, e não a página HTML de erro padrão do Express.
export const rotaApiNaoEncontrada: RequestHandler = (_req, res) => {
  responderErro(res, 404, 'ROTA_NAO_ENCONTRADA', 'Esta rota da API não existe.');
};

interface ErroComStatus extends Error {
  status?: number;
  type?: string;
}

// Último da cadeia (Express reconhece pelos 4 argumentos). Falhas do corpo vêm do express.json.
export const tratadorDeErros: ErrorRequestHandler = (erro: ErroComStatus, _req, res, next) => {
  if (res.headersSent) {
    next(erro);
    return;
  }
  if (erro.type === 'entity.parse.failed') {
    responderErro(res, 400, 'CORPO_INVALIDO', 'O corpo da requisição não é um JSON válido.');
    return;
  }
  if (erro.type === 'entity.too.large') {
    responderErro(res, 413, 'PAYLOAD_GRANDE_DEMAIS', 'O corpo da requisição é grande demais.');
    return;
  }
  // Erro nosso: fica no log do servidor, e quem chamou recebe só a mensagem genérica.
  console.error('Erro não tratado na API:', erro);
  responderErro(res, 500, 'ERRO_INTERNO', 'Não foi possível gerar a análise agora. Tente novamente em instantes.');
};
