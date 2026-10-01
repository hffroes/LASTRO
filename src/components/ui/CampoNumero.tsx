import { useEffect, useRef, useState } from 'react';
import { formatarNumeroBr, interpretarNumeroBr, type LeituraNumero } from '../../utils/motor/formatacao';
import type { PropriedadesAcessiveisControle } from './Campo';
import estilos from './CampoNumero.module.css';

export interface PropriedadesEntradaNumero extends PropriedadesAcessiveisControle {
  name: string;
  /** Em unidades menores (centavos, centésimos de m²); null = vazio. */
  valor: number | null;
  aoMudar: (leitura: LeituraNumero) => void;
  aoSair?: () => void;
  prefixo?: string;
  sufixo?: string;
  placeholder?: string;
  obrigatorio?: boolean;
}

function textoDoValor(valor: number | null): string {
  return valor === null ? '' : formatarNumeroBr(valor);
}

// Sem máscara durante a digitação: o texto fica como o usuário escreveu (ou colou), e a leitura em
// pt-BR acontece a cada tecla. Só ao sair o texto é reescrito no formato do guia ("1.240,00").
// Máscara que reposiciona o cursor atrapalha a edição no meio do número e o colar.
export function EntradaNumero({
  valor,
  aoMudar,
  aoSair,
  prefixo,
  sufixo,
  obrigatorio,
  ...controle
}: PropriedadesEntradaNumero) {
  const [texto, setTexto] = useState(() => textoDoValor(valor));
  const focado = useRef(false);

  // O valor pode mudar por fora (rascunho restaurado, "limpar análise" na F22). Sem foco, o texto
  // acompanha; com foco, nunca se reescreve o que o usuário está digitando.
  useEffect(() => {
    if (focado.current) return;
    setTexto((atual) => {
      const leitura = interpretarNumeroBr(atual);
      const valorDoTexto = leitura.tipo === 'valido' ? leitura.unidadesMenores : null;
      return valorDoTexto === valor ? atual : textoDoValor(valor);
    });
  }, [valor]);

  return (
    <div className={estilos.grupo} data-invalido={controle['aria-invalid'] ? 'true' : undefined}>
      {prefixo && (
        <span className={`${estilos.afixo} ${estilos.prefixo}`} aria-hidden="true">
          {prefixo}
        </span>
      )}
      <input
        {...controle}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-required={obrigatorio ? 'true' : undefined}
        className={estilos.entrada}
        value={texto}
        onFocus={() => {
          focado.current = true;
        }}
        onChange={(evento) => {
          setTexto(evento.target.value);
          aoMudar(interpretarNumeroBr(evento.target.value));
        }}
        onBlur={() => {
          focado.current = false;
          const leitura = interpretarNumeroBr(texto);
          if (leitura.tipo === 'valido') setTexto(formatarNumeroBr(leitura.unidadesMenores));
          aoSair?.();
        }}
      />
      {sufixo && (
        <span className={`${estilos.afixo} ${estilos.sufixo}`} aria-hidden="true">
          {sufixo}
        </span>
      )}
    </div>
  );
}
