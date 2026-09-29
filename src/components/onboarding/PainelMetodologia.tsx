import { useLayoutEffect, useRef } from 'react';
import { useMetodologia } from '../../hooks/useMetodologia';
import { usePrimeiroAcesso } from '../../hooks/usePrimeiroAcesso';
import { SequenciaMetodologia } from './SequenciaMetodologia';
import estilos from './PainelMetodologia.module.css';

// <dialog> nativo com showModal: o navegador já prende o foco, torna a página por baixo inerte e
// trata o Esc. Reimplementar isso à mão é onde painéis costumam falhar em acessibilidade.
export function PainelMetodologia() {
  const { aberta, fechar } = useMetodologia();
  const { marcarComoVisto } = usePrimeiroAcesso();
  const refDialogo = useRef<HTMLDialogElement>(null);
  const refQuemAbriu = useRef<HTMLElement | null>(null);

  // Efeito de layout, não passivo: roda antes do efeito da sequência que foca o título. Assim o
  // painel já está aberto quando o foco chega (num <dialog> fechado o foco não entra) e quem o
  // abriu é lido antes de o foco sair dali.
  useLayoutEffect(() => {
    const dialogo = refDialogo.current;
    if (!dialogo) return;

    if (aberta && !dialogo.open) {
      refQuemAbriu.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialogo.showModal();
    } else if (!aberta && dialogo.open) {
      dialogo.close();
    }
  }, [aberta]);

  // Único ponto de saída (botões, Esc): quem consultou a metodologia já a viu, e o foco volta a
  // quem abriu o painel para o teclado não recomeçar do topo da página.
  function aoFechar() {
    marcarComoVisto();
    fechar();
    refQuemAbriu.current?.focus();
    refQuemAbriu.current = null;
  }

  return (
    <dialog
      ref={refDialogo}
      className={estilos.painel}
      aria-label="Metodologia"
      onClose={aoFechar}
    >
      {/* Desmontar ao fechar faz cada abertura recomeçar do primeiro passo. */}
      {aberta && (
        <SequenciaMetodologia
          modo="consulta"
          aoSair={() => refDialogo.current?.close()}
          aoConcluir={() => refDialogo.current?.close()}
          focarTituloAoMontar
        />
      )}
    </dialog>
  );
}
