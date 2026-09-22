import { Moon, Sun } from 'lucide-react';
import { useTema } from '../../hooks/useTema';
import estilos from './AlternadorTema.module.css';

export function AlternadorTema() {
  const { tema, alternar } = useTema();
  const ehEscuro = tema === 'escuro';
  const Icone = ehEscuro ? Sun : Moon;

  return (
    <button
      type="button"
      className={estilos.botao}
      onClick={alternar}
      aria-pressed={ehEscuro}
      aria-label={ehEscuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
      title={ehEscuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
    >
      <Icone size={18} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
