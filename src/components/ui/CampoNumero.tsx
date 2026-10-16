import { useEffect, useRef, useState } from 'react';
import {
  formatarInteiroBr,
  formatarNumeroBr,
  interpretarInteiroBr,
  interpretarNumeroBr,
  type LeituraNumero,
} from '../../utils/motor/formatacao';
import type { PropriedadesAcessiveisControle } from './Campo';
import estilos from './CampoNumero.module.css';

export interface PropriedadesEntradaNumero extends PropriedadesAcessiveisControle {
  name: string;
  /** Em unidades menores (centavos, centésimos de m²), ou a própria contagem se `inteiro`; null = vazio. */
  valor: number | null;
  aoMudar: (leitura: LeituraNumero) => void;
  aoSair?: () => void;
  prefixo?: string;
  sufixo?: string;
  placeholder?: string;
  obrigatorio?: boolean;
  /** Contagem (pavimentos, unidades): sem casas decimais na leitura nem na apresentação. */
  inteiro?: boolean;
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
  inteiro,
  ...controle
}: PropriedadesEntradaNumero) {
  const ler = inteiro ? interpretarInteiroBr : interpretarNumeroBr;
  const formatar = inteiro ? formatarInteiroBr : formatarNumeroBr;
  const textoDoValor = (numero: number | null) => (numero === null ? '' : formatar(numero));
  const [texto, setTexto] = useState(() => textoDoValor(valor));
  const focado = useRef(false);

  // O valor pode mudar por fora (rascunho restaurado, "limpar análise" na F22). Sem foco, o texto
  // acompanha; com foco, nunca se reescreve o que o usuário está digitando.
  useEffect(() => {
    if (focado.current) return;
    setTexto((atual) => {
      const leitura = ler(atual);
      const valorDoTexto = leitura.tipo === 'valido' ? leitura.unidadesMenores : null;
      return valorDoTexto === valor ? atual : textoDoValor(valor);
    });
    // ler e formatar ficam de fora: só mudam com `inteiro`, que é fixo por campo.
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
        inputMode={inteiro ? 'numeric' : 'decimal'}
        autoComplete="off"
        aria-required={obrigatorio ? 'true' : undefined}
        className={estilos.entrada}
        value={texto}
        onFocus={() => {
          focado.current = true;
        }}
        onChange={(evento) => {
          setTexto(evento.target.value);
          aoMudar(ler(evento.target.value));
        }}
        onBlur={() => {
          focado.current = false;
          const leitura = ler(texto);
          if (leitura.tipo === 'valido') setTexto(formatar(leitura.unidadesMenores));
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
