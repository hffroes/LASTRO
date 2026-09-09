# 🤝 Guia de Contribuição - LASTRO

## Primeiros Passos

1. **Leia primeiro:** `ORGANIZATION.md` na raiz do repo
2. **Entenda:** A estrutura de produtos e branches
3. **Configure:** Seu ambiente de desenvolvimento
4. **Comece:** Escolha uma issue ou crie uma feature

---

## Setup Inicial

### Clonar o Repositório
```bash
git clone https://github.com/hffroes/lastro.git
cd lastro
```

### Adicionar Remote Upstream (se contribuindo com fork)
```bash
git remote add upstream https://github.com/hffroes/lastro.git
git fetch upstream
```

### Instalar Dependências

#### Global (obrigatório)
```bash
npm install  # ou package manager que usar
```

#### Para um Produto Específico
```bash
cd products/produto-1
npm install
```

---

## Workflow de Desenvolvimento

### 1️⃣ Escolher o Que Trabalhar

**Opção A:** Pegar uma issue existente
```bash
# Ir em GitHub → Issues
# Procurar por: [seu-produto] [tipo/feature] ou [tipo/bug]
# Comentar: "Vou pegar essa 💪"
```

**Opção B:** Criar uma nova issue
```bash
# GitHub → New Issue
# Título: [Produto X] Descrição clara
# Labels: seu-produto, tipo/feature, prioridade
# Descrição: por que precisa, escopo, acceptance criteria
```

### 2️⃣ Criar Sua Branch

```bash
# Sempre partir de develop
git checkout develop
git pull origin develop
git fetch origin  # Sincronizar

# Criar branch com nome descritivo
git checkout -b claude/feature/produto-1/nome-da-feature
#            └───────┬──────────┘  └────────┬────────┘
#            tipo de trabalho       produto + descrição
```

**Tipos de trabalho:**
- `feature/` - Nova funcionalidade
- `bugfix/` - Corrigir bug
- `refactor/` - Melhorias sem mudança de funcionalidade
- `docs/` - Apenas documentação

### 3️⃣ Fazer Suas Mudanças

#### Editar Apenas SEU Produto
```bash
# ✅ Certo - tudo em uma pasta
products/produto-1/src/...
products/produto-1/tests/...
products/produto-1/planning/...

# ❌ Evitar - mudanças espalhadas
products/produto-1/
products/produto-2/  # Não é sua responsabilidade
```

#### Se Precisar Compartilhar Código
```bash
# Mover para shared/
shared/components/  # Componente reutilizável
shared/utils/       # Função util comum
shared/lib/         # Biblioteca compartilhada

# Depois criar uma PR separada para shared/
# Isto garante que outros produtos possam revisar
```

#### Padrão de Commits

```bash
# Commit frequente, mensagens claras
git add products/produto-1/src/novo-arquivo.js
git commit -m "[Produto 1] Adiciona validação de email

- Implementa regex para validação
- Adiciona testes unitários
- Docs: validation.md atualizado"

# Formato:
# [Produto X] Título curto (até 50 chars)
# 
# Corpo (opcional, até 72 chars por linha):
# - O que mudou
# - Por que mudou
# - Como testar
```

### 4️⃣ Testar Suas Mudanças

#### Rodar Testes do Seu Produto
```bash
cd products/produto-1
npm test
npm run lint
npm run build  # Se aplicável
```

#### Testar Manualmente
```bash
# Se seu produto tem um servidor
npm run dev

# Abrir browser e testar
# http://localhost:3000
```

#### Verificar Impacto em Shared
```bash
# Se modificou algo em shared/
npm test  # Na raiz
# Garante que nenhum outro produto quebrou
```

### 5️⃣ Abrir Pull Request

#### Antes de Fazer Push

```bash
# Sincronizar com main/develop
git fetch origin
git rebase origin/develop  # Puxar mudanças recentes

# Se houver conflitos
# Git vai avisar, resolve manualmente:
# 1. Edita os arquivos em conflito
# 2. git add <arquivo>
# 3. git rebase --continue

# Fazer força push (seguro pois é sua branch)
git push -f origin claude/feature/produto-1/nome-da-feature
```

#### Template de PR

```markdown
## 📋 Descrição

Descreve QUÊ foi mudado e POR QUÊ.

Relacionado a: #123 (número da issue)

## 🎯 Tipo de Mudança

- [x] Feature (nova funcionalidade)
- [ ] Bug Fix (correção de bug)
- [ ] Refactor (sem mudança de comportamento)
- [ ] Documentation (apenas docs)

## ✅ Checklist de Testes

- [x] Testes unitários adicionados/atualizados
- [x] Testes passam localmente (`npm test`)
- [x] Linter passou (`npm run lint`)
- [x] Testei manualmente
- [x] Documentação atualizada

## 📸 Screenshots (se aplicável)

Antes e depois de mudanças visuais.

## 🔗 Links

- Issue: #123
- Docs: [Link para planning/doc]
- Related PRs: #124, #125
```

#### Labels Obrigatórios

Adicionar na PR:
1. **Produto:** `produto-1`, `produto-2`, ou `shared`
2. **Tipo:** `tipo/feature`, `tipo/bug`, `tipo/refactor`, `tipo/docs`
3. **Opcionais:**
   - `prioridade/alta` - Precisa de review urgente
   - `status/bloqueado` - Esperando algo
   - `área/engine` - Para saber o contexto

### 6️⃣ Code Review

#### O Que Esperar
- ✅ Feedback constructivo
- ✅ Pode levar 24-48h
- ✅ Mudanças podem ser solicitadas
- ✅ Tudo normal, não é pessoal!

#### Quando Receber Comentários

```bash
# 1. Ler feedback
# 2. Conversar se discordar (nos comentários)
# 3. Fazer mudanças
git add products/produto-1/...
git commit -m "[Produto 1] Ajustes por review"
git push

# 4. Marcar como resolvido
# (Nos comentários: "Resolvido em [hash do commit]")
```

#### Se Pedir Mudanças Maiores
- Conversar na PR antes de mudar tudo
- "Concordo, vou fazer assim..."
- Não ter medo de questionar se algo não fizer sentido

### 7️⃣ Merge e Após

#### Critérios para Merge

✅ Tudo deve estar assim:
- [x] CI/CD 100% verde (todos os testes passam)
- [x] Pelo menos 1 review aprovado
- [x] Sem conflitos com `develop`
- [x] Descrição clara na PR
- [x] Labels corretos

#### Mergear

```bash
# GitHub faz o merge automaticamente
# Após merge:

# 1. Deletar branch (GitHub pode fazer auto)
git branch -D claude/feature/produto-1/nome-da-feature
git push origin --delete claude/feature/produto-1/nome-da-feature

# 2. Atualizar seu local
git checkout develop
git pull origin develop
```

---

## 🚨 Regras Importantes

### ⛔ NÃO FAÇA

```bash
# ❌ NÃO fazer force push em main/develop
git push -f origin develop  # NUNCA!

# ❌ NÃO commitar .env, senhas, tokens
git add .env  # NUNCA!

# ❌ NÃO mexer em código de outro produto
# Você trabalha em produto-1, evite editar produto-2/

# ❌ NÃO squash commits (mantenha histórico)
# Use "Create a merge commit" no GitHub

# ❌ NÃO mergear sua própria PR (espere review)
```

### ✅ SEMPRE FAÇA

```bash
# ✅ Sempre sincronizar antes de começar
git fetch origin
git pull origin develop

# ✅ Sempre testar antes de push
npm test
npm run lint

# ✅ Sempre descrever bem no commit
git commit -m "[Produto 1] Descrição clara do que fez"

# ✅ Sempre rebase em caso de conflito
git rebase origin/develop

# ✅ Sempre adicionar testes para novas funcionalidades
products/produto-1/tests/nova-feature.test.js
```

---

## 📚 Estrutura Esperada

Para seu produto ficar bem organizado:

```
products/produto-x/
├── src/                      # Código-fonte
│   ├── index.js
│   ├── modules/
│   │   └── modulo-1.js
│   └── utils/
│       └── helper.js
│
├── tests/                    # Testes
│   ├── modulo-1.test.js
│   └── integration.test.js
│
├── planning/                 # Documentação
│   ├── roadmap.md
│   ├── architecture.md
│   └── decisions.md
│
├── claude.md                 # Visão geral do produto
├── prd.md                    # Product Requirements
├── README.md                 # Como começar
├── package.json              # Dependências
└── .gitignore
```

---

## 🐛 Reportando Bugs

```markdown
### Título
[Produto 2] Crash ao enviar formulário

### Descrição
Quando clico em enviar, a app crasheia.

### Passos para Reproduzir
1. Ir em /form
2. Preencher nome
3. Clicar em "Enviar"
4. VER ERRO

### Comportamento Esperado
Deve mostrar "Enviado com sucesso"

### Informações do Erro
```
Error: Cannot read property 'name' of undefined
  at submit (src/form.js:45)
```

### Versão
produto-2 v1.0.1

### Labels
- produto-2
- tipo/bug
- prioridade/alta
```

---

## 🎓 Conceitos Importantes

### Branch vs Fork

**Branch:** Para contribuidores com acesso ao repo
```bash
git checkout -b claude/feature/produto-1/minha-feature
```

**Fork:** Para contribuidores externos (open source)
```bash
# Fork no GitHub
git clone seu-fork
git add upstream remoto
```

### Rebase vs Merge

Neste projeto: **Sempre use merge commits**
- Preserva histórico de cada feature
- Fácil de reverter se necessário
- Cada produto tem seu contexto

### Shared vs Produto-Específico

**Shared** (`shared/components/`, `shared/utils/`):
```javascript
// Usado por 2+ produtos
export function validateEmail(email) {
  // ...
}
```

**Produto-Específico** (`products/produto-1/src/`):
```javascript
// Lógica específica de produto-1
export function processProductData() {
  // ...
}
```

---

## 🆘 Precisa de Ajuda?

- **Documentação:** Leia `ORGANIZATION.md`
- **Dúvida de Setup:** Veja `products/SEU_PRODUTO/README.md`
- **Problema de Git:** Pergunte em uma issue ou PR
- **Entender Processo:** Este arquivo (você está aqui!)

---

## 📊 Exemplos Reais

### Exemplo 1: Feature Simples

```bash
# 1. Criar branch
git checkout -b claude/feature/produto-1/dark-mode

# 2. Editar código
# products/produto-1/src/theme.js
# products/produto-1/tests/theme.test.js

# 3. Commit
git add products/produto-1/
git commit -m "[Produto 1] Adiciona suporte a dark mode

- Implementa toggle de tema
- Persiste preferência em localStorage
- Testes: 100% coverage"

# 4. Push
git push -u origin claude/feature/produto-1/dark-mode

# 5. PR → Review → Merge ✅
```

### Exemplo 2: Refactor com Shared

```bash
# 1. Criar branch
git checkout -b claude/refactor/shared/melhora-validacao

# 2. Mover código
# De: products/produto-1/src/validate.js
# Para: shared/utils/validate.js

# 3. Atualizar imports em todos os produtos
# products/produto-1/src/form.js
# products/produto-2/src/form.js

# 4. Commits organizados
git add shared/
git commit -m "[Shared] Move validação para shared

- Centraliza lógica de validação
- 3 produtos podem reutilizar"

git add products/
git commit -m "[Múltiplos Produtos] Atualiza imports

- produto-1, produto-2, produto-3 agora usam shared/validate"

# 5. Push → Review → Merge ✅
```

---

**Última atualização:** 2026-09-09  
**Versão:** 1.0
