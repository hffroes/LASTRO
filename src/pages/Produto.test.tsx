import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MOTIVO_PAVIMENTOS_FIXOS, MOTIVO_UNIDADE_UNICA, TEXTOS_CUB, TEXTOS_PRODUTO } from '../content/produto';
import { AnaliseProvider, CHAVE_RASCUNHO } from '../hooks/useAnalise';
import { MENSAGENS_PRODUTO } from '../utils/validacao/produto';
import { Produto } from './Produto';

const TERRENO_VALIDO = {
  nome: 'Lote da Rua Alagoas',
  codigoMunicipioIbge: 3106200,
  areaTotalM2: 1000,
  precoPedidoCentavos: 120_000_000,
  formatoLote: 'regular',
  topografia: 'plana',
};

function salvarRascunho(terreno: object) {
  window.sessionStorage.setItem(
    CHAVE_RASCUNHO,
    JSON.stringify({ versao: 1, analise: { objetivo: 'comprarTerreno', terreno } }),
  );
}

function TerrenoFalso() {
  const navegar = useNavigate();
  return (
    <div>
      tela de terreno
      <button onClick={() => navegar('/produto')}>ir ao produto</button>
    </div>
  );
}

function renderProduto() {
  return render(
    <MemoryRouter initialEntries={['/produto']}>
      <AnaliseProvider>
        <Routes>
          <Route path="/terreno" element={<TerrenoFalso />} />
          <Route path="/produto" element={<Produto />} />
          <Route path="/resultado" element={<div>tela de resultado</div>} />
        </Routes>
      </AnaliseProvider>
    </MemoryRouter>,
  );
}

function grupo(legenda: string) {
  return screen.getByRole('group', { name: legenda });
}

function radios(legenda: string) {
  return within(grupo(legenda)).getAllByRole('radio') as HTMLInputElement[];
}

function valoresDe(legenda: string) {
  return radios(legenda).map((item) => item.value);
}

function escolher(legenda: string, rotulo: string) {
  fireEvent.click(within(grupo(legenda)).getByRole('radio', { name: new RegExp(`^${rotulo}`) }));
}

function radio(legenda: string, rotulo: string) {
  return within(grupo(legenda)).getByRole('radio', { name: new RegExp(`^${rotulo}`) }) as HTMLInputElement;
}

function entrada(rotulo: string) {
  return screen.getByLabelText(rotulo) as HTMLInputElement;
}

function digitar(rotulo: string, valor: string) {
  const campo = entrada(rotulo);
  fireEvent.focus(campo);
  fireEvent.change(campo, { target: { value: valor } });
  fireEvent.blur(campo);
}

// Campo calculado ou travado: <output>, com papel de status, nomeado pelo rótulo.
function calculado(rotulo: string) {
  return screen.getByRole('status', { name: rotulo });
}

function indicador(id: string) {
  return screen.getByTestId(id).textContent;
}

function preencherPredio4x4(area = '68,50') {
  escolher(campos.tipoProjeto, 'Residencial');
  escolher(campos.tipologia, 'Prédio');
  digitar(campos.pavimentos, '4');
  digitar(campos.unidadesPorPavimento, '4');
  digitar(campos.areaUnidade, area);
}

function preencherUnidade(area = '68,50', preco = '450.000,00') {
  digitar(campos.areaUnidade, area);
  digitar(campos.precoUnidade, preco);
}

// Na Etapa 2 o botão de avançar gera a análise (F13).
function avancar() {
  fireEvent.click(screen.getByRole('button', { name: 'Gerar análise' }));
}

function resumo() {
  return screen.getByText('Falta preencher para avançar').closest('[tabindex="-1"]') as HTMLElement;
}

function itensDoResumo() {
  return within(resumo())
    .getAllByRole('button')
    .map((botao) => botao.textContent);
}

const { campos } = TEXTOS_PRODUTO;

describe('Produto', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(cleanup);

  describe('trava de acesso (D-R11)', () => {
    it('sem a Etapa 1, a URL direta volta ao Terreno', () => {
      renderProduto();

      expect(screen.getByText('tela de terreno')).toBeTruthy();
      expect(screen.queryByRole('heading', { name: 'Produto' })).toBeNull();
    });

    it('com a Etapa 1 incompleta (sem topografia), também volta', () => {
      salvarRascunho({ ...TERRENO_VALIDO, topografia: null });
      renderProduto();

      expect(screen.getByText('tela de terreno')).toBeTruthy();
    });

    it('com a Etapa 1 válida, abre a página de Produto', () => {
      salvarRascunho(TERRENO_VALIDO);
      renderProduto();

      expect(screen.getByRole('heading', { level: 1, name: 'Produto' })).toBeTruthy();
    });
  });

  describe('com a Etapa 1 válida', () => {
    beforeEach(() => salvarRascunho(TERRENO_VALIDO));

    it('mostra as seções da Etapa 2', () => {
      renderProduto();

      const secoes = screen.getAllByRole('heading', { level: 2 }).map((titulo) => titulo.textContent);
      expect(secoes).toEqual(['Tipo e tipologia', 'Padrão de acabamento', 'Programa do empreendimento', 'Áreas e indicadores urbanísticos', 'Custo unitário da obra (CUB)']);
    });

    it('as tipologias só aparecem depois do tipo, e são só as dele', () => {
      renderProduto();

      expect(screen.queryByRole('group', { name: campos.tipologia })).toBeNull();
      expect(screen.getByText(campos.tipologiaAguardando)).toBeTruthy();

      escolher(campos.tipoProjeto, 'Residencial');
      expect(valoresDe(campos.tipologia)).toEqual(['casa', 'predio']);

      escolher(campos.tipoProjeto, 'Comercial');
      expect(valoresDe(campos.tipologia)).toEqual(['salasLojas', 'andaresLivres']);
    });

    it('trocar o tipo desmarca a tipologia e mantém o padrão', () => {
      renderProduto();

      escolher(campos.tipoProjeto, 'Residencial');
      escolher(campos.tipologia, 'Prédio');
      escolher(campos.padrao, 'Alto');
      escolher(campos.tipoProjeto, 'Comercial');

      expect(radios(campos.tipologia).some((item) => item.checked)).toBe(false);
      expect(radio(campos.padrao, 'Alto').checked).toBe(true);
    });

    it('Galpões já traz marcada a única tipologia do tipo', () => {
      renderProduto();

      escolher(campos.tipoProjeto, 'Galpões');

      expect(radios(campos.tipologia)).toHaveLength(1);
      expect(radio(campos.tipologia, 'Galpões industriais').checked).toBe(true);
    });

    it('Uso misto aparece desabilitado, com o motivo, e não pode ser escolhido (D-B6)', () => {
      renderProduto();

      const usoMisto = radio(campos.tipoProjeto, 'Uso misto');
      expect(usoMisto.disabled).toBe(true);
      expect(usoMisto.closest('label')?.textContent).toContain('Em definição');

      fireEvent.click(usoMisto);
      expect(usoMisto.checked).toBe(false);
      expect(screen.queryByRole('group', { name: campos.tipologia })).toBeNull();
    });

    it('não existe padrão pré-escolhido', () => {
      renderProduto();

      expect(radios(campos.padrao).map((item) => item.checked)).toEqual([false, false, false]);
      expect(valoresDe(campos.padrao)).toEqual(['baixo', 'normal', 'alto']);
    });

    it('"Avançar" vazio é barrado com o resumo, que recebe o foco, sem repetir a tipologia antes do tipo', async () => {
      renderProduto();

      avancar();

      expect(itensDoResumo()).toEqual([
        MENSAGENS_PRODUTO.tipoProjetoAusente,
        MENSAGENS_PRODUTO.padraoAusente,
        MENSAGENS_PRODUTO.pavimentosAusente,
        MENSAGENS_PRODUTO.unidadesAusente,
        MENSAGENS_PRODUTO.areaUnidadeAusente,
        MENSAGENS_PRODUTO.precoUnidadeAusente,
      ]);
      expect(screen.queryByText('tela de resultado')).toBeNull();
      await waitFor(() => expect(document.activeElement).toBe(resumo()));
    });

    it('o resumo passa a pedir a tipologia quando só ela falta', () => {
      renderProduto();

      escolher(campos.tipoProjeto, 'Comercial');
      escolher(campos.padrao, 'Normal');
      digitar(campos.pavimentos, '8');
      digitar(campos.unidadesPorPavimento, '10');
      preencherUnidade();
      avancar();

      expect(itensDoResumo()).toEqual([MENSAGENS_PRODUTO.tipologiaAusente]);
    });

    it('o item do resumo leva ao campo pendente, de cartão ou numérico', () => {
      renderProduto();

      avancar();
      fireEvent.click(within(resumo()).getByRole('button', { name: MENSAGENS_PRODUTO.padraoAusente }));
      expect(document.activeElement).toBe(radio(campos.padrao, 'Baixo'));

      fireEvent.click(within(resumo()).getByRole('button', { name: MENSAGENS_PRODUTO.areaUnidadeAusente }));
      expect(document.activeElement).toBe(entrada(campos.areaUnidade));
    });

    it('com tudo preenchido, avança para o Resultado', () => {
      renderProduto();

      escolher(campos.tipoProjeto, 'Residencial');
      escolher(campos.tipologia, 'Prédio');
      escolher(campos.padrao, 'Normal');
      digitar(campos.pavimentos, '4');
      digitar(campos.unidadesPorPavimento, '4');
      preencherUnidade();
      avancar();

      expect(screen.getByText('tela de resultado')).toBeTruthy();
    });

    it('voltar ao Terreno e retornar preserva as escolhas e o programa', () => {
      renderProduto();

      escolher(campos.tipoProjeto, 'Comercial');
      escolher(campos.tipologia, 'Andares livres');
      escolher(campos.padrao, 'Baixo');
      digitar(campos.pavimentos, '12');
      preencherUnidade('400', '2.000.000');
      fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
      fireEvent.click(screen.getByRole('button', { name: 'ir ao produto' }));

      expect(radio(campos.tipoProjeto, 'Comercial').checked).toBe(true);
      expect(radio(campos.tipologia, 'Andares livres').checked).toBe(true);
      expect(radio(campos.padrao, 'Baixo').checked).toBe(true);
      expect(entrada(campos.pavimentos).value).toBe('12');
      expect(entrada(campos.areaUnidade).value).toBe('400,00');
      expect(entrada(campos.precoUnidade).value).toBe('2.000.000,00');
    });

    describe('custo unitário da obra — CUB (F12)', () => {
      // O terreno do rascunho tem topografia Plana e formato Regular. Aqui é preciso a Regular da
      // referência do PRD, então o teste do caso de referência troca a topografia no rascunho.
      function rascunhoComTopografia(topografia: string, formatoLote = 'regular') {
        salvarRascunho({ ...TERRENO_VALIDO, topografia, formatoLote });
      }

      it('caso de referência do PRD: prédio Normal, 4 pav., topografia Regular → R$ 3.154,91/m²', () => {
        rascunhoComTopografia('regular');
        renderProduto();

        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Prédio');
        escolher(campos.padrao, 'Normal');
        digitar(campos.pavimentos, '4');

        expect(screen.getByTestId('cub-projeto').textContent).toBe('R-8');
        expect(screen.getByTestId('cub-base').textContent).toBe('R$ 2.554,58/m²');
        expect(screen.getByTestId('cub-soma').textContent).toBe('23,50%');
        expect(screen.getByTestId('cub-ajustado').textContent).toBe('R$ 3.154,91/m²');
      });

      it('discrimina os quatro aditivos um a um, com a faixa e a opção de cada', () => {
        rascunhoComTopografia('regular');
        renderProduto();

        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Prédio');
        escolher(campos.padrao, 'Normal');
        digitar(campos.pavimentos, '4');

        const tabela = screen.getByRole('table', { name: TEXTOS_CUB.aditivos });
        const linhas = within(tabela).getAllByRole('row').map((linha) => linha.textContent);
        expect(linhas).toEqual([
          'Fundaçãoaté 4 pavimentos7,00%',
          'Padrão de acabamentoNormal15,00%',
          'TopografiaRegular1,50%',
          'Formato do loteRegular0,00%',
          'Soma dos aditivos23,50%',
        ]);
      });

      it('mostra a competência e a versão da base, e que a data de emissão não foi informada', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Prédio');
        escolher(campos.padrao, 'Normal');
        digitar(campos.pavimentos, '4');

        expect(screen.getByText(/Base Sinduscon-MG, competência Ago\/2026 · versão cub-2026-08/)).toBeTruthy();
        expect(screen.getByText(new RegExp(TEXTOS_CUB.emissaoNaoInformada))).toBeTruthy();
      });

      it('mudar padrão, pavimentos e o terreno reclassifica e recalcula na hora', () => {
        rascunhoComTopografia('regular');
        renderProduto();
        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Prédio');
        escolher(campos.padrao, 'Normal');
        digitar(campos.pavimentos, '4');

        escolher(campos.padrao, 'Alto');
        expect(screen.getByTestId('cub-base').textContent).toBe('R$ 3.120,21/m²');

        digitar(campos.pavimentos, '10');
        expect(screen.getByTestId('cub-projeto').textContent).toBe('R-16');
        expect(screen.getByTestId('cub-base').textContent).toBe('R$ 3.223,52/m²');
        expect(screen.getByTestId('cub-soma').textContent).toBe('36,50%'); // 15% + 20% + 1,5% + 0%
      });

      it('antes de classificar, diz o que falta e não mostra número', () => {
        renderProduto();

        expect(screen.getByText(TEXTOS_CUB.aguardando)).toBeTruthy();
        expect(screen.queryByTestId('cub-ajustado')).toBeNull();
      });

      it('D-B4: padrão Baixo sem CUB publicado vira aviso, sem número, e diz que não é erro do usuário', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Prédio');
        escolher(campos.padrao, 'Baixo');
        digitar(campos.pavimentos, '10');

        expect(screen.getByText(TEXTOS_CUB.tituloPendencia)).toBeTruthy();
        expect(screen.getByText(TEXTOS_CUB.pendenciaPadraoSemValor('R-16'))).toBeTruthy();
        expect(screen.getByText(TEXTOS_CUB.pendenciaRodape)).toBeTruthy();
        expect(screen.queryByTestId('cub-base')).toBeNull();
        expect(screen.queryByTestId('cub-ajustado')).toBeNull();
        // Os aditivos continuam discriminados: não dependem do valor que falta.
        // Fundação 9–16 (15%) + Baixo (10%) + topografia Plana (0%) + formato Regular (0%).
        expect(screen.getByTestId('cub-soma').textContent).toBe('25,00%');
      });

      it('D-B5: andares livres com 9+ pavimentos (CAL-16) vira aviso de projeto sem tabela', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Comercial');
        escolher(campos.tipologia, 'Andares livres');
        escolher(campos.padrao, 'Normal');
        digitar(campos.pavimentos, '12');

        expect(screen.getByTestId('cub-projeto').textContent).toBe('CAL-16');
        expect(screen.getByText(TEXTOS_CUB.pendenciaProjetoSemTabela('CAL-16'))).toBeTruthy();
        expect(screen.queryByTestId('cub-ajustado')).toBeNull();
      });

      it('a pendência de CUB não trava o "Gerar análise": o servidor devolve a pendência, e o resultado a explica', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Comercial');
        escolher(campos.tipologia, 'Andares livres');
        escolher(campos.padrao, 'Normal');
        digitar(campos.pavimentos, '12');
        digitar(campos.unidadesPorPavimento, '4');
        preencherUnidade();
        avancar();

        expect(screen.getByText('tela de resultado')).toBeTruthy();
      });

      it('galpão: projeto GI, 1 pavimento, e o CUB base é o mesmo nos três padrões', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Galpões');
        escolher(campos.padrao, 'Baixo');
        const baseBaixo = screen.getByTestId('cub-base').textContent;
        escolher(campos.padrao, 'Alto');

        expect(screen.getByTestId('cub-projeto').textContent).toBe('GI');
        expect(screen.getByTestId('cub-base').textContent).toBe('R$ 1.333,76/m²');
        expect(baseBaixo).toBe('R$ 1.333,76/m²');
      });
    });

    describe('áreas e indicadores urbanísticos (F11)', () => {
      it('caso do plano: 1.000 m², taxa 60%, 4 pavimentos → utilizada 600, construída 2.400, CA 2,40', () => {
        renderProduto();

        preencherPredio4x4();

        expect(entrada(campos.taxaOcupacao).value).toBe('60,00');
        expect(indicador('area-utilizada')).toBe('600,00 m²');
        expect(indicador('area-construida')).toBe('2.400,00 m²');
        expect(indicador('coeficiente-aproveitamento')).toBe('2,40');
      });

      it('área comercializável é distinta da construída: 16 unidades × 68,50 m²', () => {
        renderProduto();

        preencherPredio4x4();

        expect(indicador('area-comercializavel')).toBe('1.096,00 m²');
        expect(indicador('area-construida')).not.toBe(indicador('area-comercializavel'));
      });

      it('o coeficiente soma todas as unidades do pavimento: 4 × 68,50 ÷ 600 = 45,67%', () => {
        renderProduto();

        preencherPredio4x4();

        expect(indicador('coeficiente-unidades')).toBe('45,67%');
      });

      it('mexer na taxa reage em tudo, e "Voltar ao padrão" restaura os 60%', () => {
        renderProduto();
        preencherPredio4x4();

        digitar(campos.taxaOcupacao, '50');
        expect(indicador('area-utilizada')).toBe('500,00 m²');
        expect(indicador('area-construida')).toBe('2.000,00 m²');
        expect(indicador('coeficiente-aproveitamento')).toBe('2,00');

        fireEvent.click(screen.getByRole('button', { name: TEXTOS_PRODUTO.campos.restaurarTaxa }));
        expect(entrada(campos.taxaOcupacao).value).toBe('60,00');
        expect(indicador('area-utilizada')).toBe('600,00 m²');
        expect(screen.queryByRole('button', { name: TEXTOS_PRODUTO.campos.restaurarTaxa })).toBeNull();
      });

      it('mostra a conta com os dados do usuário, dentro da fórmula expansível', () => {
        renderProduto();
        preencherPredio4x4();

        expect(screen.getByText('1.000,00 m² × 60,00% = 600,00 m²')).toBeTruthy();
        expect(screen.getByText('600,00 m² × 4 pavimentos = 2.400,00 m²')).toBeTruthy();
        expect(screen.getAllByText('Como é calculado').length).toBeGreaterThanOrEqual(4);
      });

      it('sem os insumos, o indicador mostra "—" e diz o que falta, sem inventar número', () => {
        renderProduto();

        expect(indicador('area-utilizada')).toBe('600,00 m²'); // só depende do terreno e da taxa
        expect(indicador('area-construida')).toBe('—');
        expect(screen.getByText(TEXTOS_PRODUTO.indicadores.areaConstruida.aguardando)).toBeTruthy();
        expect(indicador('area-comercializavel')).toBe('—');
      });

      it('casa: o coeficiente das unidades some (PRD 3.3), e as demais áreas seguem', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Casa');
        digitar(campos.pavimentos, '2');
        digitar(campos.areaUnidade, '180');

        expect(screen.queryByTestId('coeficiente-unidades')).toBeNull();
        expect(indicador('area-construida')).toBe('1.200,00 m²');
        expect(indicador('area-comercializavel')).toBe('180,00 m²');
      });

      it('taxa fora de 0–100% é acusada e o painel não calcula sobre ela', () => {
        renderProduto();
        preencherPredio4x4();

        digitar(campos.taxaOcupacao, '0,6');
        expect(indicador('area-utilizada')).toBe('6,00 m²'); // 0,60% é válido: o usuário vê o efeito

        digitar(campos.taxaOcupacao, '150');
        expect(screen.getByText(MENSAGENS_PRODUTO.taxaOcupacaoAcimaDeCem)).toBeTruthy();
        expect(indicador('area-utilizada')).toBe('—');
        expect(indicador('coeficiente-aproveitamento')).toBe('—');

        digitar(campos.taxaOcupacao, '0');
        expect(screen.getByText(MENSAGENS_PRODUTO.taxaOcupacaoNaoPositiva)).toBeTruthy();
      });

      it('taxa apagada trava o "Gerar análise" e leva ao campo pelo resumo', () => {
        renderProduto();
        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Prédio');
        escolher(campos.padrao, 'Normal');
        digitar(campos.pavimentos, '4');
        digitar(campos.unidadesPorPavimento, '4');
        preencherUnidade();
        digitar(campos.taxaOcupacao, '');
        avancar();

        expect(itensDoResumo()).toEqual([MENSAGENS_PRODUTO.taxaOcupacaoAusente]);
        fireEvent.click(within(resumo()).getByRole('button', { name: MENSAGENS_PRODUTO.taxaOcupacaoAusente }));
        expect(document.activeElement).toBe(entrada(campos.taxaOcupacao));
      });

      it('texto ilegível na taxa é acusado como formato, não como campo vazio', () => {
        renderProduto();

        digitar(campos.taxaOcupacao, 'sessenta');

        expect(screen.getByText(MENSAGENS_PRODUTO.taxaOcupacaoIlegivel)).toBeTruthy();
      });

      it('a taxa ajustada sobrevive a voltar ao Terreno e retornar', () => {
        renderProduto();

        digitar(campos.taxaOcupacao, '55');
        fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
        fireEvent.click(screen.getByRole('button', { name: 'ir ao produto' }));

        expect(entrada(campos.taxaOcupacao).value).toBe('55,00');
      });
    });

    describe('programa do empreendimento (F10)', () => {
      it('Prédio 4 × 4: total de 16 unidades, com a fórmula à vista', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Prédio');
        expect(calculado(campos.totalUnidades).textContent).toBe('—');
        expect(screen.getByText(campos.totalUnidadesAguardando)).toBeTruthy();

        digitar(campos.pavimentos, '4');
        digitar(campos.unidadesPorPavimento, '4');

        expect(calculado(campos.totalUnidades).textContent).toBe('16');
        expect(screen.getByText(campos.formulaTotalUnidades)).toBeTruthy();
      });

      it('preço por m² vendido = preço ÷ área, com a nota de que a lastro não consulta mercado', () => {
        renderProduto();

        preencherUnidade('68,50', '450.000,00');

        expect(calculado(campos.precoM2Vendido).textContent).toBe('R$ 6.569,34/m²');
        expect(screen.getByText(campos.formulaPrecoM2Vendido)).toBeTruthy();
      });

      it('área zero não gera preço por m²: acusa a área', () => {
        renderProduto();

        preencherUnidade('0', '450.000,00');

        expect(calculado(campos.precoM2Vendido).textContent).toBe('—');
        expect(screen.getByText(MENSAGENS_PRODUTO.areaUnidadeNaoPositiva)).toBeTruthy();
      });

      it('fração de pavimento é recusada, não arredondada', () => {
        renderProduto();

        digitar(campos.pavimentos, '4,5');

        expect(screen.getByText(MENSAGENS_PRODUTO.pavimentosNaoInteiro)).toBeTruthy();
        expect(entrada(campos.pavimentos).getAttribute('aria-invalid')).toBe('true');
      });

      it('Casa trava 1 unidade por pavimento e no total, com o motivo; os pavimentos seguem livres', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Casa');
        digitar(campos.pavimentos, '2');

        expect(screen.queryByLabelText(campos.unidadesPorPavimento, { selector: 'input' })).toBeNull();
        expect(calculado(campos.unidadesPorPavimento).textContent).toBe('1');
        expect(screen.getByText(MOTIVO_UNIDADE_UNICA.casa as string)).toBeTruthy();
        expect(calculado(campos.totalUnidades).textContent).toBe('1');
      });

      it('Galpões trava 1 pavimento e 1 unidade, com os motivos (D-R19), e avança sem digitá-los', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Galpões');
        escolher(campos.padrao, 'Normal');
        preencherUnidade('3.000', '9.000.000');

        expect(calculado(campos.pavimentos).textContent).toBe('1');
        expect(screen.getByText(MOTIVO_PAVIMENTOS_FIXOS.galpao as string)).toBeTruthy();
        expect(calculado(campos.unidadesPorPavimento).textContent).toBe('1');
        expect(calculado(campos.totalUnidades).textContent).toBe('1');

        avancar();
        expect(screen.getByText('tela de resultado')).toBeTruthy();
      });

      it('trocar de Prédio para Casa e voltar reavalia as travas e recupera o que foi digitado', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Prédio');
        digitar(campos.pavimentos, '4');
        digitar(campos.unidadesPorPavimento, '4');
        expect(calculado(campos.totalUnidades).textContent).toBe('16');

        escolher(campos.tipologia, 'Casa');
        expect(calculado(campos.totalUnidades).textContent).toBe('1');

        escolher(campos.tipologia, 'Prédio');
        expect(entrada(campos.unidadesPorPavimento).value).toBe('4');
        expect(calculado(campos.totalUnidades).textContent).toBe('16');
      });

      it('texto ilegível num campo que a tipologia passa a travar não vira pendência', () => {
        renderProduto();

        escolher(campos.tipoProjeto, 'Residencial');
        escolher(campos.tipologia, 'Prédio');
        digitar(campos.unidadesPorPavimento, 'quatro');
        escolher(campos.tipologia, 'Casa');
        escolher(campos.padrao, 'Alto');
        digitar(campos.pavimentos, '2');
        preencherUnidade();
        avancar();

        expect(screen.getByText('tela de resultado')).toBeTruthy();
      });
    });
  });
});
