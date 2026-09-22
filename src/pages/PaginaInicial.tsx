import { useNavigate } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { Botao } from '../components/ui/Botao';
import { usePrimeiroAcesso } from '../hooks/usePrimeiroAcesso';
import estilos from './PaginaInicial.module.css';

export function PaginaInicial() {
  const navegar = useNavigate();
  const { ehPrimeiroAcesso, marcarComoVisto } = usePrimeiroAcesso();

  function aoComecarAnalise() {
    if (ehPrimeiroAcesso) {
      marcarComoVisto();
      navegar('/onboarding');
    } else {
      navegar('/terreno');
    }
  }

  function aoVerMetodologia() {
    navegar('/onboarding', { state: { modoConsulta: true } });
  }

  return (
    <div className={estilos.pagina}>
      <p className={estilos.sobretitulo}>Terreno viável</p>

      <h1 className={estilos.display}>Devo adquirir este terreno?</h1>
      <p className={estilos.subtitulo}>E construir aqui vai dar dinheiro?</p>

      <p className={estilos.leitura}>
        Duas perguntas, uma conta só. A lastro calcula quanto o terreno pode valer para o que
        você pretende construir, compara com o preço pedido e devolve uma recomendação clara:
        comprar, não comprar ou comprar com ressalvas.
      </p>

      <p className={estilos.metadados}>
        Poucos minutos · sem cadastro · uma análise por acesso
      </p>

      <p className={estilos.preparo}>
        Tenha à mão a área e o preço pedido do terreno, e o que pretende construir: tipologia,
        pavimentos, unidades e preço de venda.
      </p>

      <div className={estilos.acoes}>
        <Botao tamanho="grande" onClick={aoComecarAnalise}>
          Começar análise
        </Botao>
        <Botao variante="fantasma" tamanho="grande" onClick={aoVerMetodologia}>
          Ver a metodologia
        </Botao>
      </div>

      <div className={estilos.aviso}>
        <Alerta tom="atencao" titulo="O resultado não fica salvo">
          Exportar em PDF ou HTML é a única forma de conservar a análise.
        </Alerta>
      </div>
    </div>
  );
}
