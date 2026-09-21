import { useNavigate } from 'react-router-dom';
import { AcoesCartao, Cartao } from '../components/ui/Cartao';
import { Botao } from '../components/ui/Botao';

export function Produto() {
  const navegar = useNavigate();

  return (
    <Cartao>
      <h1>Produto</h1>
      <p>Conteúdo definitivo chega nas fases F09–F12.</p>
      <AcoesCartao>
        <Botao variante="secundaria" onClick={() => navegar('/terreno')}>
          Voltar
        </Botao>
        <Botao onClick={() => navegar('/resultado')}>Avançar</Botao>
      </AcoesCartao>
    </Cartao>
  );
}
