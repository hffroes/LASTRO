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

// Valor e percentual de uma linha da tabela de composição (F15).
function valorDe(id: string) {
  return screen.getByTestId(`composicao-${id}-valor`).textContent;
}

function pctDe(id: string) {
  return screen.getByTestId(`composicao-${id}-pct`).textContent;
}

// Espera o resultado chegar: o VGV é a primeira linha da tabela.
const AGUARDAR = 'composicao-vgv-valor';

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

      await screen.findByTestId(AGUARDAR);
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
      await screen.findByTestId(AGUARDAR);
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
        'Composição de custos',
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

      const detalhes = screen.getByText(TEXTOS_RESULTADO.verDetalhes).closest('details') as HTMLDetailsElement;
      expect(detalhes.open).toBe(false);
      expect(within(detalhes).getByTestId('composicao-vgv-valor').textContent).toBe('R$ 14.400.000,00');
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

  describe('composição de custos (F15): a tabela do PRD 2.5', () => {
    beforeEach(() => vi.stubGlobal('fetch', servidorQueCalcula()));

    it('VGV, obra, despesas, lucro, Resultado do terreno, preço pedido e sobra, do cenário conferido à mão', async () => {
      renderResultado();
      await screen.findByTestId(AGUARDAR);

      expect(valorDe('vgv')).toBe('R$ 14.400.000,00');
      expect(valorDe('custo-obra')).toBe('R$ 7.571.784,00');
      expect(valorDe('despesas-gerais')).toBe('R$ 1.584.000,00');
      expect(valorDe('lucro')).toBe('R$ 3.168.000,00');
      expect(valorDe('resultado-terreno')).toBe('R$ 2.076.216,00');
      expect(valorDe('preco-pedido')).toBe('R$ 1.200.000,00');
      expect(valorDe('sobra-deficit')).toBe('R$ 876.216,00');
    });

    it('cada linha traz o seu percentual do VGV, e a coluna fecha', async () => {
      renderResultado();
      await screen.findByTestId(AGUARDAR);

      expect(pctDe('vgv')).toMatch(/^100,00%/);
      expect(pctDe('custo-obra')).toMatch(/^52,58%/);
      expect(pctDe('despesas-gerais')).toMatch(/^11,00%/);
      expect(pctDe('lucro')).toMatch(/^22,00%/);
      expect(pctDe('resultado-terreno')).toMatch(/^14,42%/);
      expect(pctDe('preco-pedido')).toMatch(/^8,33%/);
      expect(pctDe('sobra-deficit')).toMatch(/^6,09%/);
      // 100,00 − 52,58 − 11,00 − 22,00 = 14,42; 14,42 − 8,33 = 6,09
    });

    it('a tabela é acessível: legenda, cabeçalhos de coluna e de linha, e os números nas células certas', async () => {
      renderResultado();
      await screen.findByTestId(AGUARDAR);

      const tabela = screen.getByRole('table', { name: TEXTOS_RESULTADO.composicao.legenda });
      const colunas = within(tabela).getAllByRole('columnheader').map((c) => c.textContent);
      expect(colunas).toEqual(['Componente', 'Valor', '% do VGV']);
      const linhas = within(tabela).getAllByRole('row');
      expect(linhas).toHaveLength(8); // cabeçalho + 7 linhas
      const cabecalhosDeLinha = within(tabela).getAllByRole('rowheader').map((c) => c.textContent ?? '');
      expect(cabecalhosDeLinha[0]).toMatch(/^VGV total/);
      expect(cabecalhosDeLinha[2]).toMatch(/Despesas gerais \(11,00%\)/);
      expect(cabecalhosDeLinha[6]).toMatch(/Sobra\/déficit/);
    });

    it('despesas gerais é uma linha só, com os 11,00% no rótulo; os itens ficam no detalhe', async () => {
      renderResultado();
      await screen.findByTestId(AGUARDAR);

      const tabela = screen.getByRole('table', { name: TEXTOS_RESULTADO.composicao.legenda });
      const linhasDeDespesas = within(tabela)
        .getAllByRole('rowheader')
        .filter((cabecalho) => /Despesas gerais \(\d/.test(cabecalho.textContent ?? ''));
      expect(linhasDeDespesas).toHaveLength(1);
      expect(within(tabela).queryByText(/Comissões|Impostos e taxas|Despesas financeiras|marketing/i)).toBeNull();
    });

    it('cada linha mostra a fórmula sob demanda, e a tabela não depende de abrir nada para ser lida', async () => {
      renderResultado();
      await screen.findByTestId(AGUARDAR);

      const formulas = screen.getAllByText(TEXTOS_RESULTADO.comoCalculado);
      expect(formulas.length).toBeGreaterThanOrEqual(7);
      const primeira = formulas[0]?.closest('details') as HTMLDetailsElement;
      expect(primeira.open).toBe(false);
      expect(within(primeira).getByText('Total de unidades × preço de venda da unidade')).toBeTruthy();
    });

    it('abrir "Ver detalhes" não reordena a página', async () => {
      renderResultado();
      await screen.findByTestId(AGUARDAR);
      const antes = screen.getAllByRole('heading', { level: 2 }).map((t) => t.textContent);

      const detalhes = screen.getByText(TEXTOS_RESULTADO.verDetalhes).closest('details') as HTMLDetailsElement;
      fireEvent.click(screen.getByText(TEXTOS_RESULTADO.verDetalhes));
      detalhes.open = true;

      expect(screen.getAllByRole('heading', { level: 2 }).map((t) => t.textContent)).toEqual(antes);
    });

    it('o detalhe das despesas: itens dos 11%, o item fora do total e a divergência de 12% sinalizada', async () => {
      renderResultado();
      await screen.findByTestId(AGUARDAR);

      expect(screen.getByTestId('despesa-comissoes').textContent).toBe('5,00%');
      expect(screen.getByTestId('despesa-impostosETaxas').textContent).toBe('4,50%');
      expect(screen.getByTestId('despesa-despesasFinanceiras').textContent).toBe('1,50%');
      expect(screen.getByTestId('despesa-total').textContent).toBe('11,00% · R$ 1.584.000,00');
      expect(screen.getByTestId('despesa-fora-vendaEMarketing').textContent).toContain('1,00%');
      expect(screen.getByText(TEXTOS_RESULTADO.despesas.divergenciaTitulo)).toBeTruthy();
      expect(
        screen.getByText(/Somando todos os itens da fonte, o total seria 12,00%, mas a análise aplica 11,00%/),
      ).toBeTruthy();
    });

    it('os itens aplicados somam exatamente o total mostrado', async () => {
      renderResultado();
      await screen.findByTestId(AGUARDAR);

      const itens = ['despesa-comissoes', 'despesa-impostosETaxas', 'despesa-despesasFinanceiras'].map((id) =>
        Number((screen.getByTestId(id).textContent ?? '').replace('%', '').replace(',', '.')),
      );
      expect(Math.round(itens.reduce((a, b) => a + b, 0) * 100)).toBe(1_100);
    });

    it('o detalhe do CUB: projeto, base, os quatro aditivos com a opção de cada um, a soma e o custo de obra', async () => {
      renderResultado();
      await screen.findByTestId(AGUARDAR);

      expect(screen.getByTestId('detalhe-cub-projeto').textContent).toBe('R-8');
      expect(screen.getByTestId('detalhe-cub-base').textContent).toBe('R$ 2.554,58/m²');
      expect(screen.getByTestId('detalhe-cub-fundacao').textContent).toBe('7,00%');
      expect(screen.getByTestId('detalhe-cub-padrao').textContent).toBe('15,00%');
      expect(screen.getByTestId('detalhe-cub-topografia').textContent).toBe('1,50%');
      expect(screen.getByTestId('detalhe-cub-formato').textContent).toBe('0,00%');
      expect(screen.getByTestId('detalhe-cub-soma').textContent).toBe('23,50%');
      expect(screen.getByTestId('detalhe-cub-ajustado').textContent).toBe('R$ 3.154,91/m²');
      expect(screen.getByTestId('detalhe-cub-area').textContent).toBe('2.400,00 m²');
      expect(screen.getByTestId('detalhe-cub-custo-obra').textContent).toBe('R$ 7.571.784,00');
      expect(screen.getByText('até 4 pavimentos')).toBeTruthy();
    });

    it('o snapshot continua visível: base de CUB, taxa, lucro e despesas provisórios, e a versão do cálculo', async () => {
      renderResultado();
      await screen.findByTestId(AGUARDAR);

      const premissas = screen.getByText(TEXTOS_RESULTADO.premissas.titulo).closest('details') as HTMLElement;
      expect(within(premissas).getByText(/Sinduscon-MG, competência Ago\/2026 · versão cub-2026-08/)).toBeTruthy();
      expect(within(premissas).getAllByText(new RegExp(TEXTOS_RESULTADO.provisorio)).length).toBeGreaterThanOrEqual(3);
      expect(within(premissas).getByText('motor-v1')).toBeTruthy();
    });

    it('cenário inviável: preço máximo, resultado e sobra/déficit negativos, com o percentual também negativo', async () => {
      const analise = analiseValida();
      analise.produto.precoUnidadeCentavos = 45_000_000;
      salvarRascunho(analise);
      renderResultado();
      await screen.findByTestId(AGUARDAR);

      expect(valorDe('resultado-terreno')).toBe('-R$ 2.747.784,00');
      expect(valorDe('sobra-deficit')).toBe('-R$ 3.947.784,00');
      expect(pctDe('resultado-terreno')).toMatch(/^-38,16%/);
      expect(pctDe('sobra-deficit')).toMatch(/^-54,83%/);
      expect(screen.getByTestId('composicao-resultado-terreno-valor').getAttribute('data-negativo')).toBe('true');
      expect(screen.getByTestId('composicao-resultado-terreno-pct').getAttribute('data-negativo')).toBe('true');
    });
  });

  describe('perspectiva Terrenista × Incorporador (F16)', () => {
    beforeEach(() => vi.stubGlobal('fetch', servidorQueCalcula()));
    const { perspectiva: textoPerspectiva, margem } = TEXTOS_RESULTADO;

    function radio(nome: string) {
      return screen.getByRole('radio', { name: nome }) as HTMLInputElement;
    }

    function abrirComo(objetivo: Analise['objetivo'], alterar?: (analise: Analise) => void) {
      const analise = analiseValida();
      analise.objetivo = objetivo;
      alterar?.(analise);
      salvarRascunho(analise);
      return renderResultado();
    }

    it('quem quer comprar o terreno abre na Terrenista (D-R6)', async () => {
      abrirComo('comprarTerreno');
      await screen.findByTestId('preco-maximo');

      expect(radio('Terrenista').checked).toBe(true);
      expect(radio('Incorporador').checked).toBe(false);
      expect(screen.queryByTestId('lucro-resultante')).toBeNull();
    });

    it('quem quer executar o empreendimento abre na Incorporador, com o lucro resultante como resposta', async () => {
      abrirComo('executarEmpreendimento');
      await screen.findByTestId('lucro-resultante');

      expect(radio('Incorporador').checked).toBe(true);
      expect(screen.queryByTestId('preco-maximo')).toBeNull();
      // 14.400.000 − 7.571.784 − 1.584.000 − 1.200.000
      expect(screen.getByTestId('lucro-resultante').textContent).toBe('R$ 4.044.216,00');
      expect(screen.getByTestId('margem-resultante').textContent).toBe('28,09%');
      expect(screen.getByTestId('preco-pedido').textContent).toBe('R$ 1.200.000,00');
      expect(screen.getByTestId('leitura-rotulo').textContent).toBe(margem.leitura.acima);
      expect(screen.getByTestId('leitura-valor').textContent).toBe('R$ 876.216,00');
      expect(screen.getByText(margem.esperado('Normal', '22,00', 'R$ 3.168.000,00'))).toBeTruthy();
    });

    it('o toggle é um grupo de radios com nome, e cada perspectiva diz o que está fixo e o que é resolvido', async () => {
      abrirComo('comprarTerreno');
      await screen.findByTestId('preco-maximo');

      const grupo = screen.getByRole('radiogroup', { name: textoPerspectiva.rotulo });
      expect(within(grupo).getAllByRole('radio')).toHaveLength(2);
      // A frase fica no cartão de destaque, logo acima do número que responde.
      const destaque = () => screen.getAllByRole('region')[0] as HTMLElement;
      expect(within(destaque()).getByTestId('perspectiva-frase').textContent).toBe(
        'Fixo: o lucro do incorporador. Resolvido: o preço máximo do terreno.',
      );
      expect(screen.getByText(textoPerspectiva.mesmaConta)).toBeTruthy();

      fireEvent.click(radio('Incorporador'));
      expect(within(destaque()).getByTestId('perspectiva-frase').textContent).toBe(
        'Fixo: o preço pedido pelo terreno. Resolvido: o lucro do incorporador.',
      );
      // O cartão troca inteiro; quem usa leitor de tela ouve a troca pela região viva do toggle.
      const anuncio = screen.getByTestId('perspectiva-anuncio');
      expect(anuncio.getAttribute('aria-live')).toBe('polite');
      expect(anuncio.textContent).toBe(
        'Leitura Incorporador. Fixo: o preço pedido pelo terreno. Resolvido: o lucro do incorporador.',
      );
    });

    it('alternar troca o destaque sem novo cálculo e sem mudar nenhum insumo', async () => {
      abrirComo('comprarTerreno');
      await screen.findByTestId('preco-maximo');
      const chamadas = vi.mocked(fetch).mock.calls.length;
      const projetoAntes = screen.getByRole('region', { name: 'Projeto analisado' }).textContent;
      const potencialAntes = screen.getByRole('region', { name: 'O que o projeto entrega' }).textContent;
      const comuns = ['vgv', 'custo-obra', 'despesas-gerais', 'preco-pedido'];
      const antes = comuns.map((id) => [valorDe(id), pctDe(id)]);

      fireEvent.click(radio('Incorporador'));
      expect(screen.getByTestId('lucro-resultante').textContent).toBe('R$ 4.044.216,00');
      fireEvent.click(radio('Terrenista'));
      expect(screen.getByTestId('preco-maximo').textContent).toBe('R$ 2.076.216,00');
      fireEvent.click(radio('Incorporador'));

      expect(vi.mocked(fetch).mock.calls.length).toBe(chamadas);
      expect(screen.getByRole('region', { name: 'Projeto analisado' }).textContent).toBe(projetoAntes);
      expect(screen.getByRole('region', { name: 'O que o projeto entrega' }).textContent).toBe(potencialAntes);
      expect(comuns.map((id) => [valorDe(id), pctDe(id)])).toEqual(antes);
    });

    it('a ordem dos blocos é a mesma nas duas leituras; só o título do destaque muda', async () => {
      abrirComo('executarEmpreendimento');
      await screen.findByTestId('lucro-resultante');

      const titulos = screen.getAllByRole('heading', { level: 2 }).map((titulo) => titulo.textContent);
      expect(titulos).toEqual([margem.titulo, 'O que o projeto entrega', 'Projeto analisado', 'Composição de custos']);
      const destaque = screen.getByRole('region', { name: margem.titulo }).textContent ?? '';
      expect(destaque).not.toMatch(/\bVGV\b|\bCUB\b|resíduo/i);
    });

    it('a composição na Incorporador: o preço pedido no lugar do lucro, e a coluna fecha no lucro resultante', async () => {
      abrirComo('executarEmpreendimento');
      await screen.findByTestId('lucro-resultante');

      const tabela = screen.getByRole('table', { name: TEXTOS_RESULTADO.composicao.legendaIncorporador });
      const linhas = within(tabela)
        .getAllByRole('rowheader')
        .map((celula) => celula.querySelector('span')?.textContent);
      // O sinal visível (aria-hidden) e a leitura por extenso, juntos no texto da célula.
      expect(linhas).toEqual([
        'VGV total',
        '−menos Custo de obra',
        '−menos Despesas gerais (11,00%)',
        '−menos Preço pedido pelo terreno',
        '=igual a Lucro resultante',
        '−menos Lucro esperado (22,00%)',
        '=igual a Diferença para o esperado',
      ]);
      expect(valorDe('lucro-resultante')).toBe(screen.getByTestId('lucro-resultante').textContent);
      expect(pctDe('lucro-resultante')).toMatch(/^28,09%/); // 100,00 − 52,58 − 11,00 − 8,33
      expect(valorDe('lucro-esperado')).toBe('R$ 3.168.000,00');
      expect(pctDe('lucro-esperado')).toMatch(/^22,00%/);
      expect(valorDe('diferenca-lucro')).toBe('R$ 876.216,00');
      expect(pctDe('diferenca-lucro')).toMatch(/^6,09%/); // 28,09 − 22,00
      expect(screen.getByText(TEXTOS_RESULTADO.composicao.fechamentoIncorporador)).toBeTruthy();
      expect(screen.queryByTestId('composicao-resultado-terreno-valor')).toBeNull();
    });

    it('a diferença para o esperado na Incorporador é a sobra da Terrenista, ao centavo', async () => {
      abrirComo('comprarTerreno');
      await screen.findByTestId('preco-maximo');
      const sobra = valorDe('sobra-deficit');

      fireEvent.click(radio('Incorporador'));
      expect(valorDe('diferenca-lucro')).toBe(sobra);
      expect(screen.getByTestId('leitura-valor').textContent).toBe(sobra);
    });

    it('margem negativa: o lucro resultante é prejuízo, com o sinal, a cor e uma frase que explica', async () => {
      abrirComo('executarEmpreendimento', (analise) => {
        analise.produto.precoUnidadeCentavos = 45_000_000;
      });
      await screen.findByTestId('lucro-resultante');

      // 7.200.000 − 7.571.784 − 792.000 − 1.200.000
      expect(screen.getByTestId('lucro-resultante').textContent).toBe('-R$ 2.363.784,00');
      expect(screen.getByTestId('lucro-resultante').getAttribute('data-negativo')).toBe('true');
      expect(screen.getByTestId('margem-resultante').textContent).toBe('-32,83%');
      expect(screen.getByTestId('leitura-rotulo').textContent).toBe(margem.leitura.abaixo);
      // −2.363.784 − 1.584.000 esperados = −3.947.784, o mesmo déficit da Terrenista
      expect(screen.getByTestId('leitura-valor').textContent).toBe('R$ 3.947.784,00');
      expect(screen.getByText(margem.prejuizo)).toBeTruthy();
      expect(pctDe('lucro-resultante')).toMatch(/^-32,83%/);
    });

    it('alternar não muda o objetivo escolhido: o resumo segue dizendo o que você quer decidir', async () => {
      abrirComo('comprarTerreno');
      await screen.findByTestId('preco-maximo');
      const resumo = () => screen.getByRole('region', { name: 'Projeto analisado' }).textContent;
      const antes = resumo();

      fireEvent.click(radio('Incorporador'));
      expect(resumo()).toBe(antes);
      expect(antes).toMatch(/Comprar o terreno/i);
    });

    it('sem resultado calculado não há toggle: a introdução fica no lugar', async () => {
      abrirComo('comprarTerreno', (analise) => {
        Object.assign(analise.produto, { padrao: 'baixo', pavimentos: 10 });
      });
      await screen.findByText(TEXTOS_CUB.tituloPendencia);

      expect(screen.queryByRole('radiogroup')).toBeNull();
      expect(screen.getByText(TEXTOS_RESULTADO.introducao)).toBeTruthy();
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
      expect(screen.queryByTestId(AGUARDAR)).toBeNull();
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
      await screen.findByTestId(AGUARDAR);
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
