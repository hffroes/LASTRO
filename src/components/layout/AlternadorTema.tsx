import { useTema } from '../../hooks/useTema';
import estilos from './AlternadorTema.module.css';

export function AlternadorTema() {
  const { tema, alternar } = useTema();
  const ehEscuro = tema === 'escuro';
  const proximoTema = ehEscuro ? 'claro' : 'escuro';

  return (
    <button type="button" className={estilos.botao} onClick={alternar} aria-pressed={ehEscuro}>
      Tema: {tema} — mudar para {proximoTema}
    </button>
  );
}
