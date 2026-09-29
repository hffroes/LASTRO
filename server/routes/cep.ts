import { Router } from 'express';
import { criarControladorCep } from '../controllers/cepController';

// Proxy do CEP no backend (F06): evita CORS no navegador e concentra tempo limite e cache num
// lugar só, em vez de cada aba consultar o provedor diretamente.
export function criarRotaCep(buscar?: typeof fetch) {
  const rota = Router();
  rota.get('/:cep', criarControladorCep({ buscar }));
  return rota;
}
