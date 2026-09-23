import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PassoOnboarding } from '../components/onboarding/PassoOnboarding';
import { Botao } from '../components/ui/Botao';
import { PASSOS_ONBOARDING } from '../content/onboarding';
import { usePrimeiroAcesso } from '../hooks/usePrimeiroAcesso';
import estilos from './Onboarding.module.css';

interface EstadoNavegacaoOnboarding {
  modoConsulta?: boolean;
}

export function Onboarding() {
  const navegar = useNavigate();
  const localizacao = useLocation();
  const modoConsulta = Boolean((localizacao.state as EstadoNavegacaoOnboarding | null)?.modoConsulta);
  const { marcarComoVisto } = usePrimeiroAcesso();

  const [indicePasso, setIndicePasso] = useState(0);
  const refTitulo = useRef<HTMLHeadingElement>(null);
  const jaMontou = useRef(false);

  const totalPassos = PASSOS_ONBOARDING.length;
  const ehPrimeiroPasso = indicePasso === 0;
  const ehUltimoPasso = indicePasso === totalPassos - 1;

  // Na primeira renderização o foco fica onde o navegador o pôs; só as trocas de passo o movem.
  useEffect(() => {
    if (!jaMontou.current) {
      jaMontou.current = true;
      return;
    }
    refTitulo.current?.focus();
  }, [indicePasso]);

  function irParaFormulario() {
    marcarComoVisto();
    navegar('/terreno');
  }

  function fecharConsulta() {
    marcarComoVisto();
    // Sem histórico anterior (aba aberta direto no endereço), voltar sairia do app.
    if (localizacao.key === 'default') {
      navegar('/');
    } else {
      navegar(-1);
    }
  }

  function aoAvancar() {
    if (ehUltimoPasso) {
      if (modoConsulta) {
        fecharConsulta();
      } else {
        irParaFormulario();
      }
      return;
    }
    setIndicePasso((atual) => atual + 1);
  }

  function aoVoltar() {
    setIndicePasso((atual) => Math.max(0, atual - 1));
  }

  const rotuloAvancar = ehUltimoPasso ? (modoConsulta ? 'Fechar' : 'Começar análise') : 'Avançar';

  return (
    <div className={estilos.pagina}>
      <PassoOnboarding
        passo={PASSOS_ONBOARDING[indicePasso]}
        numero={indicePasso + 1}
        total={totalPassos}
        refTitulo={refTitulo}
      />

      <div className={estilos.acoes}>
        {/* No último passo a saída já é o botão principal; repetir aqui só duplicaria a ação. */}
        {!ehUltimoPasso &&
          (modoConsulta ? (
            <Botao variante="fantasma" onClick={fecharConsulta}>
              Fechar metodologia
            </Botao>
          ) : (
            <Botao variante="fantasma" onClick={irParaFormulario}>
              Pular
            </Botao>
          ))}

        <div className={estilos.navegacao}>
          {!ehPrimeiroPasso && (
            <Botao variante="contorno" onClick={aoVoltar}>
              Voltar
            </Botao>
          )}
          <Botao onClick={aoAvancar}>{rotuloAvancar}</Botao>
        </div>
      </div>
    </div>
  );
}
