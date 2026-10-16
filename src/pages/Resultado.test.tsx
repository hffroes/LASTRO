import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TEXTOS_CUB } from '../content/produto';
import { TEXTOS_RESULTADO } from '../content/resultado';
import { AnaliseProvider, CHAVE_RASCUNHO } from '../hooks/useAnalise';
import { MENSAGEM_ERRO_GENERICO, MENSAGEM_SEM_CONEXAO, TEMPO_LIMITE_ANALISE_MS } from '../hooks/useAnaliseRemota';
import type { Analise } from '../types/analise';
import { gerarAnalise } from '../utils/motor/analise';
import { Resultado } from './Resultado';

// Prédio Normal 4 × 4, topografia Regular, terreno de 1.000 m² a 60%, 16 unidades a R$ 900.000.
function analiseValida(): Analise {
  return {
    objetivo: 'comprarTerreno',
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

function salvarRascunho(analise: Analise) {
  window.sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({ versao: 1, analise }));
}

function respostaJson(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });
}

function renderResultado() {
  return render(
    <MemoryRouter initialEntries={['/resultado']}>
      <AnaliseProvider>
        <Routes>
          <Route path="/terreno" element={<div>tela de terreno</div>} />
          <Route path="/produto" element={<div>tela de produto</div>} />
          <Route path="/resultado" element={<Resultado />} />
        </Routes>
      </AnaliseProvider>
    </MemoryRouter>,
  );
}

// O servidor de verdade calcula com o mesmo motor: a resposta falsa também.
function servidorQueCalcula() {
  return vi.fn(async (_url: RequestInfo | URL, inicio?: RequestInit) => {
    const analise = JSON.parse(String(inicio?.body)) as Analise;
    return respostaJson({ dados: gerarAnalise(analise) });
  });
}

function valorDe(id: string) {
  return screen.getByTestId(`resultado-${id}`).textContent;
}

describe('Resultado (F13, versão crua)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    salvarRascunho(analiseValida());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('trava de acesso (D-R11)', () => {
    it('sem o terreno completo, a URL direta volta ao Terreno, sem chamar a API', () => {
      window.sessionStorage.clear();
      const buscar = vi.fn();
      vi.stubGlobal('fetch', buscar);
      renderResultado();

      expect(screen.getByText('tela de terreno')).toBeTruthy();
      expect(buscar).not.toHaveBeenCalled();
    });

    it('com o terreno completo e o produto incompleto, volta ao Produto', () => {
      const analise = analiseValida();
      analise.produto.padrao = null;
      salvarRascunho(analise);
      const buscar = vi.fn();
      vi.stubGlobal('fetch', buscar);
      renderResultado();

      expect(screen.getByText('tela de produto')).toBeTruthy();
      expect(buscar).not.toHaveBeenCalled();
    });
  });

  describe('chamada à API', () => {
    it('envia a análise inteira por POST /api/v1/analises, uma única vez', async () => {
      const buscar = servidorQueCalcula();
      vi.stubGlobal('fetch', buscar);
      renderResultado();

      await screen.findByTestId('resultado-vgv');
      expect(buscar).toHaveBeenCalledTimes(1);
      const [url, inicio] = buscar.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/v1/analises');
      expect(inicio.method).toBe('POST');
      expect((inicio.headers as Record<string, string>)['Content-Type']).toBe('application/json');
      expect(JSON.parse(String(inicio.body))).toEqual(analiseValida());
    });

    it('mostra o estado de carregando enquanto o servidor calcula', async () => {
      let liberar: (resposta: Response) => void = () => {};
      vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolver) => (liberar = resolver))));
      renderResultado();

      expect(screen.getByRole('status').textContent).toBe(TEXTOS_RESULTADO.carregando);
      liberar(respostaJson({ dados: gerarAnalise(analiseValida()) }));
      await screen.findByTestId('resultado-vgv');
      expect(screen.queryByText(TEXTOS_RESULTADO.carregando)).toBeNull();
    });
  });

  describe('primeira leitura (F14): o essencial primeiro', () => {
    beforeEach(() => vi.stubGlobal('fetch', servidorQueCalcula()));

    it('o preço máximo recomendado é exatamente o Resultado do terreno, e a sobra é o Resultado líquido', async () => {
      renderResultado();
      await screen.findByTestId('preco-maximo');

      expect(screen.getByTestId('preco-maximo').textContent).toBe(valorDe('resultado-terreno'));
      expect(screen.getByTestId('preco-maximo').textContent).toBe('R$ 2.076.216,00');
      expect(screen.getByTestId('leitura-rotulo').textContent).toBe('Sobra');
      expect(screen.getByTestId('leitura-valor').textContent).toBe('R$ 876.216,00');
      expect(screen.getByTestId('preco-pedido').textContent).toBe('R$ 1.200.000,00');
    });

    it('a ordem é: preço máximo, o que o projeto entrega, projeto analisado, e só então a conta', async () => {
      renderResultado();
      await screen.findByTestId('preco-maximo');

      const titulos = screen.getAllByRole('heading', { level: 2 }).map((titulo) => titulo.textContent);
      expect(titulos).toEqual([
        'Preço máximo recomendado para o terreno',
        'O que o projeto entrega',
        'Projeto analisado',
        'Método do resíduo do terreno',
      ]);
    });

    it('a primeira dobra não usa os termos técnicos: VGV, CUB e resíduo só aparecem na conta completa', async () => {
      renderResultado();
      await screen.findByTestId('preco-maximo');

      for (const regiao of ['Preço máximo recomendado para o terreno', 'O que o projeto entrega', 'Projeto analisado']) {
        const texto = screen.getByRole('region', { name: regiao }).textContent ?? '';
        expect(texto, regiao).not.toMatch(/\bVGV\b|\bCUB\b|resíduo/i);
      }
    });

    it('mostra o potencial vindo do servidor: 2.400 m² construídos, 1.096 m² para vender, 16 unidades', async () => {
      renderResultado();
      await screen.findByTestId('preco-maximo');

      expect(screen.getByTestId('potencial-area-construida').textContent).toBe('2.400,00 m²');
      expect(screen.getByTestId('potencial-area-comercializavel').textContent).toBe('1.096,00 m²');
      expect(screen.getByTestId('potencial-unidades').textContent).toBe('16');
    });

    it('a conta completa e as premissas vêm recolhidas, mas continuam ali para conferir', async () => {
      renderResultado();
      await screen.findByTestId('preco-maximo');

      const detalhes = screen.getByText(TEXTOS_RESULTADO.contaCompleta).closest('details') as HTMLDetailsElement;
      expect(detalhes.open).toBe(false);
      expect(within(detalhes).getByTestId('resultado-vgv').textContent).toBe('R$ 14.400.000,00');
      expect(within(detalhes).getByText(TEXTOS_RESULTADO.premissas.titulo)).toBeTruthy();
    });

    it('cenário inviável: déficit com o valor, e o preço máximo negativo explicado', async () => {
      const analise = analiseValida();
      analise.produto.precoUnidadeCentavos = 45_000_000;
      salvarRascunho(analise);
      renderResultado();
      await screen.findByTestId('preco-maximo');

      expect(screen.getByTestId('preco-maximo').textContent).toBe('-R$ 2.747.784,00');
      expect(screen.getByTestId('leitura-rotulo').textContent).toBe('Déficit');
      expect(screen.getByTestId('leitura-valor').textContent).toBe('R$ 3.947.784,00');
      expect(screen.getByText(TEXTOS_RESULTADO.precoMaximo.semMargem)).toBeTruthy();
    });

    it('cenário viável e inviável dão leituras diferentes na mesma tela', async () => {
      const viavel = renderResultado();
      await screen.findByTestId('preco-maximo');
      const leituraViavel = screen.getByTestId('leitura-rotulo').textContent;
      viavel.unmount();

      const analise = analiseValida();
      analise.produto.precoUnidadeCentavos = 45_000_000;
      salvarRascunho(analise);
      renderResultado();
      await screen.findByTestId('preco-maximo');

      expect(leituraViavel).toBe('Sobra');
      expect(screen.getByTestId('leitura-rotulo').textContent).toBe('Déficit');
    });

    it('com pendência de CUB não há preço máximo nem potencial: nada de número sem base', async () => {
      const analise = analiseValida();
      Object.assign(analise.produto, { padrao: 'baixo', pavimentos: 10 });
      salvarRascunho(analise);
      renderResultado();

      await screen.findByText(TEXTOS_CUB.tituloPendencia);
      expect(screen.queryByTestId('preco-maximo')).toBeNull();
      expect(screen.queryByTestId('potencial-unidades')).toBeNull();
    });
  });

  describe('sucesso: os números do servidor, linha a linha', () => {
    beforeEach(() => vi.stubGlobal('fetch', servidorQueCalcula()));

    it('VGV, obra, despesas, lucro, Resultado do terreno e líquido do cenário conferido à mão', async () => {
      renderResultado();
      await screen.findByTestId('resultado-vgv');

      expect(valorDe('vgv')).toBe('R$ 14.400.000,00');
      expect(valorDe('custo-obra')).toBe('R$ 7.571.784,00');
      expect(valorDe('despesas-gerais')).toBe('R$ 1.584.000,00');
      expect(valorDe('lucro')).toBe('R$ 3.168.000,00');
      expect(valorDe('resultado-terreno')).toBe('R$ 2.076.216,00');
      expect(valorDe('preco-pedido')).toBe('R$ 1.200.000,00');
      expect(valorDe('resultado-liquido')).toBe('R$ 876.216,00');
      expect(valorDe('viavel')).toBe('Sim');
    });

    it('rotula os percentuais e marca os parâmetros provisórios', async () => {
      renderResultado();
      await screen.findByTestId('resultado-vgv');

      expect(screen.getByText(/Despesas gerais \(11,00%\)/)).toBeTruthy();
      expect(screen.getByText(/Lucro do incorporador \(22,00%\)/)).toBeTruthy();
      expect(screen.getAllByText(new RegExp(TEXTOS_RESULTADO.provisorio)).length).toBeGreaterThanOrEqual(2);
    });

    it('mostra as premissas e a versão de dados usadas, incluindo a divergência da itemização (D-B2)', async () => {
      renderResultado();
      await screen.findByTestId('resultado-vgv');

      const premissas = screen.getByText(TEXTOS_RESULTADO.premissas.titulo).closest('details') as HTMLElement;
      const texto = within(premissas).getByText(/Sinduscon-MG, competência Ago\/2026 · versão cub-2026-08/);
      expect(texto).toBeTruthy();
      expect(within(premissas).getByText(/R-8/)).toBeTruthy();
      expect(within(premissas).getByText(/A itemização da fonte soma 12,00%/)).toBeTruthy();
      expect(within(premissas).getByText('motor-v1')).toBeTruthy();
    });

    it('cenário inviável: resultado do terreno e líquido negativos, com o sinal antes do símbolo', async () => {
      const analise = analiseValida();
      analise.produto.precoUnidadeCentavos = 45_000_000;
      salvarRascunho(analise);
      renderResultado();
      await screen.findByTestId('resultado-vgv');

      expect(valorDe('resultado-terreno')).toBe('-R$ 2.747.784,00');
      expect(valorDe('resultado-liquido')).toBe('-R$ 3.947.784,00');
      expect(valorDe('viavel')).toBe('Não');
      expect(screen.getByTestId('resultado-resultado-terreno').getAttribute('data-negativo')).toBe('true');
    });
  });

  describe('CUB sem valor publicado: estado do resultado, não erro', () => {
    it('padrão Baixo em R-16 (D-B4) explica a pendência e não mostra número de custo', async () => {
      const analise = analiseValida();
      Object.assign(analise.produto, { padrao: 'baixo', pavimentos: 10 });
      salvarRascunho(analise);
      vi.stubGlobal('fetch', servidorQueCalcula());
      renderResultado();

      expect(await screen.findByText(TEXTOS_CUB.tituloPendencia)).toBeTruthy();
      expect(screen.getByText(TEXTOS_CUB.pendenciaPadraoSemValor('R-16'))).toBeTruthy();
      expect(screen.queryByTestId('resultado-vgv')).toBeNull();
      expect(screen.getByRole('button', { name: TEXTOS_RESULTADO.cubPendente.voltar })).toBeTruthy();
    });
  });

  describe('erros', () => {
    it('erro de validação do servidor: lista as mensagens e leva de volta ao que corrigir', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          respostaJson(
            {
              erro: {
                codigo: 'VALIDACAO_FALHOU',
                mensagem: 'Alguns dados da análise precisam de ajuste.',
                detalhes: [{ etapa: 'produto', campo: 'precoUnidade', mensagem: 'O preço de venda precisa ser maior que zero.' }],
              },
            },
            400,
          ),
        ),
      );
      renderResultado();

      expect(await screen.findByText(TEXTOS_RESULTADO.erroValidacao.titulo)).toBeTruthy();
      expect(screen.getByText('O preço de venda precisa ser maior que zero.')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
      expect(screen.getByText('tela de produto')).toBeTruthy();
    });

    it('erro de validação em dado do terreno leva ao Terreno', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          respostaJson(
            { erro: { codigo: 'VALIDACAO_FALHOU', mensagem: 'x', detalhes: [{ etapa: 'terreno', campo: 'area', mensagem: 'A área precisa ser maior que zero.' }] } },
            400,
          ),
        ),
      );
      renderResultado();

      await screen.findByText('A área precisa ser maior que zero.');
      fireEvent.click(screen.getByRole('button', { name: TEXTOS_RESULTADO.erroValidacao.voltarTerreno }));
      expect(screen.getByText('tela de terreno')).toBeTruthy();
    });

    it('erro do servidor: explica em pt-BR e permite tentar de novo', async () => {
      const buscar = vi
        .fn()
        .mockResolvedValueOnce(respostaJson({ erro: { codigo: 'ERRO_INTERNO', mensagem: MENSAGEM_ERRO_GENERICO } }, 500))
        .mockImplementation(servidorQueCalcula());
      vi.stubGlobal('fetch', buscar);
      renderResultado();

      expect(await screen.findByText(TEXTOS_RESULTADO.erroServidor.titulo)).toBeTruthy();
      expect(screen.getByText(MENSAGEM_ERRO_GENERICO)).toBeTruthy();

      fireEvent.click(screen.getByRole('button', { name: TEXTOS_RESULTADO.erroServidor.tentarDeNovo }));
      await screen.findByTestId('resultado-vgv');
      expect(buscar).toHaveBeenCalledTimes(2);
      expect(screen.queryByText(TEXTOS_RESULTADO.erroServidor.titulo)).toBeNull();
    });

    it('sem conexão com o servidor: mensagem de rede e tentar de novo', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
      renderResultado();

      expect(await screen.findByText(MENSAGEM_SEM_CONEXAO)).toBeTruthy();
      expect(screen.getByRole('button', { name: TEXTOS_RESULTADO.erroServidor.tentarDeNovo })).toBeTruthy();
    });

    it('resposta que não segue o contrato vira erro de servidor, não tela quebrada', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => respostaJson({ lixo: true })));
      renderResultado();

      expect(await screen.findByText(MENSAGEM_ERRO_GENERICO)).toBeTruthy();
    });

    it('servidor que não responde: o tempo limite encerra a espera', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.stubGlobal(
        'fetch',
        vi.fn((_url: RequestInfo | URL, inicio?: RequestInit) =>
          new Promise<Response>((_resolver, rejeitar) => {
            inicio?.signal?.addEventListener('abort', () => rejeitar(new DOMException('Aborted', 'AbortError')));
          }),
        ),
      );
      renderResultado();

      expect(screen.getByRole('status').textContent).toBe(TEXTOS_RESULTADO.carregando);
      await vi.advanceTimersByTimeAsync(TEMPO_LIMITE_ANALISE_MS + 100);
      await waitFor(() => expect(screen.getByText(MENSAGEM_SEM_CONEXAO)).toBeTruthy());
    });
  });
});
