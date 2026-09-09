# 📋 Organização do LASTRO - Monorepo Guide

## Visão Geral

O LASTRO é organizado como um **monorepo** com múltiplos produtos independentes que compartilham infraestrutura e componentes comuns. Esta documentação define como organizar branches, pastas, issues e workflow de desenvolvimento.

---

## 📁 Estrutura de Pastas

```
LASTRO/
├── products/                   # Produtos independentes
│   ├── produto-1/
│   │   ├── claude.md          # Documentação do produto
│   │   ├── prd.md             # Product Requirements Document
│   │   ├── planning/          # Docs de planejamento, roadmap, sprints
│   │   ├── .claude/           # Configuração Claude Code local
│   │   │   ├── skills/
│   │   │   └── settings.json
│   │   ├── src/               # Código-fonte do motor de execução
│   │   ├── tests/             # Testes específicos do produto
│   │   ├── package.json       # Dependências (se JS/TS)
│   │   └── README.md
│   │
│   ├── produto-2/             # Mesma estrutura
│   ├── produto-3/             # Mesma estrutura
│   └── PRODUCTS.md            # Registro de todos os produtos
│
├── shared/                     # Código reutilizável entre produtos
│   ├── components/            # Componentes compartilhados
│   ├── utils/                 # Funções utilitárias
│   ├── lib/                   # Bibliotecas comuns
│   ├── infrastructure/        # Setup, CI/CD base, deploy scripts
│   ├── package.json           # Dependências compartilhadas
│   └── README.md              # Documentação de reutilização
│
├── design-system/             # Sistema de design (já existente)
│   └── ...
│
├── docs/                      # Documentação geral do LASTRO
│   ├── architecture.md        # Arquitetura geral
│   ├── contribution.md        # Guia de contribuição
│   ├── deployment.md          # Estratégia de deploy
│   └── glossary.md            # Termos usados no LASTRO
│
├── .github/
│   ├── workflows/
│   │   ├── ci-produto-1.yml   # CI/CD específico produto 1
│   │   ├── ci-produto-2.yml   # CI/CD específico produto 2
│   │   ├── ci-shared.yml      # CI/CD para código compartilhado
│   │   └── lint-all.yml       # Lint em todo o repo
│   │
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.md             # Template de bug report
│   │   ├── feature.md         # Template de feature request
│   │   └── product-doc.md     # Template para docs de produto
│   │
│   └── pull_request_template.md
│
├── .gitignore
├── ORGANIZATION.md            # Este arquivo
├── CONTRIBUTION.md            # Guia detalhado de contribuição
└── package.json               # Dependências globais (opcional)
```

---

## 🌿 Estratégia de Branches

### Padrão de Nomenclatura

```
claude/[tipo]/[produto]/[descrição]
       └─────  └───────  └──────────
        tipo   produto   description
```

### Tipos de Branches

#### 1. **Feature Branches** (novo trabalho)
```
claude/feature/produto-1/nome-da-feature
claude/feature/produto-2/integracao-api
claude/feature/shared/novo-componente-compartilhado
```

#### 2. **Bug Fix Branches**
```
claude/bugfix/produto-1/corrige-validacao
claude/bugfix/shared/memory-leak-utils
```

#### 3. **Refactor Branches**
```
claude/refactor/produto-1/reorganiza-estrutura
claude/refactor/shared/melhora-performance
```

#### 4. **Release Branches**
```
release/produto-1-v1.0
release/produto-2-v2.5
```

#### 5. **Hotfix Branches** (correções críticas em produção)
```
hotfix/produto-1-seguranca-v1.0.1
hotfix/produto-2-bug-critico-v2.5.1
```

### Branches Principais

- **`main`** - Produção, deploy automático
- **`develop`** - Integração contínua, staging
- Nenhuma branch `master`

---

## 🏷️ Sistema de Labels no GitHub

### Por Produto
```
produto-1, produto-2, produto-3, shared
```

### Por Tipo
```
tipo/bug
tipo/feature
tipo/refactor
tipo/documentation
tipo/chore
```

### Por Prioridade
```
prioridade/crítica
prioridade/alta
prioridade/média
prioridade/baixa
```

### Por Status
```
status/em-progresso
status/bloqueado
status/review-pendente
status/pronto-para-merge
```

### Por Área
```
área/engine
área/ui
área/api
área/infraestrutura
área/docs
```

### Exemplos de Issue
```
[produto-1] [tipo/feature] [prioridade/alta] Implementar novo motor de processamento
[shared] [tipo/refactor] [prioridade/média] Melhorar performance de validação
[produto-2] [tipo/bug] [prioridade/crítica] Fix crash na inicialização
```

---

## 📝 Pull Request Workflow

### 1. **Criar Branch do Correto**
```bash
git checkout develop
git pull origin develop
git checkout -b claude/feature/produto-1/minha-feature
```

### 2. **Nomear Corretamente**
```
[Produto 1] Descrição clara da mudança

- Descrição do que foi feito
- Por que foi feito
- Como testar

Closes #123
```

### 3. **Labels Obrigatórios na PR**
- 1 label de produto (`produto-1`, `produto-2`, ou `shared`)
- 1 label de tipo (`tipo/feature`, `tipo/bug`, etc.)
- Labels opcionais: prioridade, status, área

### 4. **Merge**
- Merge commit (não squash) para preservar histórico de produto
- Delete branch após merge
- CI deve estar 100% verde

---

## 🤖 CI/CD Workflow

### Workflow Automático no Push

```
Push para claude/feature/produto-1/*
    ↓
GitHub Actions dispara
    ├─ [ci-produto-1.yml] Testa APENAS produto-1/
    ├─ [ci-shared.yml] Testa shared/ (afetado?)
    ├─ [lint-all.yml] Lint em todo repo
    └─ Report status na PR
    ↓
Se TUDO passar ✅
    └─→ Pronto para merge
    
Se algo falhar ❌
    └─→ PR fica vermelha, mostrar erro
```

### Workflow no Merge em `main`

```
Merge para main
    ↓
GitHub Actions dispara deploy
    ├─ Run tests completos
    ├─ Build/compile
    ├─ Deploy em produção
    └─ Notificação de sucesso/erro
```

---

## 📋 Checklist para Novo Produto

Quando adicionar um novo produto ao LASTRO:

- [ ] Criar pasta `products/novo-produto/`
- [ ] Criar `products/novo-produto/claude.md`
- [ ] Criar `products/novo-produto/prd.md`
- [ ] Criar `products/novo-produto/planning/`
- [ ] Criar `products/novo-produto/src/`
- [ ] Criar `products/novo-produto/tests/`
- [ ] Criar workflow CI em `.github/workflows/ci-novo-produto.yml`
- [ ] Atualizar `products/PRODUCTS.md` com informações do novo produto
- [ ] Adicionar labels no GitHub para o novo produto
- [ ] Documentar dependências em `products/novo-produto/package.json`

---

## 🔗 Quando Usar `shared/`

Use código em `shared/` quando:

✅ **Reutilizar entre 2+ produtos**
✅ **Infraestrutura comum** (deploy, CI/CD base)
✅ **Componentes genéricos** que não são específicos de um produto
✅ **Utilitários comuns** (validação, helpers)

❌ **Não use** para:
- Lógica específica de um produto (vai em `products/produto-x/`)
- Código experimental (crie em seu produto primeiro, refatore depois)
- Coisas que só um produto usa

---

## 📚 Documentação Obrigatória

### Por Produto (`products/produto-x/`)
- **claude.md** - Visão geral, arquitetura, como rodar
- **prd.md** - Product Requirements
- **planning/roadmap.md** - Roadmap do produto
- **README.md** - Como começar a desenvolver

### Global (`docs/`)
- **architecture.md** - Arquitetura geral
- **contribution.md** - Guia detalhado (vem depois)
- **deployment.md** - Estratégia de deploy
- **glossary.md** - Termos usados

---

## 🚀 Exemplo Real

### Cenário: Desenvolver Feature no Produto 1

```bash
# 1. Atualizar develop
git checkout develop
git pull origin develop

# 2. Criar branch
git checkout -b claude/feature/produto-1/nova-validacao

# 3. Fazer mudanças apenas em:
# - products/produto-1/src/...
# - products/produto-1/tests/...

# 4. Commits claros
git commit -m "[Produto 1] Adiciona validação de email"

# 5. Push
git push -u origin claude/feature/produto-1/nova-validacao

# 6. Abrir PR no GitHub com labels:
# - produto-1
# - tipo/feature
# - prioridade/média

# 7. CI roda automaticamente
# - ci-produto-1.yml testa products/produto-1/
# - lint-all.yml checa style

# 8. Após aprovação, fazer merge
# (GitHub deleta branch automaticamente)
```

---

## 📞 Dúvidas?

Consulte:
- `docs/contribution.md` - Guia detalhado
- `products/PRODUCTS.md` - Registro de produtos
- `.github/workflows/` - Configuração de CI/CD
- Issues com label `tipo/documentation`

---

**Versão:** 1.0  
**Última atualização:** 2026-09-09  
**Mantido por:** LASTRO Team
