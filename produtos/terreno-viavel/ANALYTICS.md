# Plano de eventos — Terreno Viável

> Esta nomenclatura nasce aqui e será **reutilizada pelos dez produtos** da LASTRO.
> Vale investir para acertar agora: renomear evento depois quebra a série histórica.

| Evento | Quando dispara | Propriedades | Alimenta |
| --- | --- | --- | --- |
| `ad_click` | Clique no anúncio | campanha, criativo, ângulo, canal | CTR, CPC |
| `landing_view` | Carregamento da landing | utm completo, versão da LP, device | CVR, landing views |
| `vsl_play` | Início do vídeo | versão da VSL | Engajamento |
| `vsl_progress` | 25 / 50 / 75 / 100% | versão, marco | Retenção por bloco do roteiro |
| `checkout_start` | Abertura do checkout | preço exibido, versão da LP | Landing → checkout |
| `purchase` | Pagamento aprovado | preço, meio de pagamento, campanha, criativo | CAC, CVR, receita |
| `purchase_failed` | Pagamento recusado | motivo | Fricção de checkout |
| `access_granted` | Acesso liberado | segundos desde a compra | QA de entrega |
| `onboarding_start` | Primeira abertura do produto | perfil, tipologia, UF, estágio | Coortes por ICP |
| `form_block_view` | Entrada em cada bloco | nome do bloco | Completion por etapa |
| `form_field_abandon` | Saída sem preencher | nome do campo | Abandono por campo |
| `calc_submit` | Clique em calcular | campos preenchidos, campos editados | Completion rate |
| **`result_view`** | Resultado exibido | semáforo, margem %, segundos desde o acesso | **Activation e time-to-value** |
| `assumption_edit` | Premissa alterada no resultado | campo, valor antigo, valor novo | Quais premissas o usuário contesta |
| `report_export` | Exportação do relatório | formato | Export / share rate |
| `report_share` | Compartilhamento por link | canal | Export / share rate |
| `next_offer_view` | Oferta do módulo seguinte exibida | produto ofertado | Funil de cross-sell |
| `next_offer_interest` | Registro de interesse | produto | Waitlist (evidência fraca) |
| `support_ticket` | Abertura de suporte | motivo: interpretação, uso, técnico, comercial | Support rate segmentado |
| `refund_request` | Pedido de reembolso | motivo | Refund rate |

**`result_view` é o evento mais importante do produto.** Ele define activation e
time-to-value simultaneamente. Se apenas um evento for instrumentado corretamente, que
seja esse.

`ad_click` acontece na plataforma de mídia; os demais são responsabilidade do aplicativo.

## Regras de implementação

- Camada única e centralizada, trocável por provedor externo em um só ponto do código.
- UTM capturado na primeira visita e propagado até a compra, para atribuir receita a
  campanha e criativo.
- Preço exibido e versão da landing vêm de configuração, gravados em `checkout_start` e
  `purchase` — é o que permite comparar as faixas R$ 97 / R$ 197 / R$ 297.
- `result_view` dispara exatamente uma vez por resultado exibido.

## Painel interno

Protegido por senha de ambiente, mostrando funil com conversão entre etapas, contagem por
tipo (24h / 7d / total), abandono por bloco e por campo, distribuição de semáforos, tempo
mediano até o valor (`access_granted` → `result_view`), completion rate e exportação CSV.

## Métricas do lançamento

Investimento em mídia · CPM / CTR / CPC · landing views · checkout iniciado · compras ·
CVR total · CAC · receita · activation rate · time-to-value · completion rate ·
export/share rate · support rate · refund rate · interesse no Produto 3.

Preencher a partir do Dia 13, quando a mídia for ligada. Até lá, vazio é a resposta
honesta — a LASTRO ainda não tem benchmark próprio.
