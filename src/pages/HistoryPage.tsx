import { useAuth } from '../hooks/useAuth';

// Placeholder — histórico de análises salvas chega nas Fases 6-9
// (formulário, resultado interativo e exportação/compartilhamento).
export default function HistoryPage() {
  const { usuario, sair } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">LASTRO</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{usuario?.email}</span>
            <button
              type="button"
              onClick={() => void sair()}
              className="text-sm font-medium text-gray-700 underline hover:text-gray-900"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="text-lg font-semibold text-gray-900">Suas análises</h2>
          <p className="mt-2 text-gray-600">
            Em breve: formulário de nova análise e histórico das últimas 3
            análises salvas.
          </p>
        </div>
      </main>
    </div>
  );
}
