import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { ParametroUsado, ResultadoEconomiaDto } from '../../types/analise';
import { MargemResultante } from './MargemResultante';
import { FraseFixoResolvido, TogglePerspectiva } from './TogglePerspectiva';

afterEach(cleanup);

const { margem, perspectiva } = TEXTOS_RESULTADO;

const LUCRO_NORMAL: { lucroIncorporador: ParametroUsado & { padrao: string } } = {
  lucroIncorporador: { pontosBase: 2_200, provisorio: true, fonte: 'PRD 3.1', versao: 'teste', padrao: 'normal' },
};

// Lucro resultante e lucro esperado definem a leitura: diferença = resultante − esperado = Resultado líquido.
function economia(
  lucroResultante: number,
  lucroEsperado: number,
  margemPontosBase: number | null = 2_809,
): Parameters<typeof MargemResultante>[0]['economia'] {
  return {
    lucroResultanteCentavos: lucroResultante,
    lucroIncorporadorCentavos: lucroEsperado,
    precoPedidoCentavos: 120_000_000,
    resultadoLiquidoCentavos: lucroResultante - lucroEsperado,
    percentuaisDoVgvPontosBase: { lucroResultante: margemPontosBase } as ResultadoEconomiaDto['percentuaisDoVgvPontosBase'],
  };
}

function texto(id: string) {
  return screen.getByTestId(id).textContent;
}

describe('TogglePerspectiva', () => {
  it('marca a perspectiva recebida e avisa a troca, sem decidir sozinho', () => {
    const aoMudar = vi.fn();
    render(<TogglePerspectiva valor="terrenista" aoMudar={aoMudar} />);

    const terrenista = screen.getByRole('radio', { name: perspectiva.opcoes.terrenista }) as HTMLInputElement;
    const incorporador = screen.getByRole('radio', { name: perspectiva.opcoes.incorporador }) as HTMLInputElement;
    expect(terrenista.checked).toBe(true);
    expect(incorporador.checked).toBe(false);

    fireEvent.click(incorporador);
    expect(aoMudar).toHaveBeenCalledWith('incorporador');
  });

  it('os dois radios têm o mesmo nome: são um grupo só, navegável pelas setas', () => {
    render(<TogglePerspectiva valor="incorporador" aoMudar={() => undefined} />);
    const nomes = screen.getAllByRole('radio').map((radio) => radio.getAttribute('name'));
    expect(new Set(nomes).size).toBe(1);
  });

  it('cada perspectiva diz o que está fixo e o que é resolvido', () => {
    const { rerender } = render(<FraseFixoResolvido perspectiva="terrenista" />);
    expect(texto('perspectiva-frase')).toBe('Fixo: o lucro do incorporador. Resolvido: o preço máximo do terreno.');

    rerender(<FraseFixoResolvido perspectiva="incorporador" />);
    expect(texto('perspectiva-frase')).toBe('Fixo: o preço pedido pelo terreno. Resolvido: o lucro do incorporador.');
  });

  it('anuncia a troca numa região viva que continua montada, com a mesma frase', () => {
    const { rerender } = render(<TogglePerspectiva valor="terrenista" aoMudar={() => undefined} />);
    const anuncio = screen.getByTestId('perspectiva-anuncio');
    expect(anuncio.getAttribute('aria-live')).toBe('polite');

    rerender(<TogglePerspectiva valor="incorporador" aoMudar={() => undefined} />);
    expect(screen.getByTestId('perspectiva-anuncio')).toBe(anuncio);
    expect(anuncio.textContent).toBe('Leitura Incorporador. Fixo: o preço pedido pelo terreno. Resolvido: o lucro do incorporador.');
  });

  it('lembra que trocar a leitura não muda nenhum dado', () => {
    render(<TogglePerspectiva valor="terrenista" aoMudar={() => undefined} />);
    expect(screen.getByText(perspectiva.mesmaConta)).toBeTruthy();
  });
});

describe('MargemResultante', () => {
  it('lucro acima do esperado: o lucro resultante, a margem e a diferença, que é a sobra da outra leitura', () => {
    render(<MargemResultante economia={economia(404_421_600, 316_800_000)} premissas={LUCRO_NORMAL} />);

    expect(texto('lucro-resultante')).toBe('R$ 4.044.216,00');
    expect(texto('margem-resultante')).toBe('28,09%');
    expect(texto('preco-pedido')).toBe('R$ 1.200.000,00');
    expect(texto('leitura-rotulo')).toBe(margem.leitura.acima);
    expect(texto('leitura-valor')).toBe('R$ 876.216,00');
    expect(screen.getByText(margem.esperado('Normal', '22,00', 'R$ 3.168.000,00'))).toBeTruthy();
    expect(screen.queryByText(margem.prejuizo)).toBeNull();
  });

  it('lucro abaixo do esperado, mas positivo: não é prejuízo', () => {
    render(<MargemResultante economia={economia(100_000_000, 316_800_000, 694)} premissas={LUCRO_NORMAL} />);

    expect(texto('leitura-rotulo')).toBe(margem.leitura.abaixo);
    expect(texto('leitura-valor')).toBe('R$ 2.168.000,00');
    expect(screen.getByTestId('lucro-resultante').getAttribute('data-negativo')).toBeNull();
    expect(screen.queryByText(margem.prejuizo)).toBeNull();
  });

  it('margem negativa: prejuízo com o sinal antes do símbolo, e a frase que explica', () => {
    render(<MargemResultante economia={economia(-236_378_400, 158_400_000, -3_283)} premissas={LUCRO_NORMAL} />);

    expect(texto('lucro-resultante')).toBe('-R$ 2.363.784,00');
    expect(screen.getByTestId('lucro-resultante').getAttribute('data-negativo')).toBe('true');
    expect(texto('margem-resultante')).toBe('-32,83%');
    expect(texto('leitura-valor')).toBe('R$ 3.947.784,00');
    expect(screen.getByText(margem.prejuizo)).toBeTruthy();
  });

  it('no ponto de equilíbrio as duas leituras coincidem: lucro resultante = esperado, sem diferença', () => {
    render(<MargemResultante economia={economia(316_800_000, 316_800_000, 2_200)} premissas={LUCRO_NORMAL} />);

    expect(texto('leitura-rotulo')).toBe(margem.leitura.igual);
    expect(screen.queryByTestId('leitura-valor')).toBeNull();
  });

  it('sem base para a margem (VGV fora do que a conta representa), a linha some em vez de mostrar um número', () => {
    render(<MargemResultante economia={economia(404_421_600, 316_800_000, null)} premissas={LUCRO_NORMAL} />);
    expect(screen.queryByTestId('margem-resultante')).toBeNull();
  });

  it('o tom do cartão segue a leitura (acima = sobra, abaixo = déficit): a cor acompanha a palavra', () => {
    const { container, rerender } = render(
      <MargemResultante economia={economia(404_421_600, 316_800_000)} premissas={LUCRO_NORMAL} />,
    );
    expect(container.querySelector('section')?.getAttribute('data-leitura')).toBe('sobra');

    rerender(<MargemResultante economia={economia(100_000_000, 316_800_000)} premissas={LUCRO_NORMAL} />);
    expect(container.querySelector('section')?.getAttribute('data-leitura')).toBe('deficit');
  });
});
