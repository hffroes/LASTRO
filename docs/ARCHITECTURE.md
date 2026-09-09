# 🏗️ Arquitetura do LASTRO

Visão geral da arquitetura de sistema e organização técnica do monorepo LASTRO.

---

## 📐 Visão Geral

LASTRO é um **monorepo** que hospeda múltiplos produtos independentes que compartilham infraestrutura e componentes reutilizáveis.

```
┌─────────────────────────────────────────────────────┐
│                    LASTRO Monorepo                   │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  Produto 1   │  │  Produto 2   │  │Produto 3 │  │
│  │  (Motor A)   │  │  (Motor B)   │  │(Motor C) │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│         │                 │                 │       │
│         └─────────────────┼─────────────────┘       │
│                           │                         │
│         ┌─────────────────▼──────────────────┐      │
│         │      Código Compartilhado (Shared) │      │
│         │  - Componentes                     │      │
│         │  - Utilitários                     │      │
│         │  - Bibliotecas                     │      │
│         │  - Infraestrutura                  │      │
│         └────────────────────────────────────┘      │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  CI/CD - GitHub Actions                      │   │
│  │  - Test                                      │   │
│  │  - Lint                                      │   │
│  │  - Build                                     │   │
│  │  - Deploy                                    │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Componentes Principais

### 1. Produtos Independentes (`products/`)

Cada produto é um motor/serviço independente com seu próprio:

- **Código-fonte** (`src/`)
- **Testes** (`tests/`)
- **Documentação** (`prd.md`, `claude.md`, `planning/`)
- **Dependências** (`package.json`)
- **Configuração** (`.env`, CI/CD específico)

**Vantagens:**
- ✅ Isolamento de dependências
- ✅ CI/CD por produto
- ✅ Deploy independente
- ✅ Times autônomos

**Desvantagens:**
- ❌ Potencial duplicação de código
- ❌ Mais pastas para gerenciar

### 2. Código Compartilhado (`shared/`)

Componentes, utilitários e bibliotecas reutilizados por múltiplos produtos.

**Estrutura:**
```
shared/
├── components/     # Componentes genéricos
├── utils/          # Funções utilitárias
├── lib/            # Bibliotecas/SDKs
└── infrastructure/ # Setup, Docker, scripts
```

**Quando usar:**
- Código duplicado em 2+ produtos
- Infraestrutura comum
- Componentes genéricos

**Quando NÃO usar:**
- Lógica específica de 1 produto
- Código experimental
- Coisas tightly-coupled

---

## 🔄 Workflow de Desenvolvimento

### 1. Feature Simples (dentro de um produto)

```
developer
  ↓
create branch: claude/feature/produto-1/minha-feature
  ↓
editar: products/produto-1/src/...
         products/produto-1/tests/...
  ↓
git push
  ↓
CI roda: ci-produto-1.yml
  ├─ npm test
  ├─ npm lint
  └─ npm build
  ↓
pull request review
  ↓
merge em develop
  ↓
GitHub Actions deploy staging
  ↓
CI roda em main → deploy production
```

### 2. Feature Compartilhada (afeta shared/)

```
developer
  ↓
create branch: claude/refactor/shared/novo-componente
  ↓
editar: shared/components/...
        shared/utils/...
  ↓
git push
  ↓
CI roda: ci-shared.yml
  ├─ npm test
  ├─ ALERTA: "Mudanças em shared/ afetam todos!"
  └─ Manual test dos produtos impactados
  ↓
pull request (REVIEW CUIDADOSO)
  ↓
merge
  ↓
CI roda testes de TODOS os produtos
  ↓
deploy com cuidado
```

---

## 🤖 CI/CD Pipeline

### Estrutura de Workflows

```
.github/workflows/
├── ci-produto-1.yml      # Testa apenas produto-1
├── ci-produto-2.yml      # Testa apenas produto-2
├── ci-produto-3.yml      # Testa apenas produto-3
├── ci-shared.yml         # Testa shared/ + ALERTA
├── lint-all.yml          # Lint em todo repo
└── deploy-main.yml       # Deploy produção
```

### Matriz de Teste

| Mudança | CI Acionado | Produtos Testados |
|---------|-----------|-------------------|
| `products/produto-1/**` | `ci-produto-1.yml` | produto-1 |
| `products/produto-2/**` | `ci-produto-2.yml` | produto-2 |
| `shared/**` | `ci-shared.yml` | shared + todos produtos |
| Todos | `lint-all.yml` | lint global |

### Status de Merge

Uma PR só pode ser mergeada se:

```
✅ Todos os CI workflows passaram
✅ Pelo menos 1 review aprovado
✅ Sem conflitos com develop
✅ Descrição clara (título + corpo)
✅ Labels corretos (produto + tipo)
```

---

## 📊 Banco de Dados

### Estratégia

Cada produto pode ter seu próprio database:

```
Produto 1 → PostgreSQL (produto-1-db)
Produto 2 → MongoDB (produto-2-db)
Produto 3 → Redis (produto-3-cache)

Shared → [Sistema centralizado de cache]
```

### Migrations

```bash
# Cada produto gerencia suas migrations
products/produto-1/db/migrations/001_init.sql

# Rode antes de deploy
npm run db:migrate
```

---

## 🚀 Deploy Strategy

### Ambientes

```
┌─────────────────────────────────────────┐
│     LOCAL (seu computador)              │
│  npm run dev                            │
└─────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│     STAGING (teste)                     │
│  Automático ao push em 'develop'        │
│  https://staging-produto-1.example.com  │
└─────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│     PRODUCTION (usuários reais)         │
│  Automático ao push em 'main'           │
│  Versão com git tag v1.0.0              │
│  https://produto-1.example.com          │
└─────────────────────────────────────────┘
```

### Processo de Deploy

```
1. Commit & Push
   ↓
2. CI testa tudo
   ↓
3. Deploy Automático
   ├─ Staging: ao fazer push em develop
   ├─ Produção: ao fazer push em main (tag v.x.x.x)
   ↓
4. Health Check
   ├─ APIs respondendo?
   ├─ Database conectado?
   ├─ Testes de smoke?
   ↓
5. Notificação
   ├─ Sucesso: 🟢
   └─ Erro: 🔴 (auto rollback)
```

---

## 🔐 Segurança

### Secrets & Environment Variables

```bash
# .env (local, nunca commitar)
DATABASE_URL=postgresql://...
API_KEY=secret-key
JWT_SECRET=secret-jwt

# GitHub Secrets
Settings → Secrets and variables
├─ DATABASE_URL
├─ API_KEY
└─ JWT_SECRET
```

### Branch Protection

Branch `main` está protegida:
- ✅ Requer review
- ✅ Requer CI verde
- ✅ Requer sem conflitos
- ❌ Proíbe force-push

---

## 📈 Escalabilidade

### Como Adicionar Novo Produto?

```
1. Criar: products/novo-produto/
2. Estrutura: Copiar de products/TEMPLATE_README.md
3. CI/CD: Criar .github/workflows/ci-novo-produto.yml
4. Atualizar: products/PRODUCTS.md
5. Documentar: prd.md, claude.md
6. Deploy: Configurar staging + produção
```

### Como Refatorar Código Compartilhado?

```
1. Identificar duplicação
2. Criar PR em shared/
3. Mover código
4. Atualizar imports em todos produtos
5. Testar impacto (todos os testes)
6. Merge cuidadoso
```

---

## 🧪 Testes

### Estratégia de Teste

```
┌─────────────────────────────┐
│   Unit Tests (rápido)       │ ← 80% de testes
│  - Funções isoladas         │
│  - Helpers, utils           │
│  - Componentes              │
└─────────────────────────────┘
             ↓
┌─────────────────────────────┐
│ Integration Tests (médio)   │ ← 15% de testes
│  - APIs + Database          │
│  - Fluxos de negócio        │
│  - Múltiplos componentes    │
└─────────────────────────────┘
             ↓
┌─────────────────────────────┐
│   E2E Tests (lento)         │ ← 5% de testes
│  - Fluxos completos         │
│  - Usuário real             │
│  - UI + Backend + DB        │
└─────────────────────────────┘
```

### Coverage

- **Meta:** 80%+
- **Critical paths:** 100%
- **Shared code:** 95%+

```bash
npm test -- --coverage
# coverage/index.html
```

---

## 📚 Documentação

### Por Produto

```
products/produto-1/
├── claude.md           # Visão técnica
├── prd.md              # Requirements
├── README.md           # Como começar
└── planning/
    ├── roadmap.md      # Roadmap
    ├── architecture.md # Design
    └── decisions.md    # ADRs
```

### Global

```
docs/
├── ARCHITECTURE.md     # Este arquivo
├── CONTRIBUTION.md     # Como contribuir
├── deployment.md       # Deploy strategy
└── glossary.md         # Termos usados
```

---

## 🔄 Fluxo de Código

```
┌──────────────────┐
│  Local Dev       │
│  Branch: claude/ │
│  feature/...     │
└────────┬─────────┘
         │
         ▼
    ┌─────────────┐
    │  git push   │
    └──────┬──────┘
           │
           ▼
    ┌──────────────┐
    │  PR Created  │
    └──────┬───────┘
           │
           ▼
    ┌─────────────────────┐
    │  CI/CD Runs         │
    │  ├─ Tests           │
    │  ├─ Lint            │
    │  ├─ Build           │
    │  └─ Report Status   │
    └──────┬──────────────┘
           │
      ┌────┴─────┐
      │           │
     PASS       FAIL
      │           │
      ▼           ▼
   ┌────┐    ┌──────────┐
   │Revie│   │ Fix code │
   │w    │   │ and push │
   └──┬──┘   └─────┬────┘
      │            │
      │      ┌─────┘
      │      │
      ▼      ▼
   ┌──────────────┐
   │  Merge       │
   └────┬─────────┘
        │
        ▼
   ┌──────────────────┐
   │ develop branch   │
   │ Deploy staging   │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │ Teste manual +   │
   │ validação        │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │ Release tag      │
   │ v1.0.0           │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │ main branch      │
   │ Deploy production│
   └──────────────────┘
```

---

## 🛠️ Tech Stack Padrão

Recomendações (use o que fizer sentido para seu produto):

| Aspecto | Recomendação | Alternativas |
|---------|-------------|--------------|
| Runtime | Node.js 20+ | Python, Go, Rust |
| Language | TypeScript | JavaScript |
| Web Framework | Express/Fastify | Nest.js, Koa |
| Database | PostgreSQL | MongoDB, Redis |
| Testing | Jest | Vitest, Mocha |
| Linting | ESLint | Biome |
| Container | Docker | Podman |
| Orchestration | Kubernetes | Docker Compose |
| Deploy | GitHub Actions | GitLab CI |

---

## 📞 Support

- 📖 Documentação: `ORGANIZATION.md`, `CONTRIBUTION.md`
- 🐛 Issues: GitHub Issues com label do produto
- 💬 Slack: Canal do produto
- 👤 Proprietário: Listar em `products/PRODUCTS.md`

---

**Última atualização:** 2026-09-09  
**Versão:** 1.0  
**Mantido por:** LASTRO Team
