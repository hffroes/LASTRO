import logoClaro from '../design-system/assets/logo/lastro-horizontal-color.svg';
import logoEscuro from '../design-system/assets/logo/lastro-horizontal-on-dark.svg';
import { AlternadorTema } from './components/layout/AlternadorTema';
import { useTema } from './hooks/useTema';
import estilos from './App.module.css';

const AMOSTRAS_DE_COR = [
  { rotulo: 'ação', variavel: '--lastro-blue-500' },
  { rotulo: 'navy', variavel: '--lastro-navy' },
  { rotulo: 'sucesso', variavel: '--lastro-success' },
  { rotulo: 'atenção', variavel: '--lastro-warning' },
  { rotulo: 'perigo', variavel: '--lastro-danger' },
  { rotulo: 'IA (urbanística)', variavel: '--lastro-ai' },
];

const ESPACAMENTOS = [4, 8, 12, 16, 24, 40, 88];

export function App() {
  const { tema } = useTema();
  const logo = tema === 'escuro' ? logoEscuro : logoClaro;

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecalho}>
        <img src={logo} alt="lastro" className={estilos.logo} />
        <AlternadorTema />
      </header>

      <main className={estilos.conteudo}>
        <section>
          <p className={estilos.rotulo}>lastro — Terreno Viável</p>
          <h1 className={estilos.display}>Devo adquirir este terreno?</h1>
          <p className={estilos.corpo}>
            Fundação técnica do produto (F00): design system aplicado, tema claro/escuro e as três famílias
            tipográficas da marca.
          </p>
        </section>

        <section>
          <h2 className={estilos.h2}>Tipografia</h2>
          <p className={estilos.amostraDisplay}>Space Grotesk — títulos</p>
          <p className={estilos.amostraCorpo}>Manrope — corpo e interface</p>
          <p className={estilos.amostraMono}>IBM Plex Mono — números e IDs, ex.: R$ 1.234,56</p>
        </section>

        <section>
          <h2 className={estilos.h2}>Cor</h2>
          <ul className={estilos.listaCores}>
            {AMOSTRAS_DE_COR.map((cor) => (
              <li key={cor.variavel} className={estilos.amostraCor}>
                <span className={estilos.pastilha} style={{ background: `var(${cor.variavel})` }} />
                <span>{cor.rotulo}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className={estilos.h2}>Raio e sombra</h2>
          <div className={estilos.linhaEstrutura}>
            <div className={estilos.amostraRaioSm}>raio sm</div>
            <div className={estilos.amostraRaioMd}>raio md</div>
            <div className={estilos.amostraSombraSm}>sombra sm</div>
            <div className={estilos.amostraSombraLg}>sombra lg</div>
          </div>
        </section>

        <section>
          <h2 className={estilos.h2}>Espaçamento</h2>
          <div className={estilos.linhaEspacamento}>
            {ESPACAMENTOS.map((valor) => (
              <div
                key={valor}
                className={estilos.blocoEspacamento}
                style={{ width: `var(--lastro-space-${valor})` }}
              >
                <span>{valor}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
