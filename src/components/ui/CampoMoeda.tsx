import { EntradaNumero, type PropriedadesEntradaNumero } from './CampoNumero';

// Dinheiro é sempre em centavos inteiros: o valor recebido e o devolvido em aoMudar.
export function EntradaMoeda(propriedades: Omit<PropriedadesEntradaNumero, 'prefixo' | 'sufixo'>) {
  return <EntradaNumero {...propriedades} prefixo="R$" placeholder={propriedades.placeholder ?? '0,00'} />;
}
