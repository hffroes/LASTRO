import { BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoClaro from '../../../design-system/assets/logo/lastro-horizontal-color.svg';
import logoEscuro from '../../../design-system/assets/logo/lastro-horizontal-on-dark.svg';
import { useMetodologia } from '../../hooks/useMetodologia';
import { useTema } from '../../hooks/useTema';
import { Botao } from '../ui/Botao';
import { AlternadorTema } from './AlternadorTema';
import estilos from './Cabecalho.module.css';

export function Cabecalho() {
  const { tema } = useTema();
  const { abrir: abrirMetodologia } = useMetodologia();
  const localizacao = useLocation();
  const logo = tema === 'escuro' ? logoEscuro : logoClaro;
  // No onboarding a metodologia já está na tela; o atalho abriria o mesmo conteúdo por cima dele.
  const mostrarMetodologia = localizacao.pathname !== '/onboarding';

  return (
    <header className={estilos.cabecalho}>
      <Link to="/" className={estilos.link}>
        <img src={logo} alt="lastro" className={estilos.logo} />
      </Link>
      <div className={estilos.acoes}>
        {mostrarMetodologia && (
          <Botao
            variante="fantasma"
            className={estilos.metodologia}
            onClick={abrirMetodologia}
            aria-haspopup="dialog"
            title="Metodologia"
          >
            <BookOpen size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className={estilos.rotuloMetodologia}>Metodologia</span>
          </Botao>
        )}
        <AlternadorTema />
      </div>
    </header>
  );
}
