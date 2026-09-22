import { useNavigate } from 'react-router-dom';
import { AcoesCartao, Cartao } from '../components/ui/Cartao';
import { Botao } from '../components/ui/Botao';

export function Resultado() {
  const navegar = useNavigate();

  return (
    <Cartao>
      <h1>Resultado</h1>
      <p>Conteúdo definitivo chega nas fases F13–F21.</p>
      <AcoesCartao>
        <Botao variante="contorno" onClick={() => navegar('/produto')}>
          Voltar
        </Botao>
      </AcoesCartao>
    </Cartao>
  );
}
