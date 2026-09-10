import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Express 4 não encaminha rejeições de Promise ao middleware de erro
// automaticamente — sem isso, uma exceção em um handler async trava a
// requisição em vez de responder com 500.
export function asyncHandler(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
