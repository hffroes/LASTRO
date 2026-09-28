import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AnaliseProvider } from '../hooks/useAnalise';
import { LIMITE_NOME_TERRENO, MENSAGENS_TERRENO } from '../utils/validacao/terreno';
import { Terreno } from './Terreno';

function ProdutoFalso() {
  const navegar = useNavigate();
  return (
    <div>
      tela de produto
      <button onClick={() => navegar('/terreno')}>voltar ao terreno</button>
    </div>
  );
}

function renderTerreno() {
  return render(
    <MemoryRouter initialEntries={['/terreno']}>
      <AnaliseProvider>
        <Routes>
          <Route path="/" element={<div>tela inicial</div>} />
          <Route path="/terreno" element={<Terreno />} />
          <Route path="/produto" element={<ProdutoFalso />} />
        </Routes>
      </AnaliseProvider>
    </MemoryRouter>,
  );
}

function campoNome() {
  return screen.getByLabelText('Nome ou identificação do terreno') as HTMLInputElement;
}

function avancar() {
  fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
}

function preencherEtapaValida() {
  fireEvent.click(screen.getByLabelText(/Comprar o terreno/));
  fireEvent.change(campoNome(), { target: { value: 'Lote da Rua Alagoas' } });
}

describe('Terreno', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(cleanup);

  it('mostra as seções da Etapa 1, com o objetivo da análise primeiro', () => {
    renderTerreno();

    const secoes = screen.getAllByRole('heading', { level: 2 }).map((titulo) => titulo.textContent);
    expect(secoes).toEqual([
      'Objetivo da análise',
      'Identificação e localização',
      'Dados físicos e financeiros',
      'Características do lote',
    ]);
  });

  it('não acusa erro antes de o usuário passar pelo campo', () => {
    renderTerreno();

    expect(screen.queryByText(MENSAGENS_TERRENO.nomeVazio)).toBeNull();
    expect(campoNome().getAttribute('aria-invalid')).toBeNull();
  });

  it('valida o nome ao sair do campo e liga o erro ao campo por aria-describedby', () => {
    renderTerreno();

    fireEvent.change(campoNome(), { target: { value: '   ' } });
    fireEvent.blur(campoNome());

    const erro = screen.getByText(MENSAGENS_TERRENO.nomeVazio);
    expect(campoNome().getAttribute('aria-invalid')).toBe('true');
    expect(campoNome().getAttribute('aria-describedby')).toContain(erro.id);
  });

  it('acusa o limite de tamanho sem cortar o que foi digitado', () => {
    renderTerreno();

    const longo = 'a'.repeat(LIMITE_NOME_TERRENO + 5);
    fireEvent.change(campoNome(), { target: { value: longo } });
    fireEvent.blur(campoNome());

    expect(campoNome().value).toBe(longo);
    expect(screen.getByText(MENSAGENS_TERRENO.nomeLongo(LIMITE_NOME_TERRENO + 5))).toBeTruthy();
  });

  it('o erro some assim que o valor fica válido, sem esperar novo blur', () => {
    renderTerreno();

    fireEvent.blur(campoNome());
    expect(screen.getByText(MENSAGENS_TERRENO.nomeVazio)).toBeTruthy();

    fireEvent.change(campoNome(), { target: { value: 'Lote 12' } });
    expect(screen.queryByText(MENSAGENS_TERRENO.nomeVazio)).toBeNull();
  });

  it('bloqueia o Avançar com resumo de pendências, que recebe o foco', async () => {
    renderTerreno();

    avancar();

    expect(screen.queryByText('tela de produto')).toBeNull();
    const resumo = screen.getByText('Falta preencher para avançar').closest('[tabindex="-1"]');
    expect(screen.getByRole('button', { name: MENSAGENS_TERRENO.objetivoAusente })).toBeTruthy();
    expect(screen.getByRole('button', { name: MENSAGENS_TERRENO.nomeVazio })).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(resumo));
  });

  it('cada pendência leva ao seu campo', () => {
    renderTerreno();
    avancar();

    fireEvent.click(screen.getByRole('button', { name: MENSAGENS_TERRENO.nomeVazio }));
    expect(document.activeElement).toBe(campoNome());

    fireEvent.click(screen.getByRole('button', { name: MENSAGENS_TERRENO.objetivoAusente }));
    expect(document.activeElement).toBe(screen.getByLabelText(/Comprar o terreno/));
  });

  it('o resumo encolhe conforme as pendências são resolvidas e some no fim', () => {
    renderTerreno();
    avancar();

    fireEvent.click(screen.getByLabelText(/Executar o empreendimento/));
    expect(screen.queryByRole('button', { name: MENSAGENS_TERRENO.objetivoAusente })).toBeNull();

    fireEvent.change(campoNome(), { target: { value: 'Lote 12' } });
    expect(screen.queryByText('Falta preencher para avançar')).toBeNull();
  });

  it('com a etapa válida, avança para Produto', () => {
    renderTerreno();
    preencherEtapaValida();

    avancar();

    expect(screen.getByText('tela de produto')).toBeTruthy();
  });

  it('o estado sobrevive à ida a Produto e à volta', () => {
    renderTerreno();
    preencherEtapaValida();
    avancar();

    fireEvent.click(screen.getByRole('button', { name: 'voltar ao terreno' }));

    expect(campoNome().value).toBe('Lote da Rua Alagoas');
    expect((screen.getByLabelText(/Comprar o terreno/) as HTMLInputElement).checked).toBe(true);
  });

  it('Voltar leva à página inicial sem validar', () => {
    renderTerreno();

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByText('tela inicial')).toBeTruthy();
  });
});
