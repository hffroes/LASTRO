import type { ButtonHTMLAttributes } from 'react';
import estilos from './Botao.module.css';

type VarianteBotao = 'primaria' | 'secundaria' | 'contorno' | 'fantasma';
type TamanhoBotao = 'medio' | 'grande';

interface PropriedadesBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
}

export function Botao({
  variante = 'primaria',
  tamanho = 'medio',
  className,
  ...resto
}: PropriedadesBotao) {
  const classes = [estilos.botao, estilos[variante], estilos[tamanho], className]
    .filter(Boolean)
    .join(' ');

  return <button type="button" className={classes} {...resto} />;
}
