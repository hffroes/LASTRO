import type { Topografia } from '../../../types/terreno';
import estilos from './Ilustracao.module.css';

const BASE = 52;

// Perfil do terreno em corte, da esquerda para a direita (y cresce para baixo). O desnível cresce
// na mesma ordem dos aditivos do PRD 3.2 C, para o desenho nunca sugerir uma ordem diferente.
const PERFIS: Record<Topografia, readonly (readonly [number, number])[]> = {
  plana: [
    [4, 34],
    [116, 34],
  ],
  regular: [
    [4, 40],
    [116, 28],
  ],
  irregular: [
    [4, 38],
    [22, 30],
    [40, 40],
    [60, 26],
    [78, 36],
    [96, 24],
    [116, 32],
  ],
  acidentada: [
    [4, 48],
    [38, 46],
    [50, 40],
    [68, 14],
    [82, 9],
    [116, 7],
  ],
};

export function IlustracaoTopografia({ topografia }: { topografia: Topografia }) {
  const pontos = PERFIS[topografia];
  const linha = pontos.map(([x, y]) => `${x},${y}`).join(' ');
  const [inicio] = pontos;
  const fim = pontos[pontos.length - 1];
  const solo = `${linha} ${fim?.[0]},${BASE} ${inicio?.[0]},${BASE}`;

  return (
    <svg className={estilos.ilustracao} viewBox="0 0 120 56" preserveAspectRatio="xMidYMid meet" focusable="false">
      <polygon className={estilos.solo} points={solo} />
      <polyline className={estilos.perfil} points={linha} />
    </svg>
  );
}
