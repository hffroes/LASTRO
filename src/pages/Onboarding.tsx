import { useLocation, useNavigate } from 'react-router-dom';
import { AcoesCartao, Cartao } from '../components/ui/Cartao';
import { Botao } from '../components/ui/Botao';

interface EstadoNavegacaoOnboarding {
  modoConsulta?: boolean;
}

export function Onboarding() {
  const navegar = useNavigate();
  const localizacao = useLocation();
  const modoConsulta = Boolean((localizacao.state as EstadoNavegacaoOnboarding | null)?.modoConsulta);

  return (
    <Cartao>
      <h1>Onboarding{modoConsulta ? ' (modo consulta)' : ''}</h1>
      <p>Conteúdo definitivo chega na F03/F04.</p>
      <AcoesCartao>
        <Botao variante="secundaria" onClick={() => navegar(-1)}>
          Voltar
        </Botao>
        {!modoConsulta && <Botao onClick={() => navegar('/terreno')}>Avançar</Botao>}
      </AcoesCartao>
    </Cartao>
  );
}
