import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import estilos from './GrupoOpcoes.module.css';
import estilosCampo from './Campo.module.css';

export interface OpcaoEscolha<Valor extends string> {
  valor: Valor;
  rotulo: string;
  descricao?: string;
}

interface PropriedadesGrupoOpcoes<Valor extends string> {
  nome: string;
  legenda: string;
  opcoes: readonly OpcaoEscolha<Valor>[];
  valor: Valor | null;
  aoMudar: (valor: Valor) => void;
  erro?: string;
  /** Desenho de cada opção, acima do rótulo. Decorativo: o texto da opção tem que bastar sozinho. */
  ilustracao?: (valor: Valor) => ReactNode;
}

// Escolha única em cartões, sobre radios nativos: setas, Tab e leitor de tela funcionam como o
// navegador já sabe fazer. Serve ao objetivo da análise e, depois, a formato, topografia e padrão.
export function GrupoOpcoes<Valor extends string>({
  nome,
  legenda,
  opcoes,
  valor,
  aoMudar,
  erro,
  ilustracao,
}: PropriedadesGrupoOpcoes<Valor>) {
  const idErro = erro ? `${nome}-erro` : undefined;

  return (
    <fieldset className={estilos.grupo} aria-describedby={idErro}>
      <legend className={estilosCampo.rotulo}>{legenda}</legend>
      <div className={estilos.opcoes}>
        {opcoes.map((opcao, indice) => {
          const id = `${nome}-${opcao.valor}`;
          return (
            <label key={opcao.valor} htmlFor={id} className={estilos.opcao} data-invalido={erro ? 'true' : undefined}>
              <input
                id={id}
                // O primeiro radio é o alvo do "ir para o campo" do resumo de pendências.
                data-alvo-campo={indice === 0 ? nome : undefined}
                type="radio"
                name={nome}
                value={opcao.valor}
                checked={valor === opcao.valor}
                onChange={() => aoMudar(opcao.valor)}
                aria-invalid={erro ? true : undefined}
                className={estilos.radio}
              />
              <span className={estilos.textos}>
                {ilustracao && (
                  <span className={estilos.ilustracao} aria-hidden="true">
                    {ilustracao(opcao.valor)}
                  </span>
                )}
                <span className={estilos.rotuloOpcao}>{opcao.rotulo}</span>
                {opcao.descricao && <span className={estilos.descricao}>{opcao.descricao}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {erro && (
        <p id={idErro} className={estilosCampo.erro}>
          <AlertCircle size={14} strokeWidth={1.75} aria-hidden="true" className={estilosCampo.iconeErro} />
          {erro}
        </p>
      )}
    </fieldset>
  );
}
