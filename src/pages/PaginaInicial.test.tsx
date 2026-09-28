import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MetodologiaProvider, useMetodologia } from '../hooks/useMetodologia';
import { PaginaInicial } from './PaginaInicial';

// O painel real é testado em PainelMetodologia.test; aqui basta saber se a página pediu para abri-lo.
function SinalPainel() {
  const { aberta } = useMetodologia();
  return aberta ? <div>painel da metodologia aberto</div> : null;
}

function renderPagina() {
  return render(
    <MetodologiaProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<PaginaInicial />} />
          <Route path="/onboarding" element={<div>tela de onboarding</div>} />
          <Route path="/terreno" element={<div>tela de terreno</div>} />
        </Routes>
      </MemoryRouter>
      <SinalPainel />
    </MetodologiaProvider>,
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

  it('"Ver a metodologia" abre o painel sem sair da página inicial', () => {
    renderPagina();

    fireEvent.click(screen.getByRole('button', { name: 'Ver a metodologia' }));

    expect(screen.getByText('painel da metodologia aberto')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Devo adquirir este terreno?' })).toBeTruthy();
  });
});
