import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Combobox } from './Combobox';

const OPCOES = [
  { valor: 1, rotulo: 'Belo Horizonte' },
  { valor: 2, rotulo: 'São João del Rei' },
  { valor: 3, rotulo: 'João Monlevade' },
  { valor: 4, rotulo: 'Sabará' },
  { valor: 5, rotulo: 'Betim' },
];

function Controlado({ inicial = null, limite }: { inicial?: number | null; limite?: number }) {
  const [valor, setValor] = useState<number | null>(inicial);
  return (
    <>
      <label htmlFor="cidade">Cidade</label>
      <Combobox id="cidade" opcoes={OPCOES} valor={valor} aoMudar={setValor} limiteResultados={limite} />
      <span data-testid="valor">{valor ?? 'nenhum'}</span>
    </>
  );
}

function campo() {
  return screen.getByRole('combobox', { name: 'Cidade' }) as HTMLInputElement;
}

function rotulosVisiveis() {
  return screen.queryAllByRole('option').map((opcao) => opcao.textContent);
}

afterEach(cleanup);

describe('Combobox', () => {
  it('começa fechado, com os atributos do padrão ARIA', () => {
    render(<Controlado />);

    expect(campo().getAttribute('aria-expanded')).toBe('false');
    expect(campo().getAttribute('aria-autocomplete')).toBe('list');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('filtra ignorando acentos e maiúsculas, com quem começa pelo texto primeiro', () => {
    render(<Controlado />);

    fireEvent.change(campo(), { target: { value: 'JOAO' } });

    expect(campo().getAttribute('aria-expanded')).toBe('true');
    expect(rotulosVisiveis()).toEqual(['João Monlevade', 'São João del Rei']);
  });

  it('anuncia a quantidade de resultados', () => {
    render(<Controlado />);

    fireEvent.change(campo(), { target: { value: 'be' } });

    expect(screen.getByRole('status').textContent).toBe('2 resultados.');
  });

  it('setas movem a opção ativa (aria-activedescendant) e Enter escolhe', () => {
    render(<Controlado />);

    fireEvent.change(campo(), { target: { value: 'be' } });
    fireEvent.keyDown(campo(), { key: 'ArrowDown' });
    fireEvent.keyDown(campo(), { key: 'ArrowDown' });

    const ativa = document.getElementById(campo().getAttribute('aria-activedescendant') ?? '');
    expect(ativa?.textContent).toBe('Betim');

    fireEvent.keyDown(campo(), { key: 'Enter' });

    expect(screen.getByTestId('valor').textContent).toBe('5');
    expect(campo().value).toBe('Betim');
    expect(campo().getAttribute('aria-expanded')).toBe('false');
  });

  it('seta para cima a partir do campo vai à última opção', () => {
    render(<Controlado />);

    fireEvent.change(campo(), { target: { value: 'be' } });
    fireEvent.keyDown(campo(), { key: 'ArrowUp' });

    const ativa = document.getElementById(campo().getAttribute('aria-activedescendant') ?? '');
    expect(ativa?.textContent).toBe('Betim');
  });

  it('Esc fecha a lista sem escolher', () => {
    render(<Controlado />);

    fireEvent.change(campo(), { target: { value: 'be' } });
    fireEvent.keyDown(campo(), { key: 'Escape' });

    expect(campo().getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByTestId('valor').textContent).toBe('nenhum');
  });

  it('clique (mousedown) numa opção escolhe', () => {
    render(<Controlado />);

    fireEvent.change(campo(), { target: { value: 'sab' } });
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Sabará' }));

    expect(screen.getByTestId('valor').textContent).toBe('4');
  });

  it('ao sair, texto igual a uma opção (sem acento) a seleciona na grafia certa', () => {
    render(<Controlado />);

    fireEvent.change(campo(), { target: { value: 'sabara' } });
    fireEvent.blur(campo());

    expect(screen.getByTestId('valor').textContent).toBe('4');
    expect(campo().value).toBe('Sabará');
  });

  it('ao sair, texto que não é opção desfaz a seleção e fica na tela para corrigir', () => {
    render(<Controlado inicial={1} />);

    fireEvent.change(campo(), { target: { value: 'Belo Horizont' } });
    fireEvent.blur(campo());

    expect(screen.getByTestId('valor').textContent).toBe('nenhum');
    expect(campo().value).toBe('Belo Horizont');
  });

  it('limita as opções renderizadas e pede para refinar', () => {
    render(<Controlado limite={2} />);

    fireEvent.change(campo(), { target: { value: 'b' } });

    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByText('Continue digitando para refinar a busca.')).toBeTruthy();
  });

  it('sem resultado, avisa', () => {
    render(<Controlado />);

    fireEvent.change(campo(), { target: { value: 'xyz' } });

    expect(screen.getByRole('status').textContent).toBe('Nenhuma opção encontrada.');
  });
});
