import { useCallback, useEffect, useRef, useState } from 'react';

// Espelha o contrato de GET /api/v1/cep/:cep (server/controllers/cepController.ts).
export interface EnderecoConsultado {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  codigoIbge: number | null;
}

export type EstadoCep =
  | { situacao: 'ocioso' }
  | { situacao: 'consultando' }
  | { situacao: 'encontrado'; endereco: EnderecoConsultado }
  | { situacao: 'naoEncontrado' }
  | { situacao: 'indisponivel' };

// Um pouco acima do tempo limite do servidor (4s): quem responde "demorou" é ele, com a mensagem
// certa; este só cobre o caso de o próprio servidor não responder.
export const TEMPO_LIMITE_CEP_MS = 6000;

interface OpcoesUseCep {
  aoEncontrar?: (endereco: EnderecoConsultado) => void;
  buscar?: typeof fetch;
}

function ehEndereco(valor: unknown): valor is EnderecoConsultado {
  if (!valor || typeof valor !== 'object') return false;
  const e = valor as Record<string, unknown>;
  return ['cep', 'logradouro', 'bairro', 'cidade', 'uf'].every((chave) => typeof e[chave] === 'string');
}

// A consulta é disparada pela página quando o CEP chega a 8 dígitos, e não por efeito sobre o
// valor: assim, recarregar a página com um CEP já preenchido não consulta de novo nem sobrescreve
// o que o usuário corrigiu à mão. Uma consulta nova cancela a anterior, e só a última vale.
export function useCep({ aoEncontrar, buscar }: OpcoesUseCep = {}) {
  const [estado, setEstado] = useState<EstadoCep>({ situacao: 'ocioso' });
  const refControle = useRef<AbortController | null>(null);
  const refAoEncontrar = useRef(aoEncontrar);
  refAoEncontrar.current = aoEncontrar;

  const limpar = useCallback(() => {
    refControle.current?.abort();
    refControle.current = null;
    setEstado({ situacao: 'ocioso' });
  }, []);

  const consultar = useCallback(
    async (cepDigitos: string) => {
      refControle.current?.abort();
      const controle = new AbortController();
      refControle.current = controle;
      setEstado({ situacao: 'consultando' });

      const cronometro = setTimeout(() => controle.abort(), TEMPO_LIMITE_CEP_MS);
      try {
        const resposta = await (buscar ?? fetch)(`/api/v1/cep/${cepDigitos}`, { signal: controle.signal });
        if (refControle.current !== controle) return;

        if (resposta.status === 404) {
          setEstado({ situacao: 'naoEncontrado' });
          return;
        }
        const corpo: unknown = resposta.ok ? await resposta.json() : null;
        const dados = (corpo as { dados?: unknown } | null)?.dados;
        if (refControle.current !== controle) return;
        if (!ehEndereco(dados)) {
          setEstado({ situacao: 'indisponivel' });
          return;
        }
        setEstado({ situacao: 'encontrado', endereco: dados });
        refAoEncontrar.current?.(dados);
      } catch {
        // Rede fora, servidor parado ou tempo esgotado: tudo vira "indisponível" para o usuário,
        // que segue preenchendo à mão. Consulta cancelada por outra mais nova é ignorada.
        if (refControle.current === controle) setEstado({ situacao: 'indisponivel' });
      } finally {
        clearTimeout(cronometro);
      }
    },
    [buscar],
  );

  useEffect(() => () => refControle.current?.abort(), []);

  return { estado, consultar, limpar };
}
