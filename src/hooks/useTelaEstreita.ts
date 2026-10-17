import { useEffect, useState } from 'react';

// A faixa mobile do plano (< 768 px). Fora do navegador (testes, servidor) ou sem matchMedia, vale a tela
// larga: o conteúdo continua todo na página, só sem a gaveta.
export const CONSULTA_TELA_ESTREITA = '(max-width: 767px)';

function consultar(): MediaQueryList | null {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(CONSULTA_TELA_ESTREITA) : null;
}

export function useTelaEstreita(): boolean {
  const [estreita, setEstreita] = useState(() => consultar()?.matches ?? false);

  useEffect(() => {
    const consulta = consultar();
    if (!consulta) return;
    const aoMudar = () => setEstreita(consulta.matches);
    aoMudar();
    consulta.addEventListener('change', aoMudar);
    return () => consulta.removeEventListener('change', aoMudar);
  }, []);

  return estreita;
}
