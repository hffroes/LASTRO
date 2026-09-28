import { forwardRef } from 'react';
import { Alerta } from './Alerta';
import estilos from './ResumoPendencias.module.css';

export interface Pendencia {
  campo: string;
  mensagem: string;
}

interface PropriedadesResumoPendencias {
  pendencias: readonly Pendencia[];
  aoIrParaCampo: (campo: string) => void;
}

// Recebe o foco quando o "Avançar" é barrado, para o leitor de tela anunciar o que falta; cada
// item leva ao campo correspondente.
export const ResumoPendencias = forwardRef<HTMLDivElement, PropriedadesResumoPendencias>(
  function ResumoPendencias({ pendencias, aoIrParaCampo }, ref) {
    return (
      <div ref={ref} tabIndex={-1} className={estilos.resumo}>
        <Alerta tom="erro" titulo="Falta preencher para avançar">
          <ul className={estilos.lista}>
            {pendencias.map((pendencia) => (
              <li key={pendencia.campo}>
                <button type="button" className={estilos.link} onClick={() => aoIrParaCampo(pendencia.campo)}>
                  {pendencia.mensagem}
                </button>
              </li>
            ))}
          </ul>
        </Alerta>
      </div>
    );
  },
);
