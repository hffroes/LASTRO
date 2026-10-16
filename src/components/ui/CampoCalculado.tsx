import { Calculator, Lock } from 'lucide-react';
import estilos from './CampoCalculado.module.css';

interface PropriedadesCampoCalculado {
  id: string;
  rotulo: string;
  /** Já formatado; null enquanto faltam insumos. */
  valor: string | null;
  formula: string;
  textoAguardando: string;
  /** Valor fixado por regra (ex.: 1 unidade por casa), não calculado: troca o ícone pelo cadeado. */
  travado?: boolean;
}

// Somente leitura e com aparência de resultado, não de campo: fundo rebaixado, borda tracejada e
// sem cursor de edição. A fórmula (ou o motivo da trava) fica à vista, para o número nunca parecer
// surgido do nada.
export function CampoCalculado({ id, rotulo, valor, formula, textoAguardando, travado }: PropriedadesCampoCalculado) {
  const Icone = travado ? Lock : Calculator;
  const idRotulo = `${id}-rotulo`;
  const idFormula = `${id}-formula`;
  return (
    <div className={estilos.campo}>
      <span id={idRotulo} className={estilos.rotulo}>
        {rotulo}
      </span>
      {/* aria-live desligado: recalcula a cada tecla, e anunciar cada parcial seria ruído. */}
      <output
        id={id}
        aria-labelledby={idRotulo}
        aria-describedby={idFormula}
        aria-live="off"
        className={estilos.valor}
        data-vazio={valor === null ? 'true' : undefined}
      >
        {valor ?? '—'}
      </output>
      <p id={idFormula} className={estilos.formula}>
        <Icone size={14} strokeWidth={1.75} aria-hidden="true" className={estilos.icone} />
        {valor === null ? textoAguardando : formula}
      </p>
    </div>
  );
}
