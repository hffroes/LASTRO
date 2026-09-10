import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Placeholder — histórico de análises salvas (listar/abrir/deletar/
// compartilhar) chega nas Fases 7-9.
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Suas análises</h2>
          <Link
            to="/analise/nova"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Nova análise
          </Link>
        </div>

        <div className="mt-4 rounded-lg bg-white p-8 shadow">
          <p className="text-gray-600">
            Em breve: histórico das últimas 3 análises salvas, com opções de
            abrir, deletar e compartilhar.
          </p>
        </div>
      </main>
    </div>
  );
}
