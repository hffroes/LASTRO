import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Etapas } from './Etapas';

const ROTULOS = ['Terreno', 'Produto', 'Resultado'];

afterEach(cleanup);

describe('Etapas', () => {
  it('marca as etapas anteriores à atual como concluídas', () => {
    render(<Etapas etapas={ROTULOS} etapaAtual={2} />);

    expect(screen.getByText('Terreno').closest('li')?.getAttribute('data-estado')).toBe('concluida');
    expect(screen.getByText('Produto').closest('li')?.getAttribute('data-estado')).toBe('concluida');
  });

  it('marca a etapa atual como ativa', () => {
    render(<Etapas etapas={ROTULOS} etapaAtual={1} />);

    const item = screen.getByText('Produto').closest('li');

    expect(item?.getAttribute('data-estado')).toBe('ativa');
    expect(item?.getAttribute('aria-current')).toBe('step');
  });

  it('marca as etapas seguintes como futuras', () => {
    render(<Etapas etapas={ROTULOS} etapaAtual={0} />);

    const item = screen.getByText('Resultado').closest('li');

    expect(item?.getAttribute('data-estado')).toBe('futura');
    expect(item?.getAttribute('aria-current')).toBeNull();
  });
});
