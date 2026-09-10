import type { Analysis, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

// CLAUDE.md / PRD §2.7: até 3 análises salvas por usuário, validado no backend.
export const LIMITE_ANALISES_POR_USUARIO = 3;

export function countAnalisesByUser(userId: string): Promise<number> {
  return prisma.analysis.count({ where: { userId } });
}

export function listAnalisesByUser(userId: string): Promise<Analysis[]> {
  return prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export function findAnaliseById(id: string): Promise<Analysis | null> {
  return prisma.analysis.findUnique({ where: { id } });
}

export function createAnalise(
  data: Prisma.AnalysisUncheckedCreateInput
): Promise<Analysis> {
  return prisma.analysis.create({ data });
}

export function deleteAnalise(id: string): Promise<Analysis> {
  return prisma.analysis.delete({ where: { id } });
}
