import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Analise, RespostaAnalise } from '../types/analise';
import { PREMISSAS_AJUSTAVEIS, type AjustesPremissas, type PremissaAjustavel } from '../types/parametros';
import type { LeituraNumero } from '../utils/motor/formatacao';
import { contarAjustes, normalizarAjustes, type ValoresPremissas } from '../utils/motor/premissas';
import { MENSAGENS_AJUSTES, validarAjuste, type ErrosAjustes } from '../utils/validacao/ajustes';
import { MENSAGENS_PRODUTO } from '../utils/validacao/produto';
import { MENSAGEM_ERRO_GENERICO, MENSAGEM_SEM_CONEXAO, TEMPO_LIMITE_ANALISE_MS, pedirAnalise } from './useAnaliseRemota';

type Calculado = Extract<RespostaAnalise, { situacao: 'calculado' }>;

// Espera depois da última tecla antes de pedir o recálculo: digitar "1.000.000" não vira sete pedidos. Curta
// o bastante para, somada ao cálculo do servidor (milissegundos), a resposta chegar dentro dos 500 ms do
// PRD 6.2.
export const ESPERA_RECALCULO_MS = 250;

// O texto que não pôde ser lido como número recebe a mensagem de formato de cada campo.
const MENSAGEM_ILEGIVEL: Record<PremissaAjustavel, string> = {
  precoUnidade: MENSAGENS_PRODUTO.precoUnidadeIlegivel,
  taxaOcupacao: MENSAGENS_PRODUTO.taxaOcupacaoIlegivel,
  lucroIncorporador: MENSAGENS_AJUSTES.percentualIlegivel,
  despesasGerais: MENSAGENS_AJUSTES.percentualIlegivel,
  cubAjustado: MENSAGENS_AJUSTES.cubIlegivel,
};

const VERSOES_INICIAIS = Object.fromEntries(PREMISSAS_AJUSTAVEIS.map((premissa) => [premissa, 0])) as Record<
  PremissaAjustavel,
  number
>;

interface OpcoesUsePremissas {
  analise: Analise;
  /** A resposta sem ajustes: é o cenário original, ao qual "restaurar" volta sem chamar o servidor. */
  original: Calculado;
  buscar?: typeof fetch;
}

// O cenário "e se..." do resultado (F17). Os ajustes vivem só aqui, no estado da página aberta: não vão ao
// rascunho, não tocam nos padrões da lastro e somem com a análise (PRD 2.10). O servidor recalcula, como
// em todo o resto do resultado (D-R25); enquanto ele responde, a tela segue com o último cenário válido.
export function usePremissas({ analise, original, buscar }: OpcoesUsePremissas) {
  const originais = useMemo(() => {
    const valores = {} as ValoresPremissas;
    for (const premissa of PREMISSAS_AJUSTAVEIS) valores[premissa] = original.premissas.ajustes.premissas[premissa].original;
    return valores;
  }, [original]);

  const [ajustes, setAjustes] = useState<AjustesPremissas>({});
  const [erros, setErros] = useState<ErrosAjustes>({});
  const [resposta, setResposta] = useState<Calculado>(original);
  const [recalculando, setRecalculando] = useState(false);
  const [erroCenario, setErroCenario] = useState<string | null>(null);
  // Restaurar remonta o campo: o texto digitado (até o ilegível) volta a ser o do valor original.
  const [versoes, setVersoes] = useState(VERSOES_INICIAIS);
  const refControle = useRef<AbortController | null>(null);

  useEffect(() => () => refControle.current?.abort(), []);

  const chaveAjustes = PREMISSAS_AJUSTAVEIS.map((premissa) => ajustes[premissa] ?? '').join('|');

  useEffect(() => {
    refControle.current?.abort();
    refControle.current = null;
    setErroCenario(null);
    // Sem ajuste nenhum, o cenário é o original: nada a pedir.
    if (contarAjustes(ajustes) === 0) {
      setResposta(original);
      setRecalculando(false);
      return;
    }
    setRecalculando(true);
    const espera = setTimeout(async () => {
      const controle = new AbortController();
      refControle.current = controle;
      const cronometro = setTimeout(() => controle.abort(), TEMPO_LIMITE_ANALISE_MS);
      try {
        const desfecho = await pedirAnalise(buscar ?? fetch, analise, ajustes, controle.signal);
        if (refControle.current !== controle) return;
        if (desfecho.situacao === 'sucesso' && desfecho.resposta.situacao === 'calculado') {
          setResposta(desfecho.resposta);
        } else if (desfecho.situacao === 'erroValidacao') {
          setErroCenario(desfecho.erros.map((erro) => erro.mensagem).join(' '));
        } else {
          setErroCenario(desfecho.situacao === 'erroServidor' ? desfecho.mensagem : MENSAGEM_ERRO_GENERICO);
        }
      } catch {
        if (refControle.current !== controle) return;
        setErroCenario(MENSAGEM_SEM_CONEXAO);
      } finally {
        clearTimeout(cronometro);
        if (refControle.current === controle) setRecalculando(false);
      }
    }, ESPERA_RECALCULO_MS);
    return () => clearTimeout(espera);
    // A chave resume os ajustes; a análise e a resposta original não mudam enquanto a página está aberta.
  }, [chaveAjustes]);

  const definir = useCallback(
    (premissa: PremissaAjustavel, leitura: LeituraNumero) => {
      // Campo vazio ou ilegível não muda o cenário: a tela segue com o último valor válido e acusa o campo.
      if (leitura.tipo !== 'valido') {
        setErros((atuais) => ({
          ...atuais,
          [premissa]: leitura.tipo === 'vazio' ? MENSAGENS_AJUSTES.ausente : MENSAGEM_ILEGIVEL[premissa],
        }));
        return;
      }
      const erro = validarAjuste(premissa, leitura.unidadesMenores, analise);
      setErros((atuais) => {
        const { [premissa]: _anterior, ...resto } = atuais;
        return erro ? { ...resto, [premissa]: erro } : resto;
      });
      if (erro) return;
      setAjustes((atuais) => normalizarAjustes({ ...atuais, [premissa]: leitura.unidadesMenores }, originais));
    },
    [analise, originais],
  );

  const restaurar = useCallback((premissa: PremissaAjustavel) => {
    setAjustes((atuais) => {
      const { [premissa]: _removido, ...resto } = atuais;
      return resto;
    });
    setErros((atuais) => {
      const { [premissa]: _removido, ...resto } = atuais;
      return resto;
    });
    setVersoes((atuais) => ({ ...atuais, [premissa]: atuais[premissa] + 1 }));
  }, []);

  const restaurarTudo = useCallback(() => {
    setAjustes({});
    setErros({});
    setVersoes((atuais) => {
      const proximas = { ...atuais };
      for (const premissa of PREMISSAS_AJUSTAVEIS) proximas[premissa] += 1;
      return proximas;
    });
  }, []);

  return {
    originais,
    ajustes,
    erros,
    versoes,
    resposta,
    recalculando,
    erroCenario,
    quantidadeAjustes: contarAjustes(ajustes),
    definir,
    restaurar,
    restaurarTudo,
  };
}

export type EstadoPremissas = ReturnType<typeof usePremissas>;
