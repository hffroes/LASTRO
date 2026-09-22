import type { ReactNode } from 'react';
import estilos from './Cartao.module.css';

interface PropriedadesCartao {
  children: ReactNode;
  className?: string;
}

export function Cartao({ children, className }: PropriedadesCartao) {
  const classes = [estilos.cartao, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

export function AcoesCartao({ children }: { children: ReactNode }) {
  return <div className={estilos.acoes}>{children}</div>;
}
