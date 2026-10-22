# Organização dos commits

Como dividir, ordenar e agrupar o trabalho em commits. Tudo aqui é regra do **Projeto**, apoiada no `CLAUDE.md` e no protocolo de execução do `plan.md`.

## 1. Um commit, uma mudança lógica

- **Teste de uma frase:** se a descrição precisa de "e" para caber tudo, são dois commits.
- Não misturar `feat` com `refactor`, nem formatação com lógica. Um commit que faz as duas coisas esconde o que mudou de comportamento.
- Mudança de **regra de domínio** (fórmula, LASTRO Score, limiares, parâmetros, recomendação) vai em **commit próprio**, citando a seção do PRD no corpo. Ela exige aprovação (`CLAUDE.md`) e precisa poder ser revertida isoladamente.
- O teste que cobre uma mudança entra **no mesmo commit** dela.

## 2. Cada commit deixa o repositório consistente

Código que passou por um commit passa em `npm run typecheck` e `npm test`. Isso permite `git bisect` e `revert` sem surpresas.

## 3. Ordem dentro de uma branch

Siga a ordem das camadas da arquitetura, do mais interno ao mais externo:

1. preparação: `refactor`, `build`, `chore` que a mudança precisa;
2. motor e parâmetros (`motor`, `parametros`, `validacao`);
3. API (`api`);
4. interface (`resultado`, `terreno`, `ui`, `conteudo`);
5. documentação (`docs`).

Commit grande só quando indivisível. Uma fase pode virar um único commit ou vários; prefira vários quando as camadas forem independentes.

## 4. Fases do `plan.md`

- Commits que implementam uma fase levam o rodapé `Fase: Fxx`.
- A aprovação da fase é um **commit à parte**, depois da aprovação do usuário (protocolo de execução, passo 10): `docs(plan,mapa-fases): marca F18 como aprovada`. O `mapa-fases.md` pede atualização no mesmo commit em que o `plan.md` muda o status de uma fase.
- Não começar a fase seguinte antes desse commit (protocolo, passo 11).

## 5. Histórico

- Branch publicada não é reescrita: sem `rebase` com `push --force`, sem `amend` de commit já enviado.
- Ajustes antes do primeiro `push` podem ser reorganizados à vontade.
- Erro em commit enviado: novo commit de correção. Desfazer: `revert` (ver [`escrita.md`](./escrita.md)).
- Mudança aprovada em homologação não é revertida por conta própria. Se conflitar com PRD, arquitetura, regra de negócio, segurança ou integridade de dados, mantém-se a mudança, explica-se o conflito e pede-se decisão ao usuário (`CLAUDE.md`, Governança).

## 6. Autoria e origem

O `CLAUDE.md` exige informar a origem de cada commit (Claude, Replit, humano ou desconhecida) e proíbe adivinhar.

- **Claude:** autor `Claude`, com os trailers `Co-Authored-By` e `Claude-Session` ao final.
- **Replit:** autor `Replit Agent`. As mensagens geradas automaticamente (`Update Replit configuration file`) ficam fora deste padrão e não são reescritas.
- **Humano:** o autor do Git identifica. Segue o padrão como qualquer outro commit.
- **Desconhecida:** quando o autor não permite concluir a origem, registrar como desconhecida.

Com tipo, escopo e trailers padronizados, a lista de commits da Pré-Merge Review sai direto de `git log`.

## 7. Branches e Pull Requests

- Uma branch, um objetivo. Os nomes `claude/<slug>` são gerados pelo ambiente e não fazem parte deste padrão.
- O **título do PR segue o mesmo formato** do cabeçalho do commit, pois o GitHub o copia para o corpo do commit de merge.
- A integração é por **commit de merge** (`Merge pull request #N from …`, prática atual), o que preserva os commits atômicos.
- Merge para `main` só depois da Pré-Merge Review aprovada pelo usuário (`CLAUDE.md`). Qualquer commit novo na branch invalida a revisão.
