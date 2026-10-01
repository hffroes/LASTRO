// Convenção numérica do motor, herdada por todas as fases de cálculo:
// - dinheiro em centavos inteiros e área em centésimos de m² inteiros — nunca ponto flutuante
//   acumulando erro de arredondamento ao longo da conta;
// - a entrada do usuário é lida dígito a dígito para inteiros (nunca parseFloat), e o texto não é
//   guardado: o que segue para o estado e para o cálculo é sempre o número;
// - arredondamento meio para cima, feito em aritmética inteira exata.

export const CASAS_DECIMAIS = 2;
const FATOR_CASAS = 10 ** CASAS_DECIMAIS;

export type LeituraNumero =
  | { tipo: 'vazio' }
  | { tipo: 'invalido' }
  // Valor em unidades menores: centavos para dinheiro, centésimos de m² para área.
  | { tipo: 'valido'; unidadesMenores: number };

const MILHAR_PONTUADO = /^\d{1,3}(\.\d{3})+$/;
const DECIMAL_COM_PONTO = new RegExp(`^\\d+\\.\\d{1,${CASAS_DECIMAIS}}$`);

// Lê o que o usuário digitou ou colou, no formato brasileiro: "1.200.000,50", "1200000", "R$ 1.200,00",
// "1.250,5 m²". Sem vírgula, ponto seguido de três dígitos é milhar ("1.250" = mil duzentos e
// cinquenta); só um ponto seguido de uma ou duas casas é decimal, para aceitar valor colado de
// planilha em inglês ("1250.5"). Qualquer ambiguidade além disso é recusada, nunca adivinhada.
export function interpretarNumeroBr(texto: string): LeituraNumero {
  const limpo = texto.replace(/r\$|m²|m2|\s/gi, '');
  if (limpo === '') return { tipo: 'vazio' };

  const negativo = limpo.startsWith('-');
  const corpo = negativo ? limpo.slice(1) : limpo;
  if (!/^[\d.,]+$/.test(corpo) || !/\d/.test(corpo)) return { tipo: 'invalido' };

  let inteiro: string;
  let fracao: string;
  const partes = corpo.split(',');
  if (partes.length > 2) return { tipo: 'invalido' };
  if (partes.length === 2) {
    [inteiro, fracao] = partes as [string, string];
    if (inteiro.includes('.') && !MILHAR_PONTUADO.test(inteiro)) return { tipo: 'invalido' };
    if (fracao.includes('.')) return { tipo: 'invalido' };
  } else if (!corpo.includes('.')) {
    [inteiro, fracao] = [corpo, ''];
  } else if (MILHAR_PONTUADO.test(corpo)) {
    [inteiro, fracao] = [corpo, ''];
  } else if (DECIMAL_COM_PONTO.test(corpo)) {
    [inteiro, fracao] = corpo.split('.') as [string, string];
  } else {
    return { tipo: 'invalido' };
  }

  if (fracao.length > CASAS_DECIMAIS) return { tipo: 'invalido' };
  const digitosInteiros = inteiro.replace(/\./g, '') || '0';
  const unidades = Number(digitosInteiros) * FATOR_CASAS + Number(fracao.padEnd(CASAS_DECIMAIS, '0'));
  return { tipo: 'valido', unidadesMenores: negativo ? -unidades : unidades };
}

// Apresentação com duas casas fixas, como no guia ("1.240,00 m²", "R$ 4.812,00/m²"). Feita à mão,
// sem Intl: o resultado não depende do navegador e não traz espaço inseparável escondido.
export function formatarNumeroBr(unidadesMenores: number): string {
  const sinal = unidadesMenores < 0 ? '-' : '';
  const absoluto = Math.abs(Math.round(unidadesMenores));
  const inteiro = Math.floor(absoluto / FATOR_CASAS)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const fracao = (absoluto % FATOR_CASAS).toString().padStart(CASAS_DECIMAIS, '0');
  return `${sinal}${inteiro},${fracao}`;
}

export function formatarMoeda(centavos: number): string {
  return `R$ ${formatarNumeroBr(centavos)}`;
}

export function formatarArea(centesimosM2: number): string {
  return `${formatarNumeroBr(centesimosM2)} m²`;
}

// Área guardada em m² (como o PRD a nomeia), com no máximo duas casas: a conversão é exata.
export function areaParaCentesimos(areaM2: number): number {
  return Math.round(areaM2 * FATOR_CASAS);
}

// Divisão inteira com arredondamento meio para cima, exata: a divisão em ponto flutuante só dá o
// palpite, e o resto inteiro decide. Exige inteiros seguros, numerador ≥ 0 e denominador > 0.
export function dividirArredondando(numerador: number, denominador: number): number {
  if (!Number.isSafeInteger(numerador) || !Number.isSafeInteger(denominador) || numerador < 0 || denominador <= 0) {
    throw new RangeError(`Divisão fora da convenção do motor: ${numerador} ÷ ${denominador}.`);
  }
  let quociente = Math.floor(numerador / denominador);
  let resto = numerador - quociente * denominador;
  if (resto < 0) {
    quociente -= 1;
    resto += denominador;
  } else if (resto >= denominador) {
    quociente += 1;
    resto -= denominador;
  }
  return 2 * resto >= denominador ? quociente + 1 : quociente;
}
