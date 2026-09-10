# LASTRO MVP — Plano de Implementação em Fases

**Status:** Pronto para Desenvolvimento  
**Data:** Setembro 2026  
**Stack:** React 18 + Node.js/Express + PostgreSQL + Replit  
**Referência:** @PRD.md (Seções 2-6)

---

## Resumo Executivo

Plano dividido em **12 fases**. Cada fase entrega algo testável e visível, progredindo de backend (auth → cálculo → persistência) → frontend (formulário → resultado) → integrações → polish.

**Estrutura de Complexidade:**
- **Baixa** (1-2 dias, <5 arquivos): Setup, testes, integração simples
- **Média** (3-4 dias, 5-10 arquivos): Componentes, CRUD, lógica de negócio
- **Alta** (5+ dias, 10+ arquivos): Motor de cálculo completo, integração multi-fonte

---

## Decisões Técnicas Obrigatórias (Antes de Qualquer Código)

### **1. ORM: Prisma vs. TypeORM**
- **Recomendação:** Prisma
  - Suporte nativo Replit PostgreSQL
  - Schema declarativo mais legível
  - Migrations automáticas seguras
  - Type-safety excelente com TypeScript
- **Alternativa:** TypeORM (mais verbose, mais controle)
- **Impacto:** Afeta toda persistência (Phase 1+)
- **Decisão necessária:** Sim, antes de Phase 1

### **2. CSS: Tailwind vs. CSS Modules**
- **Recomendação:** Tailwind
  - Prototipagem rápida (crítico em MVP)
  - Consistência de espaçamento/cores
  - Bundle menor do que CSS Modules
  - Melhor suporte a dark mode (futuro)
- **Alternativa:** CSS Modules (mais encapsulação)
- **Impacto:** Afeta todos componentes React (Phase 5+)
- **Decisão necessária:** Sim, antes de Phase 5

### **3. Estrutura .env e Variáveis**
- **Necessário definir:**
  - `DATABASE_URL` (Replit Postgres)
  - `JWT_SECRET` (geração segura, min 32 chars)
  - `JWT_REFRESH_SECRET` (diferente do access)
  - `NODE_ENV` (development/production)
  - `VITE_API_URL` (frontend → backend)
  - `FIPEZAP_API_BASE` (TBD: existe API pública?)
  - `CUB_DATA_SOURCE` (TBD: endpoint ou arquivo?)
- **Arquivo template:** `.env.example` com instruções
- **Decisão necessária:** Sim, antes de Phase 1

### **4. Autenticação: Estratégia de Refresh Tokens**
- **Recomendação:**
  - Access token: 15 min (JTI claim para revoke)
  - Refresh token: 7 dias (httpOnly cookie)
  - Endpoint POST `/auth/refresh` sem credenciais (usa cookie)
- **Impacto:** Auth flow (Phase 1, Phase 5)
- **Decisão necessária:** Sim, antes de Phase 1

### **5. Validação: Zod vs. Joi vs. Manutenção**
- **Recomendação:** Zod
  - TypeScript-first
  - Composable schemas
  - Mensagens de erro customizáveis
  - Leve (<20KB)
- **Impacto:** Backend validation (Phase 1+)
- **Decisão necessária:** Sim, antes de Phase 1

### **6. PDF/HTML Export: Biblioteca**
- **Recomendação:**
  - PDF: `pdfkit` ou `puppeteer` (renderiza HTML→PDF)
  - HTML: Geração de string + CSS inline
- **TBD:** Avaliar disponibilidade em Replit
- **Decisão necessária:** Sim, antes de Phase 8

### **7. Testes: Jest vs. Vitest**
- **Recomendação:** Vitest (mais rápido, Vite-native)
- **Escopo mínimo:** Motor de cálculo + Auth + API validation
- **Decisão necessária:** Sim, antes de Phase 3

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
- Pastas: `/server`, `/src`, `/prisma`

**Entregável Testável:**
- `npm install` sem erros
- `npm run dev` lança Vite + Express simultâneos
- Endpoints `/api/v1/health` responde `{ ok: true }`

**Decisões Resolvidas:**
- ✅ ORM escolhido (Prisma)
- ✅ CSS escolhido (Tailwind)
- ✅ Validação escolhida (Zod)
- ✅ Testes escolhidos (Vitest)
- ✅ `.env` estruturado

**Complexidade:** Baixa (1 dia)  
**Arquivos Tocados:** ~15 novos

**Riscos/Consultas:**
- Replit tem suporte Prisma nativo? → Testar em Fase 1
- PostgreSQL em Replit já vem pré-criado? → Confirmar variável `DATABASE_URL`

**Modelo Sugerido:** Sonnet 5  
*Razão:* Setup boilerplate, decisões já mapeadas

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
- `server/data/mock-fipezap.json` (hardcoded até integração)
- `server/data/mock-cub.json` (hardcoded até integração)

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
- `server/utils/pdfGenerator.ts` (usando pdfkit ou puppeteer)
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
- `pdfkit` vs `puppeteer`? Testar ambos em Replit
- Arquivo temporário ou em-memory para PDF? → Recomendar stream em-memory

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

### **FASE 10: Integração Dados Externos (FipeZap e CUB)**

**Descrição:** Substituir mocks por integração real com APIs de FipeZap e Sinduscon-MG (CUB). Cache e fallback.

**Arquivos Criados/Modificados:**
- `server/services/fipezapService.ts` (fetch dados FipeZap)
- `server/services/cubService.ts` (fetch dados Sinduscon-MG)
- `server/utils/cache.ts` (cache em memory ou Redis-like)
- `prisma/schema.prisma` (adicionar tabela ExternalDataCache)
- `server/jobs/updateExternalData.ts` (cron job, atualizar dados mensais)
- `server/routes/externalData.ts` (GET status de atualização)

**Entregável Testável:**
- GET `/api/v1/data/fipezap?region=MG&tipologia=Multifamiliar` → dados reais FipeZap
- GET `/api/v1/data/cub` → dados reais Sinduscon-MG
- Dados cached por 24h (TBD: frequência)
- Alerta se dados > 30 dias desatualizados
- Fallback para último snapshot se API indisponível
- Teste: desligar internet → fallback funciona

**Complexidade:** Média-Alta (3-4 dias)  
**Arquivos Tocados:** ~8 novos

**Riscos/Consultas:**
- FipeZap tem API pública? Qual a documentação? → **NECESSÁRIO PESQUISAR ANTES**
- CUB Sinduscon-MG tem endpoint REST? Formato? → **NECESSÁRIO PESQUISAR ANTES**
- Permissões CORS? Rate limits? Autenticação? → **INVESTIGAR**

**Modelo Sugerido:** Sonnet 5  
*Razão:* Integração com APIs externas, tratamento de erros de rede, cache strategy, fallback logic

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
- `.github/workflows/ci.yml` (lint, test, build, deploy)
- `Dockerfile` (opcional, se não usar Replit deploy direto)
- `README.md` (instruções de dev/prod)

**Entregável Testável:**
- `npm run test:e2e` executa suite completa
- Todas as linhas de fluxo happy-path cobertas
- CI passa em cada push
- Deploy automático em staging funciona
- App em staging acessível e operacional

**Complexidade:** Média (2-3 dias)  
**Arquivos Tocados:** ~8 novos

**Riscos/Consultas:**
- Headless Chrome em Replit? → Verificar permissões
- Qual é o ambiente staging? → Recomendar Replit Preview URLs ou branch staging

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
- [ ] Decisões técnicas documentadas e aprovadas
- [ ] `.env.example` pronto
- [ ] Repo estruturado com pastas corretas

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
- [ ] **[CRÍTICO]** Pesquisar disponibilidade APIs FipeZap/CUB

### Antes de Fase 12
- [ ] UX responsiva em mobile/desktop
- [ ] Onboarding visível novo usuário

---

## Pontos de Consulta Obrigatórios (Bloqueadores Potenciais)

### **1. APIs Externas (CRÍTICO — antes Fase 10)**
- FipeZap: Existe API pública REST? Documentação? Rate limits? CORS?
- CUB Sinduscon-MG: Existe endpoint? Formato? Autenticação?
- **Impacto:** Se não houver, usar dados estáticos ou web scraping (risco maior)

### **2. Replit PostgreSQL (antes Fase 1)**
- Variável `DATABASE_URL` já vem pré-criada em Replit?
- Suporta `npx prisma migrate` sem problemas?
- **Impacto:** Se não, ajustar tipo ORM ou usar diferentes conexões dev/prod

### **3. PDF/HTML Export (antes Fase 8)**
- `pdfkit` disponível em Replit sem problemas?
- Alternativa `puppeteer` é viável (requer Chromium)?
- **Impacto:** Se não, considerar serverless (ex: AWS Lambda) ou biblioteca alternativa

### **4. Metodologia LASTRO Score (antes Fase 3)**
- PRD§4.3 diz "a ser definida durante desenvolvimento"
- Necessário definir pesos antes de code? (40% viabilidade, 30% normalidade, 20% risco, 10% mercado?)
- **Impacto:** Sem definição, código é placeholder

### **5. Detalhes de Projeto por Tipologia (antes Fase 6)**
- PRD§2.2 diz "detalhes serão definidos por hardcoding"
- Qual é a lista completa de campos para Multifamiliar/Comercial/etc?
- **Impacto:** UI será incomplete se campos não especificados

---

## Riscos Técnicos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|--------|-----------|
| APIs externas indisponíveis | Média | Alto | Pesquisar cedo (Fase 10), manter mock como fallback |
| Performance cálculo com ajustes reais-time > 500ms | Baixa | Médio | Usar Web Worker se necessário, cache de resultados |
| Replit limitações (DB, storage, CPU) | Média | Alto | Testar escalabilidade em Fase 1, migrar se necessário |
| Segurança JWT (token expiração, refresh) | Baixa | Alto | Review código Fase 1 com security expert |
| Compatibilidade navegadores antigos | Baixa | Baixo | Testar Chrome/Firefox/Safari atualizados |

---

## Decisões Técnicas Pendentes (Roadmap)

Estas decisões podem esperar até Fase executada, mas precisam ser **resolvidas antes de code**:

1. **ORM** → Prisma ✅ (recomendado)
2. **CSS** → Tailwind ✅ (recomendado)
3. **Validação** → Zod ✅ (recomendado)
4. **PDF Generator** → pdfkit vs puppeteer (testar Fase 0)
5. **Cache** → in-memory vs Redis (recomendado: in-memory v1, Redis futuro)
6. **Logger** → console vs winston (recomendado: console v1)
7. **API Rate Limiting** → express-rate-limit (adicionar Fase 1)

---

## Notas Arquiteturais

### Motor de Cálculo
- **Fns puras e testáveis** em `server/utils/calculator.ts`
- Zero dependência de DB ou UI
- Todos inputs/outputs são números (evita erros de tipo)
- Testes cobrindo fórmulas + arredondamentos

### Separação Frontend/Backend
- Frontend nunca calcula valores monetários (sempre confia no backend)
- Validações espelhadas (frontend UX, backend security)
- API v1 versioned (`/api/v1/*`) para futuras mudanças

### Segurança
- JWT com refresh tokens
- Senhas bcrypt
- CORS apenas para origin Replit
- Validação entrada com Zod em todos endpoints
- Proteção contra limit 3 análises por usuário (validado backend)

---

## Como Usar Este Plano

1. **Antes de escrever qualquer código:** Resolver todas decisões técnicas (Seção "Decisões Obrigatórias")
2. **Executar fases sequencialmente** conforme dependências (diagrama Critical Path)
3. **Após cada fase:** Validar checkpoint antes de próxima
4. **Bloqueado em ponto de consulta?** → Escalhar imediatamente, não avançar
5. **Mudança de escopo?** → Atualizar plano, não ignorar

---

**Status:** Pronto para Desenvolvimento  
**Próximo Passo:** Resolver decisões técnicas obrigatórias + iniciar Fase 0
