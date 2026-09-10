import type { Request, Response } from 'express';
import type { AjusteCub } from '@prisma/client';
import {
  findParametro,
  listAjustesCub,
  listTipologias,
} from '../models/Parametro';
import { COEFICIENTES_IA_PLACEHOLDER } from '../utils/parameterConstants';
import type { CubAdjustment, Tipology } from '../../shared/schemas';

function buildAjustesMap(
  ajustes: AjusteCub[],
  categoria: string
): Record<string, number> {
  return Object.fromEntries(
    ajustes
      .filter(a => a.categoria === categoria)
      .map(a => [a.chave, a.percentual])
  );
}

export async function getTipologias(
  _req: Request,
  res: Response
): Promise<void> {
  const tipologias = await listTipologias();

  const resposta: Tipology[] = tipologias.map(t => ({
    id: t.id,
    nome: t.tipologia,
    padrao: t.padrao as Tipology['padrao'],
    percentualTerreno: t.percentualTerreno,
    percentualLucro: t.percentualLucro,
  }));

  res.status(200).json({ tipologias: resposta });
}

export async function getAjustesCub(
  _req: Request,
  res: Response
): Promise<void> {
  const [tipologias, ajustes] = await Promise.all([
    listTipologias(),
    listAjustesCub(),
  ]);

  const ajusteTopografia = buildAjustesMap(ajustes, 'topografia');
  const ajusteFormato = buildAjustesMap(ajustes, 'formato');

  const resposta: CubAdjustment[] = tipologias.map(t => ({
    id: t.id,
    tipologia: t.tipologia,
    padrao: t.padrao,
    ajusteTipologia: t.ajusteTipologiaCub,
    ajusteTopografia,
    ajusteFormato,
  }));

  res.status(200).json({ ajustesCub: resposta });
}

export async function getCoeficientesIa(
  _req: Request,
  res: Response
): Promise<void> {
  const parametro = await findParametro('coeficientes_ia');
  res.status(200).json(parametro?.valor ?? COEFICIENTES_IA_PLACEHOLDER);
}
