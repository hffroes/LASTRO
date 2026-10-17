import { useCallback, useEffect, useRef, useState } from 'react';
import type { Analise, ErroValidacao, RespostaAnalise } from '../types/analise';
import type { AjustesPremissas } from '../types/parametros';

// Espelha o contrato de POST /api/v1/analises (server/controllers/analisesController.ts): o servidor
// valida de novo e calcula; o que vale é a resposta dele.
export type EstadoAnaliseRemota =
  | { situacao: 'ocioso' }
  | { situacao: 'carregando' }
  // Inclui o cubPendente: pedido válido que o cálculo não conclui, e não um erro.
  | { situacao: 'sucesso'; resposta: RespostaAnalise }
  | { situacao: 'erroValidacao'; erros: ErroValidacao[] }
  | { situacao: 'erroServidor'; mensagem: string };

// Meta do PRD 6.2 é 500 ms no servidor; o dobro cobre rede lenta sem deixar a pessoa esperando para sempre.
export const TEMPO_LIMITE_ANALISE_MS = 10_000;

export const MENSAGEM_SEM_CONEXAO = 'Não foi possível falar com o servidor. Confira a conexão e tente de novo.';
export const MENSAGEM_ERRO_GENERICO = 'Não foi possível gerar a análise agora. Tente novamente em instantes.';

interface OpcoesUseAnaliseRemota {
  buscar?: typeof fetch;
}

function ehResposta(valor: unknown): valor is RespostaAnalise {
  return typeof valor === 'object' && valor !== null && typeof (valor as { situacao?: unknown }).situacao === 'string';
}

// Corpo de erro da API → erros por campo. Corpo que não segue o formato vira erro de servidor.
function lerErro(corpo: unknown): { mensagem: string; detalhes: ErroValidacao[] } | null {
  const erro = (corpo as { erro?: { mensagem?: unknown; detalhes?: unknown } } | null)?.erro;
  if (!erro || typeof erro.mensagem !== 'string') return null;
  const detalhes = Array.isArray(erro.detalhes) ? (erro.detalhes as ErroValidacao[]) : [];
  return { mensagem: erro.mensagem, detalhes };
}

export type DesfechoPedido = Extract<EstadoAnaliseRemota, { situacao: 'sucesso' | 'erroValidacao' | 'erroServidor' }>;

// Um pedido à API, do envio à leitura do corpo. Usado pelo cálculo da página e pelo recálculo dos ajustes
// (F17, usePremissas), para os dois lerem a resposta do mesmo jeito. Rede fora do ar e cancelamento
// chegam como exceção: quem chamou decide o que fazer com elas.
export async function pedirAnalise(
  buscar: typeof fetch,
  analise: Analise,
  ajustes: AjustesPremissas | undefined,
  signal: AbortSignal,
): Promise<DesfechoPedido> {
  const resposta = await buscar('/api/v1/analises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ajustes ? { ...analise, ajustes } : analise),
    signal,
  });
  const corpo: unknown = await resposta.json().catch(() => null);
  if (resposta.ok) {
    const dados = (corpo as { dados?: unknown } | null)?.dados;
    return ehResposta(dados) ? { situacao: 'sucesso', resposta: dados } : { situacao: 'erroServidor', mensagem: MENSAGEM_ERRO_GENERICO };
  }
  const erro = lerErro(corpo);
  if (resposta.status >= 400 && resposta.status < 500 && erro && erro.detalhes.length > 0) {
    return { situacao: 'erroValidacao', erros: erro.detalhes };
  }
  return { situacao: 'erroServidor', mensagem: erro?.mensagem ?? MENSAGEM_ERRO_GENERICO };
}

export function useAnaliseRemota({ buscar }: OpcoesUseAnaliseRemota = {}) {
  const [estado, setEstado] = useState<EstadoAnaliseRemota>({ situacao: 'ocioso' });
  const refControle = useRef<AbortController | null>(null);

  // Sair da página cancela o pedido em andamento: nenhuma resposta tardia atualiza tela desmontada.
  useEffect(() => () => refControle.current?.abort(), []);

  const gerar = useCallback(
    async (analise: Analise) => {
      refControle.current?.abort();
      const controle = new AbortController();
      refControle.current = controle;
      setEstado({ situacao: 'carregando' });

      const cronometro = setTimeout(() => controle.abort(), TEMPO_LIMITE_ANALISE_MS);
      try {
        const desfecho = await pedirAnalise(buscar ?? fetch, analise, undefined, controle.signal);
        if (refControle.current !== controle) return;
        setEstado(desfecho);
      } catch {
        // Cancelado por uma chamada mais nova (ou pela saída da página): quem cancelou cuida do estado.
        if (refControle.current !== controle) return;
        setEstado({ situacao: 'erroServidor', mensagem: MENSAGEM_SEM_CONEXAO });
      } finally {
        clearTimeout(cronometro);
      }
    },
    [buscar],
  );

  return { estado, gerar };
}
