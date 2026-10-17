// Contas do programa do empreendimento (PRD 2.2), puras: a tela mostra e o motor econômico (F13)
// usa as mesmas, para "total de unidades" nunca ter duas definições.
import { ehUnidadeUnica, pavimentosFixos } from '../../data/tipologias';
import type { DadosProduto } from '../../types/produto';
import { calcularPrecoUnitarioCentavos } from './terreno';

export interface ProgramaEfetivo {
  pavimentos: number | null;
  unidadesPorPavimento: number | null;
  // null enquanto os insumos não permitem a conta.
  totalUnidades: number | null;
}

function contagemValida(valor: number | null): valor is number {
  return valor !== null && Number.isSafeInteger(valor) && valor > 0;
}

// Aplica as travas da tipologia sobre o que o usuário informou. Casa e Galpões: 1 unidade total,
// mesmo com mais de um pavimento — a regra do PRD 2.2 prevalece sobre pavimentos × unidades.
export function calcularProgramaEfetivo(produto: DadosProduto): ProgramaEfetivo {
  const pavimentos = pavimentosFixos(produto.tipologia) ?? produto.pavimentos;
  if (ehUnidadeUnica(produto.tipologia)) {
    return { pavimentos, unidadesPorPavimento: 1, totalUnidades: 1 };
  }
  const { unidadesPorPavimento } = produto;
  const totalUnidades =
    contagemValida(pavimentos) && contagemValida(unidadesPorPavimento) ? pavimentos * unidadesPorPavimento : null;
  return { pavimentos, unidadesPorPavimento, totalUnidades };
}

// PRD 2.2: preço por m² vendido = preço da unidade ÷ área da unidade, arredondado ao centavo. É a
// mesma divisão do preço por m² do terreno, então reaproveita a mesma conta e o mesmo arredondamento.
// Só informativo: o MVP não consulta base de preços (PRD 3.4), cabe ao usuário comparar com o mercado.
export function calcularPrecoM2VendidoCentavos(precoUnidadeCentavos: number | null, areaUnidadeM2: number | null): number | null {
  return calcularPrecoUnitarioCentavos(precoUnidadeCentavos, areaUnidadeM2);
}
