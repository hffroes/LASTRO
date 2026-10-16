import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { PainelAreas } from '../components/produto/PainelAreas';
import { PainelCub } from '../components/produto/PainelCub';
import { ProgramaEmpreendimento, type CampoNumericoProduto } from '../components/produto/ProgramaEmpreendimento';
import { SeletorPadrao } from '../components/produto/SeletorPadrao';
import { SeletorTipologia } from '../components/produto/SeletorTipologia';
import { Botao } from '../components/ui/Botao';
import { ResumoPendencias } from '../components/ui/ResumoPendencias';
import { TEXTOS_PRODUTO } from '../content/produto';
import { ehUnidadeUnica, pavimentosFixos } from '../data/tipologias';
import { useAnalise } from '../hooks/useAnalise';
import type { LeituraNumero } from '../utils/motor/formatacao';
import { calcularAreas, montarEntradaAreas } from '../utils/motor/areas';
import { calcularCubDaAnalise } from '../utils/motor/cub';
import { calcularPrecoM2VendidoCentavos, calcularProgramaEfetivo } from '../utils/motor/produto';
import {
  MENSAGENS_PRODUTO,
  ORDEM_CAMPOS_PRODUTO,
  validarEtapaProduto,
  type CampoEtapaProduto,
} from '../utils/validacao/produto';
import { etapaTerrenoValida } from '../utils/validacao/terreno';
import estilosEtapa from './EtapaAnalise.module.css';

export function Produto() {
  const navegar = useNavigate();
  const { analise, definirTipoProjeto, atualizarProduto } = useAnalise();
  const [camposTocados, setCamposTocados] = useState<ReadonlySet<CampoEtapaProduto>>(new Set());
  const [tentouAvancar, setTentouAvancar] = useState(false);
  // Texto que não pôde ser lido como número: o estado da análise guarda só números, então a
  // ilegibilidade fica aqui, para a mensagem dizer "formato" e não "campo vazio".
  const [ilegiveis, setIlegiveis] = useState<ReadonlySet<CampoNumericoProduto | 'taxaOcupacao'>>(new Set());
  const refResumo = useRef<HTMLDivElement>(null);

  // D-R11: só se chega aqui com a Etapa 1 válida. Pela URL direta (ou com o rascunho incompleto),
  // volta ao Terreno, onde estão as pendências; sem isso o produto seria classificado para um
  // terreno que o cálculo não tem como usar.
  if (!etapaTerrenoValida(analise)) {
    return <Navigate to="/terreno" replace />;
  }

  function registrarLeitura(campo: CampoNumericoProduto | 'taxaOcupacao', leitura: LeituraNumero): number | null {
    setIlegiveis((atuais) => {
      const ilegivel = leitura.tipo === 'invalido';
      if (atuais.has(campo) === ilegivel) return atuais;
      const proximos = new Set(atuais);
      if (ilegivel) proximos.add(campo);
      else proximos.delete(campo);
      return proximos;
    });
    return leitura.tipo === 'valido' ? leitura.unidadesMenores : null;
  }

  const { produto } = analise;
  const erros = validarEtapaProduto(analise);
  // Campo travado pela tipologia não está na tela: um texto ilegível deixado nele antes da trava
  // não pode virar pendência.
  if (ilegiveis.has('pavimentos') && pavimentosFixos(produto.tipologia) === null) {
    erros.pavimentos = MENSAGENS_PRODUTO.pavimentosNaoInteiro;
  }
  if (ilegiveis.has('unidadesPorPavimento') && !ehUnidadeUnica(produto.tipologia)) {
    erros.unidadesPorPavimento = MENSAGENS_PRODUTO.unidadesNaoInteiro;
  }
  if (ilegiveis.has('areaUnidade')) erros.areaUnidade = MENSAGENS_PRODUTO.areaUnidadeIlegivel;
  if (ilegiveis.has('precoUnidade')) erros.precoUnidade = MENSAGENS_PRODUTO.precoUnidadeIlegivel;
  if (ilegiveis.has('taxaOcupacao')) erros.taxaOcupacao = MENSAGENS_PRODUTO.taxaOcupacaoIlegivel;
  const pendencias = ORDEM_CAMPOS_PRODUTO.flatMap((campo) => {
    const mensagem = erros[campo];
    return mensagem ? [{ campo, mensagem }] : [];
  });

  // O erro só aparece depois que o usuário passou pelo campo ou tentou avançar, como no Terreno. As
  // escolhas em cartões não têm "sair do campo": só a tentativa de avançar as acusa.
  function erroVisivel(campo: CampoEtapaProduto): string | undefined {
    return tentouAvancar || camposTocados.has(campo) ? erros[campo] : undefined;
  }

  function marcarTocado(campo: CampoEtapaProduto) {
    setCamposTocados((atuais) => (atuais.has(campo) ? atuais : new Set(atuais).add(campo)));
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
    document.querySelector<HTMLElement>(`[data-alvo-campo="${campo}"], #campo-${campo}`)?.focus();
  }

  const { secoes } = TEXTOS_PRODUTO;
  // Derivados só com os insumos válidos: um número sobre insumo inválido seria um número sem base.
  const { totalUnidades } = calcularProgramaEfetivo(produto);
  const totalUnidadesExibido = erros.pavimentos || erros.unidadesPorPavimento ? null : totalUnidades;
  // O motor recusa por conta própria insumo inválido (zero, fração, taxa fora de 0–100%), então o
  // painel só mostra o que tem base; mesma entrada que o motor econômico usará na F13.
  const entradaAreas = montarEntradaAreas(analise.terreno.areaTotalM2, produto);
  const resultadoAreas = calcularAreas(entradaAreas);
  const resultadoCub = calcularCubDaAnalise(analise.terreno, produto);
  const precoM2VendidoCentavos =
    erros.areaUnidade || erros.precoUnidade
      ? null
      : calcularPrecoM2VendidoCentavos(produto.precoUnidadeCentavos, produto.areaUnidadeM2);

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

        <section className={estilosEtapa.secao} aria-labelledby="secao-programa">
          <h2 id="secao-programa" className={estilosEtapa.tituloSecao}>
            {secoes.programa.titulo}
          </h2>
          <p className={estilosEtapa.descricaoSecao}>{secoes.programa.descricao}</p>
          <ProgramaEmpreendimento
            produto={produto}
            totalUnidades={totalUnidadesExibido}
            precoM2VendidoCentavos={precoM2VendidoCentavos}
            erroVisivel={erroVisivel}
            aoMudar={atualizarProduto}
            aoLer={registrarLeitura}
            aoSair={marcarTocado}
          />
        </section>

        <section className={estilosEtapa.secao} aria-labelledby="secao-areas">
          <h2 id="secao-areas" className={estilosEtapa.tituloSecao}>
            {secoes.areas.titulo}
          </h2>
          <p className={estilosEtapa.descricaoSecao}>{secoes.areas.descricao}</p>
          <PainelAreas
            produto={produto}
            entrada={entradaAreas}
            resultado={resultadoAreas}
            erroVisivel={erroVisivel}
            aoMudar={atualizarProduto}
            aoLer={registrarLeitura}
            aoSair={marcarTocado}
          />
        </section>

        <section className={estilosEtapa.secao} aria-labelledby="secao-cub">
          <h2 id="secao-cub" className={estilosEtapa.tituloSecao}>
            {secoes.cub.titulo}
          </h2>
          <p className={estilosEtapa.descricaoSecao}>{secoes.cub.descricao}</p>
          <PainelCub resultado={resultadoCub} tipologia={produto.tipologia} pavimentos={entradaAreas.pavimentos} />
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
