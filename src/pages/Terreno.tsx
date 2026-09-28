import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Botao } from '../components/ui/Botao';
import { Campo, EntradaTexto } from '../components/ui/Campo';
import { GrupoOpcoes } from '../components/ui/GrupoOpcoes';
import { ResumoPendencias } from '../components/ui/ResumoPendencias';
import { OPCOES_OBJETIVO, TEXTOS_TERRENO } from '../content/terreno';
import { useAnalise } from '../hooks/useAnalise';
import {
  LIMITE_NOME_TERRENO,
  ORDEM_CAMPOS_TERRENO,
  validarEtapaTerreno,
  type CampoEtapaTerreno,
} from '../utils/validacao/terreno';
import estilos from './Terreno.module.css';

export function Terreno() {
  const navegar = useNavigate();
  const { analise, definirObjetivo, atualizarTerreno } = useAnalise();
  const [camposTocados, setCamposTocados] = useState<ReadonlySet<CampoEtapaTerreno>>(new Set());
  const [tentouAvancar, setTentouAvancar] = useState(false);
  const refResumo = useRef<HTMLDivElement>(null);

  const erros = validarEtapaTerreno(analise);
  const pendencias = ORDEM_CAMPOS_TERRENO.flatMap((campo) => {
    const mensagem = erros[campo];
    return mensagem ? [{ campo, mensagem }] : [];
  });

  // O erro só aparece depois que o usuário passou pelo campo ou tentou avançar: acusar um campo
  // vazio que ele ainda nem alcançou é ruído. Depois disso, acompanha a digitação.
  function erroVisivel(campo: CampoEtapaTerreno): string | undefined {
    return tentouAvancar || camposTocados.has(campo) ? erros[campo] : undefined;
  }

  function marcarTocado(campo: CampoEtapaTerreno) {
    setCamposTocados((atuais) => (atuais.has(campo) ? atuais : new Set(atuais).add(campo)));
  }

  function aoAvancar() {
    if (pendencias.length === 0) {
      navegar('/produto');
      return;
    }
    setTentouAvancar(true);
    // Depois do render que mostra o resumo, para o foco ter onde pousar.
    requestAnimationFrame(() => refResumo.current?.focus());
  }

  function irParaCampo(campo: string) {
    document.querySelector<HTMLElement>(`[data-alvo-campo="${campo}"], #campo-${campo}`)?.focus();
  }

  const { secoes, campos } = TEXTOS_TERRENO;
  const tamanhoNome = analise.terreno.nome.trim().length;

  return (
    <div className={estilos.pagina}>
      <p className={estilos.sobretitulo}>{TEXTOS_TERRENO.sobretitulo}</p>
      <h1 className={estilos.titulo}>{TEXTOS_TERRENO.titulo}</h1>
      <p className={estilos.introducao}>{TEXTOS_TERRENO.introducao}</p>

      <form
        className={estilos.formulario}
        noValidate
        onSubmit={(evento) => {
          // Enter num campo equivale a "Avançar", com a mesma trava.
          evento.preventDefault();
          aoAvancar();
        }}
      >
        <section className={estilos.secao} aria-labelledby="secao-objetivo">
          <h2 id="secao-objetivo" className={estilos.tituloSecao}>
            {secoes.objetivo.titulo}
          </h2>
          <p className={estilos.descricaoSecao}>{secoes.objetivo.descricao}</p>
          <GrupoOpcoes
            nome="objetivo"
            legenda={campos.objetivo}
            opcoes={OPCOES_OBJETIVO}
            valor={analise.objetivo}
            aoMudar={definirObjetivo}
            erro={erroVisivel('objetivo')}
          />
        </section>

        <section className={estilos.secao} aria-labelledby="secao-identificacao">
          <h2 id="secao-identificacao" className={estilos.tituloSecao}>
            {secoes.identificacao.titulo}
          </h2>
          <Campo
            id="campo-nome"
            rotulo={campos.nome}
            erro={erroVisivel('nome')}
            dica={
              <>
                {campos.dicaNome}{' '}
                <span className={estilos.contador}>
                  {tamanhoNome}/{LIMITE_NOME_TERRENO}
                </span>
              </>
            }
          >
            {(controle) => (
              <EntradaTexto
                {...controle}
                name="nome"
                autoComplete="off"
                aria-required="true"
                value={analise.terreno.nome}
                onChange={(evento) => atualizarTerreno({ nome: evento.target.value })}
                onBlur={() => marcarTocado('nome')}
              />
            )}
          </Campo>
          <p className={estilos.pendente}>{secoes.identificacao.pendente}</p>
        </section>

        <section className={estilos.secao} aria-labelledby="secao-fisicos">
          <h2 id="secao-fisicos" className={estilos.tituloSecao}>
            {secoes.fisicos.titulo}
          </h2>
          <p className={estilos.pendente}>{secoes.fisicos.pendente}</p>
        </section>

        <section className={estilos.secao} aria-labelledby="secao-lote">
          <h2 id="secao-lote" className={estilos.tituloSecao}>
            {secoes.lote.titulo}
          </h2>
          <p className={estilos.pendente}>{secoes.lote.pendente}</p>
        </section>

        {tentouAvancar && pendencias.length > 0 && (
          <ResumoPendencias ref={refResumo} pendencias={pendencias} aoIrParaCampo={irParaCampo} />
        )}

        <div className={estilos.acoes}>
          <Botao variante="contorno" onClick={() => navegar('/')}>
            Voltar
          </Botao>
          <Botao type="submit">Avançar</Botao>
        </div>
      </form>
    </div>
  );
}
