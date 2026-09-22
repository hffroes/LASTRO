import { useNavigate } from 'react-router-dom';
import { AcoesCartao, Cartao } from '../components/ui/Cartao';
import { Botao } from '../components/ui/Botao';

export function NaoEncontrada() {
  const navegar = useNavigate();

  return (
    <Cartao>
      <h1>Página não encontrada</h1>
      <p>O endereço acessado não existe.</p>
      <AcoesCartao>
        <Botao onClick={() => navegar('/')}>Voltar para o início</Botao>
      </AcoesCartao>
    </Cartao>
  );
}
