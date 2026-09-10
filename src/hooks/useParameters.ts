import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import type { Tipology } from '../../shared/schemas';

// Busca as tipologias/padrões e seus percentuais de referência
// (GET /api/v1/parametros/tipologias, Fase 2) para alimentar o Step 2 do
// formulário — carrega automaticamente % terreno/lucro por combinação.
export function useParameters() {
  const [tipologias, setTipologias] = useState<Tipology[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const res = await apiFetch('/api/v1/parametros/tipologias');
        if (!res.ok) throw new Error('Não foi possível carregar as tipologias');
        const data = await res.json();
        if (!cancelado) setTipologias(data.tipologias);
      } catch (erro) {
        if (!cancelado) {
          setErro(
            erro instanceof Error ? erro.message : 'Erro ao carregar tipologias'
          );
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  return { tipologias, carregando, erro };
}
