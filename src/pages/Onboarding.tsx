import { useNavigate } from 'react-router-dom';
import { SequenciaMetodologia } from '../components/onboarding/SequenciaMetodologia';
import { usePrimeiroAcesso } from '../hooks/usePrimeiroAcesso';
import estilos from './Onboarding.module.css';

// Esta página é só o primeiro acesso. A consulta posterior (cabeçalho, página inicial) abre o
// mesmo conteúdo no PainelMetodologia, sem sair da página em que o usuário está.
export function Onboarding() {
  const navegar = useNavigate();
  const { marcarComoVisto } = usePrimeiroAcesso();

  function irParaFormulario() {
    marcarComoVisto();
    navegar('/terreno');
  }

  return (
    <div className={estilos.pagina}>
      <SequenciaMetodologia modo="primeiroAcesso" aoSair={irParaFormulario} aoConcluir={irParaFormulario} />
    </div>
  );
}
