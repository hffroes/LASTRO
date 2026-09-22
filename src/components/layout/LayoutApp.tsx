import { Outlet, useLocation } from 'react-router-dom';
import { Etapas } from '../ui/Etapas';
import { Cabecalho } from './Cabecalho';
import { Rodape } from './Rodape';
import estilos from './LayoutApp.module.css';

const ETAPAS_DA_ANALISE = ['Terreno', 'Produto', 'Resultado'];
const ROTAS_DA_ANALISE = ['/terreno', '/produto', '/resultado'];

export function LayoutApp() {
  const localizacao = useLocation();
  const indiceEtapaAtual = ROTAS_DA_ANALISE.indexOf(localizacao.pathname);

  return (
    <div className={estilos.pagina}>
      <Cabecalho />
      {indiceEtapaAtual !== -1 && (
        <div className={estilos.faixaEtapas}>
          <Etapas etapas={ETAPAS_DA_ANALISE} etapaAtual={indiceEtapaAtual} />
        </div>
      )}
      <main className={estilos.conteudo}>
        <Outlet />
      </main>
      <Rodape />
    </div>
  );
}
