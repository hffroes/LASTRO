# Financeiro — relatórios de fluxo de caixa

Rotina que gera o relatório financeiro em HTML de cada centro de custo a partir
das bases **Contas a Receber** e **Contas a Pagar** do Notion.

```
financeiro/
  dados/<data-da-captura>/<centro>.json   snapshot auditável do Notion
  gerar_relatorio.py                      snapshot -> relatório HTML
  relatorios/                             relatórios gerados
```

## Como atualizar

1. **Capturar** os lançamentos das duas bases do centro de custo e gravar um
   snapshot novo em `dados/AAAA-MM-DD/<centro>.json`. O snapshot é a fonte
   auditável: todo número do relatório sai dele.
2. **Gerar**:

   ```bash
   python3 gerar_relatorio.py dados/2026-08-19/edgar-pereira.json \
                              relatorios/relatorio-edgar-2026-08.html
   ```

   Um terceiro argumento opcional (`AAAA-MM-DD`) fixa a data de referência;
   sem ele vale o `capturado_em` do snapshot.
3. **Publicar** o HTML na página do centro de custo no Notion, substituindo o
   relatório anterior.

## O que o snapshot precisa ter

| Campo | Para que serve |
| --- | --- |
| `saldo_inicial` | Saldo informado na página de Controle Financeiro (`rotulo`, `valor`, `referencia`) |
| `receber` / `pagar` | Lançamentos linha a linha, com `vencimento`, `valor` e `status` |
| `agregado_receber` / `agregado_pagar` | Totais por mês e status, usados para conferir o linha a linha |
| `detalhe_ate` | Opcional. Último mês com detalhe completo — a projeção para aí |
| `observacoes` | Ressalvas que entram no rodapé do relatório |

## Critérios de cálculo

- **Caixa**: só o que está `Pago`/`Recebido`, posicionado na data de vencimento
  (as bases não guardam data de pagamento — a aproximação está declarada no rodapé).
- **Competência**: todo lançamento na data de vencimento, liquidado ou não.
- **Atraso**: vencimento anterior à data de referência e status ainda em aberto.
  Nos cenários projetados, o atraso é realocado para o mês corrente.
- **Cenários** (interativos no HTML): base, conservador (atraso a receber não
  entra) e só realizado. O simulador de custo extra só afeta a tela.
