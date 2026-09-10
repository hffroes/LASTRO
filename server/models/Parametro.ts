import type { AjusteCub, Parametro, Tipologia } from '@prisma/client';
import { prisma } from '../lib/prisma';

export function listTipologias(): Promise<Tipologia[]> {
  return prisma.tipologia.findMany({
    orderBy: [{ tipologia: 'asc' }, { padrao: 'asc' }],
  });
}

export function findTipologia(
  tipologia: string,
  padrao: string
): Promise<Tipologia | null> {
  return prisma.tipologia.findUnique({
    where: { tipologia_padrao: { tipologia, padrao } },
  });
}

export function listAjustesCub(): Promise<AjusteCub[]> {
  return prisma.ajusteCub.findMany({
    orderBy: [{ categoria: 'asc' }, { chave: 'asc' }],
  });
}

export function findParametro(chave: string): Promise<Parametro | null> {
  return prisma.parametro.findUnique({ where: { chave } });
}
