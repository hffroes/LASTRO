import type { Request, Response } from 'express';
import { PrecoMercadoQuerySchema } from '../../shared/schemas';
import { getMarketDataAdapter } from '../services/adapters';

export async function getPrecosMercado(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = PrecoMercadoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }
  const { tipologia, regiao } = parsed.data;

  const adapter = getMarketDataAdapter();
  const preco = await adapter.getPrecoMercado(tipologia, regiao);

  if (!preco) {
    res.status(404).json({
      error: `Sem preço de mercado mock para tipologia "${tipologia}" na região "${regiao}"`,
    });
    return;
  }

  res.status(200).json(preco);
}
