import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormWizard } from '../hooks/useFormWizard';
import TerrainDataStep from '../components/form/TerrainDataStep';
import ProjectTypeStep from '../components/form/ProjectTypeStep';
import ProjectDetailsStep from '../components/form/ProjectDetailsStep';
import SalesDataStep from '../components/form/SalesDataStep';
import { apiFetch } from '../utils/api';
import type { AnalysisFormData } from '../types/form';
import type { AnalysisResult } from '../../shared/schemas';

const TITULOS_PASSO = [
  'Terreno',
  'Tipologia',
  'Detalhes construtivos',
  'Venda',
];

function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AnalysisFormPage() {
  const { passo, dados, avancar, voltar } = useFormWizard();
  const [enviando, setEnviando] = useState(false);
  const [erroCalculo, setErroCalculo] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AnalysisResult | null>(null);

  const finalizar = async (dadosFinais: AnalysisFormData) => {
    setEnviando(true);
    setErroCalculo(null);
    try {
      const res = await apiFetch('/api/v1/analises/calcular', {
        method: 'POST',
        body: JSON.stringify(dadosFinais),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Não foi possível calcular a análise');
      }
      setResultado(data.resultado);
    } catch (erro) {
      setErroCalculo(erro instanceof Error ? erro.message : 'Erro ao calcular');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <Link
          to="/history"
          className="text-sm font-medium text-gray-700 underline"
        >
          ← Voltar às suas análises
        </Link>

        {resultado ? (
          <div className="mt-6 rounded-lg bg-white p-8 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Resultado (prévia)
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Exibição completa do resultado (score, tabela de custos, alertas
              técnicos) chega na próxima fase — por enquanto, um resumo simples.
            </p>

            <dl className="mt-4 space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt>VGV</dt>
                <dd>{formatarReais(resultado.vgv)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Resultado líquido</dt>
                <dd>{formatarReais(resultado.resultadoLiquido)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Preço máximo recomendado</dt>
                <dd>{formatarReais(resultado.precoMaximoRecomendado)}</dd>
              </div>
              <div className="flex justify-between font-semibold text-gray-900">
                <dt>LASTRO Score</dt>
                <dd>{resultado.lastroScore}/100</dd>
              </div>
              <div className="flex justify-between font-semibold text-gray-900">
                <dt>Recomendação</dt>
                <dd>{resultado.recomendacao}</dd>
              </div>
            </dl>

            {resultado.alertas.length > 0 && (
              <ul className="mt-4 space-y-1 rounded-md bg-warning/10 p-3 text-sm text-gray-700">
                {resultado.alertas.map(alerta => (
                  <li key={alerta.tipo}>⚠ {alerta.mensagem}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm font-medium text-gray-500">
              Passo {passo + 1} de {TITULOS_PASSO.length}:{' '}
              {TITULOS_PASSO[passo]}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gray-900 transition-all"
                style={{
                  width: `${((passo + 1) / TITULOS_PASSO.length) * 100}%`,
                }}
              />
            </div>

            <div className="mt-6 rounded-lg bg-white p-8 shadow">
              {passo === 0 && (
                <TerrainDataStep valoresIniciais={dados} onAvancar={avancar} />
              )}
              {passo === 1 && (
                <ProjectTypeStep
                  valoresIniciais={dados}
                  onAvancar={avancar}
                  onVoltar={voltar}
                />
              )}
              {passo === 2 && (
                <ProjectDetailsStep
                  valoresIniciais={dados}
                  onAvancar={avancar}
                  onVoltar={voltar}
                />
              )}
              {passo === 3 && (
                <SalesDataStep
                  valoresIniciais={dados}
                  onVoltar={voltar}
                  onFinalizar={finalizar}
                  enviando={enviando}
                />
              )}

              {erroCalculo && (
                <p className="mt-4 text-sm text-danger">{erroCalculo}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
