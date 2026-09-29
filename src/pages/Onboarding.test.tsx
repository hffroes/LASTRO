import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DIAGRAMA_RESIDUO, PASSOS_ONBOARDING } from '../content/onboarding';
import { Onboarding } from './Onboarding';

const CHAVE_PRIMEIRO_ACESSO = 'lastro-primeiro-acesso-visto';

function renderOnboarding() {
  return render(
    <MemoryRouter initialEntries={['/', '/onboarding']} initialIndex={1}>
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

  describe('teclado', () => {
    it('seta para a direita avança e seta para a esquerda volta', () => {
      renderOnboarding();

      fireEvent.keyDown(document.body, { key: 'ArrowRight' });
      fireEvent.keyDown(document.body, { key: 'ArrowRight' });
      expect(tituloAtual()).toBe(PASSOS_ONBOARDING[2].titulo);

      fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
      expect(tituloAtual()).toBe(PASSOS_ONBOARDING[1].titulo);
    });

    it('funciona com o foco já dentro da sequência, e leva o foco ao título', () => {
      renderOnboarding();

      fireEvent.keyDown(screen.getByRole('button', { name: 'Avançar' }), { key: 'ArrowRight' });

      expect(tituloAtual()).toBe(PASSOS_ONBOARDING[1].titulo);
      expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }));
    });

    it('para nas pontas: não volta antes do primeiro passo nem conclui pelo teclado', () => {
      renderOnboarding();

      fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
      expect(tituloAtual()).toBe(PASSOS_ONBOARDING[0].titulo);

      for (let i = 0; i < PASSOS_ONBOARDING.length + 2; i += 1) {
        fireEvent.keyDown(document.body, { key: 'ArrowRight' });
      }
      expect(tituloAtual()).toBe(PASSOS_ONBOARDING[PASSOS_ONBOARDING.length - 1].titulo);
      expect(screen.queryByText('tela de terreno')).toBeNull();
    });

    it('ignora setas com modificador e setas digitadas num campo', () => {
      render(
        <MemoryRouter initialEntries={['/onboarding']}>
          <input aria-label="campo qualquer" />
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </MemoryRouter>,
      );

      fireEvent.keyDown(document.body, { key: 'ArrowRight', altKey: true });
      fireEvent.keyDown(screen.getByLabelText('campo qualquer'), { key: 'ArrowRight' });

      expect(tituloAtual()).toBe(PASSOS_ONBOARDING[0].titulo);
    });
  });

  it('o indicador de progresso acompanha o passo atual', () => {
    renderOnboarding();

    const percorridos = () =>
      screen.getByTestId('progresso-onboarding').querySelectorAll('[data-estado="percorrido"]').length;

    expect(screen.getByTestId('progresso-onboarding').children).toHaveLength(PASSOS_ONBOARDING.length);
    expect(percorridos()).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(percorridos()).toBe(2);
  });

  it('mostra o diagrama do resíduo rotulado como exemplo, sem valores', () => {
    renderOnboarding();

    const indiceResiduo = PASSOS_ONBOARDING.findIndex((passo) => passo.diagrama === 'residuo');
    for (let i = 0; i < indiceResiduo; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    }

    const figura = screen.getByRole('figure');
    expect(figura.textContent).toContain('Exemplo ilustrativo · fora de escala');
    expect(figura.textContent).toContain('Resultado do terreno');
    // Nenhum número no diagrama: nem R$, nem percentual, nem valor solto.
    expect(figura.textContent).not.toMatch(/\d/);
  });
});

describe('conteúdo da metodologia', () => {
  const textoCompleto = PASSOS_ONBOARDING.flatMap((passo) => [
    passo.titulo,
    passo.introducao,
    passo.nota ?? '',
    ...(passo.diagrama === 'residuo'
      ? [DIAGRAMA_RESIDUO.aviso, DIAGRAMA_RESIDUO.descricaoTodo, DIAGRAMA_RESIDUO.rotuloPartes]
      : []),
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

  it('apresenta o objetivo como escolha do usuário e a recomendação nos dois vocabulários', () => {
    expect(textoCompleto).toContain('Comprar o terreno ou executar o empreendimento');
    expect(textoCompleto).toMatch(/comprar ou não o terreno/);
    expect(textoCompleto).toMatch(/fazer ou não o empreendimento/);
  });

  it('respeita a caixa baixa da marca', () => {
    expect(textoCompleto).not.toMatch(/\b(Lastro|LASTRO)\b/);
  });
});
