import { Calculator } from 'lucide-react';
import estilos from './CampoCalculado.module.css';

interface PropriedadesCampoCalculado {
  id: string;
  rotulo: string;
  /** Já formatado; null enquanto faltam insumos. */
  valor: string | null;
  formula: string;
  textoAguardando: string;
}

// Somente leitura e com aparência de resultado, não de campo: fundo rebaixado, borda tracejada e
// sem cursor de edição. A fórmula fica à vista, para o número nunca parecer surgido do nada.
export function CampoCalculado({ id, rotulo, valor, formula, textoAguardando }: PropriedadesCampoCalculado) {
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
        <Calculator size={14} strokeWidth={1.75} aria-hidden="true" className={estilos.icone} />
        {valor === null ? textoAguardando : formula}
      </p>
    </div>
  );
}
