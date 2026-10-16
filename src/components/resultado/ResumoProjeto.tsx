import { OPCOES_PADRAO, OPCOES_TIPOLOGIA } from '../../content/produto';
import { OPCOES_OBJETIVO } from '../../content/terreno';
import { TEXTOS_RESULTADO } from '../../content/resultado';
import { buscarMunicipioPorCodigo } from '../../data/municipios-mg';
import type { Analise, ProgramaDto } from '../../types/analise';
import { areaParaCentesimos, formatarArea, formatarInteiroBr, formatarMoeda } from '../../utils/motor/formatacao';
import estilos from './ResumoProjeto.module.css';

interface PropriedadesResumoProjeto {
  analise: Analise;
  /** Programa efetivo vindo do servidor (com as travas da tipologia): é o que valeu na conta. */
  programa: ProgramaDto;
}

// "Projeto analisado" (PRD 2.5): o que foi informado, em poucas linhas, para quem lê o resultado saber
// de qual cenário ele fala. Mostra o que o usuário digitou; o que o cálculo usou está no potencial.
export function ResumoProjeto({ analise, programa }: PropriedadesResumoProjeto) {
  const { projeto } = TEXTOS_RESULTADO;
  const { terreno, produto } = analise;
  const municipio = buscarMunicipioPorCodigo(terreno.codigoMunicipioIbge)?.nome ?? '—';
  const tipologia = produto.tipologia ? OPCOES_TIPOLOGIA[produto.tipologia].rotulo : '—';
  const padrao = OPCOES_PADRAO.find((opcao) => opcao.valor === produto.padrao)?.rotulo ?? '—';
  const objetivo = OPCOES_OBJETIVO.find((opcao) => opcao.valor === analise.objetivo)?.rotulo ?? '—';
  const pavimentos = `${formatarInteiroBr(programa.pavimentos)} pavimento${programa.pavimentos === 1 ? '' : 's'}`;
  const unidades = `${formatarInteiroBr(programa.totalUnidades)} unidade${programa.totalUnidades === 1 ? '' : 's'}`;

  const linhas = [
    { id: 'objetivo', rotulo: projeto.objetivo, valor: objetivo },
    { id: 'terreno', rotulo: projeto.terreno, valor: terreno.nome.trim() },
    { id: 'cidade', rotulo: projeto.cidade, valor: municipio },
    {
      id: 'area-terreno',
      rotulo: projeto.areaTerreno,
      valor: terreno.areaTotalM2 === null ? '—' : formatarArea(areaParaCentesimos(terreno.areaTotalM2)),
    },
    { id: 'tipologia', rotulo: projeto.tipologia, valor: `${tipologia}, ${pavimentos}` },
    { id: 'padrao', rotulo: projeto.padrao, valor: padrao },
    { id: 'unidades', rotulo: projeto.unidades, valor: unidades },
    {
      id: 'area-unidade',
      rotulo: projeto.areaUnidade,
      valor: produto.areaUnidadeM2 === null ? '—' : formatarArea(areaParaCentesimos(produto.areaUnidadeM2)),
    },
    {
      id: 'preco-unidade',
      rotulo: projeto.precoUnidade,
      valor: produto.precoUnidadeCentavos === null ? '—' : formatarMoeda(produto.precoUnidadeCentavos),
    },
  ];
  return (
    <section className={estilos.secao} aria-labelledby="titulo-projeto">
      <h2 id="titulo-projeto" className={estilos.titulo}>
        {projeto.titulo}
      </h2>
      <dl className={estilos.lista}>
        {linhas.map((linha) => (
          <div key={linha.id} className={estilos.linha}>
            <dt className={estilos.rotulo}>{linha.rotulo}</dt>
            <dd className={estilos.valor} data-testid={`projeto-${linha.id}`}>
              {linha.valor}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
