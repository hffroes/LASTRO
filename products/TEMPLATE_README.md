# 📦 [NOME DO PRODUTO]

> Descrição breve do que é este produto

**Status:** 🟢 Ativo | **Versão:** 1.0.0 | **Proprietário:** @seu-usuario

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Quick Start](#quick-start)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Desenvolvimento](#desenvolvimento)
5. [Testes](#testes)
6. [Deploy](#deploy)
7. [Documentação](#documentação)
8. [Troubleshooting](#troubleshooting)

---

## 👀 Visão Geral

### O Que É?

[Descrição clara do produto em 2-3 frases]

### Para Quem?

[Público-alvo: desenvolvedores, usuários finais, etc]

### Por Quê?

[Qual problema resolve]

### Stack Técnico

| Aspecto | Tecnologia |
|---------|-----------|
| Linguagem | JavaScript/TypeScript |
| Runtime | Node.js 20+ |
| Framework | Express / Nest.js / Outro |
| Database | PostgreSQL / MongoDB / Outro |
| Deploy | Docker / AWS / Vercel |
| CI/CD | GitHub Actions |

---

## 🚀 Quick Start

### Pré-requisitos

```bash
# Verificar versões
node --version    # v20.0.0 ou maior
npm --version     # v10.0.0 ou maior
git --version
```

### Setup Inicial

```bash
# 1. Clonar o repo (se não tiver feito)
git clone https://github.com/hffroes/lastro.git
cd lastro

# 2. Entrar na pasta do produto
cd products/[nome-do-produto]

# 3. Instalar dependências
npm install

# 4. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com seus valores

# 5. Executar em desenvolvimento
npm run dev
```

Pronto! Sua app está rodando em `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
products/[nome-do-produto]/
├── src/
│   ├── index.js              # Entry point
│   ├── app.js                # App setup
│   ├── routes/               # Rotas/endpoints
│   │   ├── api.js
│   │   └── auth.js
│   ├── controllers/          # Lógica de negócio
│   ├── models/               # Estrutura de dados
│   ├── middleware/           # Middlewares
│   ├── utils/                # Helpers
│   └── config/               # Configuração
│
├── tests/
│   ├── unit/                 # Testes unitários
│   ├── integration/          # Testes de integração
│   └── fixtures/             # Dados de teste
│
├── planning/
│   ├── roadmap.md            # Roadmap do produto
│   ├── architecture.md       # Arquitetura técnica
│   ├── decisions.md          # Decisões arquiteturais
│   └── database-schema.md    # Schema do banco
│
├── claude.md                 # Documentação Claude Code
├── prd.md                    # Product Requirements Document
├── .env.example              # Template de env vars
├── package.json
└── README.md                 # Este arquivo
```

---

## 🛠️ Desenvolvimento

### Rodar Localmente

```bash
npm run dev
```

Logs e hot reload automático.

### Estrutura de Branches

```
develop
└─ claude/feature/[nome-do-produto]/minha-feature
   └─ Pull Request
      └─ Merge em develop
```

Ver [ORGANIZATION.md](../../ORGANIZATION.md) para detalhes.

### Padrão de Commits

```bash
git commit -m "[Nome do Produto] Descrição clara

- O que foi feito
- Por que foi feito
- Como testar"
```

### Code Style

```bash
# Verificar estilo
npm run lint

# Formatar código automaticamente
npm run format
```

---

## 🧪 Testes

### Rodar Testes

```bash
# Todos os testes
npm test

# Apenas unitários
npm run test:unit

# Apenas integração
npm run test:integration

# Watch mode (rerun ao salvar)
npm run test:watch

# Com coverage
npm run test:coverage
```

### Escrever Testes

```javascript
// products/[nome-do-produto]/tests/unit/myFeature.test.js
describe('My Feature', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

### Coverage

Meta: **80%+** de cobertura

```bash
npm run test:coverage
# Abre relatório em coverage/index.html
```

---

## 🚀 Deploy

### Staging

```bash
npm run deploy:staging
# Ou via GitHub: push para `develop`
# CI automático faz deploy
```

Acesso: [staging-url]

### Produção

```bash
# 1. Criar tag de release
git tag v1.0.0
git push origin v1.0.0

# 2. GitHub Actions faz deploy automático
# Ou manual:
npm run deploy:production
```

Acesso: [production-url]

### Variáveis de Ambiente

```bash
# .env (nunca commitar)
NODE_ENV=development
DATABASE_URL=postgresql://...
API_KEY=your-key-here
```

Obter valores de `@seu-usuario` ou documentação de setup.

---

## 📚 Documentação

### Documentos Importantes

- **[claude.md](./claude.md)** - Visão técnica do projeto
- **[prd.md](./prd.md)** - Product Requirements Document
- **[planning/roadmap.md](./planning/roadmap.md)** - O que vem por aí
- **[planning/architecture.md](./planning/architecture.md)** - Design técnico

### Documentação do Shared

Este produto usa código de `shared/`:
- [shared/README.md](../../shared/README.md) - Componentes reutilizáveis
- [shared/components/](../../shared/components/) - UI, validadores
- [shared/utils/](../../shared/utils/) - Helpers genéricos

### Documentação Global

- [ORGANIZATION.md](../../ORGANIZATION.md) - Estrutura do monorepo
- [CONTRIBUTION.md](../../docs/CONTRIBUTION.md) - Como contribuir
- [products/PRODUCTS.md](../PRODUCTS.md) - Registro de todos os produtos

---

## 🐛 Troubleshooting

### Problema: "Cannot find module"

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules
npm install
npm run build
```

### Problema: Port já está em uso

```bash
# Mudar porta
PORT=3001 npm run dev

# Ou matar processo na porta 3000
lsof -i :3000
kill -9 <PID>
```

### Problema: Testes falhando

```bash
# Checar se tudo compilou
npm run build

# Rodar testes em verbose
npm test -- --verbose

# Verificar variáveis de ambiente
cat .env
```

### Problema: Database não conecta

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Verificar se DB está rodando
npm run db:status

# Fazer migrate
npm run db:migrate
```

### Problema: CI/CD falhando

1. Verificar workflow: `.github/workflows/ci-[produto].yml`
2. Ver logs na aba "Actions" do GitHub
3. Reproduzir localmente: `npm test && npm run lint && npm run build`

---

## 📞 Suporte & Contato

### Time

- **Proprietário:** @seu-usuario
- **Slack:** #[nome-do-produto]
- **Documentação:** `planning/`

### Reportar Problemas

1. Procurar issue similar existente
2. Se não houver, criar nova issue
3. Label: `produto-[nome]`, `tipo/bug`

---

## 📊 Recursos

| Recurso | Link |
|---------|------|
| GitHub Issues | [Issues](https://github.com/hffroes/lastro/issues?q=label%3Aproduto-[nome]) |
| CI/CD | [Actions](https://github.com/hffroes/lastro/actions) |
| Staging | [URL] |
| Produção | [URL] |
| Documentação | `./planning/` |

---

## 📝 Changelog

### v1.0.0 (2026-09-01)
- ✨ Primeira versão estável
- 🎯 Features principais implementadas
- ✅ 100% testes

### v0.5.0 (2026-08-15)
- 🚀 Beta release

---

## 📄 License

[Sua License]

---

**Última atualização:** 2026-09-09  
**Mantido por:** [Seu Usuário]  
**Claude Code Version:** 1.0
