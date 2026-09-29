import estilos from './ProgressoOnboarding.module.css';

interface PropriedadesProgressoOnboarding {
  passoAtual: number;
  total: number;
}

// Só visual: o sobretítulo "n de total" já anuncia o progresso ao leitor de tela, e repetir aqui
// faria cada troca de passo ser lida duas vezes.
export function ProgressoOnboarding({ passoAtual, total }: PropriedadesProgressoOnboarding) {
  return (
    <div className={estilos.progresso} aria-hidden="true" data-testid="progresso-onboarding">
      {Array.from({ length: total }, (_, indice) => (
        <span
          key={indice}
          className={estilos.segmento}
          data-estado={indice + 1 <= passoAtual ? 'percorrido' : 'futuro'}
        />
      ))}
    </div>
  );
}
