# QA — cálculo não avança para a tela de resultado

**Data:** 19/08/2026 · **Severidade:** Crítica · **Status:** diagnosticado, correção pendente

## Sintoma

O usuário preenche o formulário guiado, clica em calcular e nada acontece: a aplicação
não navega para a tela de resultado e nenhuma mensagem de erro aparece.

## Causa raiz

Recursão infinita no cálculo do servidor. `calcular()` chama `calcularSensibilidade()`,
que chama `calcular()` de novo, sem condição de parada. O resultado é
`RangeError: Maximum call stack size exceeded`, a requisição responde HTTP 500 e a
análise nunca chega a ser salva.

O ranking de sensibilidade precisa recalcular a margem seis vezes em cada direção, mas
deve chamar o **núcleo de cálculo** — as fórmulas 1 a 16 — e não a função de alto nível
que já inclui a sensibilidade.

## Duas inconsistências, não uma

1. **A recursão** — o defeito que derruba a requisição.

2. **Motor duplicado e divergente** — o front-end já usa um núcleo de cálculo separado,
   sem sensibilidade, para evitar exatamente essa recursão; o servidor continua chamando
   o cálculo completo. Existem hoje dois caminhos de cálculo diferentes no produto.
   Isso contraria a decisão registrada em `ENGINE.md`: o motor é um módulo puro, único,
   versionado e auditável. Duas implementações significam que o número exibido na tela e
   o número gravado no relatório podem divergir sem que ninguém perceba — grave num
   produto cuja promessa é ser auditável.

3. **Falha silenciosa** — a navegação acontece apenas no caminho de sucesso; não há
   tratamento de erro. Qualquer falha do servidor vira "o botão não faz nada",
   sem mensagem ao usuário e sem sinal para o suporte.

## Correção proposta

- Extrair o núcleo determinístico (fórmulas 1–16) e fazer a sensibilidade chamar **esse**
  núcleo, quebrando o ciclo.
- Unificar: um único módulo de cálculo, consumido por servidor e cliente, para eliminar a
  divergência.
- Tratar o erro na interface: mensagem clara, botão volta ao estado normal e o evento de
  falha é registrado na telemetria.

## Regressão a cobrir com teste

- Chamar a sensibilidade não deve recorrer ao cálculo de alto nível (teste direto do ciclo).
- Cálculo com os mesmos inputs no núcleo compartilhado devolve o mesmo resultado em
  servidor e cliente.
- Erro do servidor no cálculo exibe mensagem e não deixa a tela travada.
