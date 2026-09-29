import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { normalizarParaBusca } from '../../utils/texto';
import type { PropriedadesAcessiveisControle } from './Campo';
import estilosCampo from './Campo.module.css';
import estilos from './Combobox.module.css';

export interface OpcaoCombobox<Valor extends string | number> {
  valor: Valor;
  rotulo: string;
}

interface PropriedadesCombobox<Valor extends string | number> extends PropriedadesAcessiveisControle {
  opcoes: readonly OpcaoCombobox<Valor>[];
  valor: Valor | null;
  aoMudar: (valor: Valor | null) => void;
  aoSair?: () => void;
  // Renderizar as 853 cidades de uma vez pesa na digitação; acima disso, pede para refinar.
  limiteResultados?: number;
  textoSemResultado?: string;
}

interface OpcaoIndexada<Valor extends string | number> extends OpcaoCombobox<Valor> {
  chave: string;
}

// Padrão "combobox com lista" do ARIA 1.2: o foco fica sempre no campo, e a opção ativa é
// indicada por aria-activedescendant. Só uma opção da lista vale: texto que não corresponde a
// nenhuma não vira seleção, e a validação acusa.
export function Combobox<Valor extends string | number>({
  id,
  'aria-describedby': descritoPor,
  'aria-invalid': invalido,
  opcoes,
  valor,
  aoMudar,
  aoSair,
  limiteResultados = 50,
  textoSemResultado = 'Nenhuma opção encontrada.',
}: PropriedadesCombobox<Valor>) {
  const idLista = useId();
  const idStatus = useId();
  const refLista = useRef<HTMLUListElement>(null);

  const indexadas = useMemo<OpcaoIndexada<Valor>[]>(
    () =>
      [...opcoes]
        .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
        .map((opcao) => ({ ...opcao, chave: normalizarParaBusca(opcao.rotulo) })),
    [opcoes],
  );
  const selecionada = indexadas.find((opcao) => opcao.valor === valor);

  const [texto, setTexto] = useState(selecionada?.rotulo ?? '');
  const [aberta, setAberta] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);

  // Seleção vinda de fora (ex.: o CEP escolheu a cidade) atualiza o texto. Seleção desfeita não
  // apaga o texto: o usuário precisa ver o que digitou para corrigir.
  useEffect(() => {
    if (selecionada) setTexto(selecionada.rotulo);
  }, [selecionada]);

  const consulta = normalizarParaBusca(texto);
  const filtradas = useMemo(() => {
    if (!consulta) return indexadas;
    // Quem começa com o que foi digitado vem antes de quem só contém: "sao" traz "São ..." primeiro.
    const comecam = indexadas.filter((opcao) => opcao.chave.startsWith(consulta));
    const contem = indexadas.filter((opcao) => !opcao.chave.startsWith(consulta) && opcao.chave.includes(consulta));
    return [...comecam, ...contem];
  }, [indexadas, consulta]);
  const visiveis = filtradas.slice(0, limiteResultados);

  const idOpcao = (indice: number) => `${idLista}-opcao-${indice}`;

  useEffect(() => {
    if (!aberta || indiceAtivo < 0) return;
    // scrollIntoView não existe no jsdom; no navegador mantém a opção ativa à vista.
    document.getElementById(idOpcao(indiceAtivo))?.scrollIntoView?.({ block: 'nearest' });
  });

  // Ao abrir perto da borda de baixo, a lista ficaria fora da tela: rola só o necessário para ela
  // aparecer inteira. Só na abertura, para não pular a página a cada tecla.
  useEffect(() => {
    if (aberta) refLista.current?.scrollIntoView?.({ block: 'nearest' });
  }, [aberta]);

  function abrir() {
    setAberta(true);
  }

  function fechar() {
    setAberta(false);
    setIndiceAtivo(-1);
  }

  function escolher(opcao: OpcaoIndexada<Valor>) {
    setTexto(opcao.rotulo);
    aoMudar(opcao.valor);
    fechar();
  }

  // Ao sair: texto vazio desfaz a seleção; texto igual (sem acento/maiúscula) a uma opção a
  // seleciona; qualquer outro texto fica na tela, sem seleção, para a validação apontar.
  function conciliar() {
    if (!consulta) {
      if (valor !== null) aoMudar(null);
      return;
    }
    const exata = indexadas.find((opcao) => opcao.chave === consulta);
    if (exata) {
      if (exata.valor !== valor) aoMudar(exata.valor);
      setTexto(exata.rotulo);
    } else if (valor !== null) {
      aoMudar(null);
    }
  }

  function aoTeclar(evento: KeyboardEvent<HTMLInputElement>) {
    switch (evento.key) {
      case 'ArrowDown':
        evento.preventDefault();
        if (!aberta) abrir();
        setIndiceAtivo((atual) => Math.min(visiveis.length - 1, atual + 1));
        break;
      case 'ArrowUp':
        evento.preventDefault();
        if (!aberta) abrir();
        setIndiceAtivo((atual) => (atual <= 0 ? visiveis.length - 1 : atual - 1));
        break;
      case 'Enter':
        // Com a lista aberta, Enter escolhe; não pode enviar o formulário junto.
        if (aberta && indiceAtivo >= 0 && visiveis[indiceAtivo]) {
          evento.preventDefault();
          escolher(visiveis[indiceAtivo]);
        }
        break;
      case 'Escape':
        if (aberta) {
          evento.preventDefault();
          fechar();
        } else if (selecionada) {
          setTexto(selecionada.rotulo);
        }
        break;
      default:
        break;
    }
  }

  const statusResultados = !aberta
    ? ''
    : filtradas.length === 0
      ? textoSemResultado
      : filtradas.length > visiveis.length
        ? `${filtradas.length} resultados; mostrando os ${visiveis.length} primeiros.`
        : `${filtradas.length} ${filtradas.length === 1 ? 'resultado' : 'resultados'}.`;

  return (
    <div className={estilos.combobox}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={aberta}
        aria-controls={idLista}
        aria-activedescendant={aberta && indiceAtivo >= 0 ? idOpcao(indiceAtivo) : undefined}
        aria-describedby={[descritoPor, idStatus].filter(Boolean).join(' ')}
        aria-invalid={invalido}
        aria-required="true"
        autoComplete="off"
        spellCheck={false}
        className={`${estilosCampo.entrada} ${estilos.entrada}`}
        value={texto}
        onChange={(evento) => {
          setTexto(evento.target.value);
          setIndiceAtivo(-1);
          abrir();
        }}
        onKeyDown={aoTeclar}
        onBlur={() => {
          fechar();
          conciliar();
          aoSair?.();
        }}
      />
      <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" className={estilos.icone} />

      <ul
        ref={refLista}
        id={idLista}
        role="listbox"
        aria-label="Sugestões"
        className={estilos.lista}
        hidden={!aberta || visiveis.length === 0}
      >
        {aberta &&
          visiveis.map((opcao, indice) => (
            <li
              key={String(opcao.valor)}
              id={idOpcao(indice)}
              role="option"
              aria-selected={opcao.valor === valor}
              className={estilos.opcao}
              data-ativa={indice === indiceAtivo ? 'true' : undefined}
              // mousedown, não click: o click viria depois do blur, que já teria fechado a lista.
              onMouseDown={(evento) => {
                evento.preventDefault();
                escolher(opcao);
              }}
            >
              <span>{opcao.rotulo}</span>
              {opcao.valor === valor && <Check size={16} strokeWidth={1.75} aria-hidden="true" />}
            </li>
          ))}
      </ul>

      {aberta && (filtradas.length === 0 || filtradas.length > visiveis.length) && (
        <p className={estilos.aviso} aria-hidden="true">
          {filtradas.length === 0 ? textoSemResultado : 'Continue digitando para refinar a busca.'}
        </p>
      )}

      {/* Anúncio da quantidade de resultados para leitor de tela, sem roubar o foco do campo. */}
      <span id={idStatus} role="status" aria-live="polite" className={estilos.somenteLeitor}>
        {statusResultados}
      </span>
    </div>
  );
}
