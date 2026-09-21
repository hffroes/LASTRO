import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PaginaInicial } from './PaginaInicial';

function renderPagina() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/onboarding" element={<div>tela de onboarding</div>} />
        <Route path="/terreno" element={<div>tela de terreno</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PaginaInicial', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(cleanup);

  it('mostra as perguntas do produto e o CTA principal', () => {
    renderPagina();

    expect(screen.getByRole('heading', { name: 'Devo adquirir este terreno?' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Começar análise' })).toBeTruthy();
  });

  it('no primeiro acesso, o CTA leva ao onboarding e marca a flag', () => {
    renderPagina();

    fireEvent.click(screen.getByRole('button', { name: 'Começar análise' }));

    expect(screen.getByText('tela de onboarding')).toBeTruthy();
    expect(window.localStorage.getItem('lastro-primeiro-acesso-visto')).toBe('true');
  });

  it('em acessos seguintes, o CTA leva direto ao formulário de terreno', () => {
    window.localStorage.setItem('lastro-primeiro-acesso-visto', 'true');
    renderPagina();

    fireEvent.click(screen.getByRole('button', { name: 'Começar análise' }));

    expect(screen.getByText('tela de terreno')).toBeTruthy();
  });

  it('o link "Ver a metodologia" também leva ao onboarding', () => {
    renderPagina();

    fireEvent.click(screen.getByRole('button', { name: 'Ver a metodologia' }));

    expect(screen.getByText('tela de onboarding')).toBeTruthy();
  });
});
