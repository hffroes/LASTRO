import type { ButtonHTMLAttributes } from 'react';
import estilos from './Botao.module.css';

type VarianteBotao = 'primaria' | 'secundaria';

interface PropriedadesBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
}

export function Botao({ variante = 'primaria', className, ...resto }: PropriedadesBotao) {
  const classes = [estilos.botao, estilos[variante], className].filter(Boolean).join(' ');

  return <button type="button" className={classes} {...resto} />;
}
