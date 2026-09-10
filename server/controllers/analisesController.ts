import type { Request, Response } from 'express';
import type { Analysis, Prisma } from '@prisma/client';
import { AnalysisInputSchema } from '../../shared/schemas';
import { resolverEAnalisar } from '../services/analiseResolver';
import {
  LIMITE_ANALISES_POR_USUARIO,
  countAnalisesByUser,
  createAnalise,
  deleteAnalise,
  findAnaliseById,
  listAnalisesByUser,
} from '../models/Analysis';

function paraRespostaSalva(analise: Analysis) {
  return {
    id: analise.id,
    input: {
      areaTerreno: analise.areaTerreno,
      areaConstruida: analise.areaConstruida,
      formatoLote: analise.formatoLote,
      topografia: analise.topografia,
      valorTerrenoR: analise.valorTerrenoR,
      tipologia: analise.tipologia,
      padrao: analise.padrao,
      unidades: analise.unidades,
      precoVendaUnitario: analise.precoVendaUnitario,
      percentualLucro: analise.percentualLucro ?? undefined,
      detalhesProto: analise.detalhesProto ?? undefined,
    },
    resultado: analise.resultado,
    parametrosSnapshot: analise.parametrosSnapshot,
    createdAt: analise.createdAt.toISOString(),
  };
}

// Cálculo efêmero — NÃO persiste, não conta para o limite de 3 análises
// (PRD §5.3/§2.6: usuário ajusta premissas e vê o resultado atualizar
// livremente antes de decidir salvar).
export async function calcular(req: Request, res: Response): Promise<void> {
  const parsed = AnalysisInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const { resultado, parametrosSnapshot } = await resolverEAnalisar(
    parsed.data
  );
  res.status(200).json({ resultado, parametrosSnapshot });
}

export async function criar(req: Request, res: Response): Promise<void> {
  const parsed = AnalysisInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const userId = req.auth!.sub;
  const totalExistente = await countAnalisesByUser(userId);
  if (totalExistente >= LIMITE_ANALISES_POR_USUARIO) {
    res.status(400).json({
      error: `Limite de ${LIMITE_ANALISES_POR_USUARIO} análises salvas atingido. Exclua uma análise existente para salvar uma nova.`,
    });
    return;
  }

  const input = parsed.data;
  // Recalcula no backend mesmo para persistir — nunca confia em um
  // resultado vindo do cliente (Notas Arquiteturais do plan.md).
  const { resultado, parametrosSnapshot } = await resolverEAnalisar(input);

  const analise = await createAnalise({
    userId,
    areaTerreno: input.areaTerreno,
    areaConstruida: input.areaConstruida,
    formatoLote: input.formatoLote,
    topografia: input.topografia,
    valorTerrenoR: input.valorTerrenoR,
    tipologia: input.tipologia,
    padrao: input.padrao,
    unidades: input.unidades,
    precoVendaUnitario: input.precoVendaUnitario,
    percentualLucro: input.percentualLucro,
    detalhesProto: input.detalhesProto,
    parametrosSnapshot: parametrosSnapshot as Prisma.InputJsonValue,
    resultado: resultado as unknown as Prisma.InputJsonValue,
  });

  res.status(201).json(paraRespostaSalva(analise));
}

export async function listar(req: Request, res: Response): Promise<void> {
  const userId = req.auth!.sub;
  const analises = await listAnalisesByUser(userId);
  res.status(200).json({ analises: analises.map(paraRespostaSalva) });
}

export async function obter(req: Request, res: Response): Promise<void> {
  const userId = req.auth!.sub;
  const analise = await findAnaliseById(req.params.id);

  // 404 tanto para "não existe" quanto "pertence a outro usuário" — não
  // vaza a existência da análise de terceiros.
  if (!analise || analise.userId !== userId) {
    res.status(404).json({ error: 'Análise não encontrada' });
    return;
  }

  res.status(200).json(paraRespostaSalva(analise));
}

export async function deletar(req: Request, res: Response): Promise<void> {
  const userId = req.auth!.sub;
  const analise = await findAnaliseById(req.params.id);

  if (!analise || analise.userId !== userId) {
    res.status(404).json({ error: 'Análise não encontrada' });
    return;
  }

  await deleteAnalise(analise.id);
  res.status(204).send();
}
