# Motor de cálculo — Terreno Viável

Determinístico, auditável e versionado. **Sem IA no caminho crítico.** O motor é um
módulo puro, sem dependência de interface, coberto por testes automatizados. A versão do
motor é exibida em todo relatório emitido.

## Fórmulas

```
 1. custo_obra        = area_construida × custo_m2 × f_padrao × f_topografia × f_complexidade
 2. indiretos         = custo_obra × pct_indiretos
 3. projetos          = custo_obra × pct_projetos
 4. custo_terreno     = preco_terreno × (1 + pct_custos_aquisicao)
 5. subtotal_custo    = custo_obra + indiretos + projetos
 6. contingencia      = subtotal_custo × pct_contingencia
 7. custo_total       = custo_terreno + subtotal_custo + contingencia

 8. VGV               = area_vendavel × preco_venda_m2
 9. desp_comerciais   = VGV × (pct_comissao + pct_marketing)
10. tributos          = VGV × pct_tributos
11. receita_liquida   = VGV − desp_comerciais − tributos

12. margem_valor      = receita_liquida − custo_total
13. margem_pct        = margem_valor / VGV

14. carga_sobre_vgv   = pct_comissao + pct_marketing + pct_tributos
15. preco_equilibrio  = custo_total / (area_vendavel × (1 − carga_sobre_vgv))

16. terreno_maximo    = VGV × (1 − carga_sobre_vgv − margem_alvo)
                        − subtotal_custo − contingencia
```

## Fatores

| Fator | Opção | Valor |
| --- | --- | --- |
| Padrão de acabamento | baixo | 0,88 |
| | normal | 1,00 |
| | alto | 1,25 |
| Topografia | plano | 1,00 |
| | leve | 1,06 |
| | acidentado | 1,15 |
| Complexidade (multiplicam entre si quando ativos) | contenção | 1,08 |
| | subsolo | 1,12 |
| | elevador | 1,05 |
| | demolição prévia | 1,03 |

Os fatores vivem em configuração central, junto dos percentuais sugeridos e das
referências de fonte e data. Nada de valor fixo espalhado pelo código — especialmente
tributos.

## Semáforo de viabilidade

A regra é derivada da **meta que o próprio usuário informou** — não de um benchmark
inventado.

| Cor | Condição | Recomendação exibida |
| --- | --- | --- |
| 🟢 Verde | `margem_pct >= margem_alvo` | Aprofundar. Vale investir em projeto e negociação. |
| 🟡 Amarelo | `0 < margem_pct < margem_alvo` | Negociar. O negócio existe, mas não na condição atual — veja o preço máximo do terreno. |
| 🔴 Vermelho | `margem_pct <= 0` | Descartar nesta configuração de produto e preço. |

Cores do design system: sucesso `#12876A`, atenção `#C2760A`, perigo `#C7382E`.

## Ranking de sensibilidade

Para cada premissa crítica, variar ±10% mantendo as demais constantes e ordenar por
impacto absoluto na margem:

```
para cada premissa p em [preco_venda_m2, custo_m2, area_vendavel,
                         preco_terreno, pct_indiretos, pct_tributos]:
    impacto[p] = | margem(p × 1.10) − margem(p × 0.90) |

exibir as 3 premissas de maior impacto
```

É a saída *"premissas que mais afetam o resultado"* — e o argumento comercial mais forte
do produto: mostra ao usuário onde ele deve negociar.
