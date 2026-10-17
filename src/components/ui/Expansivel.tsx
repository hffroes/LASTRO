import type { ReactNode } from 'react';
import estilos from './Expansivel.module.css';

interface PropriedadesExpansivel {
  titulo: string;
  children: ReactNode;
  /** "discreta" para a fórmula sob demanda de uma linha, "principal" para uma seção recolhida. */
  variante?: 'principal' | 'discreta';
  className?: string;
}

// Recolhe o detalhe sem tirar da página: <details> nativo, que já traz teclado (Enter e espaço), foco e
// o estado aberto ou fechado para o leitor de tela. Recolhida por padrão; abrir não reordena nada, só
// empurra o que vem depois (PRD 10.3: resultado simples primeiro, detalhes progressivos).
export function Expansivel({ titulo, children, variante = 'principal', className }: PropriedadesExpansivel) {
  const classes = [estilos.expansivel, estilos[variante], className].filter(Boolean).join(' ');
  return (
    <details className={classes}>
      <summary className={estilos.resumo}>{titulo}</summary>
      <div className={estilos.corpo}>{children}</div>
    </details>
  );
}
