import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Botao } from '../components/ui/Botao';
import { Campo, EntradaTexto } from '../components/ui/Campo';
import { CampoCalculado } from '../components/ui/CampoCalculado';
import { EntradaMoeda } from '../components/ui/CampoMoeda';
import { EntradaNumero } from '../components/ui/CampoNumero';
import { Combobox } from '../components/ui/Combobox';
import { GrupoOpcoes } from '../components/ui/GrupoOpcoes';
import { ResumoPendencias } from '../components/ui/ResumoPendencias';
import { OPCOES_OBJETIVO, TEXTOS_TERRENO } from '../content/terreno';
import { MUNICIPIOS_MG, buscarMunicipioPorCodigo } from '../data/municipios-mg';
import { useAnalise } from '../hooks/useAnalise';
import { useCep, type EnderecoConsultado, type EstadoCep } from '../hooks/useCep';
import { areaParaCentesimos, formatarMoeda, type LeituraNumero } from '../utils/motor/formatacao';
import { calcularPrecoUnitarioCentavos } from '../utils/motor/terreno';
import { formatarCep, somenteDigitos } from '../utils/texto';
import {
  DIGITOS_CEP,
  LIMITE_NOME_TERRENO,
  MENSAGENS_TERRENO,
  ORDEM_CAMPOS_TERRENO,
  UF_COBERTA,
  validarEtapaTerreno,
  type CampoEtapaTerreno,
} from '../utils/validacao/terreno';
import estilos from './Terreno.module.css';

const OPCOES_MUNICIPIOS = MUNICIPIOS_MG.map((municipio) => ({ valor: municipio.codigoIbge, rotulo: municipio.nome }));

type CampoNumerico = 'area' | 'preco';

type TomStatusCep = 'neutro' | 'aviso' | 'sucesso';

function statusDoCep(estado: EstadoCep, enderecoPeloCep: boolean): { texto: string; tom: TomStatusCep } | null {
  const { statusCep } = TEXTOS_TERRENO;
  switch (estado.situacao) {
    case 'consultando':
      return { texto: statusCep.consultando, tom: 'neutro' };
    case 'naoEncontrado':
      return { texto: statusCep.naoEncontrado, tom: 'aviso' };
    case 'indisponivel':
      return { texto: statusCep.indisponivel, tom: 'aviso' };
    default:
      // Depois de um F5 a consulta não se repete, mas a origem do endereço continua indicada.
      return enderecoPeloCep ? { texto: statusCep.preenchido, tom: 'sucesso' } : null;
  }
}

export function Terreno() {
  const navegar = useNavigate();
  const { analise, definirObjetivo, atualizarTerreno } = useAnalise();
  const [camposTocados, setCamposTocados] = useState<ReadonlySet<CampoEtapaTerreno>>(new Set());
  const [tentouAvancar, setTentouAvancar] = useState(false);
  // Texto que não pôde ser lido como número: o estado da análise guarda só números, então a
  // ilegibilidade fica aqui, para a mensagem dizer "formato" e não "campo vazio".
  const [ilegiveis, setIlegiveis] = useState<ReadonlySet<CampoNumerico>>(new Set());
  const refResumo = useRef<HTMLDivElement>(null);

  // CEP de fora de MG não preenche nada (D-R15): só registra a UF, e a validação bloqueia.
  // Em MG, preenche o que o CEP trouxe; campo que o CEP devolve vazio (CEP geral de cidade) não
  // apaga o que o usuário já tinha digitado.
  function aoEncontrarEndereco(endereco: EnderecoConsultado) {
    if (endereco.uf !== UF_COBERTA) {
      atualizarTerreno({ ufCep: endereco.uf, enderecoPeloCep: false });
      marcarTocado('cep');
      return;
    }
    const municipio = buscarMunicipioPorCodigo(endereco.codigoIbge);
    atualizarTerreno({
      ufCep: endereco.uf,
      ...(municipio ? { codigoMunicipioIbge: municipio.codigoIbge } : {}),
      ...(endereco.logradouro ? { logradouro: endereco.logradouro } : {}),
      ...(endereco.bairro ? { bairro: endereco.bairro } : {}),
      enderecoPeloCep: true,
    });
  }

  const { estado: estadoCep, consultar: consultarCep, limpar: limparCep } = useCep({
    aoEncontrar: aoEncontrarEndereco,
  });

  function aoMudarCep(valorDigitado: string) {
    const digitos = somenteDigitos(valorDigitado).slice(0, DIGITOS_CEP);
    if (digitos === analise.terreno.cep) return;
    // CEP mudou: a UF e a indicação de origem da consulta anterior não valem mais para ele.
    atualizarTerreno({ cep: digitos, ufCep: null, enderecoPeloCep: false });
    if (digitos.length === DIGITOS_CEP) {
      void consultarCep(digitos);
    } else {
      limparCep();
    }
  }

  function registrarLeitura(campo: CampoNumerico, leitura: LeituraNumero): number | null {
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

  const erros = validarEtapaTerreno(analise);
  if (ilegiveis.has('area')) erros.area = MENSAGENS_TERRENO.areaIlegivel;
  if (ilegiveis.has('preco')) erros.preco = MENSAGENS_TERRENO.precoIlegivel;
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
  const statusCep = statusDoCep(estadoCep, analise.terreno.enderecoPeloCep);
  const { areaTotalM2, precoPedidoCentavos } = analise.terreno;
  // Só com os dois insumos válidos: um preço por m² sobre área inválida seria um número sem base.
  const precoUnitarioCentavos =
    erros.area || erros.preco ? null : calcularPrecoUnitarioCentavos(precoPedidoCentavos, areaTotalM2);

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

          <Campo id="campo-cidade" rotulo={campos.cidade} erro={erroVisivel('cidade')} dica={campos.dicaCidade}>
            {(controle) => (
              <Combobox
                {...controle}
                opcoes={OPCOES_MUNICIPIOS}
                valor={analise.terreno.codigoMunicipioIbge}
                aoMudar={(codigo) => atualizarTerreno({ codigoMunicipioIbge: codigo })}
                aoSair={() => marcarTocado('cidade')}
                textoSemResultado={campos.cidadeSemResultado}
              />
            )}
          </Campo>

          <Campo
            id="campo-cep"
            rotulo={campos.cep}
            erro={erroVisivel('cep')}
            dica={
              <>
                {campos.dicaCep}{' '}
                {/* Região viva sempre presente: o leitor de tela anuncia cada mudança da consulta. */}
                <span role="status" className={estilos.statusCep} data-tom={statusCep?.tom}>
                  {statusCep?.texto}
                </span>
              </>
            }
          >
            {(controle) => (
              <EntradaTexto
                {...controle}
                name="cep"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                className={estilos.campoCurto}
                value={formatarCep(analise.terreno.cep)}
                onChange={(evento) => aoMudarCep(evento.target.value)}
                onBlur={() => marcarTocado('cep')}
              />
            )}
          </Campo>

          <Campo id="campo-logradouro" rotulo={campos.logradouro} erro={erroVisivel('logradouro')}>
            {(controle) => (
              <EntradaTexto
                {...controle}
                name="logradouro"
                autoComplete="address-line1"
                value={analise.terreno.logradouro}
                onChange={(evento) => atualizarTerreno({ logradouro: evento.target.value, enderecoPeloCep: false })}
                onBlur={() => marcarTocado('logradouro')}
              />
            )}
          </Campo>

          <Campo id="campo-bairro" rotulo={campos.bairro} erro={erroVisivel('bairro')}>
            {(controle) => (
              <EntradaTexto
                {...controle}
                name="bairro"
                autoComplete="address-level3"
                value={analise.terreno.bairro}
                onChange={(evento) => atualizarTerreno({ bairro: evento.target.value, enderecoPeloCep: false })}
                onBlur={() => marcarTocado('bairro')}
              />
            )}
          </Campo>
        </section>

        <section className={estilos.secao} aria-labelledby="secao-fisicos">
          <h2 id="secao-fisicos" className={estilos.tituloSecao}>
            {secoes.fisicos.titulo}
          </h2>
          <p className={estilos.descricaoSecao}>{secoes.fisicos.descricao}</p>

          <Campo id="campo-area" rotulo={campos.area} erro={erroVisivel('area')} dica={campos.dicaArea}>
            {(controle) => (
              <EntradaNumero
                {...controle}
                name="area"
                sufixo="m²"
                placeholder="0,00"
                obrigatorio
                valor={areaTotalM2 === null ? null : areaParaCentesimos(areaTotalM2)}
                aoMudar={(leitura) => {
                  const centesimos = registrarLeitura('area', leitura);
                  atualizarTerreno({ areaTotalM2: centesimos === null ? null : centesimos / 100 });
                }}
                aoSair={() => marcarTocado('area')}
              />
            )}
          </Campo>

          <Campo id="campo-preco" rotulo={campos.preco} erro={erroVisivel('preco')} dica={campos.dicaPreco}>
            {(controle) => (
              <EntradaMoeda
                {...controle}
                name="preco"
                obrigatorio
                valor={precoPedidoCentavos}
                aoMudar={(leitura) => atualizarTerreno({ precoPedidoCentavos: registrarLeitura('preco', leitura) })}
                aoSair={() => marcarTocado('preco')}
              />
            )}
          </Campo>

          <CampoCalculado
            id="campo-preco-unitario"
            rotulo={campos.precoUnitario}
            valor={precoUnitarioCentavos === null ? null : `${formatarMoeda(precoUnitarioCentavos)}/m²`}
            formula={campos.formulaPrecoUnitario}
            textoAguardando={campos.precoUnitarioAguardando}
          />
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
