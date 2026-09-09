# 🔗 Shared - Código Reutilizável

Este diretório contém código, componentes e utilitários reutilizáveis entre múltiplos produtos LASTRO.

---

## 📁 Estrutura

```
shared/
├── components/          # Componentes reutilizáveis
│   ├── validators/
│   ├── ui/
│   └── forms/
│
├── utils/              # Funções utilitárias
│   ├── validation.js
│   ├── transforms.js
│   └── helpers.js
│
├── lib/                # Bibliotecas/SDKs
│   ├── api-client.js
│   ├── db-connector.js
│   └── auth.js
│
├── infrastructure/     # Configuração e deploy
│   ├── docker/
│   ├── scripts/
│   └── config/
│
├── package.json        # Dependências compartilhadas
└── README.md          # Este arquivo
```

---

## ✅ Regras de Uso

### ✅ ADICIONAR para shared/

Mover código para `shared/` quando:

1. **Usado por 2+ produtos**
   ```javascript
   // shared/utils/validation.js - usado por produto-1 e produto-2
   export function validateEmail(email) { ... }
   ```

2. **Infraestrutura comum**
   ```
   shared/infrastructure/docker/Dockerfile
   shared/infrastructure/scripts/deploy.sh
   ```

3. **Componentes genéricos**
   ```javascript
   // shared/components/ui/Button.js
   // Botão reutilizável para múltiplos produtos
   ```

4. **Bibliotecas centralizadas**
   ```javascript
   // shared/lib/api-client.js
   // HTTP client usado por vários produtos
   ```

### ❌ NÃO ADICIONAR para shared/

Manter em `products/produto-x/` quando:

- ❌ Específico de UM produto
- ❌ Lógica de negócio de um produto
- ❌ Ainda experimental (mude depois, quando estável)
- ❌ Tightly coupled com dados de um produto

**Exemplo errado:**
```javascript
// ❌ NÃO em shared/
// shared/lib/processProductData.js
// Isso é lógica do produto-1, não compartilhada!
```

**Exemplo certo:**
```javascript
// ✅ EM shared/
// shared/utils/dataTransform.js
// Transformação genérica que múltiplos produtos usam
```

---

## 📦 Components

### `shared/components/`

Componentes reutilizáveis entre produtos.

```javascript
// Exemplo: shared/components/validators/email.js
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

**Quando usar:**
- Múltiplos produtos precisam da mesma funcionalidade
- Comportamento deve ser consistente

---

## 🛠️ Utils

### `shared/utils/`

Funções utilitárias pequenas e reutilizáveis.

```javascript
// shared/utils/formatters.js
export function formatCurrency(value) { ... }
export function formatDate(date) { ... }
export function slugify(text) { ... }
```

**Quando usar:**
- Transformações simples
- Helpers genéricos
- Formatação/parsing

---

## 📚 Lib

### `shared/lib/`

Bibliotecas maiores, SDKs, clientes.

```javascript
// shared/lib/api-client.js
export class ApiClient {
  constructor(baseUrl) { ... }
  async get(endpoint) { ... }
  async post(endpoint, data) { ... }
}
```

**Quando usar:**
- Acesso a APIs externas
- Conexão com banco de dados
- Autenticação
- Integração com serviços terceiros

---

## 🚀 Infrastructure

### `shared/infrastructure/`

Configuração, scripts de deploy, Docker, CI/CD base.

```
shared/infrastructure/
├── docker/
│   ├── Dockerfile.base
│   └── docker-compose.yml
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   └── migrate.sh
└── config/
    ├── env.example
    └── constants.js
```

**Quando usar:**
- Configuração compartilhada
- Scripts de operação
- Imagens Docker base
- Variáveis de ambiente

---

## 🔄 Workflow para Adicionar Código em Shared

### 1. Identificar Oportunidade

Você está duplicando código entre produtos?

```
produto-1/src/utils/validation.js
produto-2/src/utils/validation.js
```

### 2. Criar PR em Shared

```bash
git checkout -b claude/refactor/shared/move-validation
# Mover arquivo
# Atualizar imports em ambos produtos
git commit -m "[Shared] Move validação para shared/"
```

### 3. Atualizar Imports

```javascript
// Antes
import { validateEmail } from '../utils/validation.js';

// Depois
import { validateEmail } from 'shared/utils/validation.js';
```

### 4. Testar Impacto

```bash
# Testar ambos produtos
cd products/produto-1 && npm test
cd products/produto-2 && npm test
cd ../.. && npm test  # Tudo junto
```

### 5. Merge & Deploy

- Merge em develop
- CI roda testes de TODOS produtos
- Deploy após tudo passar

---

## 📖 Documentação

Cada parte de shared deve ter README.md:

```
shared/
├── components/README.md        # Como usar componentes
├── utils/README.md             # Lista de utils disponíveis
├── lib/README.md               # SDKs/Clientes
└── infrastructure/README.md    # Setup de infraestrutura
```

---

## 🧪 Testes

### Executar Testes do Shared

```bash
npm test --workspace=shared
```

### Validar Impacto nos Produtos

```bash
# Testar se mudança em shared quebrou algum produto
npm test --workspace=products/produto-1
npm test --workspace=products/produto-2
npm test --workspace=products/produto-3
```

### CI Automático

Quando há mudanças em `shared/`:
- `.github/workflows/ci-shared.yml` roda testes
- Post alerta: "Mudanças em shared/ afetam todos os produtos"
- Requer review cuidadoso

---

## 📋 Versionamento

Se `shared/` vira um pacote NPM:

```json
// shared/package.json
{
  "name": "@lastro/shared",
  "version": "1.2.0",
  "description": "Componentes e utilidades compartilhadas LASTRO"
}
```

Produtos usam:
```json
{
  "dependencies": {
    "@lastro/shared": "^1.2.0"
  }
}
```

---

## 🚀 Publicar Novo Componente

### Checklist

- [ ] Código pronto e testado
- [ ] Documentação completa
- [ ] Exportado corretamente em `index.js`
- [ ] Testes passam (`npm test`)
- [ ] 0 warnings no lint (`npm run lint`)
- [ ] Importável por outros produtos
- [ ] Exemplo de uso documentado

### Exemplo

```javascript
// shared/components/Button/index.js
export { Button } from './Button.jsx';
export { ButtonGroup } from './ButtonGroup.jsx';
export { useButton } from './hooks.js';

// shared/components/Button/Button.jsx
export function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}
```

Uso em outro produto:
```javascript
import { Button } from 'shared/components/Button';

export function MyForm() {
  return <Button onClick={handleSubmit}>Submit</Button>;
}
```

---

## 🔗 Referências

- [ORGANIZATION.md](../ORGANIZATION.md) - Estrutura geral
- [CONTRIBUTION.md](../docs/CONTRIBUTION.md) - Como contribuir
- [products/PRODUCTS.md](./PRODUCTS.md) - Registro de produtos

---

## 📞 Suporte

- 💬 Dúvida sobre se compartilhar? Crie uma issue!
- 📝 Quer documentar melhor? Contribua com um PR!
- 🐛 Bug em shared? Afeta todos - prioridade alta!

---

**Última atualização:** 2026-09-09  
**Versão:** 1.0
