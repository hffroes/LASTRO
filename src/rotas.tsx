import { Route, Routes } from 'react-router-dom';
import { LayoutApp } from './components/layout/LayoutApp';
import { PaginaInicial } from './pages/PaginaInicial';
import { Onboarding } from './pages/Onboarding';
import { Terreno } from './pages/Terreno';
import { Produto } from './pages/Produto';
import { Resultado } from './pages/Resultado';
import { NaoEncontrada } from './pages/NaoEncontrada';

export function Rotas() {
  return (
    <Routes>
      <Route element={<LayoutApp />}>
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/terreno" element={<Terreno />} />
        <Route path="/produto" element={<Produto />} />
        <Route path="/resultado" element={<Resultado />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  );
}
