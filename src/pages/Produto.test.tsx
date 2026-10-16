import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MOTIVO_PAVIMENTOS_FIXOS, MOTIVO_UNIDADE_UNICA, TEXTOS_PRODUTO } from '../content/produto';
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

function preencherUnidade(area = '68,50', preco = '450.000,00') {
  digitar(campos.areaUnidade, area);
  digitar(campos.precoUnidade, preco);
}

function avancar() {
  fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
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
      expect(secoes).toEqual(['Tipo e tipologia', 'Padrão de acabamento', 'Programa do empreendimento']);
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
