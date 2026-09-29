import express from 'express';
import { criarRotaCep } from './routes/cep';
import { rotaSaude } from './routes/saude';

interface OpcoesApp {
  // Testes injetam um fetch falso para não depender do provedor externo.
  buscarExterno?: typeof fetch;
}

export function criarApp({ buscarExterno }: OpcoesApp = {}) {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/saude', rotaSaude);
  app.use('/api/v1/cep', criarRotaCep(buscarExterno));
  return app;
}
