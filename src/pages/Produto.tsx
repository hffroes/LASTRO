import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { SeletorPadrao } from '../components/produto/SeletorPadrao';
import { SeletorTipologia } from '../components/produto/SeletorTipologia';
import { Botao } from '../components/ui/Botao';
import { ResumoPendencias } from '../components/ui/ResumoPendencias';
import { TEXTOS_PRODUTO } from '../content/produto';
import { useAnalise } from '../hooks/useAnalise';
import { ORDEM_CAMPOS_PRODUTO, validarEtapaProduto, type CampoEtapaProduto } from '../utils/validacao/produto';
import { etapaTerrenoValida } from '../utils/validacao/terreno';
import estilosEtapa from './EtapaAnalise.module.css';

export function Produto() {
  const navegar = useNavigate();
  const { analise, definirTipoProjeto, atualizarProduto } = useAnalise();
  const [tentouAvancar, setTentouAvancar] = useState(false);
  const refResumo = useRef<HTMLDivElement>(null);

  // D-R11: só se chega aqui com a Etapa 1 válida. Pela URL direta (ou com o rascunho incompleto),
  // volta ao Terreno, onde estão as pendências; sem isso o produto seria classificado para um
  // terreno que o cálculo não tem como usar.
  if (!etapaTerrenoValida(analise)) {
    return <Navigate to="/terreno" replace />;
  }

  const erros = validarEtapaProduto(analise);
  const pendencias = ORDEM_CAMPOS_PRODUTO.flatMap((campo) => {
    const mensagem = erros[campo];
    return mensagem ? [{ campo, mensagem }] : [];
  });

  // Todos os campos aqui são escolhas em cartões, sem "sair do campo": o erro só aparece depois da
  // tentativa de avançar, como formato e topografia no Terreno.
  function erroVisivel(campo: CampoEtapaProduto): string | undefined {
    return tentouAvancar ? erros[campo] : undefined;
  }

  function aoAvancar() {
    if (pendencias.length === 0) {
      navegar('/resultado');
      return;
    }
    setTentouAvancar(true);
    // Depois do render que mostra o resumo, para o foco ter onde pousar.
    requestAnimationFrame(() => refResumo.current?.focus());
  }

  function irParaCampo(campo: string) {
    document.querySelector<HTMLElement>(`[data-alvo-campo="${campo}"]`)?.focus();
  }

  const { secoes } = TEXTOS_PRODUTO;
  const { produto } = analise;

  return (
    <div className={estilosEtapa.pagina}>
      <p className={estilosEtapa.sobretitulo}>{TEXTOS_PRODUTO.sobretitulo}</p>
      <h1 className={estilosEtapa.titulo}>{TEXTOS_PRODUTO.titulo}</h1>
      <p className={estilosEtapa.introducao}>{TEXTOS_PRODUTO.introducao}</p>

      <form
        className={estilosEtapa.formulario}
        noValidate
        onSubmit={(evento) => {
          evento.preventDefault();
          aoAvancar();
        }}
      >
        <section className={estilosEtapa.secao} aria-labelledby="secao-classificacao">
          <h2 id="secao-classificacao" className={estilosEtapa.tituloSecao}>
            {secoes.classificacao.titulo}
          </h2>
          <p className={estilosEtapa.descricaoSecao}>{secoes.classificacao.descricao}</p>
          <SeletorTipologia
            tipoProjeto={produto.tipoProjeto}
            tipologia={produto.tipologia}
            aoMudarTipoProjeto={definirTipoProjeto}
            aoMudarTipologia={(tipologia) => atualizarProduto({ tipologia })}
            erroTipoProjeto={erroVisivel('tipoProjeto')}
            erroTipologia={erroVisivel('tipologia')}
          />
        </section>

        <section className={estilosEtapa.secao} aria-labelledby="secao-padrao">
          <h2 id="secao-padrao" className={estilosEtapa.tituloSecao}>
            {secoes.padrao.titulo}
          </h2>
          <p className={estilosEtapa.descricaoSecao}>{secoes.padrao.descricao}</p>
          <SeletorPadrao
            valor={produto.padrao}
            aoMudar={(padrao) => atualizarProduto({ padrao })}
            erro={erroVisivel('padrao')}
          />
        </section>

        {tentouAvancar && pendencias.length > 0 && (
          <ResumoPendencias ref={refResumo} pendencias={pendencias} aoIrParaCampo={irParaCampo} />
        )}

        <div className={estilosEtapa.acoes}>
          <Botao variante="contorno" onClick={() => navegar('/terreno')}>
            Voltar
          </Botao>
          <Botao type="submit">Avançar</Botao>
        </div>
      </form>
    </div>
  );
}
