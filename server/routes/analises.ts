import { Router } from 'express';
import { criarControladorAnalises } from '../controllers/analisesController';
import type { OpcoesGerarAnalise } from '../../src/utils/motor/analise';
import { validarCorpoDaAnalise } from '../middleware/validacao';

// POST /api/v1/analises (F13): recebe a análise, valida tudo de novo e devolve o resultado com o snapshot
// das premissas. Sem estado: nada é gravado (PRD 2.7; o registro interno é da F31). Desde a F17 aceita também
// "ajustes" de premissa, para o cenário "e se..." do resultado: valem só para a resposta.
export function criarRotaAnalises(opcoes?: OpcoesGerarAnalise) {
  const rota = Router();
  rota.post('/', validarCorpoDaAnalise, criarControladorAnalises({ opcoes }));
  return rota;
}
