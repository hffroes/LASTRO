import express from 'express';
import type { OpcoesGerarAnalise } from '../src/utils/motor/analise';
import { rotaApiNaoEncontrada, tratadorDeErros } from './middleware/erros';
import { criarRotaAnalises } from './routes/analises';
import { criarRotaCep } from './routes/cep';
import { rotaSaude } from './routes/saude';

interface OpcoesApp {
  // Testes injetam um fetch falso para não depender do provedor externo.
  buscarExterno?: typeof fetch;
  // Testes injetam parâmetros ou base de CUB diferentes na análise.
  opcoesAnalise?: OpcoesGerarAnalise;
}

// Cada análise cabe em poucos KB; o teto barra corpo absurdo antes de qualquer validação.
const LIMITE_CORPO = '50kb';

export function criarApp({ buscarExterno, opcoesAnalise }: OpcoesApp = {}) {
  const app = express();
  app.use(express.json({ limit: LIMITE_CORPO }));
  app.use('/api/v1/saude', rotaSaude);
  app.use('/api/v1/cep', criarRotaCep(buscarExterno));
  app.use('/api/v1/analises', criarRotaAnalises(opcoesAnalise));
  app.use('/api/v1', rotaApiNaoEncontrada);
  app.use(tratadorDeErros);
  return app;
}
