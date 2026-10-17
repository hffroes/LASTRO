import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ComposicaoEconomica } from '../components/resultado/ComposicaoEconomica';
import { DetalheCub } from '../components/resultado/DetalheCub';
import { DetalheDespesas } from '../components/resultado/DetalheDespesas';
import { MargemResultante } from '../components/resultado/MargemResultante';
import { PainelPremissas } from '../components/resultado/PainelPremissas';
import { PotencialPreliminar } from '../components/resultado/PotencialPreliminar';
import { PrecoMaximo } from '../components/resultado/PrecoMaximo';
import { PremissasUsadas } from '../components/resultado/PremissasUsadas';
import { ResumoProjeto } from '../components/resultado/ResumoProjeto';
import { TogglePerspectiva } from '../components/resultado/TogglePerspectiva';
import { Alerta } from '../components/ui/Alerta';
import { Botao } from '../components/ui/Botao';
import { Expansivel } from '../components/ui/Expansivel';
import { TEXTOS_CUB } from '../content/produto';
import { TEXTOS_RESULTADO } from '../content/resultado';
import { useAnaliseRemota } from '../hooks/useAnaliseRemota';
import { useAnalise } from '../hooks/useAnalise';
import { usePremissas } from '../hooks/usePremissas';
import type { Analise, Perspectiva, RespostaAnalise } from '../types/analise';
import { perspectivaPadrao } from '../utils/motor/perspectiva';
import { etapaProdutoValida } from '../utils/validacao/produto';
import { etapaTerrenoValida } from '../utils/validacao/terreno';
import estilosEtapa from './EtapaAnalise.module.css';
import estilos from './Resultado.module.css';

// Resultado (F14): a primeira leitura, com o essencial na primeira dobra — o preço máximo recomendado e
// como o preço pedido se compara — e o que está por trás recolhido. Os números vêm do servidor, que valida
// e calcula. Nota, recomendação e alertas ainda não existem (F18 e F19), então nada aqui é veredito.
// F16: a mesma resposta lida pelas duas perspectivas. Alternar só troca o destaque e a tabela; os números
// são os da mesma resposta do servidor, sem novo cálculo.
// F17: o resultado calculado ganha o painel de cenários, e tudo abaixo do toggle passa a mostrar o cenário.
export function Resultado() {
  const navegar = useNavigate();
  const { analise } = useAnalise();
  const { estado, gerar } = useAnaliseRemota();
  const terrenoValido = etapaTerrenoValida(analise);
  const produtoValido = etapaProdutoValida(analise);
  const pronta = terrenoValido && produtoValido;
  // D-R6: abre na perspectiva do objetivo escolhido; daqui em diante é só a leitura, não o objetivo.
  const [perspectiva, setPerspectiva] = useState<Perspectiva>(() => perspectivaPadrao(analise.objetivo));

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
  const calculado = estado.situacao === 'sucesso' && estado.resposta.situacao === 'calculado';
  return (
    <div className={estilosEtapa.pagina}>
      <p className={estilosEtapa.sobretitulo}>{textos.sobretitulo}</p>
      <h1 className={estilosEtapa.titulo}>{textos.titulo}</h1>
      {/* Com o resultado na tela, o toggle ocupa o lugar da introdução: é a primeira coisa a ler. */}
      {calculado ? (
        <TogglePerspectiva valor={perspectiva} aoMudar={setPerspectiva} />
      ) : (
        <p className={estilosEtapa.introducao}>{textos.introducao}</p>
      )}

      <div className={estilosEtapa.formulario}>
        {(estado.situacao === 'ocioso' || estado.situacao === 'carregando') && (
          <section className={estilosEtapa.secao} aria-busy="true">
            <p role="status" className={estilos.carregando}>
              {textos.carregando}
            </p>
          </section>
        )}

        {estado.situacao === 'sucesso' && estado.resposta.situacao === 'calculado' && (
          <ResultadoCalculado analise={analise} original={estado.resposta} perspectiva={perspectiva} />
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

type Calculado = Extract<RespostaAnalise, { situacao: 'calculado' }>;

interface PropriedadesResultadoCalculado {
  analise: Analise;
  original: Calculado;
  perspectiva: Perspectiva;
}

// O resultado com o cenário "e se..." (F17). Os ajustes nascem vazios a cada vez que este bloco monta: uma
// análise nova (ou "tentar de novo") começa sempre das premissas originais, e nada do cenário anterior fica.
// Do cartão à tabela, os números são os do cenário; sem ajuste, o cenário é a própria resposta original.
function ResultadoCalculado({ analise, original, perspectiva }: PropriedadesResultadoCalculado) {
  const textos = TEXTOS_RESULTADO;
  const premissas = usePremissas({ analise, original });
  const { resposta } = premissas;
  const ajustadas = resposta.premissas.ajustes.quantidade;
  return (
    <>
      {perspectiva === 'terrenista' ? (
        <PrecoMaximo economia={resposta.economia} ajustadas={ajustadas} />
      ) : (
        <MargemResultante economia={resposta.economia} premissas={resposta.premissas} ajustadas={ajustadas} />
      )}
      <PotencialPreliminar areas={resposta.areas} programa={resposta.programa} />
      <ResumoProjeto analise={analise} programa={resposta.programa} />
      {/* Depois da leitura aprovada na F14 (destaque, entrega, projeto), antes da conta: o impacto de cada
          ajuste aparece no topo do próprio painel, então ele não precisa ficar colado ao cartão. */}
      <PainelPremissas estado={premissas} original={original} perspectiva={perspectiva} />
      <section className={estilosEtapa.secao} aria-labelledby="secao-conta">
        <h2 id="secao-conta" className={estilosEtapa.tituloSecao}>
          {textos.secaoNumeros}
        </h2>
        <Expansivel titulo={textos.verDetalhes}>
          <ComposicaoEconomica economia={resposta.economia} premissas={resposta.premissas} perspectiva={perspectiva} />
          <DetalheDespesas economia={resposta.economia} premissas={resposta.premissas} />
          <DetalheCub economia={resposta.economia} areas={resposta.areas} premissas={resposta.premissas} />
          <PremissasUsadas dados={resposta} />
        </Expansivel>
      </section>
    </>
  );
}
