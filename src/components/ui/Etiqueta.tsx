import type { ReactNode } from 'react';
import estilos from './Etiqueta.module.css';

type TomEtiqueta = 'neutro' | 'info';

interface PropriedadesEtiqueta {
  tom?: TomEtiqueta;
  children: ReactNode;
  'data-testid'?: string;
}

// Etiqueta de status do guia (seção 05, "Status e etiquetas"): pílula com ponto. A palavra carrega o
// estado; a cor só o reforça.
export function Etiqueta({ tom = 'neutro', children, 'data-testid': idTeste }: PropriedadesEtiqueta) {
  return (
    <span className={estilos.etiqueta} data-tom={tom} data-testid={idTeste}>
      <span className={estilos.ponto} aria-hidden="true" />
      {children}
    </span>
  );
}
