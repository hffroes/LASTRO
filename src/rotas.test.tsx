import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { TemaProvider } from './hooks/useTema';
import { PASSOS_ONBOARDING } from './content/onboarding';
import { Rotas } from './rotas';

function renderEm(caminho: string) {
  return render(
    <TemaProvider>
      <MemoryRouter initialEntries={[caminho]}>
        <Rotas />
      </MemoryRouter>
    </TemaProvider>,
  );
}

afterEach(cleanup);

describe('rotas', () => {
  it.each([
    ['/', 'Devo adquirir este terreno?'],
    ['/onboarding', PASSOS_ONBOARDING[0].titulo],
    ['/terreno', 'Terreno'],
    ['/produto', 'Produto'],
    ['/resultado', 'Resultado'],
  ])('renderiza a página correta para %s', (caminho, titulo) => {
    renderEm(caminho);

    const cabecalho = screen.getByRole('heading', { name: titulo });
    expect(cabecalho.tagName).toBe('H1');
  });

  it('cai na página 404 para uma rota inexistente', () => {
    renderEm('/rota-que-nao-existe');

    const cabecalho = screen.getByRole('heading', { name: 'Página não encontrada' });
    expect(cabecalho.tagName).toBe('H1');
  });

  it('mostra o indicador de etapas apenas nas páginas do fluxo de análise', () => {
    const primeiraRenderizacao = renderEm('/terreno');
    expect(screen.getByRole('list', { name: 'Progresso da análise' })).toBeTruthy();
    primeiraRenderizacao.unmount();

    renderEm('/');
    expect(screen.queryByRole('list', { name: 'Progresso da análise' })).toBeNull();
  });
});
