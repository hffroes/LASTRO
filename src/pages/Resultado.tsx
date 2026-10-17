import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ComposicaoEconomica } from '../components/resultado/ComposicaoEconomica';
import { DetalheCub } from '../components/resultado/DetalheCub';
import { DetalheDespesas } from '../components/resultado/DetalheDespesas';
import { PotencialPreliminar } from '../components/resultado/PotencialPreliminar';
import { PrecoMaximo } from '../components/resultado/PrecoMaximo';
import { PremissasUsadas } from '../components/resultado/PremissasUsadas';
import { ResumoProjeto } from '../components/resultado/ResumoProjeto';
import { Alerta } from '../components/ui/Alerta';
import { Botao } from '../components/ui/Botao';
import { Expansivel } from '../components/ui/Expansivel';
import { TEXTOS_CUB } from '../content/produto';
import { TEXTOS_RESULTADO } from '../content/resultado';
import { useAnaliseRemota } from '../hooks/useAnaliseRemota';
import { useAnalise } from '../hooks/useAnalise';
import { etapaProdutoValida } from '../utils/validacao/produto';
import { etapaTerrenoValida } from '../utils/validacao/terreno';
import estilosEtapa from './EtapaAnalise.module.css';
import estilos from './Resultado.module.css';

// Resultado (F14): a primeira leitura, com o essencial na primeira dobra — o preço máximo recomendado e
// como o preço pedido se compara — e o que está por trás recolhido. Os números vêm do servidor, que valida
// e calcula. Nota, recomendação e alertas ainda não existem (F18 e F19), então nada aqui é veredito.
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
          <>
            <PrecoMaximo economia={estado.resposta.economia} />
            <PotencialPreliminar areas={estado.resposta.areas} programa={estado.resposta.programa} />
            <ResumoProjeto analise={analise} programa={estado.resposta.programa} />
            <section className={estilosEtapa.secao} aria-labelledby="secao-conta">
              <h2 id="secao-conta" className={estilosEtapa.tituloSecao}>
                {textos.secaoNumeros}
              </h2>
              <Expansivel titulo={textos.verDetalhes}>
                <ComposicaoEconomica economia={estado.resposta.economia} premissas={estado.resposta.premissas} />
                <DetalheDespesas economia={estado.resposta.economia} premissas={estado.resposta.premissas} />
                <DetalheCub economia={estado.resposta.economia} areas={estado.resposta.areas} premissas={estado.resposta.premissas} />
                <PremissasUsadas dados={estado.resposta} />
              </Expansivel>
            </section>
          </>
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
