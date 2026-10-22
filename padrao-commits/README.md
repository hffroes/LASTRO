# Padrão de commits — LASTRO

Como escrever e organizar os commits deste repositório. Baseado na especificação [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) e adaptado ao `CLAUDE.md` e ao `plan.md`.

**Para quê:** histórico legível, rastreável por fase e por seção do PRD, e pronto para a Pré-Merge Review do `CLAUDE.md`, que lista os commits com resumo e origem.

> Os exemplos desta pasta são ilustrativos, salvo quando indicado que vêm do histórico real.

## Formato

```text
<tipo>[(escopo)][!]: <descrição>

[corpo]

[rodapé(s)]
```

```text
feat(resultado): adiciona toggle Terrenista × Incorporador

- A perspectiva padrão vem do objetivo da análise; o toggle troca só a
  leitura, sem novo cálculo (PRD 4.4)

Fase: F16
```

## Regras essenciais

1. **Tipo obrigatório**, minúsculo: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `chore`… (lista em [`tipos-e-escopos.md`](./tipos-e-escopos.md)).
2. **Escopo opcional**: substantivo do catálogo de escopos, entre parênteses.
3. **Descrição em pt-BR**, no presente (`adiciona`, `corrige`), minúscula, sem ponto final, cabeçalho com até 72 caracteres.
4. **Corpo explica o porquê**, separado do cabeçalho por uma linha em branco.
5. **Rodapés no formato `Token: valor`**. `Fase: Fxx` quando o commit implementa uma fase do `plan.md`.
6. **Quebra de compatibilidade** é marcada com `!` antes dos dois-pontos e/ou rodapé `BREAKING CHANGE:`.
7. **Um commit = uma mudança lógica**, com o repositório consistente depois dele.
8. **Histórico publicado não é reescrito**: correção vira novo commit; desfazer vira `revert`.

## Conteúdo da pasta

| Arquivo | O que tem |
| --- | --- |
| [`escrita.md`](./escrita.md) | Estrutura da mensagem: cabeçalho, corpo, rodapés, quebra de compatibilidade, revert |
| [`tipos-e-escopos.md`](./tipos-e-escopos.md) | Tipos, casos que confundem e catálogo de escopos do projeto |
| [`organizacao.md`](./organizacao.md) | Como dividir, ordenar e agrupar commits; fases, autoria, branches e PRs |
| [`exemplos.md`](./exemplos.md) | Bons exemplos, erros comuns e o histórico real reescrito no padrão |
| [`modelo-commit.txt`](./modelo-commit.txt) | Modelo de mensagem para o Git |

## Ativar o modelo de mensagem

```bash
git config commit.template padrao-commits/modelo-commit.txt
```

A configuração é local de cada clone e só vale para `git commit` sem `-m`. Quem commita com `-m` (incluindo agentes) segue estes documentos.

## O que vem da especificação e o que é do projeto

- **Da especificação:** estrutura `tipo(escopo)!: descrição`, corpo e rodapés, `feat` e `fix` obrigatórios nos casos que a spec define, `BREAKING CHANGE` em maiúsculas, tipos adicionais permitidos, mapeamento SemVer.
- **Do projeto:** descrição em pt-BR e no presente, limite de 72 caracteres, rodapé `Fase`, catálogo de escopos, definição de "quebra" no contexto do LASTRO, trailers de autoria e regras de organização.

Cada regra indica a origem (**Spec** ou **Projeto**) em [`escrita.md`](./escrita.md).

## Vigência

O padrão vale a partir da sua adoção. Commits anteriores (`F17: …`, `Fase 6: …`, mensagens geradas pelo Replit) não são reescritos. [`exemplos.md`](./exemplos.md) mostra como os commits reais ficariam no novo formato, apenas como ilustração.
