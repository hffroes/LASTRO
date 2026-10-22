# Exemplos

> Os exemplos das seções "Bons exemplos" e "Erros comuns" são ilustrativos: não são commits reais nem afirmam defeitos que existiram. Só a seção "Histórico real no novo padrão" parte de mensagens do histórico.

## Bons exemplos

Simples, sem corpo:

```text
docs(plan,mapa-fases): marca F18 como aprovada

Fase: F18
```

Com corpo e fase:

```text
feat(resultado): adiciona perspectiva Terrenista × Incorporador

- Perspectiva padrão vem do objetivo da análise (PRD 4.4); o toggle troca
  só a leitura, sem novo cálculo nem mudança de insumo
- Anúncio da troca para leitor de tela

Fase: F16
Co-Authored-By: <agente> <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_…
```

Correção de regra de domínio, em commit próprio:

```text
fix(motor): corrige soma dos aditivos do CUB ajustado

O CUB ajustado é CUB base × (1 + soma dos aditivos). A multiplicação
encadeada inflava o resultado quando havia mais de um aditivo (PRD 3.2).
```

Quebra de compatibilidade, com `!` e rodapé:

```text
feat(api)!: renomeia o campo de área do payload de análise

BREAKING CHANGE: `areaTerreno` passa a se chamar `areaTerrenoM2` na
requisição e na resposta de /api/v1/analises.
```

Vulnerabilidade em dependência:

```text
fix(deps): atualiza vitest para 5.0.1

Corrige vulnerabilidade crítica na versão anterior.
```

Revert:

```text
revert: desfaz "feat(terreno): adiciona campo de topografia"

O campo conflita com a decisão registrada no PRD 3.2.

Refs: 676104e
```

## Erros comuns

| Errado | Problema | Certo |
| --- | --- | --- |
| `ajustes` | Não diz o que mudou | `fix(terreno): impede área negativa no formulário` |
| `Feat: Adiciona toggle.` | Tipo em maiúscula e ponto final | `feat(resultado): adiciona toggle de perspectiva` |
| `F18: Exportação em PDF` | Fase no lugar do tipo; sem classificação | `feat(exportacao): gera PDF do resultado` + `Fase: F18` |
| `feat: adiciona toggle, corrige CUB e atualiza o plan` | Três mudanças em um commit | Três commits: `feat(resultado)`, `fix(motor)`, `docs(plan)` |
| `style: muda cor do botão primário` | `style` é formatação de código, não visual | `fix(ui): ajusta cor do botão primário ao token do design system` |
| `feat(motor)!: muda cálculo do lucro` | Quebra sem explicar o que quebra | Acrescentar `BREAKING CHANGE:` com o impacto, e citar a aprovação |
| `fix: corrige bug` | Sem escopo útil e sem descrição real | `fix(validacao): aceita CEP com hífen` |
| `chore: altera cub.ts` | Descreve o arquivo, não o efeito; tipo errado | `fix(parametros): corrige valor do CUB R-8 padrão normal` |

## Histórico real no novo padrão

Apenas ilustração: o histórico publicado não é reescrito. As mensagens abaixo vêm de commits reais.

| Commit real | No padrão | Observação |
| --- | --- | --- |
| `F17: Premissas ajustáveis e cenários em tempo real` | `feat(resultado): permite ajustar premissas e explorar cenários` + `Fase: F17` | Fase vira rodapé; tipo e escopo passam a classificar |
| `F16: Perspectiva Terrenista × Incorporador` | `feat(resultado): adiciona perspectiva Terrenista × Incorporador` + `Fase: F16` | |
| `F13: Motor econômico e API de análise` | `feat(motor): adiciona motor econômico` e `feat(api): expõe análise em /api/v1` + `Fase: F13` | Título com "e": poderia ser dois commits |
| `docs(plan): marca F09 a F15 como aprovadas` | Já conforme; `docs(plan,mapa-fases)` se o mapa também mudar | |
| `fix: atualiza vitest para 5.0.1 (corrige vulnerabilidade crítica)` | `fix(deps): atualiza vitest para 5.0.1` | O motivo vai para o corpo |
| `Revisão de UX da F02: alinha a base ao guia do design system` | `fix(ui): alinha a base ao guia do design system` + `Fase: F02` | |
| `F03 + docs: renomeia IA→CA, ajusta copy e explicita cobertura MG` | `docs(prd,claude,plan): renomeia IA para CA` e `fix(conteudo): ajusta copy e explicita cobertura de MG` | Três assuntos em um commit: deveria ser dividido |
| `chore(replit): traz o .replit para a branch de trabalho` | Já conforme | |
| `Update Replit configuration file` (Replit Agent) | `chore(replit): atualiza configuração do ambiente` | Origem Replit: mensagem fora do nosso controle |
