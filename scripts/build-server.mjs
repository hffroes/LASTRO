// `tsc` no build principal só typecheck (tsconfig.json tem noEmit: true,
// necessário para o frontend, que é transpilado pelo Vite/esbuild). Sem
// isso, `dist/server/index.js` nunca existia e `npm start` falhava
// (MODULE_NOT_FOUND) — bug pré-existente desde a Fase 0, nunca validado
// de fato em produção. Bundling em vez de `tsc` com emit evita a fricção
// de import ESM sem extensão (`from '../lib/prisma'`) que o loader nativo
// do Node exigiria resolver manualmente.
import { build } from 'esbuild';

await build({
  entryPoints: ['server/index.ts'],
  outfile: 'dist/server/index.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  packages: 'external',
  sourcemap: true,
});
