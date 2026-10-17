import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TEXTOS_RESULTADO } from '../content/resultado';
import { AnaliseProvider, CHAVE_RASCUNHO } from '../hooks/useAnalise';
import { ESPERA_RECALCULO_MS } from '../hooks/usePremissas';
import type { Analise } from '../types/analise';
import type { AjustesPremissas } from '../types/parametros';
import { gerarAnalise } from '../utils/motor/analise';
import { MENSAGENS_AJUSTES } from '../utils/validacao/ajustes';
import { MENSAGENS_PRODUTO } from '../utils/validacao/produto';
import { Resultado } from './Resultado';

// F17: o cenário "e se..." no resultado. O cenário de referência é o de premissas.test.ts: prédio Normal
// 4 × 4, 1.000 m² a 60%, 16 unidades a R$ 900.000, pedido R$ 1,2 milhão → preço máximo R$ 2.076.216,00.
const texto = TEXTOS_RESULTADO.cenarios;

function analiseValida(objetivo: Analise['objetivo'] = 'comprarTerreno'): Analise {
  return {
    objetivo,
    terreno: {
      nome: 'Lote da Rua Alagoas',
      codigoMunicipioIbge: 3106200,
      cep: '',
      logradouro: '',
      bairro: '',
      ufCep: null,
      enderecoPeloCep: false,
      areaTotalM2: 1000,
      precoPedidoCentavos: 120_000_000,
      formatoLote: 'regular',
      topografia: 'regular',
    },
    produto: {
      tipoProjeto: 'residencial',
      tipologia: 'predio',
      padrao: 'normal',
      pavimentos: 4,
      unidadesPorPavimento: 4,
      areaUnidadeM2: 68.5,
      precoUnidadeCentavos: 90_000_000,
      taxaOcupacaoPontosBase: 6_000,
    },
  };
}

function respostaJson(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });
}

// O servidor de verdade calcula com o mesmo motor, e com os ajustes do pedido: a resposta falsa também.
function servidorQueCalcula() {
  return vi.fn(async (_url: RequestInfo | URL, inicio?: RequestInit) => {
    const { ajustes, ...analise } = JSON.parse(String(inicio?.body)) as Analise & { ajustes?: AjustesPremissas };
    return respostaJson({ dados: gerarAnalise(analise, {}, ajustes) });
  });
}

function corpoDoPedido(buscar: ReturnType<typeof servidorQueCalcula>, indice: number) {
  return JSON.parse(String(buscar.mock.calls[indice]?.[1]?.body)) as Analise & { ajustes?: AjustesPremissas };
}

function renderResultado() {
  return render(
    <MemoryRouter initialEntries={['/resultado']}>
      <AnaliseProvider>
        <Routes>
          <Route path="/produto" element={<div>tela de produto</div>} />
          <Route path="/resultado" element={<Resultado />} />
        </Routes>
      </AnaliseProvider>
    </MemoryRouter>,
  );
}

function campo(premissa: string): HTMLInputElement {
  return document.querySelector<HTMLInputElement>(`#premissa-${premissa}`)!;
}

function digitar(premissa: string, valor: string) {
  fireEvent.change(campo(premissa), { target: { value: valor } });
}

let buscar: ReturnType<typeof servidorQueCalcula>;

async function abrir(objetivo: Analise['objetivo'] = 'comprarTerreno') {
  window.sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({ versao: 1, analise: analiseValida(objetivo) }));
  const utilidades = renderResultado();
  await screen.findByTestId('painel-premissas');
  return utilidades;
}

async function esperarRecalculo(chamadas: number) {
  await waitFor(() => expect(buscar).toHaveBeenCalledTimes(chamadas));
  await waitFor(() => expect(screen.getByTestId('cenario-status').textContent).toMatch(/^Resultado atualizado/));
}

beforeEach(() => {
  window.sessionStorage.clear();
  buscar = servidorQueCalcula();
  vi.stubGlobal('fetch', buscar);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('painel de premissas (F17)', () => {
  it('mostra as cinco premissas com o original à vista, todas como "Original"', async () => {
    await abrir();
    const painel = screen.getByRole('region', { name: texto.titulo });
    expect(within(painel).getByLabelText(texto.premissas.precoUnidade.rotulo)).toHaveProperty('value', '900.000,00');
    expect(campo('lucroIncorporador').value).toBe('22,00');
    expect(campo('despesasGerais').value).toBe('11,00');
    expect(campo('taxaOcupacao').value).toBe('60,00');
    expect(campo('cubAjustado').value).toBe('3.154,91');
    expect(painel.textContent).toContain('Informado na Etapa 2: R$ 900.000,00');
    expect(painel.textContent).toContain('Padrão da lastro para o acabamento Normal: 22,00%');
    expect(painel.textContent).toContain('Calculado pela lastro (CUB base com os aditivos): R$ 3.154,91/m²');
    for (const premissa of ['precoUnidade', 'lucroIncorporador', 'despesasGerais', 'taxaOcupacao', 'cubAjustado']) {
      expect(screen.getByTestId(`etiqueta-${premissa}`).textContent).toBe(texto.etiqueta.original);
    }
    expect(screen.getByTestId('cenario-quantidade').textContent).toBe(texto.nenhumAjuste);
    expect(screen.queryByTestId('marca-cenario')).toBeNull();
    // Só o cálculo da página: o painel sem ajuste não pede nada.
    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it('"vender 10% mais" (PRD 10.2): o servidor recalcula e todo o resultado reage', async () => {
    await abrir();
    digitar('precoUnidade', '990.000,00');
    await esperarRecalculo(2);

    expect(corpoDoPedido(buscar, 1).ajustes).toEqual({ precoUnidade: 99_000_000 });
    // A análise enviada é a informada: o ajuste vai à parte, nunca reescreve o insumo.
    expect(corpoDoPedido(buscar, 1).produto.precoUnidadeCentavos).toBe(90_000_000);
    expect(screen.getByTestId('preco-maximo').textContent).toBe('R$ 3.041.016,00');
    expect(screen.getByTestId('impacto-valor').textContent).toBe('R$ 3.041.016,00');
    expect(screen.getByTestId('impacto-diferenca').textContent).toBe('R$ 964.800,00 acima da análise sem ajustes');
    expect(screen.getByTestId('marca-cenario').textContent).toBe(texto.marcaCartao(1));
    expect(screen.getByTestId('etiqueta-precoUnidade').textContent).toBe(texto.etiqueta.ajustada);
    expect(screen.getByTestId('cenario-quantidade').textContent).toBe(texto.quantidade(1));
  });

  it('digitar em sequência gera um pedido só, depois da espera (debounce)', async () => {
    await abrir();
    vi.useFakeTimers();
    try {
      for (const parcial of ['9', '95', '950', '950.000']) digitar('precoUnidade', parcial);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ESPERA_RECALCULO_MS - 10);
      });
      expect(buscar).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('cenario-status').textContent).toBe(texto.recalculando);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(20);
      });
      expect(buscar).toHaveBeenCalledTimes(2);
      expect(corpoDoPedido(buscar, 1).ajustes).toEqual({ precoUnidade: 95_000_000 });
    } finally {
      vi.useRealTimers();
    }
  });

  it('"voltar ao original" restaura o valor e o resultado sem chamar o servidor', async () => {
    await abrir();
    digitar('precoUnidade', '990.000,00');
    await esperarRecalculo(2);

    fireEvent.click(screen.getByRole('button', { name: texto.restaurarRotulo(texto.premissas.precoUnidade.rotulo) }));
    await waitFor(() => expect(screen.getByTestId('preco-maximo').textContent).toBe('R$ 2.076.216,00'));
    expect(campo('precoUnidade').value).toBe('900.000,00');
    expect(screen.getByTestId('etiqueta-precoUnidade').textContent).toBe(texto.etiqueta.original);
    expect(screen.queryByTestId('marca-cenario')).toBeNull();
    await new Promise((resolver) => setTimeout(resolver, ESPERA_RECALCULO_MS + 50));
    expect(buscar).toHaveBeenCalledTimes(2);
  });

  it('"restaurar tudo" volta todas as premissas ao original', async () => {
    await abrir();
    digitar('lucroIncorporador', '20');
    digitar('cubAjustado', '3.000,00');
    await esperarRecalculo(2);
    expect(corpoDoPedido(buscar, 1).ajustes).toEqual({ lucroIncorporador: 2_000, cubAjustado: 300_000 });
    expect(screen.getByTestId('cenario-quantidade').textContent).toBe(texto.quantidade(2));

    fireEvent.click(screen.getByRole('button', { name: texto.restaurarTudo }));
    await waitFor(() => expect(screen.getByTestId('preco-maximo').textContent).toBe('R$ 2.076.216,00'));
    expect(campo('lucroIncorporador').value).toBe('22,00');
    expect(campo('cubAjustado').value).toBe('3.154,91');
    expect(screen.getByTestId('cenario-quantidade').textContent).toBe(texto.nenhumAjuste);
  });

  it('valor igual ao original não é ajuste', async () => {
    await abrir();
    digitar('despesasGerais', '11');
    await new Promise((resolver) => setTimeout(resolver, ESPERA_RECALCULO_MS + 50));
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('etiqueta-despesasGerais').textContent).toBe(texto.etiqueta.original);
  });

  it('valor ilegível, vazio ou fora do limite é acusado no campo e não vai ao servidor', async () => {
    await abrir();
    digitar('precoUnidade', 'abc');
    expect(await screen.findByText(MENSAGENS_PRODUTO.precoUnidadeIlegivel)).toBeTruthy();
    digitar('despesasGerais', '');
    expect(screen.getByText(MENSAGENS_AJUSTES.ausente)).toBeTruthy();
    digitar('lucroIncorporador', '120');
    expect(screen.getByText(MENSAGENS_AJUSTES.percentualAcimaDeCem)).toBeTruthy();
    expect(screen.getByText(texto.corrigir)).toBeTruthy();
    expect(campo('lucroIncorporador').getAttribute('aria-invalid')).toBe('true');
    await new Promise((resolver) => setTimeout(resolver, ESPERA_RECALCULO_MS + 50));
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('preco-maximo').textContent).toBe('R$ 2.076.216,00');
  });

  it('valor implausível passa, com aviso: lucro de 30% fora da faixa de 20% a 25% (PRD 4.2)', async () => {
    await abrir();
    digitar('lucroIncorporador', '30');
    expect(await screen.findByTestId('aviso-lucroIncorporador')).toBeTruthy();
    expect(screen.getByTestId('aviso-lucroIncorporador').textContent).toBe(texto.avisos.faixa('20,00%', '25,00%'));
    expect(campo('lucroIncorporador').getAttribute('aria-invalid')).toBeNull();
    await esperarRecalculo(2);
    expect(corpoDoPedido(buscar, 1).ajustes).toEqual({ lucroIncorporador: 3_000 });
  });

  it('CUB que leva o custo de obra acima de 65% do VGV: aviso no painel', async () => {
    await abrir();
    digitar('cubAjustado', '4.500,00');
    await esperarRecalculo(2);
    // 4.500 × 2.400 = 10.800.000 sobre 14.400.000 = 75%.
    expect(screen.getByText(texto.avisos.custoObra('75,00%', '40,00%', '65,00%'))).toBeTruthy();
  });

  it('nova análise começa do padrão: os ajustes não sobrevivem à página', async () => {
    const { unmount } = await abrir();
    digitar('despesasGerais', '13');
    await esperarRecalculo(2);
    unmount();

    renderResultado();
    await screen.findByTestId('painel-premissas');
    expect(corpoDoPedido(buscar, 2).ajustes).toBeUndefined();
    expect(campo('despesasGerais').value).toBe('11,00');
    expect(screen.getByTestId('preco-maximo').textContent).toBe('R$ 2.076.216,00');
    // O rascunho da análise também não guarda nada do cenário.
    expect(window.sessionStorage.getItem(CHAVE_RASCUNHO)).not.toContain('ajustes');
  });

  it('na leitura Incorporador, o impacto é o do lucro ao preço pedido', async () => {
    await abrir('executarEmpreendimento');
    digitar('precoUnidade', '990.000,00');
    await esperarRecalculo(2);
    // Lucro resultante: 15.840.000 − 7.571.784 − 1.742.400 − 1.200.000 = 5.325.816; sem ajuste, 4.044.216.
    expect(within(screen.getByTestId('painel-premissas')).getByText(texto.impacto.incorporador)).toBeTruthy();
    expect(screen.getByTestId('impacto-valor').textContent).toBe('R$ 5.325.816,00');
    expect(screen.getByTestId('lucro-resultante').textContent).toBe('R$ 5.325.816,00');
    expect(screen.getByTestId('marca-cenario')).toBeTruthy();
  });

  it('o detalhe mostra o ajuste: despesas ajustadas e a lista de premissas ajustadas com o original', async () => {
    await abrir();
    digitar('despesasGerais', '13');
    await esperarRecalculo(2);
    expect(screen.getByText(TEXTOS_RESULTADO.despesas.ajustadaTitulo)).toBeTruthy();
    expect(screen.getByTestId('despesa-total').textContent).toBe('11,00%');
    expect(screen.getByTestId('premissas-ajustes').textContent).toBe('Despesas gerais (% do VGV): 13,00% (original: 11,00%)');
  });

  it('falha do servidor no recálculo: aviso no painel, e a tela segue com o último cenário', async () => {
    await abrir();
    buscar.mockImplementationOnce(async () => respostaJson({ erro: { codigo: 'ERRO_INTERNO', mensagem: 'Fora do ar.' } }, 500));
    digitar('precoUnidade', '990.000,00');
    expect(await screen.findByText(texto.erroTitulo)).toBeTruthy();
    expect(screen.getByText(/Fora do ar\./)).toBeTruthy();
    expect(screen.getByTestId('preco-maximo').textContent).toBe('R$ 2.076.216,00');
  });
});

describe('painel de premissas no celular: gaveta (F17)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((consulta: string) => ({
        matches: consulta.includes('max-width'),
        media: consulta,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  it('a seção mostra só o resumo; o painel abre numa gaveta e fecha devolvendo o foco', async () => {
    await abrir();
    expect(campo('precoUnidade')).toBeNull();
    const abrirGaveta = screen.getByRole('button', { name: texto.abrir });
    abrirGaveta.focus();
    fireEvent.click(abrirGaveta);

    const gaveta = await screen.findByRole('dialog', { name: texto.titulo });
    expect(gaveta.hasAttribute('open')).toBe(true);
    expect(within(gaveta).getByTestId('impacto-valor').textContent).toBe('R$ 2.076.216,00');
    digitar('precoUnidade', '990.000,00');
    await esperarRecalculo(2);
    expect(within(gaveta).getByTestId('impacto-valor').textContent).toBe('R$ 3.041.016,00');

    fireEvent.click(within(gaveta).getAllByRole('button', { name: texto.fechar })[0]!);
    await waitFor(() => expect(gaveta.hasAttribute('open')).toBe(false));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: texto.abrir }));
    // Fechar a gaveta não desfaz o cenário.
    expect(screen.getByTestId('preco-maximo').textContent).toBe('R$ 3.041.016,00');
    expect(screen.getByRole('button', { name: texto.restaurarTudo })).toBeTruthy();
  });
});
