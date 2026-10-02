import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FORMATOS_LOTE, TOPOGRAFIAS } from '../../../types/terreno';
import { IlustracaoFormatoLote } from './IlustracaoFormatoLote';
import { IlustracaoTopografia } from './IlustracaoTopografia';

describe('ilustrações do terreno', () => {
  it.each(FORMATOS_LOTE)('formato %s', (formato) => {
    const { container } = render(<IlustracaoFormatoLote formato={formato} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it.each(TOPOGRAFIAS)('topografia %s', (topografia) => {
    const { container } = render(<IlustracaoTopografia topografia={topografia} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('nenhuma cor no SVG: traço e preenchimento vêm só dos tokens, pelo CSS', () => {
    const { container } = render(
      <>
        {FORMATOS_LOTE.map((formato) => (
          <IlustracaoFormatoLote key={formato} formato={formato} />
        ))}
        {TOPOGRAFIAS.map((topografia) => (
          <IlustracaoTopografia key={topografia} topografia={topografia} />
        ))}
      </>,
    );
    expect(container.innerHTML).not.toMatch(/(fill|stroke|style|color)="/);
  });

  it('o desnível do perfil cresce na ordem dos aditivos: plana < regular < irregular < acidentada', () => {
    const amplitude = (topografia: (typeof TOPOGRAFIAS)[number]) => {
      const { container, unmount } = render(<IlustracaoTopografia topografia={topografia} />);
      const ys = (container.querySelector('polyline')?.getAttribute('points') ?? '')
        .split(' ')
        .map((par) => Number(par.split(',')[1]));
      unmount();
      return Math.max(...ys) - Math.min(...ys);
    };
    const amplitudes = TOPOGRAFIAS.map(amplitude);
    expect(amplitudes[0]).toBe(0);
    for (let i = 1; i < amplitudes.length; i += 1) {
      expect(amplitudes[i]).toBeGreaterThan(amplitudes[i - 1] as number);
    }
  });
});
