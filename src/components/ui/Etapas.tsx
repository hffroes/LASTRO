import estilos from './Etapas.module.css';

export type EstadoEtapa = 'concluida' | 'ativa' | 'futura';

interface PropriedadesEtapas {
  etapas: string[];
  etapaAtual: number;
}

function calcularEstado(indice: number, etapaAtual: number): EstadoEtapa {
  if (indice < etapaAtual) return 'concluida';
  if (indice === etapaAtual) return 'ativa';
  return 'futura';
}

export function Etapas({ etapas, etapaAtual }: PropriedadesEtapas) {
  return (
    <ol className={estilos.lista} aria-label="Progresso da análise">
      {etapas.map((rotulo, indice) => {
        const estado = calcularEstado(indice, etapaAtual);
        return (
          <li
            key={rotulo}
            className={estilos.item}
            data-estado={estado}
            aria-current={estado === 'ativa' ? 'step' : undefined}
          >
            <span className={estilos.indice}>{indice + 1}</span>
            <span className={estilos.rotulo}>{rotulo}</span>
          </li>
        );
      })}
    </ol>
  );
}
