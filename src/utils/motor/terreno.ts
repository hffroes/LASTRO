import { areaParaCentesimos, dividirArredondando } from './formatacao';

// PRD 2.2: preço unitário do terreno = preço pedido ÷ área total, em R$/m² arredondado ao centavo.
// Centavos ÷ centésimos de m² dá centavos por centésimo; o ×100 volta para centavos por m².
// null quando os insumos não permitem a conta, para a tela nunca mostrar um número sem base.
export function calcularPrecoUnitarioCentavos(precoPedidoCentavos: number | null, areaTotalM2: number | null): number | null {
  if (precoPedidoCentavos === null || areaTotalM2 === null) return null;
  const areaCentesimos = areaParaCentesimos(areaTotalM2);
  if (!Number.isSafeInteger(precoPedidoCentavos) || precoPedidoCentavos <= 0 || areaCentesimos <= 0) return null;
  return dividirArredondando(precoPedidoCentavos * 100, areaCentesimos);
}
