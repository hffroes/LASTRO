# Terreno Viável — especificação do MVP

## Público

| ICP | Momento de uso | O que ganha |
| --- | --- | --- |
| A. Construtor proprietário | Apareceu um terreno; precisa responder rápido ao corretor. | Descartar cedo o que não fecha conta. |
| B. Incorporador independente | Analisa vários terrenos por mês. | Comparar oportunidades com a mesma régua. |
| C. Engenheiro / arquiteto consultivo | Estudo preliminar para cliente ou investidor. | Entregar análise profissional mais rápido. |
| D. Investidor-construtor | Avaliando exposição de capital. | Saber o teto de preço que preserva a meta. |

Qual segmento converte melhor em mídia paga é hipótese aberta. O perfil é capturado no
onboarding e as campanhas nascem segmentadas para gerar cortes comparáveis.

## Jornada

```
Anúncio → Landing + VSL → Checkout → E-mail de acesso → Onboarding curto
       → Formulário guiado (5 blocos) → Resultado (semáforo + quadro)
       → Edita premissa, recalcula na hora → Exporta / compartilha relatório
       → Ponte para Preço Mínimo de Venda
```

Cada seta é um ponto de medição. Trecho não instrumentado é trecho invisível — e o que
é invisível não pode ser otimizado.

## Telas

1. **Landing** — gancho, VSL, o que o usuário recebe, preço (configurável), CTA.
2. **Checkout** — self-service, sem etapa manual; no MVP é simulado e isolado em módulo próprio.
3. **Acesso** — liberação automática em menos de um minuto.
4. **Onboarding** — três perguntas: perfil, UF, estágio do projeto. Pulável.
5. **Formulário guiado** — cinco blocos curtos, um por vez, com progresso e validação por bloco.
6. **Resultado** — semáforo, quadro, preço máximo, equilíbrio, sensibilidade, premissas editáveis.
7. **Relatório** — uma página A4, imprimível em PDF e compartilhável por link.
8. **Minhas análises** — lista com terreno, data, semáforo e margem; reabrir e duplicar.

## Inputs

| Bloco | Campo | Tipo | Sugerido | Observação |
| --- | --- | --- | --- | --- |
| Terreno | Área do terreno | Número, m² | — | |
| Terreno | Preço pedido / custo de aquisição | Moeda | — | Se permuta, informar percentual equivalente. |
| Terreno | Custos de aquisição | % sobre o terreno | 5% | ITBI, escritura, corretagem. |
| Produto | Tipologia | Seleção (4 opções) | — | Ampliar só com dado de conversão. |
| Produto | Número de unidades | Número | — | |
| Produto | Área construída total | Número, m² | — | |
| Produto | Área vendável total | Número, m² | — | Base do VGV. |
| Produto | Padrão de acabamento | baixo / normal / alto | normal | Fator sobre o custo base. |
| Complexidade | Topografia | plano / leve / acidentado | plano | Fator multiplicador. |
| Complexidade | Contenção, subsolo, elevador, demolição | Booleanos | não | Cada um aplica fator. |
| Receita | Estratégia | venda / locação | venda | Locação adiada no MVP. |
| Receita | Preço de venda por m² | Moeda | editável | Exibir fonte e data. |
| Custos | Custo de obra por m² | Moeda | editável | Exibir fonte e data. |
| Custos | Indiretos | % sobre a obra | 8% | |
| Custos | Projetos e aprovações | % sobre a obra | 4% | |
| Custos | Comissão | % sobre o VGV | 4% | |
| Custos | Marketing | % sobre o VGV | 2% | |
| Custos | Tributos | % sobre o VGV | 6% | Parametrizável; nunca hard-coded. |
| Custos | Contingência | % sobre o custo | 5% | |
| Meta | Margem alvo | % | 20% | Define o semáforo e o preço máximo do terreno. |

Todo valor sugerido aparece preenchido, editável, com selo de fonte e data. Cada campo
adicional custa conversão: antes de incluir qualquer campo novo, responder **ele muda o
resultado?** Se não muda, vai para o backlog.

## Outputs

- Semáforo de viabilidade com recomendação em uma frase.
- Quadro receita × custo × margem: VGV, custo total, margem em R$ e em %.
- Preço máximo indicativo do terreno para a margem alvo, comparado ao preço pedido.
- Preço de equilíbrio por m² — abaixo disso o negócio deixa de existir.
- Top 3 premissas mais sensíveis, com o efeito de cada uma.
- Relatório de 1 página, com premissas, fontes, datas e versão do motor visíveis.

## Fora do MVP — adiado explicitamente

| Funcionalidade | Por quê | Quando reconsiderar |
| --- | --- | --- |
| Integração automática de CUB e índices | Sugerido editável resolve; integração é risco de licença e atraso. | Se o abandono se concentrar no campo de custo por m². |
| Cenário de locação | Dobra a superfície de cálculo e de QA antes da primeira venda. | Se a demanda aparecer em suporte ou nos criativos. |
| Comparação entre múltiplos terrenos | É promessa do painel, não da primeira decisão. | Após activation comprovada. |
| Fluxo de caixa, VPL e TIR | É o Retorno da Obra. Antecipar destrói o cross-sell. | Nunca aqui. |
| Login social, permissões, multiusuário | Complexidade sem demanda comprovada. | Só com demanda real de conta compartilhada. |
| Área equivalente por coeficientes NBR | Precisão além do necessário na fase preliminar. | É o Orçamento Preliminar. |

## Ponte de cross-sell

Após o resultado: *"O terreno parece viável. Qual o preço mínimo que mantém a margem?"*
→ captura de interesse no **Preço Mínimo de Venda**.

## Hipóteses a validar

1. O construtor paga por uma resposta preliminar sem laudo técnico.
2. O formulário guiado é curto o suficiente para não gerar abandono.
3. O semáforo é compreendido sem suporte humano.
4. O relatório de 1 página é levado a sócio, corretor ou investidor.
5. O resultado gera demanda natural pelo Preço Mínimo de Venda.
