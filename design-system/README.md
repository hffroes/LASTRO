# Lastro — Design System

Base visual dos produtos da Lastro. Construtech para pequenas construtoras, incorporadores, engenheiros e arquitetos.

## Estrutura

```
design-system/
  assets/logo/      Logo em SVG (símbolo, lockups, mono, favicon)
  tokens/tokens.css Variáveis CSS: cor, tipografia, raio, sombra, tema escuro
  guide/            Guia visual completo (abrir no navegador)
```

## Princípios

1. **Fundação primeiro** — estrutura antes de ornamento.
2. **Auditável** — todo número mostra origem, data e responsável.
3. **Densidade útil** — respiro vem da tipografia, não do vazio.
4. **IA como copiloto** — sugere e explica citando a base de conhecimento; o profissional decide.

## Marca

Direção **Módulos**: dois blocos (um rígido, um flexível) assentados sobre a mesma base navy. A base é o lastro — o que é auditável e não se move.

- Wordmark sempre em caixa baixa: `lastro`. Nunca "Lastro" ou "LASTRO".
- Tamanho mínimo: símbolo 16px, lockup horizontal 96px.
- Respiro mínimo = altura da base do símbolo em todos os lados.
- Não separar os blocos da base, reordená-los ou girar o símbolo.
- Não aplicar sombra, contorno ou gradiente.

## Tipografia

| Uso | Família | Peso |
| --- | --- | --- |
| Títulos | Space Grotesk | 600 / 700 |
| Corpo e interface | Manrope | 400 / 500 / 600 |
| Números, unidades, IDs | IBM Plex Mono | 400 / 500 |

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Escala: display 54 · h1 32 · h2 20 · body 15 · ui 13.5 · mono 14.

## Cor

Navy estrutura, azul age, cinza informa. Cor semântica só para estado — nunca decorativa.
Ação: `--lastro-blue-500` (#2F6DF0). No tema escuro sobe para `--lastro-blue-400` (#5F93F7) para manter contraste AA sobre navy.

## Estrutura

- Espaçamento na escala de 4px: 4, 8, 12, 16, 24, 40, 88.
- Raio: 6 (input, botão) · 12 (card) · 999 (pill, avatar).
- Elevação: flat (borda) · sm (dropdown) · lg (modal).

## Ícones

[Lucide](https://lucide.dev) — traço 1.75px, 18px na interface. Não desenhar ícone fora do set.

## Padrão de app

Sidebar navy fixa de 232px · conteúdo em cinza-50 · painel do copiloto de IA de 320px à direita, colapsável e nunca sobreposto ao conteúdo.
