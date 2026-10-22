# Escrita do commit

Estrutura da mensagem e regras de cada parte. A coluna **Origem** indica se a regra vem da especificação Conventional Commits 1.0.0 (**Spec**) ou é uma escolha do LASTRO (**Projeto**).

## 1. Estrutura

```text
<tipo>[(escopo)][!]: <descrição>
<linha em branco>
[corpo]
<linha em branco>
[rodapé(s)]
```

## 2. Cabeçalho

| Parte | Regra | Origem |
| --- | --- | --- |
| `tipo` | Obrigatório. Substantivo que classifica a mudança: `feat` para funcionalidade nova, `fix` para correção. Os demais estão em [`tipos-e-escopos.md`](./tipos-e-escopos.md) | Spec |
| `tipo` em minúsculo | A spec não diferencia maiúsculas (exceto `BREAKING CHANGE`); o projeto padroniza minúsculo | Projeto |
| `(escopo)` | Opcional. Substantivo entre parênteses que nomeia a parte do código afetada: `fix(motor):`. Catálogo em [`tipos-e-escopos.md`](./tipos-e-escopos.md) | Spec |
| vários escopos | Separados por vírgula, sem espaço: `docs(prd,claude,plan):`. Já usado no histórico | Projeto |
| `!` | Opcional, imediatamente antes do `:`. Indica quebra de compatibilidade | Spec |
| `: ` | Obrigatório: dois-pontos seguido de espaço | Spec |
| `descrição` | Obrigatória, logo após o `: `. Resumo curto da mudança | Spec |

### Estilo da descrição (Projeto)

- Português do Brasil.
- Verbo no presente do indicativo, 3ª pessoa: `adiciona`, `corrige`, `remove`, `renomeia`, `alinha`. Lê-se como "este commit… adiciona X".
- Minúscula inicial, exceto siglas e nomes próprios (`CUB`, `VGV`, `Terrenista`).
- Sem ponto final.
- Cabeçalho inteiro (tipo + escopo + descrição) com até **72 caracteres**.
- Descreve o efeito, não o arquivo: `corrige soma dos aditivos do CUB ajustado`, não `altera cub.ts`.
- Usa os termos do PRD: `CA` (coeficiente de aproveitamento, nunca "IA"), `CUB ajustado`, `VGV`.
- Sem mensagens vagas: `ajustes`, `wip`, `correções`, `atualiza`.

## 3. Corpo

| Regra | Origem |
| --- | --- |
| Opcional; começa uma linha em branco depois da descrição | Spec |
| Texto livre, com quantos parágrafos forem necessários | Spec |
| Escrito em pt-BR, quebrado em ~72 colunas; itens em lista com `-` | Projeto |
| Explica o porquê, a decisão tomada e os efeitos colaterais, sem repetir o diff | Projeto |
| Cita a seção do PRD ou a decisão do plano quando houver (`PRD 4.1`, `D-R6`) | Projeto |
| Esperado sempre que o commit tocar regra de domínio, contrato de API ou parâmetro | Projeto |

## 4. Rodapés

Formato `Token: valor` ou `Token #valor`. O token usa `-` no lugar de espaço (`Co-Authored-By`); a única exceção é `BREAKING CHANGE`. O rodapé começa uma linha em branco depois do corpo (ou depois do cabeçalho, se não houver corpo). **Origem:** Spec para o formato; o uso de cada token abaixo é do Projeto, exceto `BREAKING CHANGE` e `Refs`, que a spec cita.

| Token | Quando usar | Exemplo |
| --- | --- | --- |
| `Fase` | Obrigatório quando o commit implementa ou ajusta uma fase do `plan.md`. Várias fases separadas por vírgula | `Fase: F17` · `Fase: F07, F08` |
| `Refs` | Referência a commit, PR ou issue. Obrigatório em `revert` | `Refs: 676104e` · `Refs: #19` |
| `BREAKING CHANGE` | Descreve a quebra e como migrar (seção 5) | `BREAKING CHANGE: o campo X passa a ser Y` |
| `Co-Authored-By` | Commit feito com agente de IA: nome do agente e e-mail de atribuição | `Co-Authored-By: <agente> <noreply@anthropic.com>` |
| `Claude-Session` | Commit feito em sessão do Claude Code: link da sessão | `Claude-Session: https://claude.ai/code/session_…` |

Ordem: `Fase`, `Refs`, `BREAKING CHANGE`, depois os trailers de autoria (`Co-Authored-By`, `Claude-Session`) por último.

## 5. Quebra de compatibilidade

**Spec:** a quebra é indicada com `!` antes dos dois-pontos, com o rodapé `BREAKING CHANGE: descrição` (em maiúsculas; `BREAKING-CHANGE` é sinônimo), ou com os dois. Quando há `!`, o rodapé pode ser omitido e a descrição passa a descrever a quebra.

**Projeto — o que conta como quebra no LASTRO:**

- contrato da API `/api/v1`: rota, campo, formato de resposta ou de erro;
- schema do banco ou migração destrutiva;
- formato do snapshot de parâmetros e da versão de dados, que os resultados exportados preservam;
- fórmula, LASTRO Score, limiar de viabilidade ou recomendação, que só mudam com aprovação (`CLAUDE.md`).

Mudança visual, de layout ou de texto de interface **não** é quebra.

```text
refactor(motor)!: muda o formato do snapshot de parâmetros

O snapshot passa a registrar a versão da base CUB junto de cada parâmetro.

BREAKING CHANGE: exportações geradas antes desta versão não trazem a
versão da base CUB; o leitor deve tratar o campo como ausente.
```

## 6. Reverter

**Spec:** use o tipo `revert` e um rodapé com o(s) SHA(s) revertido(s).

```text
revert: desfaz "feat(terreno): adiciona campo de topografia"

O campo conflita com a decisão registrada no PRD 3.2.

Refs: 676104e
```

Reverter uma mudança já aprovada em homologação exige decisão explícita do usuário (`CLAUDE.md`, Governança). Veja [`organizacao.md`](./organizacao.md).

## 7. Efeito na versão (SemVer)

| Commit | Versão |
| --- | --- |
| `fix` | PATCH |
| `feat` | MINOR |
| qualquer tipo com `!` ou `BREAKING CHANGE` | MAJOR |
| demais tipos | sem efeito |

Hoje o mapeamento é só semântico: o `package.json` está em `0.1.0`, não há tags e nenhuma ferramenta gera versão ou changelog. Automatizar isso (commitlint, release automático) exigiria dependências novas e depende de decisão prévia (`CLAUDE.md`, regra 2 de comportamento).
