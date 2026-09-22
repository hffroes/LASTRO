import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import estilos from './Alerta.module.css';

export type TomAlerta = 'info' | 'atencao' | 'sucesso' | 'erro';

interface PropriedadesAlerta {
  tom?: TomAlerta;
  titulo?: string;
  children: ReactNode;
}

const ICONES = {
  info: Info,
  atencao: AlertTriangle,
  sucesso: CheckCircle2,
  erro: XCircle,
} as const;

export function Alerta({ tom = 'info', titulo, children }: PropriedadesAlerta) {
  const Icone = ICONES[tom];

  return (
    <div className={`${estilos.alerta} ${estilos[tom]}`} role="note">
      <Icone className={estilos.icone} size={18} strokeWidth={1.75} aria-hidden="true" />
      <div className={estilos.conteudo}>
        {titulo && <strong className={estilos.titulo}>{titulo}</strong>}
        <span className={estilos.corpo}>{children}</span>
      </div>
    </div>
  );
}
