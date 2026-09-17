# NovasImplementacoes.md — Repositório de Ideias Futuras (LASTRO)

## Objetivo
Este arquivo é um repositório vivo de ideias, funcionalidades e referências de mercado que **podem** vir a ser incorporadas ao LASTRO no futuro. Não é um backlog aprovado nem uma extensão do escopo do MVP.

> ⚠️ Nada aqui está aprovado. Qualquer item que avance para implementação segue as Regras de Comportamento do `CLAUDE.md`: plano antes de mudança não-trivial, sem alterar stack/arquitetura/DB/auth sem consultar, aviso antes de conflito com `@PRD.md`, e nenhuma funcionalidade Fase 2+ sem aprovação explícita.

## Como usar
- Cada ideia entra como um item novo, com **data, origem (reunião/conversa/observação) e status**.
- Status possíveis: `ideia bruta` · `avaliar` · `aprovado para plano` · `descartado`.
- Ao avaliar uma ideia, registrar: aderência ao princípio "Complexidade por baixo, clareza por cima", impacto em arquitetura/dados/escopo do MVP, e se conflita com `@PRD.md`.
- Ideias descartadas permanecem no arquivo (não apagar), com justificativa, para não reabrir discussão já resolvida.

---

## 2026-09-17 — Reunião Trinus (Turano Construtora)

**Origem:** Transcrição de reunião comercial entre Trinus (plataforma de back-office financeiro/contábil para incorporadoras) e Turano Construtora. Não é reunião de produto do LASTRO — ideias extraídas por analogia/mapeamento.

**Contexto:** Trinus é uma plataforma que se conecta a ERPs de mercado (Sienge/CNG, Mega, UAU) e consolida dados financeiros/contábeis para preparar incorporadoras para acesso a crédito e mercado de capitais. Modelo oposto ao LASTRO (que é sem persistência, análise única por acesso), mas expõe funcionalidades de mercado relevantes para mapeamento.

### Ideias com alta aderência ao motor de cálculo atual (baixo custo de arquitetura)

- **[avaliar] Cenários múltiplos (pessimista/realista/otimista)**
  Rodar a mesma análise com N sets de premissas e comparar resultados lado a lado. Reaproveita 100% o motor de cálculo puro existente — não exige nova fonte de dados nem persistência além do que já existe na análise única.

- **[avaliar] Análise de sensibilidade visual**
  Interface que varia custo de obra × preço de venda em tempo real e mostra impacto na margem/resultado. Camada de UI sobre o motor de cálculo já existente (recalcula com parâmetros ajustados via slider).

- **[referência de UX, não funcionalidade nova] "Viabilidade Express" da Trinus**
  Fluxo de simulação rápida (poucas premissas → resultado rápido) como etapa anterior a uma análise completa. O LASTRO já é essencialmente isso; útil como validação de que o formato atual (resultado simples primeiro, detalhe progressivo) está alinhado com demanda de mercado.

### Ideias que conflitam com escopo/regras atuais do MVP (exigem decisão explícita antes de qualquer plano)

- **[descartado por ora] Smart Insumos (preço médio de insumos por região)**
  Exigiria base de dados de cotações por região. Conflita com regra de não embutir valores de CUB/mercado no código sem fonte versionada — análoga ao tratamento já dado ao CUB Sinduscon-MG.

- **[descartado por ora] Geo Insights (preço de m² por região)**
  Equivalente à base de preços de mercado (FipeZap) já avaliada e retirada do escopo do MVP conforme `@PRD.md`. Retomar exigiria nova avaliação de fonte de dados e aprovação.

- **[fora de escopo] Ficha técnica + comparação Premissas vs. Realizado ao longo do tempo**
  Exigiria persistência de histórico e múltiplas análises por projeto — MVP é intencionalmente "uma análise por acesso, sem histórico".

- **[fora de escopo] IA conversacional sobre dados do empreendimento**
  Assistente que responde perguntas em linguagem natural consultando dados históricos. Exigiria persistência que o MVP não tem. Atenção adicional: nomenclatura "IA" no domínio LASTRO é reservada a Índice/Coeficiente de Aproveitamento urbanístico — qualquer feature de IA artificial exigiria cuidado para não confundir a terminologia do produto.

- **[fora de escopo] Módulo de orçamento por composição (paramétrico/básico/executivo/custo alternativo)**
  LASTRO usa CUB ajustado simplificado (soma de aditivos), não orçamento detalhado por composição/insumo. Mudança de motor de cálculo, não é ajuste incremental.

- **[fora de escopo] Exportação de comparativos por período (3/6/12/36 meses)**
  Não se aplica sem histórico de múltiplas análises/acompanhamento contínuo.

- **[fora de escopo, produto diferente] Gestão de carteira/recebíveis, régua de inadimplência, consulta PF/PJ, integração com ERPs (Sienge/CNG/Mega/UAU)**
  Pertencem a um produto de gestão pós-venda/back-office contínuo. LASTRO é uma ferramenta de decisão pré-aquisição — natureza de produto diferente, não uma feature incremental.

---

## Backlog (itens ainda sem origem/data associada)

_(vazio — adicionar novos itens acima desta seção, mantendo ordem cronológica decrescente)_
