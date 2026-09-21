import { useNavigate } from 'react-router-dom';
import { AcoesCartao, Cartao } from '../components/ui/Cartao';
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
    <Cartao>
      <p className={estilos.rotulo}>lastro — Terreno Viável</p>
      <h1 className={estilos.display}>Devo adquirir este terreno?</h1>
      <p className={estilos.subDisplay}>E vale a pena construir aqui?</p>
      <p className={estilos.corpo}>
        A LASTRO cruza os dados do terreno com o que você quer construir e devolve uma
        recomendação clara — comprar, não comprar ou comprar com ressalvas — com a
        composição de custos por trás do resultado. Leva poucos minutos.
      </p>
      <p className={estilos.aviso}>
        O resultado não fica salvo: para conservar a análise, exporte em PDF ou HTML antes de
        sair.
      </p>
      <AcoesCartao>
        <Botao onClick={aoComecarAnalise}>Começar análise</Botao>
      </AcoesCartao>
      <button type="button" className={estilos.linkSecundario} onClick={aoVerMetodologia}>
        Ver a metodologia
      </button>
    </Cartao>
  );
}
