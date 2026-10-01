import type { FormatoLote } from '../../../types/terreno';
import estilos from './Ilustracao.module.css';

// Lote visto de cima, com a rua tracejada embaixo para dar a orientação (frente do lote).
const CONTORNOS: Record<FormatoLote, string> = {
  regular: '32,8 88,8 88,46 32,46',
  // Fora do retângulo: lados inclinados e de tamanhos diferentes, sem nenhum ângulo reto.
  irregular: '26,46 96,46 88,22 64,6 36,14',
};

export function IlustracaoFormatoLote({ formato }: { formato: FormatoLote }) {
  return (
    <svg className={estilos.ilustracao} viewBox="0 0 120 56" preserveAspectRatio="xMidYMid meet" focusable="false">
      <polygon className={estilos.lote} points={CONTORNOS[formato]} />
      <line className={estilos.rua} x1="8" y1="52" x2="112" y2="52" strokeDasharray="4 3" />
    </svg>
  );
}
