import { useCallback, useEffect, useRef, useState } from 'react';
import { PASSOS_ONBOARDING } from '../../content/onboarding';
import { Botao } from '../ui/Botao';
import { PassoOnboarding } from './PassoOnboarding';
import estilos from './SequenciaMetodologia.module.css';

export type ModoMetodologia = 'primeiroAcesso' | 'consulta';

interface PropriedadesSequenciaMetodologia {
  modo: ModoMetodologia;
  /** "Pular" no primeiro acesso; "Fechar metodologia" na consulta. */
  aoSair: () => void;
  /** Botão principal do último passo. */
  aoConcluir: () => void;
  /** No painel o título ganha foco já na abertura, para o leitor de tela anunciar o conteúdo. */
  focarTituloAoMontar?: boolean;
}

// Setas não podem roubar o cursor de quem está digitando num campo.
function ehCampoEditavel(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false;
  return alvo.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName);
}

export function SequenciaMetodologia({
  modo,
  aoSair,
  aoConcluir,
  focarTituloAoMontar = false,
}: PropriedadesSequenciaMetodologia) {
  const [indicePasso, setIndicePasso] = useState(0);
  const refTitulo = useRef<HTMLHeadingElement>(null);
  const jaMontou = useRef(false);

  const totalPassos = PASSOS_ONBOARDING.length;
  const ehPrimeiroPasso = indicePasso === 0;
  const ehUltimoPasso = indicePasso === totalPassos - 1;
  const ehConsulta = modo === 'consulta';

  // Na página, a primeira renderização deixa o foco onde o navegador o pôs; só as trocas de passo
  // o movem. No painel, o foco precisa entrar nele já na abertura.
  useEffect(() => {
    if (!jaMontou.current) {
      jaMontou.current = true;
      if (!focarTituloAoMontar) return;
    }
    refTitulo.current?.focus();
  }, [indicePasso, focarTituloAoMontar]);

  const avancar = useCallback(() => {
    setIndicePasso((atual) => Math.min(totalPassos - 1, atual + 1));
  }, [totalPassos]);

  const voltar = useCallback(() => {
    setIndicePasso((atual) => Math.max(0, atual - 1));
  }, []);

  // No documento, e não no contêiner: no primeiro acesso o foco ainda não está dentro da sequência
  // e as setas precisam funcionar mesmo assim. A seta nunca conclui nem sai: isso é sempre clique.
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.defaultPrevented || evento.altKey || evento.ctrlKey || evento.metaKey || evento.shiftKey) {
        return;
      }
      if (ehCampoEditavel(evento.target)) return;

      if (evento.key === 'ArrowRight') {
        evento.preventDefault();
        avancar();
      } else if (evento.key === 'ArrowLeft') {
        evento.preventDefault();
        voltar();
      }
    }

    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [avancar, voltar]);

  function aoClicarPrincipal() {
    if (ehUltimoPasso) {
      aoConcluir();
    } else {
      avancar();
    }
  }

  const rotuloPrincipal = ehUltimoPasso ? (ehConsulta ? 'Fechar' : 'Começar análise') : 'Avançar';

  return (
    <div className={estilos.sequencia} data-modo={modo}>
      <div className={estilos.conteudo}>
        <PassoOnboarding
          passo={PASSOS_ONBOARDING[indicePasso]}
          numero={indicePasso + 1}
          total={totalPassos}
          refTitulo={refTitulo}
        />
      </div>

      <div className={estilos.acoes}>
        {/* No último passo a saída já é o botão principal; repetir aqui só duplicaria a ação. */}
        {!ehUltimoPasso && (
          <Botao variante="fantasma" onClick={aoSair}>
            {ehConsulta ? 'Fechar metodologia' : 'Pular'}
          </Botao>
        )}

        <div className={estilos.navegacao}>
          {!ehPrimeiroPasso && (
            <Botao variante="contorno" onClick={voltar} aria-keyshortcuts="ArrowLeft">
              Voltar
            </Botao>
          )}
          <Botao
            onClick={aoClicarPrincipal}
            aria-keyshortcuts={ehUltimoPasso ? undefined : 'ArrowRight'}
          >
            {rotuloPrincipal}
          </Botao>
        </div>
      </div>
    </div>
  );
}
