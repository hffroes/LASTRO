import { AlertTriangle, RotateCcw } from 'lucide-react';
import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { PremissaAjustavel as IdPremissa } from '../../types/parametros';
import type { LeituraNumero } from '../../utils/motor/formatacao';
import { Botao } from '../ui/Botao';
import { Campo } from '../ui/Campo';
import { EntradaNumero } from '../ui/CampoNumero';
import { Etiqueta } from '../ui/Etiqueta';
import estilos from './PremissaAjustavel.module.css';

// A unidade de cada premissa decide o afixo do campo; o número é sempre lido em unidades menores
// (centavos ou pontos-base), como em todo o motor.
const AFIXOS: Record<IdPremissa, { prefixo?: string; sufixo?: string }> = {
  precoUnidade: { prefixo: 'R$' },
  lucroIncorporador: { sufixo: '%' },
  despesasGerais: { sufixo: '%' },
  taxaOcupacao: { sufixo: '%' },
  cubAjustado: { prefixo: 'R$', sufixo: '/m²' },
};

interface PropriedadesPremissaAjustavel {
  premissa: IdPremissa;
  rotulo: string;
  /** O que está no cenário: o ajuste, ou o original quando não há ajuste. */
  valor: number;
  /** "Informado na Etapa 2: R$ 900.000,00", "Padrão da lastro: 11,00%"… sempre à vista. */
  textoOriginal: string;
  ajustada: boolean;
  erro?: string;
  aviso?: string;
  /** Muda a cada "voltar ao original": remonta o campo com o texto do valor original. */
  versao: number;
  aoMudar: (leitura: LeituraNumero) => void;
  aoRestaurar: () => void;
}

// Uma premissa do cenário: o valor em uso, o original sempre à vista e, quando ajustada, a etiqueta e o
// caminho de volta. O estado "ajustada" vem em palavra e etiqueta, nunca só em cor.
export function PremissaAjustavel({
  premissa,
  rotulo,
  valor,
  textoOriginal,
  ajustada,
  erro,
  aviso,
  versao,
  aoMudar,
  aoRestaurar,
}: PropriedadesPremissaAjustavel) {
  const { cenarios: texto } = TEXTOS_RESULTADO;
  return (
    <div className={estilos.premissa} data-testid={`premissa-${premissa}`} data-ajustada={ajustada ? 'true' : undefined}>
      <Campo
        id={`premissa-${premissa}`}
        rotulo={rotulo}
        erro={erro}
        dica={
          <>
            {textoOriginal}
            {aviso && (
              <span className={estilos.aviso} data-testid={`aviso-${premissa}`}>
                <AlertTriangle size={14} strokeWidth={1.75} aria-hidden="true" className={estilos.iconeAviso} />
                {aviso}
              </span>
            )}
          </>
        }
      >
        {(controle) => (
          <EntradaNumero key={versao} {...controle} name={premissa} valor={valor} aoMudar={aoMudar} {...AFIXOS[premissa]} />
        )}
      </Campo>
      <div className={estilos.estado}>
        <Etiqueta tom={ajustada ? 'info' : 'neutro'} data-testid={`etiqueta-${premissa}`}>
          {ajustada ? texto.etiqueta.ajustada : texto.etiqueta.original}
        </Etiqueta>
        {ajustada && (
          <Botao variante="fantasma" className={estilos.restaurar} onClick={aoRestaurar} aria-label={texto.restaurarRotulo(rotulo)}>
            <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
            {texto.restaurar}
          </Botao>
        )}
      </div>
    </div>
  );
}
