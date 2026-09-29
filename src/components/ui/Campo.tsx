import type { InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import estilos from './Campo.module.css';

export interface PropriedadesAcessiveisControle {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

interface PropriedadesCampo {
  id: string;
  rotulo: string;
  dica?: ReactNode;
  erro?: string;
  /** Recebe id e ligações de acessibilidade; cada fase decide o controle (texto, número com unidade, busca). */
  children: (controle: PropriedadesAcessiveisControle) => ReactNode;
}

// Padrão de campo do produto: rótulo, controle, dica e erro. A dica e o erro entram no
// aria-describedby, para o leitor de tela lê-los junto com o campo, não soltos na página.
export function Campo({ id, rotulo, dica, erro, children }: PropriedadesCampo) {
  const idDica = dica ? `${id}-dica` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  const descritoPor = [idErro, idDica].filter(Boolean).join(' ') || undefined;

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.rotulo}>
        {rotulo}
      </label>
      {children({ id, 'aria-describedby': descritoPor, 'aria-invalid': erro ? true : undefined })}
      {erro && (
        <p id={idErro} className={estilos.erro}>
          <AlertCircle size={14} strokeWidth={1.75} aria-hidden="true" className={estilos.iconeErro} />
          {erro}
        </p>
      )}
      {dica && (
        <p id={idDica} className={estilos.dica}>
          {dica}
        </p>
      )}
    </div>
  );
}

export function EntradaTexto({ className, ...resto }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className={[estilos.entrada, className].filter(Boolean).join(' ')} {...resto} />;
}
