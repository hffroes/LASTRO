import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { Botao } from '../components/ui/Botao';
import { TEXTOS_CUB } from '../content/produto';
import { TEXTOS_RESULTADO } from '../content/resultado';
import { useAnaliseRemota } from '../hooks/useAnaliseRemota';
import { useAnalise } from '../hooks/useAnalise';
import type { RespostaAnalise } from '../types/analise';
import { formatarMoedaComSinal, formatarNumeroBr } from '../utils/motor/formatacao';
import { etapaProdutoValida } from '../utils/validacao/produto';
import { etapaTerrenoValida } from '../utils/validacao/terreno';
import estilosEtapa from './EtapaAnalise.module.css';
import estilos from './Resultado.module.css';

const percentual = (pontosBase: number) => `${formatarNumeroBr(pontosBase)}%`;
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

type Calculado = Extract<RespostaAnalise, { situacao: 'calculado' }>;

function NumerosDoResultado({ dados }: { dados: Calculado }) {
  const { linhas, provisorio, sim, nao } = TEXTOS_RESULTADO;
  const { economia, premissas } = dados;
  const itens = [
    { id: 'vgv', ...linhas.vgv, valor: formatarMoedaComSinal(economia.vgvCentavos) },
    { id: 'custo-obra', ...linhas.custoObra, valor: formatarMoedaComSinal(economia.custoObraCentavos) },
    {
      id: 'despesas-gerais',
      ...linhas.despesasGerais,
      rotulo: `${linhas.despesasGerais.rotulo} (${percentual(premissas.despesasGerais.pontosBase)})`,
      nota: premissas.despesasGerais.provisorio ? provisorio : null,
      valor: formatarMoedaComSinal(economia.despesasGeraisCentavos),
    },
    {
      id: 'lucro',
      ...linhas.lucro,
      rotulo: `${linhas.lucro.rotulo} (${percentual(premissas.lucroIncorporador.pontosBase)})`,
      nota: premissas.lucroIncorporador.provisorio ? provisorio : null,
      valor: formatarMoedaComSinal(economia.lucroIncorporadorCentavos),
    },
    {
      id: 'resultado-terreno',
      ...linhas.resultadoTerreno,
      destaque: true,
      negativo: economia.resultadoTerrenoCentavos < 0,
      valor: formatarMoedaComSinal(economia.resultadoTerrenoCentavos),
    },
    { id: 'preco-pedido', ...linhas.precoPedido, valor: formatarMoedaComSinal(economia.precoPedidoCentavos) },
    {
      id: 'resultado-liquido',
      ...linhas.resultadoLiquido,
      destaque: true,
      negativo: economia.resultadoLiquidoCentavos < 0,
      valor: formatarMoedaComSinal(economia.resultadoLiquidoCentavos),
    },
    { id: 'viavel', ...linhas.viavel, valor: economia.viavel ? sim : nao },
  ];
  return (
    <dl className={estilos.linhas}>
      {itens.map((item) => (
        <div key={item.id} className={estilos.linha} data-destaque={'destaque' in item && item.destaque ? 'true' : undefined}>
          <dt className={estilos.rotulo}>
            {item.rotulo}
            {'nota' in item && item.nota && <span className={estilos.provisorio}> · {item.nota}</span>}
          </dt>
          <dd className={estilos.valor} data-testid={`resultado-${item.id}`} data-negativo={'negativo' in item && item.negativo ? 'true' : undefined}>
            {item.valor}
          </dd>
          <dd className={estilos.formula}>{item.formula}</dd>
        </div>
      ))}
    </dl>
  );
}

function PremissasUsadas({ dados }: { dados: Calculado }) {
  const { premissas: texto, provisorio } = TEXTOS_RESULTADO;
  const { premissas } = dados;
  const { versaoBase } = premissas.cub;
  return (
    <details className={estilos.premissas}>
      <summary>{texto.titulo}</summary>
      <dl className={estilos.listaPremissas}>
        <div>
          <dt>{texto.baseCub}</dt>
          <dd>
            Sinduscon-MG, competência {MESES[versaoBase.competencia.mes - 1]}/{versaoBase.competencia.ano} · versão {versaoBase.id}
            {versaoBase.dataEmissao === null && ` · ${TEXTOS_CUB.emissaoNaoInformada}`}
          </dd>
        </div>
        <div>
          <dt>{texto.projetoCub}</dt>
          <dd>{premissas.cub.projeto}</dd>
        </div>
        <div>
          <dt>{texto.cubBase}</dt>
          <dd>{formatarMoedaComSinal(premissas.cub.cubBaseCentavos)}/m²</dd>
        </div>
        <div>
          <dt>{texto.somaAditivos}</dt>
          <dd>{percentual(premissas.cub.aditivos.somaPontosBase)}</dd>
        </div>
        <div>
          <dt>{texto.cubAjustado}</dt>
          <dd>{formatarMoedaComSinal(premissas.cub.cubAjustadoCentavos)}/m²</dd>
        </div>
        <div>
          <dt>{texto.taxaOcupacao}</dt>
          <dd>
            {percentual(premissas.taxaOcupacao.pontosBase)} ({premissas.taxaOcupacao.ajustadaPeloUsuario ? texto.taxaAjustada : texto.taxaPadrao}
            {premissas.taxaOcupacao.provisorio && !premissas.taxaOcupacao.ajustadaPeloUsuario ? `, ${provisorio}` : ''})
          </dd>
        </div>
        <div>
          <dt>{texto.lucro}</dt>
          <dd>
            {percentual(premissas.lucroIncorporador.pontosBase)} do VGV, padrão {premissas.lucroIncorporador.padrao}
            {premissas.lucroIncorporador.provisorio ? ` (${provisorio})` : ''}
          </dd>
        </div>
        <div>
          <dt>{texto.despesas}</dt>
          <dd>
            {percentual(premissas.despesasGerais.pontosBase)} do VGV{premissas.despesasGerais.provisorio ? ` (${provisorio})` : ''}.{' '}
            {texto.itemizacao.replace('{soma}', percentual(premissas.despesasGerais.somaItemizacaoPontosBase))}
          </dd>
        </div>
        <div>
          <dt>{texto.versaoMotor}</dt>
          <dd>{premissas.versaoMotor}</dd>
        </div>
      </dl>
    </details>
  );
}

// Resultado cru da F13: os números do método do resíduo vindos do servidor, que valida e calcula. A
// apresentação (veredito, hierarquia, composição) é da F14 em diante.
export function Resultado() {
  const navegar = useNavigate();
  const { analise } = useAnalise();
  const { estado, gerar } = useAnaliseRemota();
  const terrenoValido = etapaTerrenoValida(analise);
  const produtoValido = etapaProdutoValida(analise);
  const pronta = terrenoValido && produtoValido;

  // Uma vez ao abrir a página (e de novo só pelo "Tentar de novo"): o cálculo é do servidor, e a análise
  // é a que o usuário acabou de fechar na Etapa 2.
  useEffect(() => {
    if (pronta) void gerar(analise);
    // Só ao montar (as dependências ficam de fora de propósito): mudar a análise depois não deve
    // disparar outro cálculo por baixo da tela.
  }, []);

  // D-R11: só se chega aqui com as duas etapas válidas; pela URL direta, volta ao que falta.
  if (!terrenoValido) return <Navigate to="/terreno" replace />;
  if (!produtoValido) return <Navigate to="/produto" replace />;

  const textos = TEXTOS_RESULTADO;
  return (
    <div className={estilosEtapa.pagina}>
      <p className={estilosEtapa.sobretitulo}>{textos.sobretitulo}</p>
      <h1 className={estilosEtapa.titulo}>{textos.titulo}</h1>
      <p className={estilosEtapa.introducao}>{textos.introducao}</p>

      <div className={estilosEtapa.formulario}>
        {(estado.situacao === 'ocioso' || estado.situacao === 'carregando') && (
          <section className={estilosEtapa.secao} aria-busy="true">
            <p role="status" className={estilos.carregando}>
              {textos.carregando}
            </p>
          </section>
        )}

        {estado.situacao === 'sucesso' && estado.resposta.situacao === 'calculado' && (
          <section className={estilosEtapa.secao} aria-labelledby="secao-residuo">
            <h2 id="secao-residuo" className={estilosEtapa.tituloSecao}>
              {textos.secaoNumeros}
            </h2>
            <NumerosDoResultado dados={estado.resposta} />
            <PremissasUsadas dados={estado.resposta} />
          </section>
        )}

        {estado.situacao === 'sucesso' && estado.resposta.situacao === 'cubPendente' && (
          <Alerta tom="atencao" titulo={TEXTOS_CUB.tituloPendencia}>
            <p className={estilos.paragrafo}>
              {estado.resposta.motivo === 'padraoSemValorPublicado'
                ? TEXTOS_CUB.pendenciaPadraoSemValor(estado.resposta.projeto)
                : TEXTOS_CUB.pendenciaProjetoSemTabela(estado.resposta.projeto)}
            </p>
            <p className={estilos.paragrafo}>
              Sem o custo por m², a lastro não calcula o custo de obra nem o resultado do terreno. {TEXTOS_CUB.pendenciaRodape}
            </p>
          </Alerta>
        )}

        {estado.situacao === 'erroValidacao' && (
          <Alerta tom="erro" titulo={textos.erroValidacao.titulo}>
            <p className={estilos.paragrafo}>{textos.erroValidacao.introducao}</p>
            <ul className={estilos.listaErros}>
              {estado.erros.map((erro) => (
                <li key={`${erro.etapa}.${erro.campo}`}>{erro.mensagem}</li>
              ))}
            </ul>
          </Alerta>
        )}

        {estado.situacao === 'erroServidor' && (
          <Alerta tom="erro" titulo={textos.erroServidor.titulo}>
            <p className={estilos.paragrafo}>{estado.mensagem}</p>
          </Alerta>
        )}

        <div className={estilosEtapa.acoes}>
          <Botao
            variante="contorno"
            onClick={() =>
              navegar(estado.situacao === 'erroValidacao' && estado.erros.some((e) => e.etapa !== 'produto') ? '/terreno' : '/produto')
            }
          >
            {estado.situacao === 'erroValidacao' && estado.erros.some((e) => e.etapa !== 'produto')
              ? textos.erroValidacao.voltarTerreno
              : estado.situacao === 'sucesso' && estado.resposta.situacao === 'cubPendente'
                ? textos.cubPendente.voltar
                : 'Voltar'}
          </Botao>
          {estado.situacao === 'erroServidor' && (
            <Botao onClick={() => void gerar(analise)}>{textos.erroServidor.tentarDeNovo}</Botao>
          )}
        </div>
      </div>
    </div>
  );
}
