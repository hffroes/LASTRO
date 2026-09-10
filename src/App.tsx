import { useEffect, useState } from 'react';

export default function App() {
  const [health, setHealth] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/v1/health');
        setHealth(res.ok);
      } catch (error) {
        console.error('Health check failed:', error);
        setHealth(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            LASTRO MVP
          </h1>
          <p className="mt-2 text-gray-600">
            Land Analysis & Acquisition Viability Tool
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-lg bg-white p-8 shadow">
            <p className="text-center text-gray-600">Checking connection...</p>
          </div>
        ) : health ? (
          <div className="rounded-lg bg-green-50 p-8 shadow">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-green-900">
                ✓ Ready to go!
              </h2>
              <p className="mt-2 text-green-700">
                Vite + Express single-port setup is operational
              </p>
              <p className="mt-1 text-sm text-green-600">
                API health check: /api/v1/health (OK)
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-red-50 p-8 shadow">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-900">
                ✗ Connection Error
              </h2>
              <p className="mt-2 text-red-700">
                Could not reach API at /api/v1/health
              </p>
              <p className="mt-1 text-sm text-red-600">
                Ensure Express server is running on port 3000
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-lg bg-white p-8 shadow">
          <h2 className="text-lg font-semibold text-gray-900">
            Phase 0: Setup Complete
          </h2>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>✓ Vite frontend configured (port 5173)</li>
            <li>✓ Express API configured (port 3000)</li>
            <li>✓ Proxy /api → localhost:3000 in dev</li>
            <li>✓ Prisma schema created</li>
            <li>✓ Tailwind CSS configured</li>
            <li>✓ TypeScript strict mode enabled</li>
            <li>✓ /shared/schemas directory created</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
