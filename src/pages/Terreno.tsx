import { useNavigate } from 'react-router-dom';
import { AcoesCartao, Cartao } from '../components/ui/Cartao';
import { Botao } from '../components/ui/Botao';

export function Terreno() {
  const navegar = useNavigate();

  return (
    <Cartao>
      <h1>Terreno</h1>
      <p>Conteúdo definitivo chega nas fases F05–F08.</p>
      <AcoesCartao>
        <Botao variante="contorno" onClick={() => navegar('/onboarding')}>
          Voltar
        </Botao>
        <Botao onClick={() => navegar('/produto')}>Avançar</Botao>
      </AcoesCartao>
    </Cartao>
  );
}
