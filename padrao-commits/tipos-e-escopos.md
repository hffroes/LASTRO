# Tipos e escopos

## Tipos

A spec exige `feat` e `fix` nos casos que define e permite outros tipos. Os demais abaixo seguem a convenção Angular, que a própria spec cita como referência.

| Tipo | Usar para | SemVer | Exemplo |
| --- | --- | --- | --- |
| `feat` | Funcionalidade ou comportamento novo | MINOR | `feat(produto): adiciona seleção de tipologia e padrão` |
| `fix` | Correção de defeito | PATCH | `fix(motor): corrige soma dos aditivos do CUB ajustado` |
| `docs` | Só documentação: `PRD.md`, `CLAUDE.md`, `plan.md`, mapa de fases, comentários | — | `docs(plan): marca F18 como aprovada` |
| `style` | Só formatação do código, sem mudar comportamento (espaços, ordem de imports) | — | `style(motor): padroniza espaçamento` |
| `refactor` | Reestrutura o código sem mudar comportamento nem corrigir defeito | — | `refactor(validacao): extrai regras de faixa para constantes` |
| `perf` | Melhora de desempenho | PATCH | `perf(resultado): evita recálculo ao alternar perspectiva` |
| `test` | Só testes, sem mudar código de produção | — | `test(motor): cobre arredondamento do resíduo do terreno` |
| `build` | Dependências e empacotamento: `package.json`, Vite, `tsconfig` | — | `build(deps): atualiza react-router-dom` |
| `ci` | Pipeline de integração contínua (ainda não existe no repositório) | — | — |
| `chore` | Manutenção do ambiente e do repositório, sem efeito no produto | — | `chore(replit): ajusta porta do preview` |
| `revert` | Reverte um commit anterior | — | `revert: desfaz "feat(terreno): …"` |

> `perf` é tratado como PATCH por ser melhoria sem mudança de contrato. A spec só atribui efeito de versão a `feat`, `fix` e quebras (**Projeto**).

## Como escolher

1. Mudou o que o usuário vê ou o resultado de um cálculo? `feat` se é novo, `fix` se corrige.
2. Só reorganizou o código, sem mudar comportamento? `refactor`.
3. Só documentação? `docs`. Só testes? `test`.
4. Dependência, build ou ambiente? `build` ou `chore`.
5. Na dúvida entre dois tipos, a mudança provavelmente precisa ser dividida em dois commits (veja [`organizacao.md`](./organizacao.md)).

## Casos que confundem (Projeto)

| Situação | Como classificar |
| --- | --- |
| Mudança visual: CSS, tokens, layout | `feat`, `fix` ou `refactor` com escopo `ui` ou `design-system`. **Nunca `style`**: ele é só formatação de código |
| Texto de interface (copy) | `feat` ou `fix` com escopo `conteudo` |
| Atualização rotineira de dependência | `build(deps)` |
| Dependência atualizada para corrigir vulnerabilidade | `fix(deps)` |
| Marcar fase como aprovada | `docs(plan,mapa-fases)` |
| Nova versão da base CUB ou novo parâmetro | `feat(parametros)`; valor corrigido: `fix(parametros)` |
| Configuração do Replit ou do preview | `chore(replit)` ou `chore(dev)` |
| Teste que acompanha uma mudança | Entra no commit dessa mudança, sem `test` separado |
| Mudança que atravessa várias áreas sem predominância | Omitir o escopo |

## Escopos

Escopo é um substantivo que nomeia a parte do projeto afetada. Escolha o mais específico da tabela. Escopo novo entra nesta tabela **no mesmo commit** que o introduz.

### Produto e código

| Escopo | Cobre | Caminhos |
| --- | --- | --- |
| `motor` | Motor de cálculo (funções puras) | `src/utils/motor/`, `server/domain/` |
| `parametros` | Parâmetros centralizados e base CUB versionada | `src/utils/motor/parametros.ts`, `src/utils/motor/dados/`, `src/types/parametros.ts` |
| `validacao` | Validação compartilhada entre tela e servidor | `src/utils/validacao/`, `server/middleware/validacao.ts` |
| `api` | Rotas, controllers e middleware de `/api/v1` | `server/routes/`, `server/controllers/`, `server/middleware/`, `server/app.ts` |
| `dados-externos` | Integrações externas: CEP, importação do CUB | `server/routes/cep.ts`, `server/controllers/cepController.ts`, `src/hooks/useCep.ts` |
| `layout` | Estrutura da aplicação e navegação | `src/components/layout/` |
| `inicio` | Página inicial | `src/pages/PaginaInicial.tsx` |
| `onboarding` | Fluxo de onboarding | `src/pages/Onboarding.tsx`, `src/components/onboarding/` |
| `terreno` | Etapa Terreno | `src/pages/Terreno.tsx`, `src/components/terreno/` |
| `produto` | Etapa Produto | `src/pages/Produto.tsx`, `src/components/produto/` |
| `resultado` | Resultado, perspectivas e cenários | `src/pages/Resultado.tsx`, `src/components/resultado/` |
| `ui` | Componentes e estilos compartilhados | `src/components/ui/`, `src/styles/` |
| `conteudo` | Textos da interface | `src/content/` |
| `testes` | Infraestrutura de testes | `vitest.config.ts`, `src/configuracaoTestes.ts` |

### Documentação e design system

| Escopo | Cobre |
| --- | --- |
| `prd` | `PRD.md` |
| `claude` | `CLAUDE.md` |
| `plan` | `plan.md` |
| `mapa-fases` | `mapa-fases.md` e `mapa-fases.html` |
| `novas-implementacoes` | `NovasImplementacoes.md` |
| `padrao-commits` | Esta pasta |
| `design-system` | `design-system/`: tokens, logo, guia |

### Ambiente

| Escopo | Cobre |
| --- | --- |
| `replit` | `.replit` e configuração do Replit |
| `dev` | Ambiente de desenvolvimento e preview (scripts, servidor de dev) |
| `deps` | Dependências (`package.json`, `package-lock.json`) |

### Reservados

Ainda sem código no repositório; valem quando a área existir, conforme o escopo do MVP no `CLAUDE.md`.

| Escopo | Cobre |
| --- | --- |
| `acesso` | Link de acesso com token, webhook Kiwify, e-mail Resend |
| `exportacao` | Exportação PDF e HTML |
| `db` | Schema e migrações do PostgreSQL |
