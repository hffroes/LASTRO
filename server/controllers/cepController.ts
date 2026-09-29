import type { Request, Response } from 'express';

// ViaCEP (PRD 3.4, D-R16): verificado em 29/09/2026, gratuito e sem chave. A página do serviço
// pede para validar os 8 dígitos antes de consultar e avisa que uso massivo bloqueia o acesso:
// daí a validação aqui e o cache abaixo.
export const URL_VIACEP = 'https://viacep.com.br/ws';
// Acima disso o usuário já está esperando demais; a falha não bloqueia (preenchimento manual).
export const TEMPO_LIMITE_VIACEP_MS = 4000;
// CEP muda raramente; 24h evita repetir a mesma consulta a cada F5 ou nova análise (D-A10).
export const VALIDADE_CACHE_CEP_MS = 24 * 60 * 60 * 1000;
export const LIMITE_ITENS_CACHE_CEP = 1000;

export interface EnderecoCep {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  codigoIbge: number | null;
}

type CodigoErroCep = 'CEP_INVALIDO' | 'CEP_NAO_ENCONTRADO' | 'CEP_INDISPONIVEL' | 'CEP_TEMPO_ESGOTADO';

interface Resposta {
  status: number;
  corpo: { dados: EnderecoCep } | { erro: { codigo: CodigoErroCep; mensagem: string } };
}

const ERROS: Record<CodigoErroCep, Resposta> = {
  CEP_INVALIDO: { status: 400, corpo: { erro: { codigo: 'CEP_INVALIDO', mensagem: 'O CEP deve ter 8 dígitos.' } } },
  CEP_NAO_ENCONTRADO: {
    status: 404,
    corpo: { erro: { codigo: 'CEP_NAO_ENCONTRADO', mensagem: 'CEP não encontrado.' } },
  },
  CEP_INDISPONIVEL: {
    status: 503,
    corpo: { erro: { codigo: 'CEP_INDISPONIVEL', mensagem: 'Consulta de CEP indisponível no momento.' } },
  },
  CEP_TEMPO_ESGOTADO: {
    status: 504,
    corpo: { erro: { codigo: 'CEP_TEMPO_ESGOTADO', mensagem: 'A consulta de CEP demorou demais.' } },
  },
};

interface DependenciasCep {
  buscar?: typeof fetch;
  agora?: () => number;
  tempoLimiteMs?: number;
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Traduz o formato do ViaCEP para o nosso: o front não depende do provedor, e trocar de provedor
// não muda o contrato da API.
function converter(cep: string, bruto: Record<string, unknown>): EnderecoCep {
  const codigoIbge = Number.parseInt(texto(bruto.ibge), 10);
  return {
    cep,
    logradouro: texto(bruto.logradouro),
    bairro: texto(bruto.bairro),
    cidade: texto(bruto.localidade),
    uf: texto(bruto.uf).toUpperCase(),
    codigoIbge: Number.isFinite(codigoIbge) ? codigoIbge : null,
  };
}

export function criarControladorCep({
  buscar = fetch,
  agora = Date.now,
  tempoLimiteMs = TEMPO_LIMITE_VIACEP_MS,
}: DependenciasCep = {}) {
  // Só respostas definitivas (encontrado / não encontrado) entram no cache; falha do provedor não,
  // para a próxima tentativa poder dar certo.
  const cache = new Map<string, { expiraEm: number; resposta: Resposta }>();

  function guardar(cep: string, resposta: Resposta) {
    if (cache.size >= LIMITE_ITENS_CACHE_CEP) {
      const maisAntigo = cache.keys().next().value;
      if (maisAntigo !== undefined) cache.delete(maisAntigo);
    }
    cache.set(cep, { expiraEm: agora() + VALIDADE_CACHE_CEP_MS, resposta });
  }

  async function consultar(cep: string): Promise<Resposta> {
    const emCache = cache.get(cep);
    if (emCache && emCache.expiraEm > agora()) return emCache.resposta;

    let respostaExterna: globalThis.Response;
    try {
      respostaExterna = await buscar(`${URL_VIACEP}/${cep}/json/`, { signal: AbortSignal.timeout(tempoLimiteMs) });
    } catch (erro) {
      const esgotou = erro instanceof Error && (erro.name === 'TimeoutError' || erro.name === 'AbortError');
      return esgotou ? ERROS.CEP_TEMPO_ESGOTADO : ERROS.CEP_INDISPONIVEL;
    }

    if (!respostaExterna.ok) return ERROS.CEP_INDISPONIVEL;

    let bruto: unknown;
    try {
      bruto = await respostaExterna.json();
    } catch {
      return ERROS.CEP_INDISPONIVEL;
    }
    if (!bruto || typeof bruto !== 'object') return ERROS.CEP_INDISPONIVEL;

    const registro = bruto as Record<string, unknown>;
    // O ViaCEP responde 200 com { erro: "true" } (string) ou { erro: true } para CEP inexistente.
    const resposta: Resposta =
      registro.erro === true || registro.erro === 'true'
        ? ERROS.CEP_NAO_ENCONTRADO
        : { status: 200, corpo: { dados: converter(cep, registro) } };
    guardar(cep, resposta);
    return resposta;
  }

  return async function obterCep(req: Request, res: Response) {
    // Aceita com ou sem hífen; qualquer outra coisa nem chega ao provedor.
    const informado = String(req.params.cep ?? '');
    const cep = informado.replace('-', '');
    if (!/^\d{5}-?\d{3}$/.test(informado)) {
      res.status(ERROS.CEP_INVALIDO.status).json(ERROS.CEP_INVALIDO.corpo);
      return;
    }
    const resposta = await consultar(cep);
    res.status(resposta.status).json(resposta.corpo);
  };
}
