import type { Ref } from 'react';
import type { PassoMetodologia } from '../../content/onboarding';
import estilos from './PassoOnboarding.module.css';

interface PropriedadesPassoOnboarding {
  passo: PassoMetodologia;
  numero: number;
  total: number;
  refTitulo?: Ref<HTMLHeadingElement>;
}

export function PassoOnboarding({ passo, numero, total, refTitulo }: PropriedadesPassoOnboarding) {
  return (
    <section className={estilos.passo} aria-labelledby={`passo-${passo.id}`}>
      <p className={estilos.sobretitulo}>
        Metodologia · {numero} de {total}
      </p>

      {/* tabIndex -1: o foco é levado ao título a cada troca de passo, para o leitor de tela anunciá-lo. */}
      <h1 id={`passo-${passo.id}`} ref={refTitulo} tabIndex={-1} className={estilos.titulo}>
        {passo.titulo}
      </h1>

      <p className={estilos.introducao}>{passo.introducao}</p>

      {passo.itens && (
        <dl className={estilos.itens}>
          {passo.itens.map((item) => (
            <div key={item.rotulo} className={estilos.item}>
              <dt className={estilos.rotulo}>{item.rotulo}</dt>
              <dd className={estilos.descricao}>{item.descricao}</dd>
            </div>
          ))}
        </dl>
      )}

      {passo.formula && (
        <ol className={estilos.formula} aria-label="Conta do resíduo do terreno">
          {passo.formula.map((linha) => (
            <li
              key={linha.rotulo}
              className={estilos.linhaFormula}
              data-resultado={linha.operador === '=' ? 'true' : undefined}
            >
              <span className={estilos.operador}>{linha.operador}</span>
              <span>{linha.rotulo}</span>
            </li>
          ))}
        </ol>
      )}

      {passo.nota && <p className={estilos.nota}>{passo.nota}</p>}
    </section>
  );
}
