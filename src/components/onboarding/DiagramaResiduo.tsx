import { DIAGRAMA_RESIDUO } from '../../content/onboarding';
import estilos from './DiagramaResiduo.module.css';

// Barras em HTML, não SVG: é o padrão do gráfico "Distribuição do custo" do guia, e a legenda
// quebra linha sozinha no mobile, em vez de o texto encolher junto com um viewBox.
export function DiagramaResiduo() {
  const { aviso, rotuloTodo, descricaoTodo, rotuloPartes, partes } = DIAGRAMA_RESIDUO;

  return (
    <figure className={estilos.diagrama}>
      <figcaption className={estilos.aviso}>{aviso}</figcaption>

      <div className={estilos.linha}>
        <p className={estilos.rotuloLinha}>
          <strong>{rotuloTodo}</strong> · {descricaoTodo}
        </p>
        <div className={estilos.barra} aria-hidden="true">
          <span className={estilos.segmento} data-parte="vgv" />
        </div>
      </div>

      <div className={estilos.linha}>
        <p className={estilos.rotuloLinha}>{rotuloPartes}</p>
        <div className={estilos.barra} aria-hidden="true">
          {partes.map((parte) => (
            <span key={parte.id} className={estilos.segmento} data-parte={parte.id} />
          ))}
        </div>
        {/* A legenda é o que o leitor de tela lê; as barras só repetem a ideia visualmente. */}
        <ul className={estilos.legenda}>
          {partes.map((parte) => (
            <li
              key={parte.id}
              className={estilos.itemLegenda}
              data-destaque={parte.id === 'terreno' ? 'true' : undefined}
            >
              <span className={estilos.amostra} data-parte={parte.id} aria-hidden="true" />
              {parte.rotulo}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
