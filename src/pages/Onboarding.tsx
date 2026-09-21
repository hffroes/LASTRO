import { useNavigate } from 'react-router-dom';
import { AcoesCartao, Cartao } from '../components/ui/Cartao';
import { Botao } from '../components/ui/Botao';

export function Onboarding() {
  const navegar = useNavigate();

  return (
    <Cartao>
      <h1>Onboarding</h1>
      <p>Conteúdo definitivo chega na F03/F04.</p>
      <AcoesCartao>
        <Botao variante="secundaria" onClick={() => navegar('/')}>
          Voltar
        </Botao>
        <Botao onClick={() => navegar('/terreno')}>Avançar</Botao>
      </AcoesCartao>
    </Cartao>
  );
}
