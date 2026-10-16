import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { Analise, AreasDto, ProgramaDto, ResultadoEconomiaDto } from '../../types/analise';
import { PotencialPreliminar } from './PotencialPreliminar';
import { PrecoMaximo } from './PrecoMaximo';
import { ResumoProjeto } from './ResumoProjeto';

afterEach(cleanup);

const { precoMaximo } = TEXTOS_RESULTADO;

// Resultado do terreno e preço pedido definem a sobra ou o déficit: liquido = terreno − pedido.
function economia(resultadoTerreno: number, precoPedido: number): Pick<
  ResultadoEconomiaDto,
  'resultadoTerrenoCentavos' | 'precoPedidoCentavos' | 'resultadoLiquidoCentavos'
> {
  return {
    resultadoTerrenoCentavos: resultadoTerreno,
    precoPedidoCentavos: precoPedido,
    resultadoLiquidoCentavos: resultadoTerreno - precoPedido,
  };
}

function texto(id: string) {
  return screen.getByTestId(id).textContent;
}

describe('PrecoMaximo', () => {
  describe('cenário com sobra (o preço pedido cabe)', () => {
    // Cenário da F13: terreno pode valer R$ 2.076.216,00; pedem R$ 1.200.000,00.
    const cenario = economia(207_621_600, 120_000_000);

    it('o preço máximo recomendado é exatamente o Resultado do terreno', () => {
      render(<PrecoMaximo economia={cenario} />);
      expect(texto('preco-maximo')).toBe('R$ 2.076.216,00');
    });

    it('mostra o preço pedido e a sobra, que é o Resultado líquido', () => {
      render(<PrecoMaximo economia={cenario} />);
      expect(texto('preco-pedido')).toBe('R$ 1.200.000,00');
      expect(texto('leitura-rotulo')).toBe('Sobra');
      expect(texto('leitura-valor')).toBe('R$ 876.216,00');
    });

    it('explica em linguagem simples, sem veredito', () => {
      render(<PrecoMaximo economia={cenario} />);
      expect(screen.getByText(precoMaximo.frase.sobra('R$ 876.216,00'))).toBeTruthy();
      expect(screen.getByText(precoMaximo.explicacao)).toBeTruthy();
      expect(screen.getByText(precoMaximo.preliminar)).toBeTruthy();
      const bloco = screen.getByRole('region', { name: precoMaximo.titulo });
      expect(within(bloco).queryByText(/comprar|viável|recomend[ao] (comprar|fazer)/i)).toBeNull();
    });

    it('não mostra o aviso de "sem margem", pois o resultado do terreno é positivo', () => {
      render(<PrecoMaximo economia={cenario} />);
      expect(screen.queryByText(precoMaximo.semMargem)).toBeNull();
    });
  });

  describe('cenário com déficit (o preço pedido passa do máximo)', () => {
    // Terreno pode valer R$ 800.000,00; pedem R$ 1.200.000,00.
    const cenario = economia(80_000_000, 120_000_000);

    it('chama de Déficit, com o valor sem sinal e a frase de "acima"', () => {
      render(<PrecoMaximo economia={cenario} />);
      expect(texto('leitura-rotulo')).toBe('Déficit');
      expect(texto('leitura-valor')).toBe('R$ 400.000,00');
      expect(screen.getByText(precoMaximo.frase.deficit('R$ 400.000,00'))).toBeTruthy();
    });

    it('o preço máximo segue sendo o Resultado do terreno, ainda positivo', () => {
      render(<PrecoMaximo economia={cenario} />);
      expect(texto('preco-maximo')).toBe('R$ 800.000,00');
      expect(screen.queryByText(precoMaximo.semMargem)).toBeNull();
    });
  });

  describe('projeto que não se paga nem com o terreno de graça (Resultado do terreno negativo)', () => {
    const cenario = economia(-274_778_400, 120_000_000);

    it('mostra o preço máximo exato, com o sinal antes do símbolo, e explica', () => {
      render(<PrecoMaximo economia={cenario} />);
      expect(texto('preco-maximo')).toBe('-R$ 2.747.784,00');
      expect(screen.getByTestId('preco-maximo').getAttribute('data-negativo')).toBe('true');
      expect(screen.getByText(precoMaximo.semMargem)).toBeTruthy();
    });

    it('o déficit é o Resultado líquido: tudo o que falta, contando o preço pedido', () => {
      render(<PrecoMaximo economia={cenario} />);
      expect(texto('leitura-rotulo')).toBe('Déficit');
      expect(texto('leitura-valor')).toBe('R$ 3.947.784,00');
    });
  });

  describe('empate (o preço pedido é exatamente o máximo)', () => {
    const cenario = economia(207_621_600, 207_621_600);

    it('chama de Empate, sem valor de diferença', () => {
      render(<PrecoMaximo economia={cenario} />);
      expect(texto('leitura-rotulo')).toBe('Empate');
      expect(screen.queryByTestId('leitura-valor')).toBeNull();
      expect(screen.getByText(precoMaximo.frase.empate)).toBeTruthy();
    });

    it('um centavo de diferença já deixa de ser empate', () => {
      const { rerender } = render(<PrecoMaximo economia={economia(100, 99)} />);
      expect(texto('leitura-rotulo')).toBe('Sobra');
      expect(texto('leitura-valor')).toBe('R$ 0,01');
      rerender(<PrecoMaximo economia={economia(100, 101)} />);
      expect(texto('leitura-rotulo')).toBe('Déficit');
      expect(texto('leitura-valor')).toBe('R$ 0,01');
    });
  });

  describe('a cor não é o único sinal', () => {
    it('sobra, déficit e empate diferem por palavra, e cada um tem um ícone', () => {
      const rotulos: string[] = [];
      for (const cenario of [economia(200, 100), economia(100, 200), economia(100, 100)]) {
        const { container, unmount } = render(<PrecoMaximo economia={cenario} />);
        rotulos.push(texto('leitura-rotulo') ?? '');
        expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
        expect(screen.getByTestId('leitura-sobra-deficit').textContent?.length).toBeGreaterThan(0);
        unmount();
      }
      expect(new Set(rotulos).size).toBe(3);
      expect(rotulos).toEqual(['Sobra', 'Déficit', 'Empate']);
    });

    it('a leitura vai no atributo do bloco, que o CSS usa só para o tom', () => {
      const { container } = render(<PrecoMaximo economia={economia(100, 200)} />);
      expect(container.querySelector('section')?.getAttribute('data-leitura')).toBe('deficit');
    });
  });

  it('valores grandes não são cortados: nove dígitos de reais', () => {
    render(<PrecoMaximo economia={economia(900_000_000_000, 1_000)} />);
    expect(texto('preco-maximo')).toBe('R$ 9.000.000.000,00');
  });
});

describe('PotencialPreliminar', () => {
  const areas: AreasDto = {
    areaUtilizadaCentesimos: 60_000,
    areaConstruidaCentesimos: 240_000,
    areaComercializavelCentesimos: 109_600,
    coeficienteAproveitamentoCentesimos: 240,
    coeficienteUnidadesPontosBase: 4_567,
  };
  const programa: ProgramaDto = { pavimentos: 4, unidadesPorPavimento: 4, totalUnidades: 16 };

  it('mostra área construída, área para vender e unidades, com a unidade de medida', () => {
    render(<PotencialPreliminar areas={areas} programa={programa} />);
    expect(texto('potencial-area-construida')).toBe('2.400,00 m²');
    expect(texto('potencial-area-comercializavel')).toBe('1.096,00 m²');
    expect(texto('potencial-unidades')).toBe('16');
  });

  it('distingue a área construída da área para vender, que não são a mesma coisa', () => {
    render(<PotencialPreliminar areas={areas} programa={programa} />);
    expect(texto('potencial-area-construida')).not.toBe(texto('potencial-area-comercializavel'));
    expect(screen.getByText(TEXTOS_RESULTADO.potencial.construida.nota)).toBeTruthy();
    expect(screen.getByText(TEXTOS_RESULTADO.potencial.comercializavel.nota)).toBeTruthy();
  });

  it('área ausente vira "—", nunca um número inventado', () => {
    render(<PotencialPreliminar areas={{ ...areas, areaConstruidaCentesimos: null }} programa={programa} />);
    expect(texto('potencial-area-construida')).toBe('—');
  });
});

describe('ResumoProjeto', () => {
  const analise: Analise = {
    objetivo: 'comprarTerreno',
    terreno: {
      nome: '  Lote da Rua Alagoas ',
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
  const programa: ProgramaDto = { pavimentos: 4, unidadesPorPavimento: 4, totalUnidades: 16 };

  it('resume o que foi informado, com o nome da cidade e os rótulos da tela', () => {
    render(<ResumoProjeto analise={analise} programa={programa} />);
    expect(texto('projeto-objetivo')).toBe('Comprar o terreno');
    expect(texto('projeto-terreno')).toBe('Lote da Rua Alagoas');
    expect(texto('projeto-cidade')).toBe('Belo Horizonte');
    expect(texto('projeto-area-terreno')).toBe('1.000,00 m²');
    expect(texto('projeto-tipologia')).toBe('Prédio (multifamiliar), 4 pavimentos');
    expect(texto('projeto-padrao')).toBe('Normal');
    expect(texto('projeto-unidades')).toBe('16 unidades');
    expect(texto('projeto-area-unidade')).toBe('68,50 m²');
    expect(texto('projeto-preco-unidade')).toBe('R$ 900.000,00');
  });

  it('usa o programa efetivo do servidor: casa de 2 pavimentos tem 1 unidade, no singular', () => {
    render(
      <ResumoProjeto
        analise={{ ...analise, produto: { ...analise.produto, tipologia: 'casa', unidadesPorPavimento: 9 } }}
        programa={{ pavimentos: 2, unidadesPorPavimento: 1, totalUnidades: 1 }}
      />,
    );
    expect(texto('projeto-tipologia')).toBe('Casa (unifamiliar), 2 pavimentos');
    expect(texto('projeto-unidades')).toBe('1 unidade');
  });

  it('1 pavimento no singular', () => {
    render(<ResumoProjeto analise={analise} programa={{ ...programa, pavimentos: 1 }} />);
    expect(texto('projeto-tipologia')).toBe('Prédio (multifamiliar), 1 pavimento');
  });
});
