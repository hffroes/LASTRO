import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Equal, SlidersHorizontal, TrendingDown, TrendingUp, X } from 'lucide-react';
import { OPCOES_PADRAO } from '../../content/produto';
import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { EstadoPremissas } from '../../hooks/usePremissas';
import { useTelaEstreita } from '../../hooks/useTelaEstreita';
import type { Perspectiva, RespostaAnalise } from '../../types/analise';
import { PREMISSAS_AJUSTAVEIS, type AjustesPremissas, type PremissaAjustavel as IdPremissa } from '../../types/parametros';
import { formatarMoeda, formatarMoedaComSinal, formatarNumeroBr } from '../../utils/motor/formatacao';
import { avisosDoCenario, type AvisoFaixa } from '../../utils/motor/premissas';
import { Alerta } from '../ui/Alerta';
import { Botao } from '../ui/Botao';
import { PremissaAjustavel } from './PremissaAjustavel';
import estilosEtapa from '../../pages/EtapaAnalise.module.css';
import estilos from './PainelPremissas.module.css';

type Calculado = Extract<RespostaAnalise, { situacao: 'calculado' }>;

const percentual = (pontosBase: number) => `${formatarNumeroBr(pontosBase)}%`;

function formatarPremissa(premissa: IdPremissa, valor: number): string {
  if (premissa === 'precoUnidade') return formatarMoeda(valor);
  if (premissa === 'cubAjustado') return `${formatarMoeda(valor)}/m²`;
  return percentual(valor);
}

// O número que responde à pergunta de cada leitura (F16): é nele que o impacto do ajuste aparece.
function valorDaLeitura(resposta: Calculado, perspectiva: Perspectiva): number {
  return perspectiva === 'terrenista' ? resposta.economia.resultadoTerrenoCentavos : resposta.economia.lucroResultanteCentavos;
}

// O que os números na tela já refletem, lido do snapshot da própria resposta (e não do que está sendo
// digitado): o aviso de custo de obra fala do cenário calculado.
function ajustesDaResposta(resposta: Calculado): AjustesPremissas {
  const ajustes: AjustesPremissas = {};
  for (const premissa of PREMISSAS_AJUSTAVEIS) {
    const { ajustada, usado } = resposta.premissas.ajustes.premissas[premissa];
    if (ajustada) ajustes[premissa] = usado;
  }
  return ajustes;
}

interface PropriedadesPainelPremissas {
  estado: EstadoPremissas;
  original: Calculado;
  perspectiva: Perspectiva;
}

// O impacto do cenário, no topo do painel: o número da leitura atual e quanto ele mudou contra a análise
// sem ajustes, no padrão "+6,2% vs. cenário base" do guia. Fica dentro do painel para o efeito de cada
// ajuste ser visível também na gaveta do mobile, que cobre o cartão da primeira dobra.
function ImpactoCenario({ estado, original, perspectiva, fixo }: PropriedadesPainelPremissas & { fixo?: boolean }) {
  const { impacto } = TEXTOS_RESULTADO.cenarios;
  const atual = valorDaLeitura(estado.resposta, perspectiva);
  const base = valorDaLeitura(original, perspectiva);
  const diferenca = atual - base;
  const leitura = diferenca > 0 ? 'acima' : diferenca < 0 ? 'abaixo' : 'igual';
  const Icone = { acima: TrendingUp, abaixo: TrendingDown, igual: Equal }[leitura];
  return (
    <div className={fixo ? `${estilos.impacto} ${estilos.impactoFixo}` : estilos.impacto} data-leitura={leitura} aria-busy={estado.recalculando ? 'true' : undefined}>
      <p className={estilos.impactoRotulo}>{impacto[perspectiva]}</p>
      <p className={estilos.impactoValor} data-testid="impacto-valor" data-negativo={atual < 0 ? 'true' : undefined}>
        {formatarMoedaComSinal(atual)}
      </p>
      <p className={estilos.impactoDiferenca} data-testid="impacto-diferenca">
        <Icone size={14} strokeWidth={1.75} aria-hidden="true" className={estilos.impactoIcone} />
        {leitura === 'igual' ? impacto.igual : impacto[leitura](formatarMoeda(Math.abs(diferenca)))}
      </p>
      {leitura !== 'igual' && <p className={estilos.impactoBase}>{impacto.semAjustes(formatarMoedaComSinal(base))}</p>}
    </div>
  );
}

function ConteudoPremissas({ estado, original, perspectiva, naGaveta }: PropriedadesPainelPremissas & { naGaveta?: boolean }) {
  const { cenarios: texto } = TEXTOS_RESULTADO;
  const padrao = OPCOES_PADRAO.find((opcao) => opcao.valor === original.premissas.lucroIncorporador.padrao)?.rotulo ?? '—';
  const avisos = avisosDoCenario(estado.ajustes, estado.resposta.economia.percentuaisDoVgvPontosBase);
  const avisoCustoObra = avisosDoCenario(ajustesDaResposta(estado.resposta), estado.resposta.economia.percentuaisDoVgvPontosBase).custoObra;
  const textoAviso = (aviso: AvisoFaixa | null) =>
    aviso ? texto.avisos.faixa(percentual(aviso.faixa.minimo), percentual(aviso.faixa.maximo)) : undefined;
  const avisoPorPremissa: Partial<Record<IdPremissa, string>> = {
    lucroIncorporador: textoAviso(avisos.lucroIncorporador),
    despesasGerais: textoAviso(avisos.despesasGerais),
  };
  const temErro = PREMISSAS_AJUSTAVEIS.some((premissa) => estado.erros[premissa]);
  const rotuloLeitura = texto.impacto[perspectiva];

  return (
    <>
      {/* Na gaveta, o impacto fica preso no topo enquanto os campos rolam por baixo dele. */}
      <ImpactoCenario estado={estado} original={original} perspectiva={perspectiva} fixo={naGaveta} />

      {/* Estado do recálculo. "Recalculando…" aparece; o número novo já está no quadro acima, então a frase
          de atualizado fica só para o leitor de tela, que a anuncia uma vez por recálculo, não a cada tecla. */}
      <p className={estado.recalculando ? estilos.status : estilos.apenasLeitor} role="status" data-testid="cenario-status">
        {estado.recalculando
          ? texto.recalculando
          : estado.quantidadeAjustes > 0 && !estado.erroCenario
            ? texto.atualizado(rotuloLeitura, formatarMoedaComSinal(valorDaLeitura(estado.resposta, perspectiva)))
            : ''}
      </p>

      {temErro && <p className={estilos.corrigir}>{texto.corrigir}</p>}
      {estado.erroCenario && (
        <Alerta tom="erro" titulo={texto.erroTitulo}>
          {estado.erroCenario} {texto.erroRodape}
        </Alerta>
      )}
      {avisoCustoObra && (
        <Alerta tom="atencao">
          {texto.avisos.custoObra(
            percentual(avisoCustoObra.valorPontosBase),
            percentual(avisoCustoObra.faixa.minimo),
            percentual(avisoCustoObra.faixa.maximo),
          )}
        </Alerta>
      )}

      <div className={estilos.premissas}>
        {PREMISSAS_AJUSTAVEIS.map((premissa) => {
          const valorBase = estado.originais[premissa];
          const textos = texto.premissas[premissa];
          return (
            <PremissaAjustavel
              key={premissa}
              premissa={premissa}
              rotulo={textos.rotulo}
              valor={estado.ajustes[premissa] ?? valorBase}
              textoOriginal={textos.original(formatarPremissa(premissa, valorBase), padrao)}
              ajustada={estado.ajustes[premissa] !== undefined}
              erro={estado.erros[premissa]}
              aviso={avisoPorPremissa[premissa]}
              versao={estado.versoes[premissa]}
              aoMudar={(leitura) => estado.definir(premissa, leitura)}
              aoRestaurar={() => estado.restaurar(premissa)}
            />
          );
        })}
      </div>

      <div className={estilos.rodape}>
        <p className={estilos.quantidade} data-testid="cenario-quantidade">
          {estado.quantidadeAjustes === 0 ? texto.nenhumAjuste : texto.quantidade(estado.quantidadeAjustes)}
        </p>
        {estado.quantidadeAjustes > 0 && (
          <Botao variante="contorno" onClick={estado.restaurarTudo}>
            {texto.restaurarTudo}
          </Botao>
        )}
      </div>
    </>
  );
}

// "Explorar cenários" (F17). Na tela larga, o painel fica na página, logo abaixo do cartão da primeira
// dobra. No celular, os cinco campos empurrariam todo o resultado para baixo: a seção mostra só o resumo e
// o painel abre numa gaveta, um <dialog> nativo (foco preso, Esc, página por baixo inerte), com o impacto
// no topo dela.
export function PainelPremissas(propriedades: PropriedadesPainelPremissas) {
  const { estado } = propriedades;
  const { cenarios: texto } = TEXTOS_RESULTADO;
  const estreita = useTelaEstreita();
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const refGaveta = useRef<HTMLDialogElement>(null);
  // Quem abriu a gaveta recebe o foco de volta ao fechar, como no painel da metodologia.
  const refQuemAbriu = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const gaveta = refGaveta.current;
    if (!gaveta) return;
    if (gavetaAberta && !gaveta.open) {
      refQuemAbriu.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      gaveta.showModal();
    }
    else if (!gavetaAberta && gaveta.open) gaveta.close();
  }, [gavetaAberta]);

  // A tela pode alargar com a gaveta aberta (girar o tablet): o painel volta para a página, e a gaveta não
  // reabre sozinha se a tela estreitar de novo.
  useEffect(() => {
    if (!estreita) setGavetaAberta(false);
  }, [estreita]);

  return (
    <section className={estilosEtapa.secao} aria-labelledby="titulo-cenarios" data-testid="painel-premissas">
      <h2 id="titulo-cenarios" className={estilosEtapa.tituloSecao}>
        {texto.titulo}
      </h2>
      <p className={estilosEtapa.descricaoSecao}>{texto.descricao}</p>

      {estreita ? (
        <>
          <div className={estilos.rodape}>
            <p className={estilos.quantidade}>
              {estado.quantidadeAjustes === 0 ? texto.nenhumAjuste : texto.quantidade(estado.quantidadeAjustes)}
            </p>
          </div>
          <div className={estilos.acoesResumo}>
            <Botao variante="secundaria" onClick={() => setGavetaAberta(true)} aria-haspopup="dialog">
              <SlidersHorizontal size={18} strokeWidth={1.75} aria-hidden="true" />
              {texto.abrir}
            </Botao>
            {estado.quantidadeAjustes > 0 && (
              <Botao variante="contorno" onClick={estado.restaurarTudo}>
                {texto.restaurarTudo}
              </Botao>
            )}
          </div>
          <dialog
            ref={refGaveta}
            className={estilos.gaveta}
            aria-labelledby="titulo-gaveta-cenarios"
            onClose={() => {
              setGavetaAberta(false);
              refQuemAbriu.current?.focus();
              refQuemAbriu.current = null;
            }}
          >
            {gavetaAberta && (
              <div className={estilos.gavetaConteudo}>
                <div className={estilos.gavetaTopo}>
                  <h2 id="titulo-gaveta-cenarios" className={estilos.gavetaTitulo}>
                    {texto.titulo}
                  </h2>
                  <Botao variante="fantasma" className={estilos.fechar} onClick={() => refGaveta.current?.close()} aria-label={texto.fechar}>
                    <X size={18} strokeWidth={1.75} aria-hidden="true" />
                  </Botao>
                </div>
                <ConteudoPremissas {...propriedades} naGaveta />
                <Botao variante="primaria" onClick={() => refGaveta.current?.close()}>
                  {texto.fechar}
                </Botao>
              </div>
            )}
          </dialog>
        </>
      ) : (
        <ConteudoPremissas {...propriedades} />
      )}
    </section>
  );
}
