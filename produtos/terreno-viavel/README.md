# Produto 1 — Terreno Viável

Aplicativo de viabilidade preliminar de terreno. Primeiro produto da sequência LASTRO
e fundação reaproveitada pelos módulos seguintes: design system, cadastro mínimo de
empreendimento, biblioteca de cálculos v1, telemetria única e checkout.

- **Pergunta que responde:** vale a pena entrar neste terreno com este produto imobiliário?
- **Promessa:** leitura preliminar de viabilidade antes de comprometer capital com aquisição e projetos detalhados.
- **Primeira vitória:** semáforo de viabilidade + preço máximo indicativo do terreno, em minutos, a partir de um formulário guiado.
- **Gate de validação:** o usuário decide descartar / aprofundar / negociar e explica por quê usando o relatório.
- **Código:** `terreno-viavel` · **Preço em teste:** R$ 197 (faixas A 97 / B 197 / C 297)

## Onde está cada coisa

| Documento | Conteúdo |
| --- | --- |
| [`SPEC.md`](SPEC.md) | Escopo, jornada, campos do formulário, outputs, fora do escopo |
| [`ENGINE.md`](ENGINE.md) | Motor de cálculo, fatores, semáforo, sensibilidade |
| [`ANALYTICS.md`](ANALYTICS.md) | Plano de eventos — nomenclatura compartilhada pelos dez produtos |

O dossiê de referência vive no Notion, em `02 — Portfólio`. Quando este repositório e o
dossiê divergirem, o dossiê vence.

## Implementação

O aplicativo é construído no Replit: **Terreno Viável — LASTRO**
(`https://replit.com/@lastrotuzan/Terreno-Viavel-1`).

Design system aplicado a partir de [`../../design-system`](../../design-system):
tokens de cor, tipografia (Space Grotesk / Manrope / IBM Plex Mono), raio, sombra e
padrão de app (sidebar navy 232px, conteúdo cinza-50, painel de copiloto 320px).
