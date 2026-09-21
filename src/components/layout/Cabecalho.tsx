import { Link } from 'react-router-dom';
import logoClaro from '../../../design-system/assets/logo/lastro-horizontal-color.svg';
import logoEscuro from '../../../design-system/assets/logo/lastro-horizontal-on-dark.svg';
import { useTema } from '../../hooks/useTema';
import { AlternadorTema } from './AlternadorTema';
import estilos from './Cabecalho.module.css';

export function Cabecalho() {
  const { tema } = useTema();
  const logo = tema === 'escuro' ? logoEscuro : logoClaro;

  return (
    <header className={estilos.cabecalho}>
      <Link to="/" className={estilos.link}>
        <img src={logo} alt="lastro" className={estilos.logo} />
      </Link>
      <AlternadorTema />
    </header>
  );
}
