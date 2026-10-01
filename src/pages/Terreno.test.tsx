import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

function campoCidade() {
  return screen.getByRole('combobox', { name: 'Cidade' }) as HTMLInputElement;
}

function campoCep() {
  return screen.getByLabelText('CEP (opcional)') as HTMLInputElement;
}

function escolherCidade(nome: string) {
  fireEvent.change(campoCidade(), { target: { value: nome } });
  fireEvent.blur(campoCidade());
}

function campoArea() {
  return screen.getByLabelText('Área total do terreno (m²)') as HTMLInputElement;
}

function campoPreco() {
  return screen.getByLabelText('Preço pedido pelo terreno (R$)') as HTMLInputElement;
}

function precoUnitario() {
  return screen.getByRole('status', { name: 'Preço por m² do terreno' });
}

function digitar(campo: HTMLInputElement, valor: string) {
  fireEvent.focus(campo);
  fireEvent.change(campo, { target: { value: valor } });
  fireEvent.blur(campo);
}

function preencherEtapaValida() {
  fireEvent.click(screen.getByLabelText(/Comprar o terreno/));
  fireEvent.change(campoNome(), { target: { value: 'Lote da Rua Alagoas' } });
  escolherCidade('Belo Horizonte');
  digitar(campoArea(), '1000');
  digitar(campoPreco(), '1200000');
}

function respostaJson(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });
}

function simularApiCep(resposta: () => Promise<Response>) {
  const buscar = vi.fn(resposta);
  vi.stubGlobal('fetch', buscar);
  return buscar;
}

describe('Terreno', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

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
    expect(screen.getByRole('button', { name: MENSAGENS_TERRENO.cidadeAusente })).toBeTruthy();
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
    escolherCidade('Belo Horizonte');
    digitar(campoArea(), '1000');
    expect(screen.getByRole('button', { name: MENSAGENS_TERRENO.precoAusente })).toBeTruthy();
    digitar(campoPreco(), '1200000');
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
    expect(campoCidade().value).toBe('Belo Horizonte');
    expect((screen.getByLabelText(/Comprar o terreno/) as HTMLInputElement).checked).toBe(true);
    expect(campoArea().value).toBe('1.000,00');
    expect(campoPreco().value).toBe('1.200.000,00');
    expect(precoUnitario().textContent).toBe('R$ 1.200,00/m²');
  });

  describe('área, preço e preço por m²', () => {
    it('caso de validação do plano: 1.000 m² e R$ 1.200.000 dão R$ 1.200,00/m²', () => {
      renderTerreno();

      expect(precoUnitario().textContent).toBe('—');
      digitar(campoArea(), '1000');
      expect(precoUnitario().textContent).toBe('—');
      digitar(campoPreco(), '1200000');

      expect(precoUnitario().textContent).toBe('R$ 1.200,00/m²');
      expect(screen.getByText(/preço pedido ÷ área total/)).toBeTruthy();
    });

    it('recalcula a cada tecla, sem esperar sair do campo', () => {
      renderTerreno();
      digitar(campoArea(), '1000');
      fireEvent.focus(campoPreco());

      fireEvent.change(campoPreco(), { target: { value: '500000' } });
      expect(precoUnitario().textContent).toBe('R$ 500,00/m²');
      fireEvent.change(campoPreco(), { target: { value: '5000000' } });
      expect(precoUnitario().textContent).toBe('R$ 5.000,00/m²');
    });

    it('não reescreve o texto durante a digitação e formata ao sair', () => {
      renderTerreno();

      fireEvent.focus(campoPreco());
      fireEvent.change(campoPreco(), { target: { value: '1200000,5' } });
      expect(campoPreco().value).toBe('1200000,5');

      fireEvent.blur(campoPreco());
      expect(campoPreco().value).toBe('1.200.000,50');
    });

    it('aceita valor colado já formatado, com "R$"', () => {
      renderTerreno();
      digitar(campoArea(), '1.250,50 m²');
      digitar(campoPreco(), 'R$ 500.000,00');

      expect(campoArea().value).toBe('1.250,50');
      expect(precoUnitario().textContent).toBe('R$ 399,84/m²');
    });

    it('área zero ou negativa é recusada e não gera preço por m²', () => {
      renderTerreno();
      digitar(campoPreco(), '1200000');

      digitar(campoArea(), '0');
      expect(screen.getByText(MENSAGENS_TERRENO.areaNaoPositiva)).toBeTruthy();
      expect(precoUnitario().textContent).toBe('—');

      digitar(campoArea(), '-50');
      expect(screen.getByText(MENSAGENS_TERRENO.areaNaoPositiva)).toBeTruthy();
      expect(campoArea().getAttribute('aria-invalid')).toBe('true');
    });

    it('texto ilegível acusa o formato, mantém o que foi digitado e bloqueia o avançar', () => {
      renderTerreno();
      preencherEtapaValida();

      digitar(campoPreco(), '1,2,3');

      expect(campoPreco().value).toBe('1,2,3');
      expect(screen.getByText(MENSAGENS_TERRENO.precoIlegivel)).toBeTruthy();
      expect(precoUnitario().textContent).toBe('—');
      avancar();
      expect(screen.queryByText('tela de produto')).toBeNull();
      expect(screen.getByRole('button', { name: MENSAGENS_TERRENO.precoIlegivel })).toBeTruthy();
    });

    it('a pendência de preço leva ao campo de preço', () => {
      renderTerreno();
      avancar();

      fireEvent.click(screen.getByRole('button', { name: MENSAGENS_TERRENO.precoAusente }));
      expect(document.activeElement).toBe(campoPreco());
    });

    it('a unidade fica no nome acessível e o teclado do celular é o numérico', () => {
      renderTerreno();

      expect(campoArea().getAttribute('inputmode')).toBe('decimal');
      expect(campoPreco().getAttribute('aria-required')).toBe('true');
    });
  });

  it('Voltar leva à página inicial sem validar', () => {
    renderTerreno();

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByText('tela inicial')).toBeTruthy();
  });

  describe('cidade e CEP', () => {
    const BH = {
      cep: '30130010',
      logradouro: 'Praça Sete de Setembro',
      bairro: 'Centro',
      cidade: 'Belo Horizonte',
      uf: 'MG',
      codigoIbge: 3106200,
    };

    it('a cidade é obrigatória e aceita só município de MG da lista', () => {
      renderTerreno();

      escolherCidade('Belo Horizont');

      expect(screen.getByText(MENSAGENS_TERRENO.cidadeAusente)).toBeTruthy();
      escolherCidade('belo horizonte');
      expect(campoCidade().value).toBe('Belo Horizonte');
      expect(screen.queryByText(MENSAGENS_TERRENO.cidadeAusente)).toBeNull();
    });

    it('aplica a máscara e só consulta ao completar os 8 dígitos', async () => {
      const buscar = simularApiCep(async () => respostaJson({ dados: BH }));
      renderTerreno();

      fireEvent.change(campoCep(), { target: { value: '3013001' } });
      expect(campoCep().value).toBe('30130-01');
      expect(buscar).not.toHaveBeenCalled();

      fireEvent.change(campoCep(), { target: { value: '30130010' } });
      expect(campoCep().value).toBe('30130-010');
      await waitFor(() => expect(buscar).toHaveBeenCalledWith('/api/v1/cep/30130010', expect.anything()));
    });

    it('CEP encontrado preenche cidade, logradouro e bairro, com a origem indicada', async () => {
      simularApiCep(async () => respostaJson({ dados: BH }));
      renderTerreno();

      fireEvent.change(campoCep(), { target: { value: '30130-010' } });

      await waitFor(() => expect(campoCidade().value).toBe('Belo Horizonte'));
      expect((screen.getByLabelText('Logradouro (opcional)') as HTMLInputElement).value).toBe('Praça Sete de Setembro');
      expect((screen.getByLabelText('Bairro (opcional)') as HTMLInputElement).value).toBe('Centro');
      expect(screen.getByText('Endereço preenchido pelo CEP. Confira e ajuste se precisar.')).toBeTruthy();
    });

    it('CEP geral de cidade (sem rua) não apaga o que já foi digitado', async () => {
      simularApiCep(async () => respostaJson({ dados: { ...BH, logradouro: '', bairro: '' } }));
      renderTerreno();

      fireEvent.change(screen.getByLabelText('Logradouro (opcional)'), { target: { value: 'Rua Alagoas' } });
      fireEvent.change(campoCep(), { target: { value: '30130010' } });

      await waitFor(() => expect(campoCidade().value).toBe('Belo Horizonte'));
      expect((screen.getByLabelText('Logradouro (opcional)') as HTMLInputElement).value).toBe('Rua Alagoas');
    });

    it('CEP inexistente avisa e deixa preencher à mão', async () => {
      simularApiCep(async () => respostaJson({ erro: { codigo: 'CEP_NAO_ENCONTRADO' } }, 404));
      renderTerreno();

      fireEvent.change(campoCep(), { target: { value: '99999999' } });

      await waitFor(() =>
        expect(screen.getByText('CEP não encontrado. Confira os números ou preencha o endereço à mão.')).toBeTruthy(),
      );
      expect(campoCep().getAttribute('aria-invalid')).toBeNull();
    });

    it('CEP de outro estado vira erro no campo e bloqueia o avançar', async () => {
      simularApiCep(async () =>
        respostaJson({ dados: { ...BH, cep: '01001000', cidade: 'São Paulo', uf: 'SP', codigoIbge: 3550308 } }),
      );
      renderTerreno();
      preencherEtapaValida();

      fireEvent.change(campoCep(), { target: { value: '01001000' } });

      await waitFor(() => expect(screen.getByText(MENSAGENS_TERRENO.cepForaDaCobertura('SP'))).toBeTruthy());
      expect(campoCidade().value).toBe('Belo Horizonte');
      avancar();
      expect(screen.queryByText('tela de produto')).toBeNull();

      // Apagar o CEP libera, porque o CEP é opcional.
      fireEvent.change(campoCep(), { target: { value: '' } });
      avancar();
      expect(screen.getByText('tela de produto')).toBeTruthy();
    });

    it('com a API de CEP fora do ar, avisa sem bloquear, e o formulário avança', async () => {
      simularApiCep(async () => {
        throw new TypeError('Failed to fetch');
      });
      renderTerreno();
      preencherEtapaValida();

      fireEvent.change(campoCep(), { target: { value: '30130010' } });
      await waitFor(() =>
        expect(
          screen.getByText('A consulta de CEP não respondeu agora. Preencha o endereço à mão; isso não impede a análise.'),
        ).toBeTruthy(),
      );
      fireEvent.change(screen.getByLabelText('Logradouro (opcional)'), { target: { value: 'Rua Alagoas' } });

      avancar();

      expect(screen.getByText('tela de produto')).toBeTruthy();
    });

    it('CEP incompleto é acusado ao sair do campo', () => {
      renderTerreno();

      fireEvent.change(campoCep(), { target: { value: '3013' } });
      fireEvent.blur(campoCep());

      expect(screen.getByText(MENSAGENS_TERRENO.cepIncompleto)).toBeTruthy();
    });
  });
});
