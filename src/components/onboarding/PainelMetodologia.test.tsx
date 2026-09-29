import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PASSOS_ONBOARDING } from '../../content/onboarding';
import { TemaProvider } from '../../hooks/useTema';
import { LayoutApp } from '../layout/LayoutApp';

const CHAVE_PRIMEIRO_ACESSO = 'lastro-primeiro-acesso-visto';

// Página com estado local, no lugar do formulário da F05: se o painel desmontasse a página,
// o texto digitado sumiria.
function PaginaComCampo() {
  const [valor, setValor] = useState('');
  return (
    <label>
      Nome do terreno
      <input value={valor} onChange={(evento) => setValor(evento.target.value)} />
    </label>
  );
}

function renderLayout(caminho = '/terreno') {
  return render(
    <TemaProvider>
      <MemoryRouter initialEntries={[caminho]}>
        <Routes>
          <Route element={<LayoutApp />}>
            <Route path="/terreno" element={<PaginaComCampo />} />
            <Route path="/onboarding" element={<div>página de onboarding</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </TemaProvider>,
  );
}

function botaoMetodologia() {
  return screen.getByRole('button', { name: 'Metodologia' });
}

function painel() {
  return document.querySelector('dialog') as HTMLDialogElement;
}

describe('PainelMetodologia (entrada do cabeçalho)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(cleanup);

  it('abre sobre a página, no primeiro passo, com o foco no título', () => {
    renderLayout();

    expect(painel().open).toBe(false);
    fireEvent.click(botaoMetodologia());

    expect(painel().open).toBe(true);
    const titulo = screen.getByRole('heading', { level: 1, name: PASSOS_ONBOARDING[0].titulo });
    expect(document.activeElement).toBe(titulo);
  });

  it('reabrir não limpa o que já foi preenchido na página', () => {
    renderLayout();

    const campo = screen.getByLabelText('Nome do terreno') as HTMLInputElement;
    fireEvent.change(campo, { target: { value: 'Lote da Rua Alagoas' } });

    fireEvent.click(botaoMetodologia());
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar metodologia' }));

    expect(painel().open).toBe(false);
    expect((screen.getByLabelText('Nome do terreno') as HTMLInputElement).value).toBe('Lote da Rua Alagoas');
  });

  it('Esc fecha o painel e devolve o foco a quem o abriu', () => {
    renderLayout();

    botaoMetodologia().focus();
    fireEvent.click(botaoMetodologia());
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });

    expect(painel().open).toBe(false);
    expect(document.activeElement).toBe(botaoMetodologia());
  });

  it('no último passo, o botão principal fecha, e consultar conta como onboarding visto', () => {
    renderLayout();

    fireEvent.click(botaoMetodologia());
    for (let i = 1; i < PASSOS_ONBOARDING.length; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    }
    expect(screen.queryByRole('button', { name: 'Começar análise' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(painel().open).toBe(false);
    expect(window.localStorage.getItem(CHAVE_PRIMEIRO_ACESSO)).toBe('true');
  });

  it('cada abertura recomeça do primeiro passo', () => {
    renderLayout();

    fireEvent.click(botaoMetodologia());
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar metodologia' }));
    fireEvent.click(botaoMetodologia());

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(PASSOS_ONBOARDING[0].titulo);
  });

  it('não aparece no cabeçalho da própria página de onboarding', () => {
    renderLayout('/onboarding');

    expect(screen.queryByRole('button', { name: 'Metodologia' })).toBeNull();
  });
});
