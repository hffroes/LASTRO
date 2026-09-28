import { BrowserRouter } from 'react-router-dom';
import { AnaliseProvider } from './hooks/useAnalise';
import { Rotas } from './rotas';

export function App() {
  return (
    <BrowserRouter>
      <AnaliseProvider>
        <Rotas />
      </AnaliseProvider>
    </BrowserRouter>
  );
}
