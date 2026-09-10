# LASTRO MVP — Plano de Implementação em Fases

**Status:** Em Desenvolvimento  
**Data:** Setembro 2026  
**Stack:** React 18 + Node.js/Express + PostgreSQL + Replit  
**Referência:** @PRD.md (Seções 2-6)

---

## Progresso de Execução

| Fase | Descrição | Status | Data | Observações |
|------|-----------|--------|------|-------------|
| **0** | Setup: Vite+Express single-port, Prisma, Tailwind, `/shared/schemas`, .env | ✅ Concluída | 10 set 2026 | npm install e testes validados na Fase 1 |
| **1** | Backend Auth: JWT, bcrypt, rate limiting | ✅ Concluída | 10 set 2026 | 18 testes automatizados passando |
| **2** | Dados Base: Tipologias, parâmetros, seed | - | - | - |
| **3** | Motor Cálculo: VGV, custos, viabilidade, LASTRO Score | - | - | - |
| **4** | CRUD Análises: Modelo, endpoints, validação | - | - | - |
| **5** | Frontend Auth: React setup, login/signup, context | - | - | - |
| **6** | Formulário Multi-step | - | - | - |
| **7** | Resultado Interativo | - | - | - |
| **8** | Export Backend: PDF + HTML | - | - | - |
| **9** | Export Frontend: Download, share | - | - | - |
| **10** | Adapter APIs Externas: FipeZap/CUB | - | - | - |
| **11** | UX Refinement: Onboarding, mobile, UI | - | - | - |
| **12** | Testes E2E & Deploy | - | - | - |

---

## Resumo Executivo

Plano dividido em **12 fases**. Cada fase entrega algo testável e visível, progredindo de backend (auth → cálculo → persistência) → frontend (formulário → resultado) → integrações → polish.

**Estrutura de Complexidade:**
- **Baixa** (1-2 dias, <5 arquivos): Setup, testes, integração simples
- **Média** (3-4 dias, 5-10 arquivos): Componentes, CRUD, lógica de negócio
- **Alta** (5+ dias, 10+ arquivos): Motor de cálculo completo, integração multi-fonte

---

## Decisões Técnicas — RESOLVIDAS

Todas as decisões abaixo foram fechadas priorizando **arquitetura simples**, **integração nativa com Replit** e **facilidade de integração com APIs externas**. Nenhuma delas é mais um bloqueador de fase.

### **0. Arquitetura de Serving: Monólito Single-Port** ⭐ (decisão nova, resolve risco de CORS/portas)
- **Decisão:** Express serve `/api/v1/*` **e** os arquivos estáticos do build de produção do Vite (`dist/`), tudo na mesma porta/processo.
- **Dev:** Vite dev server roda separado (5173) com proxy `/api` → Express (3000).
- **Prod:** Um único processo Express, uma única porta (`process.env.PORT`, como o Replit exige).
- **Motivo:** Replit expõe publicamente **uma única porta**. Rodar frontend e backend como serviços separados exigiria CORS, múltiplos domínios/portas e configuração extra que Replit não facilita. Same-origin elimina isso por completo e simplifica Fase 12 (deploy).
- **Impacto:** Elimina a necessidade de `VITE_API_URL` em produção; simplifica CORS (só necessário em dev).

### **1. ORM: Prisma** ✅
- Suporte nativo ao Postgres do Replit (integração Neon, `DATABASE_URL` auto-injetada ao ativar o addon de banco no painel)
- Schema declarativo, migrations seguras, type-safety com TypeScript
- **Decisão final.** Sem revisão futura sem consulta (regra CLAUDE.md #2).

### **2. CSS: Tailwind** ✅
- Zero configuração de build extra além do plugin Vite oficial
- Prototipagem rápida, consistente com "Clareza por cima"
- **Decisão final.**

### **3. Estrutura .env e Variáveis** ✅
```bash
DATABASE_URL=              # auto-injetada pelo addon Postgres do Replit
JWT_SECRET=                # min 32 chars, gerado via `openssl rand -base64 32`
JWT_REFRESH_SECRET=        # diferente do access, mesma geração
NODE_ENV=development       # development | production
PORT=3000                  # Replit sobrescreve automaticamente em prod
# Sem VITE_API_URL: same-origin em produção (ver decisão 0)
FIPEZAP_ADAPTER=static     # static | http — trocável sem mudar código (ver decisão 6)
CUB_ADAPTER=static         # static | http
```
- Arquivo `.env.example` documentado em Fase 0.

### **4. Autenticação: JWT Access + Refresh** ✅
- Access token: 15 min, retornado no corpo JSON (não precisa de cookie — same-origin simplifica)
- Refresh token: 7 dias, httpOnly cookie (`SameSite=Strict`, `Secure` em prod)
- Endpoint `POST /auth/refresh` sem credenciais no corpo (usa o cookie)
- **Decisão final**, implementada em Fase 1.

### **5. Validação: Zod + Schemas Compartilhados** ✅
- Zod para validação frontend e backend
- **Novo:** pasta `/shared/schemas` com os schemas Zod usados por ambos os lados — elimina duplicação de regras de negócio (regra CLAUDE.md "Regras negócio centralizadas")
- **Decisão final.**

### **6. Integração APIs Externas: Adapter Pattern** ✅ (resolve o maior risco do plano)
- **Problema:** Não há confirmação de que FipeZap e Sinduscon-MG expõem APIs públicas (CLAUDE.md regra #6/#7 proíbe inventar endpoints).
- **Decisão:** Service layer com interface fixa (`MarketDataAdapter`, `CubDataAdapter`) e duas implementações:
  - `StaticAdapter` (padrão): lê de `/server/data/*.json`, versionado manualmente no repo até confirmação de fonte real
  - `HttpAdapter`: usado somente após confirmação real de endpoint (Fase 10), trocável via variável de ambiente (`FIPEZAP_ADAPTER=http`)
- **Motivo:** Isola o risco de indisponibilidade de API em uma única camada — o resto da aplicação (motor de cálculo, formulário, resultado) nunca sabe qual adapter está ativo. Nenhuma fase downstream fica bloqueada esperando confirmação de API.
- **Cache:** in-memory (`Map`) por processo + snapshot em tabela `ExternalDataCache` no Postgres como fallback entre reinícios
- **Atualização:** *lazy refresh* — verificado na própria request (se `>30 dias`, tenta atualizar antes de responder; se falhar, responde com snapshot + alerta de desatualização). **Não usa cron job**: o free tier do Replit hiberna processos inativos, então jobs agendados não disparam de forma confiável.

### **7. PDF/HTML Export: pdfkit** ✅
- **Decisão:** `pdfkit` (não `puppeteer`)
- **Motivo:** Puppeteer requer Chromium headless — pesado e historicamente instável em containers com recursos limitados como o Replit. `pdfkit` é puro Node, sem processo filho, sem binário externo.
- HTML export: template string com CSS inline, sem biblioteca.

### **8. Testes: Vitest** ✅
- Runner único para frontend e backend (nativo Vite)
- Escopo mínimo conforme CLAUDE.md: motor de cálculo, CUB ajustado, LASTRO Score, alertas de normalidade, auth, limite 3 análises, fallback de dados externos

### **9. Cache e Logger: Sem Infra Extra** ✅
- Cache: in-memory (`Map`) — sem Redis (adicionaria uma dependência de infra que o Replit não oferece nativamente)
- Logger: `console.log` estruturado em JSON — sem `winston` (overengineering para o escopo do MVP)

### **10. Rate Limiting** ✅
- `express-rate-limit` com memory store (sem Redis), aplicado nas rotas de auth (Fase 1) e análises (Fase 4)

### **11. Deploy: Replit Deployments Nativo** ✅
- **Decisão:** usar o deploy nativo do Replit (build + publish integrados), não Docker nem GitHub Actions customizado
- **Motivo:** o ambiente já é Replit; reimplementar CI/CD com Docker adiciona complexidade sem benefício para um MVP de 1 dev
- Testes automatizados (Vitest + Playwright) continuam rodando localmente/no Replit antes de cada deploy; GitHub Actions fica reservado para lint+test em push, sem etapa de build de imagem

---

## Fases de Implementação

### **FASE 0: Inicialização e Setup**

**Descrição:** Criar estrutura de projeto, configurar dependências, decidir stack técnico.

**Arquivos Criados/Modificados:**
- `package.json` (deps)
- `.env.example` (template)
- `tsconfig.json` (strict mode)
- `.gitignore` (segurança)
- `README.md` (instruções dev)
- `server/index.ts` (Express: monta `/api/v1`, serve `dist/` em prod)
- `vite.config.ts` (proxy `/api` → localhost:3000 em dev)
- Pastas: `/server`, `/src`, `/prisma`, `/shared/schemas`

**Entregável Testável:**
- `npm install` sem erros
- `npm run dev` lança Vite (5173, com proxy) + Express (3000) simultâneos
- Endpoint `/api/v1/health` responde `{ ok: true }`
- `npm run build && npm start` serve frontend + API na mesma porta (valida arquitetura single-port)

**Decisões Resolvidas (ver seção "Decisões Técnicas — RESOLVIDAS"):**
- ✅ Arquitetura single-port (Express serve API + estáticos)
- ✅ ORM (Prisma), CSS (Tailwind), Validação (Zod), Testes (Vitest)
- ✅ `.env` estruturado, `/shared/schemas` criada

**Complexidade:** Baixa (1 dia)  
**Arquivos Tocados:** ~15 novos

**Riscos/Consultas:**
- Confirmar que o addon Postgres do Replit injeta `DATABASE_URL` automaticamente ao ativar no painel
- Validar que `npx prisma migrate dev` funciona sem passo manual extra

**Modelo Sugerido:** Sonnet 5  
*Razão:* Setup boilerplate, decisões já mapeadas

**Status:** ✅ **CONCLUÍDA** (10 set 2026)
- Estrutura de pastas criada
- Dependências definidas em package.json
- Configurações de build/dev preparadas (Vite, TypeScript, ESLint, Prettier, Vitest, Playwright)
- Prisma schema criado com models User, Analysis, ExternalDataCache
- /shared/schemas estruturada com Zod schemas (auth, analysis, parameters)
- Express app com /api/v1/health endpoint
- README.md com instruções completas
- .env.example pronto para configuração
- Commit: 6df3f91

**Próximo Passo:** ~~`npm install` e validar `npm run dev`~~ — validado na Fase 1 (ver abaixo). Corrigido `jsonwebtoken` para `^9.0.2` (versão `^9.1.2` do package.json original não existe no npm) e adicionado `jsdom` como devDependency (exigido pelo `vitest.config.ts`, ausente do package.json original).

---

### **FASE 1: Backend — Autenticação e Modelo de Usuários**

**Descrição:** Criar schema Prisma para `User`, endpoints JWT (signup, login, refresh), middleware de autenticação.

**Arquivos Criados/Modificados:**
- `prisma/schema.prisma` (modelo User)
- `prisma/migrations/*` (primeira migração)
- `server/models/User.ts` (tipo + métodos)
- `server/middleware/auth.ts` (verificar JWT, attach user)
- `server/routes/auth.ts` (POST /auth/signup, /auth/login, /auth/refresh)
- `server/controllers/authController.ts` (lógica)
- `server/utils/jwt.ts` (sign, verify)
- `server/index.ts` (middleware + rotas)

**Entregável Testável:**
- POST `/api/v1/auth/signup` com email/senha → user criado, access + refresh tokens retornados
- POST `/api/v1/auth/login` com email/senha → tokens retornados
- POST `/api/v1/auth/refresh` com refresh token → novo access token
- GET `/api/v1/auth/me` (protegido) → retorna user autenticado
- Senha bcrypt verificada

**Complexidade:** Média (2-3 dias)  
**Arquivos Tocados:** ~8 novos/modificados

**Riscos/Consultas:**
- Replit PostgreSQL requer migração manual ou Prisma manage? → Testar `npx prisma migrate dev`
- httpOnly cookies funcionam em Replit? → Testar com curl

**Modelo Sugerido:** Sonnet 5  
*Razão:* Lógica de segurança (JWT, bcrypt), decisões de edge cases (token rotation, error messages), padrão completo

**Status:** ✅ **CONCLUÍDA** (10 set 2026)
- `server/lib/prisma.ts`: instância única do `PrismaClient` compartilhada pela app
- `server/utils/jwt.ts`: sign/verify de access (15min) e refresh (7d) tokens
- `server/models/User.ts`: `createUser` (hash bcrypt), `findUserByEmail`, `findUserById`, `verifyPassword`, `toPublicUser`
- `server/middleware/auth.ts`: `authenticateToken` valida `Authorization: Bearer` e popula `req.auth`
- `server/controllers/authController.ts` + `server/routes/auth.ts`: `POST /signup`, `POST /login`, `POST /refresh` (usa cookie httpOnly, sem credenciais no corpo), `POST /logout`, `GET /me` (protegida)
- Refresh token: cookie httpOnly `SameSite=Strict`, `Secure` em produção — access token retornado no corpo JSON, conforme decisão técnica #4
- Rate limiting (`express-rate-limit`, memory store) aplicado a todas as rotas de auth, desativado em `NODE_ENV=test`
- `server/app.ts`: fábrica da app Express extraída de `server/index.ts` para permitir testes com `supertest` sem abrir porta/conectar ao banco
- `prisma/migrations/20260910174809_init`: primeira migração aplicada e validada localmente (Postgres 16) — pasta ignorada pelo `.gitignore` do projeto, não versionada
- 18 testes automatizados (`__tests__/auth.test.ts`, Vitest + Supertest): signup, login, refresh, `/me`, logout, rate limiting, hashing de senha, rejeição de tokens trocados/inválidos — todos passando
- `npx tsc --noEmit` sem erros; validado manualmente via `curl` end-to-end (signup → me → login → refresh → logout)
- Correções incidentais no `package.json` da Fase 0: `jsonwebtoken` `^9.1.2`→`^9.0.2` (versão inexistente), `jsdom` adicionado (exigido pelo `vitest.config.ts` mas ausente)
- Pendência conhecida (fora do escopo desta fase): `.eslintrc.cjs` não usa parser TypeScript — `npm run lint` falha em qualquer arquivo `.ts`/`.tsx` do repositório, incluindo os já existentes antes desta fase

**Próximo Passo:** Fase 2 (Dados Base e Parâmetros)

---

### **FASE 2: Backend — Dados Base e Parâmetros**

**Descrição:** Criar tabelas e endpoints para dados imutáveis: tipologias, percentuais por tipologia, ajustes CUB, coeficientes IA. Mock FipeZap/CUB enquanto não integrados.

**Arquivos Criados/Modificados:**
- `prisma/schema.prisma` (tipos: Tipology, CubAdjustment, Parameter)
- `prisma/seed.ts` (popular dados do PRD§3)
- `server/models/Parameter.ts`
- `server/routes/parameters.ts` (GET endpoints)
- `server/controllers/parametersController.ts`
- `server/utils/parameterConstants.ts` (tabela PRD com tipologias)
- `server/data/fipezap-static.json` (fonte do `StaticAdapter`, ver Fase 10)
- `server/data/cub-static.json` (fonte do `StaticAdapter`, ver Fase 10)

**Entregável Testável:**
- GET `/api/v1/parameters/tipologies` → lista de Unifamiliar/Multifamiliar/etc com % terreno e lucro
- GET `/api/v1/parameters/cub-adjustments` → ajustes por tipologia/topografia/formato
- GET `/api/v1/parameters/ia-coefficients` (placeholder)
- GET `/api/v1/data/market-prices?tipologia=Multifamiliar&region=MG` → mock dados FipeZap
- Database seeded com dados do PRD

**Complexidade:** Baixa-Média (1-2 dias)  
**Arquivos Tocados:** ~10 novos/modificados

**Riscos/Consultas:**
- Dados de "IA" (Índice de Aproveitamento) do PRD§3.3 diz "será definido durante desenvolvimento" → Usar placeholder/TODO
- Precisamos de tabela separada para cada padrão (Baixo/Normal/Alto) por tipologia ou enum? → Recomendar estrutura normalizada em tabela única

**Modelo Sugerido:** Sonnet 5  
*Razão:* Estrutura de dados, validação de schema

---

### **FASE 3: Backend — Motor de Cálculo (Lógica Pura)**

**Descrição:** Implementar funções determinísticas e testáveis para cálculos econômicos. Zero dependência de UI ou persistência. Core da business logic.

**Arquivos Criados/Modificados:**
- `server/utils/calculator.ts` (fns puras: VGV, custos, viabilidade, LASTRO Score)
- `server/types/analysis.ts` (AnalysisInput, AnalysisOutput)
- `__tests__/calculator.test.ts` (suite de testes)

**Fns a Implementar:**
1. `calcVGV(unidades: number, precoVenda: number): number`
2. `calcCustoConstrucao(cubBase, areaConstr, ajusteTipologia, ajusteTopografia, ajusteFormato): number`
3. `calcCubAjustado(cubBase, tipologia, topografia, formato): number`
4. `calcCustoTerreno(percentualVGV, VGV): number`
5. `calcLucroIncorporador(percentualVGV, VGV): number`
6. `calcOutrosCustos(VGV): number` (hardcoded 3-5%)
7. `calcResultadoLiquido(VGV, custos): number`
8. `analisaNormalidadePercentuais(componentes, tipologia): Alert[]`
9. `calcLastroScore(viabilidade, normalidade, riscoTecnico): number`
10. `recomendacao(score): "COMPRAR" | "RESSALVAS" | "NAO_COMPRAR"`

**Entregável Testável:**
- Todos os testes passam com dados do PRD§4
- Exemplo: VGV = 1000 unidades × R$ 500k = R$ 500M
- Exemplo: CUB Ajustado com Multifamiliar Normal + topografia regular + lote regular
- Verificação de arredondamento monetário (centavos)

**Complexidade:** Alta (3-4 dias)  
**Arquivos Tocados:** ~3 novos, testes

**Riscos/Consultas:**
- PRD§4.3 diz "LASTRO Score metodologia a ser definida" → Necessário definição antes? Ou placeholder aceitável?
- Percentuais em convenção: 0.10 ou 10%? → Padronizar (recomendação: 0.10 = decimal)
- Arredondamentos: usar `Math.round()` ou biblioteca? → Recomendar `decimal.js` se precisão crítica

**Modelo Sugerido:** Sonnet 5  
*Razão:* Lógica econômica complexa, múltiplos edge cases, fórmulas que precisam ser revisadas para correção

---

### **FASE 4: Backend — Análises (CRUD e Persistência)**

**Descrição:** Criar tabela `Analysis`, endpoints para criar/listar/obter/deletar análises. Validar limite de 3 análises por usuário.

**Arquivos Criados/Modificados:**
- `prisma/schema.prisma` (modelo Analysis com relacionamento User)
- `prisma/migrations/*` (nova migração)
- `server/models/Analysis.ts`
- `server/routes/analyses.ts` (POST, GET, DELETE)
- `server/controllers/analysisController.ts`
- `server/middleware/authRequired.ts` (validar token em cada rota)
- `__tests__/analysisController.test.ts`

**Entregável Testável:**
- POST `/api/v1/analyses` com dados input → Analysis criada, retorna ID + resultado calculado
- GET `/api/v1/analyses` (auth requerida) → lista análises do usuário (máx 3)
- GET `/api/v1/analyses/:id` → retorna análise completa (input + output + timestamp)
- DELETE `/api/v1/analyses/:id` → deleta análise
- Tentar criar 4ª análise → erro 400 "Limite de 3 análises"
- Usuário A não vê análises de Usuário B

**Complexidade:** Média (2-3 dias)  
**Arquivos Tocados:** ~8 novos/modificados

**Riscos/Consultas:**
- Análise salva deve guardar snapshot dos parâmetros usados (PRD§5)? → Sim, adicionar campo `parametersSnapshot: JSON`
- Timestamp em timezone Brasília ou UTC? → Recomendar UTC no DB, converti no frontend

**Modelo Sugerido:** Sonnet 5  
*Razão:* Lógica de autorização (usuários isolados), validações de negócio (limite 3), snapshot de dados

---

### **FASE 5: Frontend — Setup e Autenticação**

**Descrição:** Vite + React 18 TypeScript, componentes de login/signup, context de autenticação, proteção de rotas.

**Arquivos Criados/Modificados:**
- `src/main.tsx` (React + CSS reset)
- `src/App.tsx` (router + layout)
- `src/contexts/AuthContext.tsx` (JWT storage, user state)
- `src/hooks/useAuth.ts` (custom hook)
- `src/pages/LoginPage.tsx` (form + validação)
- `src/pages/SignupPage.tsx` (form + validação)
- `src/pages/HistoryPage.tsx` (placeholder, será preenchido Phase 7)
- `src/components/ProtectedRoute.tsx` (redirecion a login se not auth)
- `src/utils/api.ts` (fetch helper com auth header)
- `src/styles/globals.css` (Tailwind reset)
- `vite.config.ts` (proxy /api → localhost:3000)

**Entregável Testável:**
- `npm run dev` lança frontend em localhost:5173
- Página de login com email/senha
- Link "Criar conta" → signup
- Signup cria usuário + redireciona a login
- Login com email/senha válida → armazena tokens + redireciona a `/history`
- Logout limpa tokens + redireciona a login
- Token inválido → redireciona a login
- Refresh token automático antes de expirar

**Complexidade:** Média (2-3 dias)  
**Arquivos Tocados:** ~10 novos

**Riscos/Consultas:**
- localStorage para access token é seguro? → Recomendar: access em localStorage, refresh em httpOnly (mais seguro), implementar ambos
- Como fazer logout sem limpar histórico? → Usar estado React + localStorage

**Modelo Sugerido:** Sonnet 5  
*Razão:* Fluxo de autenticação integrado (frontend + backend), edge cases (refresh antes de expirar, logout), segurança

---

### **FASE 6: Frontend — Formulário de Entrada**

**Descrição:** Componentes dinâmicos do formulário, captura de dados conforme tipologia, integração com API de parâmetros.

**Arquivos Criados/Modificados:**
- `src/pages/AnalysisFormPage.tsx`
- `src/components/form/TerrainDataStep.tsx` (área, formato, topografia)
- `src/components/form/ProjectTypeStep.tsx` (tipologia, padrão)
- `src/components/form/ProjectDetailsStep.tsx` (variável conforme tipo)
- `src/components/form/SalesDataStep.tsx` (unidades, preço venda)
- `src/hooks/useFormWizard.ts` (state multi-step)
- `src/hooks/useParameters.ts` (fetch params do backend)
- `src/utils/formValidation.ts` (Zod schemas)
- `src/types/form.ts` (AnalysisFormData)

**Entregável Testável:**
- Formulário multi-step com navegação anterior/próximo
- Step 1: Terreno (área m², formato, topografia) — validação de campo obrigatório
- Step 2: Tipologia (select + padrão) — carrega automaticamente % terreno/lucro
- Step 3: Detalhes (variável conforme tipologia)
  - Multifamiliar: pavimentos, apto/pav, área apto
  - Unifamiliar: área construída
  - Comercial: número de salas/pavimentos
- Step 4: Venda (unidades, preço unitário) — exibe m²/unidade automaticamente
- "Próximo" desabilitado até validação passar
- Todos os dados persistidos no state (mesmo se clicar "voltar")

**Complexidade:** Média (2-3 dias)  
**Arquivos Tocados:** ~10 novos

**Riscos/Consultas:**
- PRD§2.2 diz "detalhes por hardcoding durante dev" → Recomendar estrutura dinâmica baseada em configuração
- Como mostrar "detalhes específicos por tipologia"? → Usar mapa de componentes por tipo

**Modelo Sugerido:** Sonnet 5  
*Razão:* UX dinâmica (mostrar/ocultar campos), validação condicional, integração com API

---

### **FASE 7: Frontend — Cálculo e Resultado Interativo**

**Descrição:** Integração com endpoint de cálculo, exibição de resultado (score, decisão, tabela de custos), ajustes em tempo real.

**Arquivos Criados/Modificados:**
- `src/pages/ResultPage.tsx` (resultado completo)
- `src/components/result/ScoreCard.tsx` (score + decisão + emoji)
- `src/components/result/CostBreakdown.tsx` (tabela de custos)
- `src/components/result/NormalityAlerts.tsx` (alertas de normalidade)
- `src/components/result/AdjustmentsPanel.tsx` (inputs para ajustes interativos)
- `src/components/result/RiskAlerts.tsx` (alertas técnicos)
- `src/hooks/useAnalysisCalculation.ts` (fetch POST /api/v1/analyses + re-calc)
- `src/types/result.ts` (AnalysisResult)

**Entregável Testável:**
- Após preencher formulário, clica "Calcular" → POST `/api/v1/analyses`
- Resultado exibe:
  - ✅ LASTRO Score (XX/100) com cor (verde >70, amarelo 50-70, vermelho <50)
  - ✅ Decisão (Comprar / Com Ressalvas / Não Comprar) com emoji
  - ✅ Tabela: VGV, Custo Terreno, Custo Construção, Lucro, Outros, Sobra
  - ✅ Alertas de normalidade (se % terreno acima do esperado, lucro baixo, etc)
  - ✅ Alertas técnicos genéricos (validar urbanístico, solo, zoneamento, etc)
- Ajustes interativos:
  - Mudar "Preço Venda Unitária" → recalcula VGV, custos, score, resultado atualiza
  - Mudar "Margem de Lucro" → recalcula score, resultado atualiza
  - Mudar "Preço do Terreno" → recalcula viabilidade, resultado atualiza
- Max 2-3 segundos entre ajuste e atualização

**Complexidade:** Média-Alta (3-4 dias)  
**Arquivos Tocados:** ~10 novos

**Riscos/Consultas:**
- PRD§4.3 "Metodologia LASTRO Score a ser definida" → Usar placeholder (ex: 50 pontos viabilidade + 30 normalidade + 20 risco)?
- Como estruturar alertas? → Recomendar array de {tipo, mensagem, severidade}

**Modelo Sugerido:** Sonnet 5  
*Razão:* Integração complexa (frontend+backend), ajustes em tempo real com re-cálculo, UX responsiva

---

### **FASE 8: Backend — Exportação (PDF e HTML)**

**Descrição:** Endpoints para gerar PDF e HTML compartilhável com resultado completo.

**Arquivos Criados/Modificados:**
- `server/routes/export.ts` (POST /export/pdf, /export/html/:id)
- `server/controllers/exportController.ts`
- `server/utils/pdfGenerator.ts` (pdfkit — decisão final, ver seção de decisões técnicas)
- `server/utils/htmlGenerator.ts` (template com CSS inline)
- `server/templates/export-template.html` (template compartilhável)
- `__tests__/export.test.ts`

**Entregável Testável:**
- POST `/api/v1/export/pdf` com analysisId → retorna arquivo `.pdf` (application/pdf)
  - PDF contém: score, decisão, tabela custos, alertas, recomendação
  - PDF pronto para imprimir
- GET `/api/v1/export/html/:id` → retorna página HTML estática compartilhável
  - URL pública, sem auth, mostra resultado
  - CSS inline, sem dependências externas
  - Responsiva mobile/desktop
  - Rodapé com "Gerado por LASTRO"

**Complexidade:** Média (2-3 dias)  
**Arquivos Tocados:** ~5 novos

**Riscos/Consultas:**
- PDF gerado em stream em-memory (sem arquivo temporário em disco — mais simples e evita limpeza de arquivos órfãos)

**Modelo Sugerido:** Sonnet 5  
*Razão:* Geração de documentos, CSS/HTML estruturali, teste de binários

---

### **FASE 9: Frontend — Exportação e Compartilhamento**

**Descrição:** Botões de download PDF/HTML, página de visualização pública, histórico com ações.

**Arquivos Criados/Modificados:**
- `src/components/result/ExportButtons.tsx` (download PDF, copiar link HTML)
- `src/pages/PublicResultPage.tsx` (visualização pública de `/share/:id`)
- `src/pages/HistoryPage.tsx` (lista análises com ações: abrir, deletar, compartilhar)
- `src/hooks/useClipboard.ts` (copiar URL para clipboard)
- `src/utils/urlShare.ts`

**Entregável Testável:**
- Na ResultPage, botão "Baixar PDF" → download do arquivo
- Botão "Compartilhar" → copia URL pública para clipboard
- Página pública `/share/:id` mostra resultado sem login
- HistoryPage lista todas análises salvas com:
  - Tipologia + data
  - Botão "Abrir" → vai para ResultPage
  - Botão "Deletar" → remove análise
  - Botão "Compartilhar" → copia link

**Complexidade:** Baixa (1-2 dias)  
**Arquivos Tocados:** ~5 novos

**Riscos/Consultas:**
- Nenhuma análise visível a usuário não autenticado? → Sim, apenas via /share/:id

**Modelo Sugerido:** Sonnet 5  
*Razão:* UI com integração de endpoints, validação de acesso

---

### **FASE 10: Integração Dados Externos (FipeZap e CUB) via Adapter**

**Descrição:** Implementar o Adapter Pattern definido nas decisões técnicas. Desde a Fase 2, a aplicação já consome dados através da interface `MarketDataAdapter`/`CubDataAdapter` com o `StaticAdapter` (JSON versionado). Esta fase **investiga** se APIs reais existem e, se confirmadas, adiciona o `HttpAdapter` — sem tocar em nenhum consumidor downstream.

**Arquivos Criados/Modificados:**
- `server/services/adapters/MarketDataAdapter.ts` (interface)
- `server/services/adapters/CubDataAdapter.ts` (interface)
- `server/services/adapters/StaticAdapter.ts` (implementação já existente desde Fase 2, referenciada aqui)
- `server/services/adapters/HttpAdapter.ts` (implementação nova, **somente se API confirmada**)
- `server/utils/cache.ts` (Map in-memory + leitura/escrita do snapshot Postgres)
- `prisma/schema.prisma` (tabela `ExternalDataCache`)
- `server/routes/externalData.ts` (GET status de atualização/idade do cache)

**Entregável Testável:**
- GET `/api/v1/data/fipezap?region=MG&tipologia=Multifamiliar` → dados via adapter ativo (`FIPEZAP_ADAPTER` env)
- GET `/api/v1/data/cub` → idem para CUB
- Lazy refresh: se snapshot > 30 dias, tenta atualizar na própria request; falha → responde com snapshot + `alertaDesatualizado: true`
- Trocar `FIPEZAP_ADAPTER=static` → `http` via `.env` sem alterar código de consumidores
- Teste: adapter HTTP indisponível → fallback automático para último snapshot em cache

**Complexidade:** Média (2-3 dias — reduzida pelo adapter isolar o risco)  
**Arquivos Tocados:** ~7 novos

**Riscos/Consultas:**
- **Investigação primeiro:** FipeZap e Sinduscon-MG têm API pública REST? Documentação, rate limits, CORS? Se **não houver**, `StaticAdapter` permanece como fonte definitiva no MVP e a fase se conclui só com atualização manual periódica do JSON — sem bloquear nenhuma outra fase (regra CLAUDE.md #6/#7: nunca inventar endpoint)

---

### **FASE 11: Onboarding e UX Refinement**

**Descrição:** Página de onboarding para novo usuário, tooltips, polish visual, responsividade mobile.

**Arquivos Criados/Modificados:**
- `src/pages/OnboardingPage.tsx` (slideshow metodologia LASTRO)
- `src/components/Tooltip.tsx` (reusável)
- `src/components/HelpModal.tsx` (ajuda contextual)
- `src/styles/tailwind.config.js` (cores, tipografia)
- `src/styles/responsive.css` (breakpoints mobile)
- `src/hooks/useFirstTimeUser.ts` (detectar novo usuário)

**Entregável Testável:**
- Novo usuário após signup vê onboarding:
  - Slide 1: "O que é LASTRO Score?"
  - Slide 2: "Como funciona a análise?"
  - Slide 3: "Indicadores de viabilidade"
  - Botão "Começar" → vai para formulário
- Usuário retornando não vê onboarding
- Botão "?" em cada campo mostra tooltip
- Mobile (320px) responsiva sem scroll horizontal
- Cores: verde (viável), amarelo (ressalvas), vermelho (inviável)

**Complexidade:** Baixa-Média (2 dias)  
**Arquivos Tocados:** ~8 novos

**Riscos/Consultas:**
- Conteúdo de onboarding aprovado? → Usar texto do PRD§1 como base

**Modelo Sugerido:** Sonnet 5  
*Razão:* UI polish, onboarding flow, responsividade mobile

---

### **FASE 12: Testes E2E e Deploy**

**Descrição:** Suite de testes E2E (Playwright), CI/CD (GitHub Actions), validação em staging.

**Arquivos Criados/Modificados:**
- `e2e/happy-path.spec.ts` (novo usuário → análise → resultado → export)
- `e2e/auth.spec.ts` (login, logout, refresh token)
- `e2e/calculations.spec.ts` (cenários de cálculo VGV/custos)
- `.github/workflows/ci.yml` (lint + test em cada push — **sem** build de imagem/deploy)
- `README.md` (instruções de dev/prod)

**Entregável Testável:**
- `npm run test:e2e` executa suite completa
- Todas as linhas de fluxo happy-path cobertas
- CI (lint + test) passa em cada push
- Deploy via Replit Deployments (build + publish nativos, sem Docker) funciona
- App publicado acessível e operacional

**Complexidade:** Média (2-3 dias)  
**Arquivos Tocados:** ~7 novos

**Riscos/Consultas:**
- Headless Chrome (Playwright) roda no ambiente de execução do Replit? → Verificar permissões antes de escrever os testes E2E

**Modelo Sugerido:** Opus 5  
*Razão:* Testes E2E complexos, validação end-to-end, CI/CD pipeline, garantia de qualidade final

---

## Cronograma Sugerido

```
FASE 0: Setup                    1 dia   → Sonnet
FASE 1: Auth Backend             2 dias  → Sonnet
FASE 2: Dados Base              2 dias  → Sonnet
FASE 3: Motor Cálculo           3 dias  → Sonnet ⭐ (complexidade peak)
FASE 4: CRUD Análises           2 dias  → Sonnet
FASE 5: Frontend Auth           3 dias  → Sonnet
FASE 6: Formulário              2 dias  → Sonnet
FASE 7: Resultado Interativo    3 dias  → Sonnet
FASE 8: Export Backend          2 dias  → Sonnet
FASE 9: Export Frontend         1 dia   → Sonnet
FASE 10: APIs Externas          3 dias  → Sonnet (investigação + integração)
FASE 11: UX Refinement          2 dias  → Sonnet
FASE 12: Testes E2E/Deploy      2 dias  → Opus (testes e validação final)
─────────────────────────────────────────────────
TOTAL:                          ~31 dias (6-7 semanas com 1 dev)
```

---

## Dependências Entre Fases (Critical Path)

```
FASE 0 (Setup)
    ↓
FASE 1 (Auth) ──┐
    ↓          │
FASE 2 (Dados) │
    ↓          │
FASE 3 (Cálculo) ← Fase 1 requisito (usuário autenticado)
    ↓
FASE 4 (CRUD) ← Fases 1 e 3 requisitos
    ↓
FASE 5 (Frontend Auth) ← Fase 1 requisito
    ↓
FASE 6 (Formulário) ← Fases 5 e 2 requisitos
    ↓
FASE 7 (Resultado) ← Fases 4, 6, 3 requisitos
    ↓
FASE 8 (Export Backend) ← Fase 4 requisito
    ↓
FASE 9 (Export Frontend) ← Fases 7 e 8 requisitos
    ↓
FASE 10 (APIs Externas) [Pode rodar em paralelo com Fases 8-9]
    ↓
FASE 11 (UX) [Pode rodar após Fase 9]
    ↓
FASE 12 (Testes) [Após Fase 11]
```

---

## Checkpoints de Validação (Após Cada Fase)

### Antes de Fase 1
- [x] Decisões técnicas resolvidas (ver "Decisões Técnicas — RESOLVIDAS")
- [ ] `.env.example` pronto
- [ ] Repo estruturado com pastas corretas, incluindo `/shared/schemas`
- [ ] `DATABASE_URL` confirmada auto-injetada pelo Replit

### Antes de Fase 3
- [ ] Auth completa e testada
- [ ] Dados de parâmetros carregados no DB

### Antes de Fase 5
- [ ] Cálculos passam em testes unitários
- [ ] CRUD análises funcional

### Antes de Fase 7
- [ ] Formulário captura dados corretamente
- [ ] Integração com endpoint de cálculo OK

### Antes de Fase 10
- [ ] Export PDF e HTML funcionais
- [ ] `StaticAdapter` já em uso desde Fase 2 (não é bloqueador — apenas decide se `HttpAdapter` entra ou não)
- [ ] Pesquisar disponibilidade real de APIs FipeZap/CUB (define se `HttpAdapter` é implementado nesta fase)

### Antes de Fase 12
- [ ] UX responsiva em mobile/desktop
- [ ] Onboarding visível novo usuário

---

## Pontos de Consulta Obrigatórios (Bloqueadores Potenciais)

As decisões de **arquitetura técnica** (ORM, CSS, validação, export, cache, deploy) estão todas resolvidas — ver "Decisões Técnicas — RESOLVIDAS". Os pontos abaixo são de **conteúdo de produto/dados**, que continuam exigindo definição ou confirmação:

### **1. APIs Externas Reais (antes de ativar `HttpAdapter` na Fase 10)**
- FipeZap: Existe API pública REST? Documentação? Rate limits? CORS?
- CUB Sinduscon-MG: Existe endpoint? Formato? Autenticação?
- **Impacto:** Mitigado pelo Adapter Pattern (decisão 6) — se não houver API, `StaticAdapter` com JSON versionado permanece a fonte de dados no MVP, sem bloquear nenhuma fase

### **2. Replit PostgreSQL (validar em Fase 0/1)**
- Confirmar que `DATABASE_URL` é auto-injetada ao ativar o addon Postgres no painel Replit
- Confirmar que `npx prisma migrate dev` funciona sem passo manual extra

### **3. Metodologia LASTRO Score (antes Fase 3)**
- PRD§4.3 diz "a ser definida durante desenvolvimento"
- Necessário definir pesos antes de code? (40% viabilidade, 30% normalidade, 20% risco, 10% mercado?)
- **Impacto:** Sem definição, código é placeholder — requer aprovação (regra CLAUDE.md: "LASTRO Score... sem mudanças sem aprovação")

### **4. Detalhes de Projeto por Tipologia (antes Fase 6)**
- PRD§2.2 diz "detalhes serão definidos por hardcoding"
- Qual é a lista completa de campos para Multifamiliar/Comercial/etc?
- **Impacto:** UI será incompleta se campos não especificados

---

## Riscos Técnicos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|--------|-----------|
| APIs externas (FipeZap/CUB) indisponíveis | Média | Baixo | Mitigado por design: Adapter Pattern isola o risco, `StaticAdapter` é fonte válida no MVP |
| Performance cálculo com ajustes reais-time > 500ms | Baixa | Médio | Motor de cálculo é síncrono e local (mesmo processo, same-origin); cache de resultado por sessão se necessário |
| Replit limitações (DB, storage, CPU) | Média | Alto | Validar `DATABASE_URL` e migrations já em Fase 0/1 |
| Segurança JWT (token expiração, refresh) | Baixa | Alto | Review código Fase 1 com foco em rotação de refresh token |
| Compatibilidade navegadores antigos | Baixa | Baixo | Testar Chrome/Firefox/Safari atualizados |

---

## Notas Arquiteturais

### Serving Single-Port (Replit-first)
- Um processo Express: serve `/api/v1/*` e o build estático do Vite (`dist/`)
- Dev: Vite (5173) com proxy `/api` → Express (3000); Prod: uma porta só (`process.env.PORT`)
- Elimina CORS em produção e a necessidade de `VITE_API_URL`

### Motor de Cálculo
- **Fns puras e testáveis** em `server/utils/calculator.ts`
- Zero dependência de DB ou UI
- Todos inputs/outputs são números (evita erros de tipo)
- Testes cobrindo fórmulas + arredondamentos

### Dados Externos: Adapter Pattern
- `MarketDataAdapter`/`CubDataAdapter` (interface) com `StaticAdapter` (JSON versionado, padrão) e `HttpAdapter` (opcional, só após confirmação de API real)
- Trocável via `.env` (`FIPEZAP_ADAPTER`, `CUB_ADAPTER`), sem alterar consumidores
- Cache in-memory + snapshot Postgres, refresh lazy sob demanda (sem cron — Replit free tier hiberna)

### Separação Frontend/Backend
- Frontend nunca calcula valores monetários (sempre confia no backend)
- Validações espelhadas via schemas Zod compartilhados em `/shared/schemas` (frontend UX, backend security — fonte única)
- API v1 versioned (`/api/v1/*`) para futuras mudanças

### Segurança
- JWT com refresh tokens (access 15min JSON, refresh 7d httpOnly cookie)
- Senhas bcrypt
- CORS necessário apenas em dev (same-origin em produção)
- Validação entrada com Zod em todos endpoints
- Rate limiting via `express-rate-limit` em rotas de auth e análises
- Proteção contra limite 3 análises por usuário (validado backend)

---

## Como Usar Este Plano

1. **Decisões técnicas:** já resolvidas (Seção "Decisões Técnicas — RESOLVIDAS") — não requerem mais consulta antes de codificar
2. **Executar fases sequencialmente** conforme dependências (diagrama Critical Path)
3. **Após cada fase:** Validar checkpoint antes de próxima
4. **Bloqueado em ponto de consulta de produto/dados** (Score, detalhes de tipologia, APIs reais)? → Escalar imediatamente, não avançar
5. **Mudança de escopo?** → Atualizar plano, não ignorar

---

**Status:** Pronto para Desenvolvimento  
**Próximo Passo:** Iniciar Fase 0 (decisões técnicas já resolvidas)
