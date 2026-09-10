# LASTRO MVP — Tabela de Fases

| Fase | O Que Será Feito | Modelo | Tempo | Complexidade | Dependências |
|------|-----------------|--------|-------|--------------|--------------|
| **0** | Setup: Vite+Express single-port, Prisma, Tailwind, `/shared/schemas`, .env template | Sonnet | 1 dia | Baixa | Nenhuma |
| **1** | Backend Auth: User model, JWT (access 15min + refresh 7d httpOnly), bcrypt, middleware, rate limiting | Sonnet | 2 dias | Média | Fase 0 |
| **2** | Dados Base: Tipologias, percentuais, ajustes CUB, coeficientes IA, `StaticAdapter` (JSON), seed DB | Sonnet | 2 dias | Baixa | Fase 0 |
| **3** | Motor Cálculo: Funções puras (VGV, custos, viabilidade, LASTRO Score), testes unitários (Vitest) | Sonnet | 3 dias | **Alta** | Fases 1, 2 |
| **4** | CRUD Análises: Analysis model, endpoints create/list/get/delete, validar limite 3, teste autorização | Sonnet | 2 dias | Média | Fases 1, 3 |
| **5** | Frontend Auth: React setup, login/signup pages, AuthContext, ProtectedRoute, token storage | Sonnet | 3 dias | Média | Fase 1 |
| **6** | Formulário Multi-step: Terreno, tipologia, detalhes projeto, dados venda, validação Zod (schemas compartilhados) | Sonnet | 2 dias | Média | Fases 2, 5 |
| **7** | Resultado Interativo: Score card, cost table, alerts, real-time ajustes (preço/lucro/terreno), UI responsiva | Sonnet | 3 dias | **Alta** | Fases 3, 4, 6 |
| **8** | Export Backend: PDF generator (**pdfkit**), HTML template inline, endpoints /api/v1/export/* | Sonnet | 2 dias | Média | Fase 4 |
| **9** | Export Frontend: Download PDF button, share link (copy clipboard), public result page, history actions | Sonnet | 1 dia | Baixa | Fases 7, 8 |
| **10** | Adapter APIs Externas: investigar FipeZap/CUB reais, `HttpAdapter` se confirmado, cache lazy + fallback | Sonnet | 3 dias | Média | Fase 4 |
| **11** | UX Refinement: Onboarding slideshow, tooltips, mobile responsividade, cores/tipografia, help modals | Sonnet | 2 dias | Baixa | Fase 9 |
| **12** | Testes E2E & Deploy: Playwright happy-path + auth + calculations, CI (lint+test), Replit Deployments nativo | Opus | 2 dias | Média | Fase 11 |

---

## Resumo por Modelo

| Modelo | Fases | Total | Razão |
|--------|-------|-------|-------|
| **Sonnet** | 0-11 | 29 dias | Todas as fases de desenvolvimento — backend, frontend, integrações, refinamento |
| **Opus** | 12 | 2 dias | Testes E2E e validação final — garantia de qualidade e cobertura completa |

---

## Critical Path (Sequência Mínima Obrigatória)

```
0 (1d) → 1 (2d) → 3 (3d) → 5 (3d) → 6 (2d) → 7 (3d)
                   ↑       ↑        ↑
                   └─ 2 (2d) pode rodar em paralelo com 1
                   └─ 4 (2d) pode rodar em paralelo com 5
                   └─ 8 (2d) pode rodar em paralelo com 6-7

Critical Path = 17 dias mínimos (0+1+3+5+6+7)
Restante pode ser distribuído = +13-14 dias
Total sequencial = 30-31 dias
```

---

## Fases Pesadas (⭐ 3+ dias cada)

| Fase | Razão da Complexidade |
|------|----------------------|
| **3** | Fórmulas econômicas, arredondamentos corretos, LASTRO Score, testes exaustivos, revisão de segurança |
| **7** | Integração completa (frontend+backend), re-cálculo real-time, múltiplos componentes dinâmicos |

*Fase 10 deixou de ser "alta complexidade": o Adapter Pattern isola o risco de API externa — a fase se resume a investigação + (opcional) implementação de um `HttpAdapter` plugável, sem cron job (lazy refresh sob demanda).*

---

## Entregáveis Visíveis por Fase

| Fase | Você Verá / Testará |
|------|-------------------|
| 0 | `npm run dev` → Vite + Express rodando |
| 1 | POST /auth/signup e /auth/login funcionando (curl/Postman) |
| 2 | GET /api/v1/parameters/* retorna dados corretamente |
| 3 | Testes passando: `npm run test` ✅ |
| 4 | POST /analyses cria análise, GET lista (max 3) |
| 5 | Login/logout funcionando, redirecionamento de rotas |
| 6 | Formulário multi-step preenchível, dados salvos em state |
| 7 | Resultado calcula e atualiza em tempo real ao ajustar premissas |
| 8 | Botão "Download PDF" gera arquivo PDF com resultado |
| 9 | Botão "Compartilhar" copia link público, URL pública abre resultado |
| 10 | Dados FipeZap/CUB via adapter — `HttpAdapter` se API confirmada, senão `StaticAdapter` permanece definitivo |
| 11 | Novo usuário vê onboarding, mobile funciona, cores visuais |
| 12 | Teste E2E executa fluxo completo: signup→análise→export ✅ |

---

## Checkpoints (Validar Antes de Próxima Fase)

| Após Fase | Validar |
|-----------|---------|
| 0 | Estrutura de pastas, deps instaladas, `npm run dev` funciona |
| 1 | Auth completa (signup, login, refresh), tokens válidos, senha bcrypt |
| 2 | Dados carregados no DB, endpoints `/parameters/*` retornam dados PRD |
| 3 | Testes unitários passam, fórmulas batem com exemplos PRD§4 |
| 4 | CRUD funciona, limite 3 análises validado, autorização testada |
| 5 | Auth frontend espelha backend, redireciona corretamente |
| 6 | Formulário captura todos campos, validação Zod funciona |
| 7 | Cálculo integrado, ajustes reais-time, UI responsiva |
| 8 | PDF gerado, HTML compartilhável, sem dados sensíveis públicos |
| 9 | Share link funciona, histórico mostra ações |
| 10 | Adapter trocável via `.env`, cache lazy funciona, fallback testado (não bloqueia se API não existir) |
| 11 | Onboarding visível, mobile sem scroll horizontal |
| 12 | E2E passa, deploy publicado via Replit Deployments |

