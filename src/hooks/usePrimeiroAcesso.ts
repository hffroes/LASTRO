import { useCallback, useState } from 'react';

const CHAVE_ARMAZENAMENTO = 'lastro-primeiro-acesso-visto';

function lerFlagArmazenada(): boolean {
  try {
    return window.localStorage.getItem(CHAVE_ARMAZENAMENTO) === 'true';
  } catch {
    // localStorage indisponível (ex.: aba anônima bloqueada) — trata cada acesso como o primeiro.
    return false;
  }
}

function salvarFlag(): void {
  try {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, 'true');
  } catch {
    // Sem persistência possível: a flag só vale para esta navegação.
  }
}

export function usePrimeiroAcesso() {
  const [ehPrimeiroAcesso] = useState<boolean>(() => !lerFlagArmazenada());

  const marcarComoVisto = useCallback(() => {
    salvarFlag();
  }, []);

  return { ehPrimeiroAcesso, marcarComoVisto };
}
