// Erro com status HTTP explícito — o middleware de erro em server/app.ts já
// lê `err.status`, então basta lançar isso de qualquer camada (resolver,
// controller) para obter a resposta HTTP correta via asyncHandler.
export class ErroDominio extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ErroDominio';
    this.status = status;
  }
}
