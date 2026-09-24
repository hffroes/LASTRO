import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PASSOS_ONBOARDING } from '../content/onboarding';
import { Onboarding } from './Onboarding';

const CHAVE_PRIMEIRO_ACESSO = 'lastro-primeiro-acesso-visto';

function renderOnboarding({ modoConsulta = false } = {}) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: '/' },
        { pathname: '/onboarding', state: modoConsulta ? { modoConsulta: true } : null },
      ]}
      initialIndex={1}
    >
      <Routes>
        <Route path="/" element={<div>tela inicial</div>} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/terreno" element={<div>tela de terreno</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function tituloAtual() {
  return screen.getByRole('heading', { level: 1 }).textContent;
}

function avancarAteOUltimoPasso() {
  for (let i = 1; i < PASSOS_ONBOARDING.length; i += 1) {
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
  }
}

describe('Onboarding', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(cleanup);

  it('começa no primeiro passo, sem botão Voltar', () => {
    renderOnboarding();

    expect(tituloAtual()).toBe(PASSOS_ONBOARDING[0].titulo);
    expect(screen.getByText(`Metodologia · 1 de ${PASSOS_ONBOARDING.length}`)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Voltar' })).toBeNull();
  });

  it('percorre todos os passos em ordem com Avançar', () => {
    renderOnboarding();

    PASSOS_ONBOARDING.forEach((passo, indice) => {
      expect(tituloAtual()).toBe(passo.titulo);
      if (indice < PASSOS_ONBOARDING.length - 1) {
        fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
      }
    });
  });

  it('Voltar retorna ao passo anterior', () => {
    renderOnboarding();

    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(tituloAtual()).toBe(PASSOS_ONBOARDING[1].titulo);
  });

  it('leva o foco ao título ao trocar de passo', () => {
    renderOnboarding();

    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }));
  });

  it('"Pular" no meio da sequência leva ao formulário e marca o onboarding como visto', () => {
    renderOnboarding();

    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));

    expect(screen.getByText('tela de terreno')).toBeTruthy();
    expect(window.localStorage.getItem(CHAVE_PRIMEIRO_ACESSO)).toBe('true');
  });

  it('concluir o último passo leva ao formulário e marca o onboarding como visto', () => {
    renderOnboarding();

    avancarAteOUltimoPasso();
    expect(screen.queryByRole('button', { name: 'Pular' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Começar análise' }));

    expect(screen.getByText('tela de terreno')).toBeTruthy();
    expect(window.localStorage.getItem(CHAVE_PRIMEIRO_ACESSO)).toBe('true');
  });

  describe('modo consulta', () => {
    it('troca "Pular" por "Fechar metodologia", que volta à tela anterior', () => {
      renderOnboarding({ modoConsulta: true });

      expect(screen.queryByRole('button', { name: 'Pular' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Fechar metodologia' }));

      expect(screen.getByText('tela inicial')).toBeTruthy();
    });

    it('no último passo, o botão principal fecha em vez de iniciar a análise', () => {
      renderOnboarding({ modoConsulta: true });

      avancarAteOUltimoPasso();
      expect(screen.queryByRole('button', { name: 'Começar análise' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

      expect(screen.getByText('tela inicial')).toBeTruthy();
    });
  });
});

describe('conteúdo da metodologia', () => {
  const textoCompleto = PASSOS_ONBOARDING.flatMap((passo) => [
    passo.titulo,
    passo.introducao,
    passo.nota ?? '',
    ...(passo.itens ?? []).flatMap((item) => [item.rotulo, item.descricao]),
    ...(passo.formula ?? []).map((linha) => linha.rotulo),
  ]).join(' ');

  it('explica o resíduo na ordem VGV → custos → resultado do terreno', () => {
    const formula = PASSOS_ONBOARDING.find((passo) => passo.formula)?.formula ?? [];

    expect(formula.map((linha) => linha.rotulo)).toEqual([
      'VGV',
      'Custo de obra',
      'Despesas gerais',
      'Lucro do incorporador',
      'Resultado do terreno',
    ]);
  });

  it('usa "CA" para Coeficiente de Aproveitamento, nunca "IA"', () => {
    expect(textoCompleto).toContain('Coeficiente de Aproveitamento (CA)');
    expect(textoCompleto).not.toMatch(/\bIA\b/);
    expect(textoCompleto).not.toMatch(/intelig[êe]ncia artificial/i);
  });

  it('avisa que a cobertura do MVP é só Minas Gerais', () => {
    expect(textoCompleto).toMatch(/Minas Gerais/);
  });

  it('não cita percentuais, que ainda dependem de decisões em aberto', () => {
    expect(textoCompleto).not.toMatch(/\d+\s*%/);
  });

  it('respeita a caixa baixa da marca', () => {
    expect(textoCompleto).not.toMatch(/\b(Lastro|LASTRO)\b/);
  });
});
