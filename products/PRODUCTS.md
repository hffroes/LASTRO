# 📦 Produtos LASTRO

Registro centralizado de todos os produtos desenvolvidos no LASTRO.

---

## 📋 Índice de Produtos

| Produto | Status | Versão | Descrição | Proprietário |
|---------|--------|---------|-----------|--------------|
| [Produto 1](#produto-1) | 🟢 Ativo | 1.0.0 | [Descrição] | @time-1 |
| [Produto 2](#produto-2) | 🟢 Ativo | 2.1.0 | [Descrição] | @time-2 |
| [Produto 3](#produto-3) | 🟡 Beta | 0.5.0 | [Descrição] | @time-3 |

---

## Produto 1

### 📌 Informações Gerais

- **Caminho no repo:** `products/produto-1/`
- **Status:** 🟢 Ativo em produção
- **Versão Atual:** 1.0.0
- **Proprietário:** @seu-usuario
- **Time:** [Nome da time]

### 📝 Documentação

- [claude.md](./produto-1/claude.md) - Visão geral técnica
- [prd.md](./produto-1/prd.md) - Product Requirements
- [README.md](./produto-1/README.md) - Como começar
- [planning/](./produto-1/planning/) - Documentação de planejamento

### 🔧 Stack Técnico

- **Linguagem:** JavaScript/TypeScript
- **Framework:** [Node.js / Express / Outro]
- **Database:** [PostgreSQL / MongoDB / Outro]
- **Deploy:** [AWS / Vercel / Outro]

### 🚀 Como Começar

```bash
cd products/produto-1
npm install
npm run dev
```

### 🧪 Testes

```bash
cd products/produto-1
npm test
npm run test:coverage
```

### 📊 Métricas

- **Último Deploy:** 2026-09-01
- **Build Time:** ~5 minutos
- **Test Coverage:** 85%
- **Uptime:** 99.9%

### 🔗 Links Úteis

- [GitHub Issues do Produto 1](https://github.com/hffroes/lastro/issues?q=label%3Aproduto-1)
- [CI/CD Workflow](../.github/workflows/ci-produto-1.yml)
- [Staging](https://staging-produto-1.example.com)
- [Produção](https://produto-1.example.com)

---

## Produto 2

### 📌 Informações Gerais

- **Caminho no repo:** `products/produto-2/`
- **Status:** 🟢 Ativo em produção
- **Versão Atual:** 2.1.0
- **Proprietário:** @seu-usuario-2
- **Time:** [Nome da time]

### 📝 Documentação

- [claude.md](./produto-2/claude.md)
- [prd.md](./produto-2/prd.md)
- [README.md](./produto-2/README.md)
- [planning/](./produto-2/planning/)

### 🔧 Stack Técnico

- **Linguagem:** Python / JavaScript
- **Framework:** [FastAPI / Django / Outro]
- **Database:** [PostgreSQL / Redis / Outro]
- **Deploy:** [Docker / Kubernetes / Outro]

### 🚀 Como Começar

```bash
cd products/produto-2
npm install  # ou pip install -r requirements.txt
npm run dev
```

### 🧪 Testes

```bash
cd products/produto-2
npm test
```

### 📊 Métricas

- **Último Deploy:** 2026-08-28
- **Build Time:** ~8 minutos
- **Test Coverage:** 92%
- **Uptime:** 99.95%

### 🔗 Links Úteis

- [GitHub Issues do Produto 2](https://github.com/hffroes/lastro/issues?q=label%3Aproduto-2)
- [CI/CD Workflow](../.github/workflows/ci-produto-2.yml)
- [Staging](https://staging-produto-2.example.com)
- [Produção](https://produto-2.example.com)

---

## Produto 3

### 📌 Informações Gerais

- **Caminho no repo:** `products/produto-3/`
- **Status:** 🟡 Beta / Em desenvolvimento
- **Versão Atual:** 0.5.0
- **Proprietário:** @seu-usuario-3
- **Time:** [Nome da time]

### 📝 Documentação

- [claude.md](./produto-3/claude.md)
- [prd.md](./produto-3/prd.md)
- [README.md](./produto-3/README.md)
- [planning/](./produto-3/planning/)

### 🔧 Stack Técnico

- **Linguagem:** Go / Rust / Outro
- **Framework:** [Gin / Rocket / Outro]
- **Database:** [DynamoDB / Cassandra / Outro]
- **Deploy:** [CloudRun / EC2 / Outro]

### 🚀 Como Começar

```bash
cd products/produto-3
npm install
npm run dev
```

### 🧪 Testes

```bash
cd products/produto-3
npm test
```

### 📊 Métricas

- **Último Deploy:** 2026-09-05 (staging)
- **Build Time:** ~3 minutos
- **Test Coverage:** 78%
- **Status:** Não em produção ainda

### 🔗 Links Úteis

- [GitHub Issues do Produto 3](https://github.com/hffroes/lastro/issues?q=label%3Aproduto-3)
- [CI/CD Workflow](../.github/workflows/ci-produto-3.yml)
- [Staging](https://staging-produto-3.example.com)
- [Roadmap](./produto-3/planning/roadmap.md)

---

## 🔄 Código Compartilhado

Alguns produtos compartilham código em `shared/`:

### Componentes Compartilhados (`shared/components/`)
- [Validadores](../shared/components/)
- [UI Components](../shared/components/)
- [Form Builders](../shared/components/)

### Utilitários (`shared/utils/`)
- [Validação](../shared/utils/)
- [Transformação de Dados](../shared/utils/)
- [Helpers](../shared/utils/)

### Bibliotecas (`shared/lib/`)
- [API Clients](../shared/lib/)
- [Database Connectors](../shared/lib/)

### Infraestrutura (`shared/infrastructure/`)
- [Docker Images](../shared/infrastructure/)
- [CI/CD Base](../shared/infrastructure/)
- [Deploy Scripts](../shared/infrastructure/)

---

## 📊 Estatísticas Globais

```
Total de Produtos: 3
Ativos em Produção: 2
Em Beta/Desenvolvimento: 1
Linhas de Código: ~150k
Cobertura de Testes: ~85%
Última Atualização: 2026-09-09
```

---

## 🤝 Colaboração

### Adicionar um Novo Produto

1. Criar pasta `products/novo-produto/`
2. Copiar estrutura de um produto existente
3. Atualizar este arquivo (PRODUCTS.md)
4. Criar workflow CI/CD em `.github/workflows/`
5. Adicionar labels no GitHub
6. Criar issue de documentação inicial

### Deletar/Arquivar um Produto

1. Marcar como "Arquivado" neste arquivo
2. Mover para branch `archived/`
3. Manter histórico git intacto
4. Documentar razão do arquivamento

---

## 📚 Templates e Checklists

### Checklist Novo Produto
- [ ] Pasta criada em `products/`
- [ ] claude.md escrito
- [ ] prd.md documentado
- [ ] README.md com instruções de setup
- [ ] package.json com dependências
- [ ] .github/workflows/ci-produto.yml criado
- [ ] Labels do produto criados no GitHub
- [ ] Entrada adicionada aqui (PRODUCTS.md)
- [ ] Time designada
- [ ] Proprietário designado

---

## 📞 Contatos

| Produto | Proprietário | Slack | Email |
|---------|--------------|-------|-------|
| Produto 1 | @user1 | #produto-1 | user1@example.com |
| Produto 2 | @user2 | #produto-2 | user2@example.com |
| Produto 3 | @user3 | #produto-3 | user3@example.com |
| Shared | @lead | #shared-engineering | lead@example.com |

---

## 🔄 Atualização

Este documento deve ser atualizado quando:
- ✅ Novo produto é adicionado
- ✅ Versão é released
- ✅ Status muda (Ativo → Arquivado, Beta → Produção)
- ✅ Stack técnico muda
- ✅ Proprietário/time muda

**Última atualização:** 2026-09-09  
**Mantido por:** LASTRO Team
