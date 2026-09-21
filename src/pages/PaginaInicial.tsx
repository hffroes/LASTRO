import { useNavigate } from 'react-router-dom';
import { AcoesCartao, Cartao } from '../components/ui/Cartao';
import { Botao } from '../components/ui/Botao';

export function PaginaInicial() {
  const navegar = useNavigate();

  return (
    <Cartao>
      <h1>Página inicial</h1>
      <p>Conteúdo definitivo chega na F02.</p>
      <AcoesCartao>
        <Botao onClick={() => navegar('/onboarding')}>Começar</Botao>
      </AcoesCartao>
    </Cartao>
  );
}
