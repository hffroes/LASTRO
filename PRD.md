# Product Requirements Document (PRD)
## LASTRO - Land Analysis & Acquisition Viability Tool
**Versão:** 1.2 MVP  
**Data:** Setembro 2026  
**Status:** Inicial  
**Revisão 1.1:** Seções 2–4, 6 e 8 revisadas com base nas planilhas de Escopo MVP, IDs, Tabela CUB (Sinduscon-MG Ago/2026) e Base de Tipologias fornecidas pelo produto.  
**Revisão 1.2:** MVP sem autenticação e sem persistência para o usuário (acesso por link pós-compra, uma análise por acesso); referência FipeZap retirada do produto; dark mode incluído no escopo.

---

## 1. Visão Geral do Produto

### Objetivo Principal
Fornecer uma ferramenta web de análise econômica rápida para responder objetivamente duas perguntas:
1. **"Devo ou não adquirir este terreno para fazer x construção?"**
2. **"Construir isso neste terreno vai dar dinheiro?"**

A primeira olha para o preço do terreno; a segunda olha para o resultado do empreendimento. As duas são lidas pela mesma base de cálculo, mudando apenas a perspectiva (ver 4.1). O usuário escolhe explicitamente, no início do fluxo, qual das duas perguntas quer responder — esse **objetivo da análise** decide o rótulo da recomendação final (ver 2.6 e 4.4) e nunca é inferido pelo sistema.

### Público-Alvo
- Pequenos construtores e incorporadoras
- Engenheiros e arquitetos autônomos
- Corretores imobiliários
- Investidores imobiliários
- Proprietários individuais

### Valor Entregue
- **Análise econômica rápida** baseada em premissas de mercado
- **Recomendação clara**, no vocabulário do objetivo escolhido: Comprar / Não Comprar / Comprar com Ressalvas, ou Fazer / Não Fazer / Fazer com Ressalvas o empreendimento (ver 2.6, 4.4)
- **Simplicidade visual** no topo + **Complexidade técnica** acessível por baixo
- **Alertas regulatórios e técnicos** que direcionam para validações posteriores

### Princípio Arquitetural
> "Complexidade por baixo. Clareza por cima."

---

## 2. Escopo do MVP

### IN (Incluído no MVP)

#### 2.1 Análise Econômica Completa
- ✅ Cálculo de VGV (Valor Geral de Venda) = Número de Unidades × Preço de Venda da Unidade
- ✅ Método do resíduo do terreno: o app calcula quanto o terreno **pode** valer no cenário informado e compara com o preço pedido
- ✅ Aplicação de premissas flexíveis por **padrão** de acabamento:
  - Percentual de custo do terreno (Baixo 8%, Normal 9%, Alto 10% do VGV)
  - Percentual de lucro do incorporador (Baixo 20%, Normal 22%, Alto 25% do VGV)
  - Custo de obra (CUB base Sinduscon-MG + aditivos de fundação, padrão, topografia e formato)
  - Despesas gerais sobre o VGV (marketing, comissões, impostos/taxas, despesas financeiras) — parametrizadas
- ✅ Identificação se percentuais estão na normalidade (não apenas lucro > 0)
- ✅ Cálculo do preço máximo recomendado para o terreno
- ✅ Toggle de perspectiva **Terrenista × Incorporador** (ver 2.6)

#### 2.2 Formulário de Entrada de Dados

**Etapa 1 — Informação do terreno:**
- ✅ Nome / identificação do terreno (texto livre, usado no histórico e nas exportações)
- ✅ Cidade (caixa de seleção com os municípios de Minas Gerais, filtrando conforme digitação)
- ✅ CEP (auto-preenchimento de logradouro e bairro via API pública de CEP — ver 3.4)
- ✅ Área total do terreno (m²)
- ✅ Preço pedido pelo terreno (R$)
- ✅ Preço unitário do terreno (R$/m², **calculado**: Preço pedido ÷ Área total)
- ✅ Formato do lote (regular, irregular) — com representação gráfica explicando cada opção
- ✅ Topografia (plana, regular, irregular, acidentada) — com representação gráfica do perfil topográfico

**Etapa 2 — Produto (o que quero fazer?):**
- ✅ Tipo de projeto: Residencial, Comercial, Galpões
- ✅ Tipologia do empreendimento:
  - Casa (unifamiliar)
  - Prédio (multifamiliar)
  - Comercial — Salas e Lojas
  - Comercial — Andares Livres (andar corrido)
  - Galpões industriais, comerciais e logísticos
  - Uso misto *(mapeamento CUB TBD — ver 3.1)*
- ✅ Padrão de acabamento: Baixo, Normal, Alto
- ✅ Número de pavimentos
- ✅ Número de unidades por pavimento
  - Casa e Galpões: restrito a 1 unidade por pavimento e, portanto, 1 unidade total
- ✅ Número total de unidades (**calculado**: pavimentos × unidades por pavimento)
- ✅ Área da unidade vendida (m²) — unidade vendida é casa, apartamento, sala/loja ou galpão
- ✅ Preço de venda da unidade (R$)
  - App calcula e mostra automaticamente o **preço por m² vendido** (Preço da unidade ÷ Área da unidade)
  - O preço por m² é devolvido ao usuário para que ele próprio confronte com o mercado da região (o MVP não consulta base de preços — ver 3.4)
- ✅ Taxa de ocupação (parâmetro ajustável, default 0,6 — ver 3.3)
- ✅ Áreas e coeficientes **calculados** e exibidos para o usuário validar junto ao plano diretor:
  - Área utilizada do terreno (m²)
  - Área total construída (m²)
  - Coeficiente da soma da metragem das unidades por metragem de pavimento (%)
  - Coeficiente de aproveitamento (CA) atingido

*Nota: os campos exibidos variam conforme a tipologia escolhida. É crucial incluir TODAS as variáveis pertinentes para a classificação correta na tabela CUB Sinduscon-MG (tipo de projeto + tipologia + faixa de pavimentos + padrão).*

#### 2.3 Cálculo Automatizado
- ✅ Cálculo da área utilizada do terreno a partir da taxa de ocupação e da área total construída a partir do número de pavimentos
- ✅ Cálculo do coeficiente de aproveitamento (CA) **atingido** pelo programa, para o usuário validar contra a legislação local
- ✅ Sugestão de m² construído baseada em fórmula, com possibilidade de ajuste manual
- ✅ Ajuste automático do custo de obra conforme faixa de pavimentos (fundação), padrão, topografia e formato do lote

#### 2.4 Alertas Técnicos e Regulatórios
- ✅ Alerta genérico indicando necessidade de validação antes da aquisição:
  - Parâmetros urbanísticos (CA, taxa de ocupação, altura máxima, recuos)
  - Zoneamento adequado — lei de uso e ocupação do solo do município e plano diretor
  - Documentação do imóvel, inscrições municipais e afins
  - Capacidade de solo/fundações
  - Infraestrutura (acesso, utilidades)
  - Impacto da topografia na execução
  - Legislação local e ambiental
- ✅ Alertas de normalidade econômica (KPIs, ver 4.2):
  - **Custo de obra / VGV fora da faixa 40%–65%** — chama a atenção do usuário para custo de implementação muito baixo ou muito alto para a tipologia
  - **Despesas gerais / VGV fora da faixa 10%–15%**
  - Preço pedido pelo terreno acima do Resultado Terreno calculado
- ✅ Alerta de eficiência de projeto:
  - **Coeficiente da soma da metragem das unidades por metragem de pavimento fora da faixa 80%–85%** — o coeficiente considera a **soma da área de todas as unidades do pavimento**, nunca a área de uma unidade isolada (num prédio de 4 unidades por andar, contabilizam-se as 4). Abaixo da faixa indica que as unidades podem ser otimizadas; acima indica unidades grandes demais para a área de aproveitamento (hall, corredores, escadas e elevadores). Não se aplica a projetos residenciais de casas
- ✅ Alerta qualitativo de adequação ao mercado:
  - Tipologia, preço por m² e padrão de acabamento escolhidos devem ser coerentes com o perfil socioeconômico do bairro/região (evitar produto luxuoso em região de menor poder aquisitivo e vice-versa)
- ✅ Entrega um **estudo de viabilidade preliminar**: os alertas apontam exatamente onde está a due diligence necessária (zoneamento, plano diretor, documentação/matrícula, capacidade de solo, legislação local) para o usuário avançar com segurança à etapa seguinte — análise documental e regulatória aprofundada é produto futuro (Fase 2+, ver seção 8)

#### 2.5 Output e Recomendação
Estrutura de resultado:
```
LASTRO SCORE: XX/100
DECISÃO: 🟢 COMPRAR | 🟡 COMPRAR COM RESSALVAS | 🔴 NÃO COMPRAR

Projeto analisado:
[Resumo da tipologia e dados]

Potencial preliminar:
- m² construídos
- m² comercializáveis
- Número de unidades estimadas

Preço solicitado pelo terreno:
R$ X.XXX.XXX

Preço máximo recomendado para o cenário:
R$ X.XXX.XXX

Composição de custos (Simplificada):
┌─────────────────────────────────┬──────────┬──────────────┐
│ Componente                      │ Valor R$ │ % do VGV     │
├─────────────────────────────────┼──────────┼──────────────┤
│ VGV Total                       │ X.XXX.XX │ 100%         │
│ - Custo de Obra                 │ X.XXX.XX │ X%           │
│ - Despesas Gerais               │ X.XXX.XX │ X%           │
│ - Lucro Incorporador            │ X.XXX.XX │ X%           │
├─────────────────────────────────┼──────────┼──────────────┤
│ = Resultado Terreno             │ X.XXX.XX │ X%           │
│ - Preço Pedido pelo Terreno     │ X.XXX.XX │ X%           │
├─────────────────────────────────┼──────────┼──────────────┤
│ Sobra/Déficit                   │ X.XXX.XX │ X%           │
└─────────────────────────────────┴──────────┴──────────────┘

Principal risco / Oportunidade:
[Identificação do fator limitador ou acelerador]

O que precisa ser confirmado antes da proposta:
1. [Item urbanístico/técnico/legal]
2. [Item urbanístico/técnico/legal]
3. [Item urbanístico/técnico/legal]

Recomendação:
[Texto claro e direto sobre viabilidade e próximos passos]
```

> O rótulo da linha DECISÃO depende do **objetivo da análise** escolhido pelo usuário (ver 2.6): objetivo "comprar o terreno" mostra COMPRAR / COMPRAR COM RESSALVAS / NÃO COMPRAR; objetivo "executar o empreendimento" mostra FAZER O EMPREENDIMENTO / FAZER COM RESSALVAS / NÃO FAZER O EMPREENDIMENTO (ver 4.4). O score, os limiares e o resto da estrutura são idênticos — só a palavra muda.

#### 2.6 Interatividade
- ✅ **Objetivo da análise** — antes de preencher o formulário, o usuário escolhe explicitamente qual das duas perguntas do produto (seção 1) quer responder. É uma escolha obrigatória, nunca inferida pelo sistema:
  - **Comprar o terreno**: a pergunta é se deve adquirir o terreno pelo preço pedido
  - **Executar o empreendimento**: a pergunta é se vale construir o programa informado no terreno (já adquirido, ou com preço já definido)
  - Essa escolha define a perspectiva padrão abaixo (Terrenista para "comprar o terreno", Incorporador para "executar o empreendimento") e o rótulo da recomendação final (ver 4.4). O usuário pode alternar a perspectiva depois pelo toggle, para explorar a outra leitura, sem que isso mude o objetivo nem recomece a análise
- ✅ Usuário pode ajustar premissas (preço de venda, % de lucro, custos) em tempo real
- ✅ Resultado atualiza dinamicamente com os ajustes
- ✅ Visualização clara do impacto de cada mudança
- ✅ **Toggle de perspectiva** — a mesma análise pode ser lida de dois pontos de vista:
  - **Terrenista**: o lucro do incorporador é fixado pela premissa do padrão e o resultado é o **Resultado Terreno** (quanto o terreno pode valer). O usuário avalia o negócio pela variação do terreno em relação ao todo
  - **Incorporador**: o preço pedido pelo terreno é fixado como dado de entrada e o resultado é a **margem de lucro resultante** para o incorporador
  - Ambos partem da mesma base de cálculo (seção 4.1); muda apenas qual variável é fixada e qual é resolvida

#### 2.7 Acesso e Persistência

**Sem autenticação no MVP.** Não há cadastro, login, senha nem conta de usuário. O acesso é liberado pela compra e mantido por um link pessoal enviado por e-mail.

- ✅ **1º acesso**: o usuário conclui o checkout de compra → com a compra confirmada, ele é levado direto à página inicial do produto **e** recebe por e-mail o link de acesso
- ✅ **2º acesso e seguintes**: pelo link recebido no e-mail
- ✅ **Validação de acesso**: o servidor valida cada acesso pelo **token do link** contra o **email de compra registrado**. Somente o email para o qual o link foi emitido (aquele confirmado na compra via Kiwify) pode acessar o link. O registro mínimo armazena: e-mail, token (hash seguro), data de emissão e validade. Isso permite expirar e revogar acessos por email específico. Nenhum dado de análise do usuário é guardado nesse registro
- ✅ **Uma análise por acesso, sem persistência para o usuário**: cada acesso é uma análise nova. O usuário não tem histórico, não salva e não retoma análises anteriores — **para conservar um resultado, ele precisa exportá-lo** (ver 2.8)
- ✅ **Armazenamento interno da LASTRO**: os resultados gerados e os dados de uso (acessos, tempo de permanência no link e afins) são armazenados pela LASTRO para acompanhamento do produto. Esses dados não são devolvidos ao usuário nem compõem histórico na interface (ver 6.3 para tratamento e privacidade)

*Decisão de arquitetura: autenticação, múltiplas análises e histórico foram deliberadamente adiados para simplificar o MVP — ver Roadmap (seção 8).*

#### 2.8 Exportação
- ✅ Relatório em PDF com resultado completo
- ✅ Relatório em HTML compartilhável (link para terceiros)
- ✅ **A exportação é a única forma de o usuário conservar a análise** — sem ela, o resultado se perde ao fim do acesso. A interface deve deixar isso explícito antes que o usuário saia da tela de resultado
- ✅ O documento exportado carrega o snapshot das premissas e da versão de dados usadas no cálculo (auditoria — ver 10.5)

#### 2.9 Onboarding e UX
- ✅ Onboarding explicando a metodologia no primeiro acesso, com opção de revê-lo
- ✅ Acesso direto ao formulário de análise nos acessos seguintes
- ✅ Responsivo para mobile e desktop
- ✅ **Dark mode** — o design system LASTRO já define a paleta escura (`--lastro-dark-*`)

#### 2.10 Dados de Baseline
- ✅ Parâmetros centralizados (sem números mágicos no código), versionados e com snapshot no resultado exportado e no registro interno:
  - Percentuais de terreno e lucro por padrão
  - Tabelas de aditivos (fundação, padrão, topografia, formato)
  - Composição das despesas gerais sobre o VGV
  - Taxa de ocupação default
  - Faixas de normalidade dos KPIs
- ✅ **Dados de importação periódica (processo manual/admin)** — não há API pública confirmada:
  - CUB Sinduscon-MG: custo unitário básico de construção (R$/m²), publicado em boletim mensal em PDF
- ✅ **Integração com API pública externa:**
  - Consulta de CEP (ex.: ViaCEP) para auto-preenchimento de logradouro e bairro

### OUT (Fora do Escopo MVP)

#### Fase 2+
- ❌ Loteamento como tipo de projeto (modelo de custo de urbanização não usa CUB e ainda não está definido) → *Roadmap, seção 8*
- ❌ "Comprar a terra / Terra para investir" (análise de valorização, sem construção) → *Roadmap, seção 8*
- ❌ Conjuntos de casas, prédios ou galpões (múltiplas edificações em um mesmo terreno)
- ❌ **Autenticação de usuário** (cadastro, login, senha, conta) → *Roadmap, seção 8*
- ❌ **Múltiplas análises, histórico e retomada de análise salva** → *Roadmap, seção 8*
- ❌ **Base de preços de mercado** (a referência FipeZap foi retirada do produto; o usuário confronta o preço por m² com o mercado por conta própria)
- ❌ Análise técnica profunda (fundações, solo, topografia detalhada) → *Futuro produto da LASTRO*
- ❌ Mobile app nativo (apenas web responsivo v1)
- ❌ Integração com plataformas (OLX, imobiliárias)
- ❌ Marketplace de terrenos
- ❌ Cálculos de financiamento/empréstimos
- ❌ Colaboração multi-user em tempo real
- ❌ Análise geográfica e mapas
- ❌ Cálculo detalhado de impostos e tributos
- ❌ Comparativo automático entre múltiplos ativos
- ❌ Exportação em Excel (próximo passo após PDF)

---

## 3. Dados e Parâmetros

### 3.1 Tipologias Suportadas (MVP)

**Percentuais de Terreno e Lucro — definidos pelo Padrão, não pela tipologia:**

| Padrão | Terreno (% VGV) | Lucro Incorporador (% VGV) |
|--------|-----------------|----------------------------|
| Baixo  | 8%  | 20% |
| Normal | 9%  | 22% |
| Alto   | 10% | 25% |

*Nota: são os mesmos percentuais para todas as tipologias. Valores provisórios e centralizados como parâmetros — serão refinados e validados com base em estudos de mercado.*

*Nota de divergência da fonte: o exemplo de cálculo de referência da planilha "Escopo MVP" aplica 20% de lucro a um projeto de padrão **Normal** (cuja premissa tabelada é 22%). A tabela acima segue a planilha "IDs" (fonte da taxonomia). A divergência está registrada e pendente de validação.*

**Classificação CUB Sinduscon-MG:**

O CUB (Custo Unitário Básico) é baseado nos projetos-padrão da ABNT NBR 12.721:2006 e divulgado pela Sinduscon-MG. A classificação correta é crítica pois determina qual valor de CUB será aplicado no cálculo.

A tabela oficial tem o **Padrão como coluna separada** do código do projeto — não existem códigos combinados do tipo `R8-B` ou `CSL-8-A`. A chave de consulta é: **Tipo de Projeto + Tipologia + Faixa de Pavimentos → Projeto CUB**, e depois **Projeto CUB + Padrão → Valor R$/m²**.

**Mapeamento Tipologia Lastro → Projeto CUB (por faixa de pavimentos):**

| Tipo de Projeto | Tipologia Lastro | Pavimentos | Projeto CUB |
|-----------------|------------------|------------|-------------|
| Residencial | Casa (unifamiliar) | 1 | R-1 |
| Residencial | Casa (unifamiliar) | 2+ | R-1 |
| Residencial | Prédio (multifamiliar) | até 4 | R-8 |
| Residencial | Prédio (multifamiliar) | até 8 | R-8 |
| Residencial | Prédio (multifamiliar) | entre 8 e 16 | R-16 |
| Residencial | Prédio (multifamiliar) | 16+ | R-16 |
| Comercial | Salas e Lojas | até 4 / até 8 | CSL-8 |
| Comercial | Salas e Lojas | entre 8 e 16 / 16+ | CSL-16 |
| Comercial | Andares Livres | até 4 / até 8 | CAL-8 |
| Comercial | Andares Livres | entre 8 e 16 / 16+ | CAL-16 *(TBD — ver nota)* |
| Galpões | Galpões industriais, comerciais e logísticos | 1 | GI |
| Uso Misto | Uso Misto | — | **TBD** — sem mapeamento na fonte |

**Valores CUB de referência (Sinduscon-MG, competência Agosto/2026, R$/m²):**

| Projeto CUB | Baixo | Normal | Alto |
|-------------|-------|--------|------|
| R-1  | 2.562,62 | 3.102,16 | 3.852,38 |
| R-8  | 2.285,68 | 2.554,58 | 3.120,21 |
| R-16 | — | 2.480,39 | 3.223,52 |
| CSL-8  | — | 2.490,95 | 2.749,80 |
| CSL-16 | — | 3.335,25 | 3.680,45 |
| CAL-8  | — | 2.954,74 | 3.213,83 |
| GI | padrão único: 1.333,76 | | |

*Estes valores são um snapshot da competência Agosto/2026 e servem apenas como referência do formato. Os valores efetivos vêm da base importada (ver 3.4) e nunca devem ser embutidos no código.*

**Lacunas conhecidas da tabela CUB (TBD, exigem decisão de produto):**
- A tabela Sinduscon-MG **não publica** valores de padrão Baixo para R-16, CSL-8, CSL-16 e CAL-8. Projetos Lastro nessas combinações precisam de uma regra de fallback definida (ex.: usar o padrão Normal com aditivo reduzido) — **TBD, não inventar valor**.
- O código **CAL-16** aparece na base de tipologias, mas **não existe** na tabela CUB Sinduscon-MG Ago/2026 (só CAL-8). Fallback **TBD**.
- **Uso Misto** não tem exemplo nem mapeamento CUB em nenhuma fonte — mantido no MVP com mapeamento **TBD**.
- Os projetos `PP-4`, `PIS` e `RP1Q` existem na tabela CUB mas não têm tipologia Lastro correspondente — não utilizados no MVP.
- Inconsistência registrada entre as fontes: a planilha "IDs" define 4 tipos de projeto (Residencial, Comercial, Galpões, Comprar a terra) e a "Base de Tipologias" inclui também "Loteamento". Como ambos ficaram fora do MVP (seção 2 — OUT), a inconsistência não é bloqueante.

**Sobre "área equivalente":**
O MVP **não** utiliza a metodologia de área equivalente (ponderada) da NBR 12.721. O custo de obra é calculado aplicando o CUB ajustado (R$/m²) diretamente sobre a **área total construída** real do projeto (ver 3.3 e 4.1).

### 3.2 Aditivos Aplicados ao CUB

O CUB da NBR 12.721 **não** contempla fundações, elevadores, equipamentos e instalações especiais (ar-condicionado, bombas, exaustão), urbanização, paisagismo, lazer, piscinas, projetos (arquitetônico, estrutural, instalações), impostos e emolumentos cartoriais, nem a remuneração do construtor e do incorporador. Os aditivos abaixo cobrem essas lacunas e as condições específicas do terreno.

São **quatro aditivos independentes**, cada um com sua própria tabela.

**A. Aditivo Fundação — varia pela faixa de pavimentos (independente do padrão):**

| Faixa de Pavimentos | Aditivo |
|---------------------|---------|
| 1 | 4% |
| 2+ | 5% |
| até 4 | 7% |
| até 8 | 10% |
| entre 8 e 16 | 15% |
| 16+ | 20% |

**B. Aditivo Padrão — varia só pelo padrão de acabamento (igual para todas as tipologias):**

| Padrão | Aditivo | Escopo coberto |
|--------|---------|----------------|
| Baixo  | 10% | Projetos e especialidades mínimas |
| Normal | 15% | Projetos, elevadores, urbanismo e afins |
| Alto   | 20% | Projetos, múltiplos elevadores, lazer, sistemas especiais e acabamentos premium |

**C. Aditivo Topografia:**

| Topografia | Aditivo |
|------------|---------|
| Plana | 0% |
| Regular | 1,5% |
| Irregular | 3% |
| Acidentada | 5% |

**D. Aditivo Formato do Lote:**

| Formato | Aditivo |
|---------|---------|
| Regular | 0% |
| Irregular | 0,5% |

**Cálculo Final do CUB Ajustado:**

Os aditivos são **somados** e aplicados em **uma única multiplicação** sobre o CUB base (não em cadeia):

```
Soma dos Aditivos = Aditivo Fundação + Aditivo Padrão + Aditivo Topografia + Aditivo Formato
CUB Ajustado      = CUB Base × (1 + Soma dos Aditivos)
Custo de Obra     = CUB Ajustado × Área Total Construída
```

*Exemplo de referência (prédio, padrão Normal, 4 pavimentos, topografia Regular, formato Regular):*
`Soma dos Aditivos = 7% + 15% + 1,5% + 0% = 23,5%` → `CUB Ajustado = 2.554,58 × 1,235 = R$ 3.154,91/m²`

*Todos os percentuais acima são parâmetros centralizados e versionados, nunca números mágicos no código. É necessário um documento técnico que explique a origem e a composição de cada aditivo (pendência registrada na fonte).*

### 3.3 Áreas, Taxa de Ocupação e Coeficiente de Aproveitamento (CA)

> **CA = Coeficiente de Aproveitamento urbanístico** (antes chamado "IA" no produto).

No MVP o CA **não** é um coeficiente pré-determinado que dita a área construída. O programa do empreendimento é informado pelo usuário e o CA atingido é **calculado** e devolvido para que ele valide contra o plano diretor e a lei de uso e ocupação do solo do seu município.

**Parâmetro base:**

| Parâmetro | Default | Observação |
|-----------|---------|------------|
| Taxa de Ocupação | 0,6 | Padrão da ferramenta, ajustável pelo usuário. Valor provisório e centralizado, a validar por município |

**Cadeia de cálculo das áreas (as quatro áreas são distintas e não se confundem):**

```
Área Utilizada do Terreno = Área Total do Terreno × Taxa de Ocupação
Área Total Construída     = Área Utilizada do Terreno × Número de Pavimentos
Área Comercializável      = Número Total de Unidades × Área da Unidade Vendida

Coeficiente de Aproveitamento (CA) atingido = Área Total Construída ÷ Área Total do Terreno
Coeficiente da soma da metragem das unidades por metragem de pavimento
    = (Unidades por Pavimento × Área da Unidade) ÷ Área Utilizada do Terreno
      (o numerador é a SOMA das áreas de todas as unidades do pavimento)
```

- O **Custo de Obra** incide sobre a **Área Total Construída** (inclui hall, corredores, escadas e elevadores).
- O **VGV** incide sobre as **unidades vendidas** (área comercializável), nunca sobre a área construída.
- O **coeficiente da soma da metragem das unidades por metragem de pavimento** deve ficar entre **80% e 85%**; o residual corresponde a hall, corredores, escadas e elevadores. O numerador soma **todas** as unidades do pavimento — nunca uma unidade isolada. Não se aplica a projetos residenciais de casas.
- **Taxa de ocupação, CA e altura máxima admissíveis por zona**: não embutidos no MVP — o app exibe os valores atingidos e alerta o usuário para validá-los na legislação local.

### 3.4 Dados Externos

- **CUB Sinduscon-MG**: custo unitário básico por projeto-padrão (R$/m²)
  - Base: ABNT NBR 12.721:2006 (série CUB/2006, não comparável à série anterior)
  - Publicado mensalmente pelo Sinduscon-MG em **boletim PDF** — **não há API pública conhecida**
  - **Processo no MVP**: importação periódica/manual por administrador, com registro de competência (mês/ano), data de emissão e arquivo de origem
  - Consultado conforme a classificação do formulário (projeto CUB + padrão) e aplicado com os aditivos da seção 3.2

- **API pública de CEP** (ex.: ViaCEP): consulta GET, sem chave
  - Uso: auto-preenchimento de logradouro e bairro a partir do CEP informado
  - Falha ou indisponibilidade **não bloqueia** a análise — o usuário preenche manualmente
  - Sujeita à verificação técnica de disponibilidade e termos de uso antes da implementação

**Sem base de preços de mercado no MVP:** a referência FipeZap foi retirada do produto. O app calcula e exibe o preço por m² vendido, mas não o confronta com nenhuma base — cabe ao usuário avaliar se o preço é compatível com o mercado da região (ver alerta qualitativo em 2.4).

**Armazenamento, Versionamento e Fallback (CUB):**
- Cada importação gera uma versão datada; nada é sobrescrito
- O resultado exportado e o registro interno preservam o snapshot da versão de dados usada (auditoria de premissas)
- Sistema alerta o usuário se os dados estiverem desatualizados (critério TBD, ex.: mais de 30 dias)
- Fallback: manter as últimas N versões disponíveis e continuar operando com a mais recente válida

### 3.5 Região de Cobertura (MVP)

- **Minas Gerais** (v1)
- Expansão para outros estados em roadmap futuro

---

## 4. Lógica de Cálculo

### 4.1 Fórmula Geral de Viabilidade (Método do Resíduo do Terreno)

O app calcula quanto o terreno **pode** valer no cenário informado (Resultado Terreno) e compara com o preço pedido.

```
VGV                 = Número Total de Unidades × Preço de Venda da Unidade
Custo de Obra       = CUB Ajustado × Área Total Construída
Despesas Gerais     = Soma das Despesas Gerais (% do VGV) × VGV
Lucro Incorporador  = % de Lucro do Padrão × VGV

Resultado Terreno   = VGV − Custo de Obra − Despesas Gerais − Lucro Incorporador
Resultado Líquido   = Resultado Terreno − Preço Pedido pelo Terreno

Viável se: Resultado Líquido >= 0
```

Onde:
- **VGV** = Número de Unidades × Preço de Venda da Unidade (nunca m² × preço/m²)
- **CUB Ajustado** = CUB Base × (1 + Soma dos Aditivos), conforme 3.2
- **Área Total Construída** = Área Utilizada do Terreno × Nº de Pavimentos, conforme 3.3
- **Lucro Incorporador** = % do VGV conforme o padrão (Baixo 20%, Normal 22%, Alto 25%)

**Composição das Despesas Gerais (aplicadas sobre o VGV):**

| Componente | % do VGV |
|------------|----------|
| Venda e Marketing | 1,0% |
| Comissões | 5,0% |
| Impostos e taxas | 4,5% |
| Despesas financeiras | 1,5% |
| **Total aplicado sobre o VGV (adotado no MVP)** | **11,0%** |

*Nota: os quatro percentuais aparecem na fonte como um cenário específico. São adotados como padrão único no MVP (parametrizados e centralizados, não hardcoded no código) e precisam de validação adicional — pode ser que variem por tipologia ou padrão.*

> ⚠️ **Divergência aritmética na fonte (pendente de decisão):** a itemização acima soma **12,0%**, mas a planilha de referência declara e aplica **11,0%** no cálculo (a célula de soma parece não incluir "Venda e Marketing": 5% + 4,5% + 1,5% = 11%). O MVP adota **11,0%** para reproduzir o exemplo de referência. É necessário confirmar com o produto se o total correto é 11% ou 12% e, no segundo caso, revisar os exemplos — **não ajustar nenhum componente por conta própria**.

**Perspectiva de leitura (toggle):**
- **Terrenista**: o Lucro Incorporador é fixado pela premissa do padrão e o **Resultado Terreno** é a variável resolvida — é o preço máximo recomendado para o terreno
- **Incorporador**: o **Preço Pedido pelo Terreno** é fixado como entrada e o **lucro resultante** é a variável resolvida:
  `Lucro Resultante = VGV − Custo de Obra − Despesas Gerais − Preço Pedido pelo Terreno`

Ambas as perspectivas usam a mesma base de cálculo; muda apenas qual variável é fixada e qual é resolvida.

### 4.2 Análise de Normalidade dos Percentuais (KPIs)

**Além da viabilidade numérica, o app analisa se os percentuais de cada componente estão dentro da normalidade:**

| Indicador | Faixa esperada | Aplicabilidade |
|-----------|----------------|----------------|
| Resultado Terreno / VGV | 8% a 10% conforme o padrão (Baixo 8%, Normal 9%, Alto 10%) | Todas |
| Custo de Obra / VGV | **40% a 65%** | Todas |
| Despesas Gerais / VGV | 10% a 15% | Todas |
| Lucro Incorporador / VGV | 20% a 25% conforme o padrão (Baixo 20%, Normal 22%, Alto 25%) | Todas |
| Coeficiente da soma da metragem das unidades por metragem de pavimento | 80% a 85% | N/A para casas unifamiliares |

**Alertas de Normalidade:**
- Se Preço Pedido pelo Terreno > Resultado Terreno: "Preço ofertado acima do viável para o projeto hipotético — recomenda-se negociar ou ajustar o projeto"
- Se Resultado Terreno / VGV < limite inferior do padrão: "Margem do terreno no limite inferior de viabilidade — é viável, mas apertada"
- Se Custo de Obra / VGV estiver **fora da faixa 40%–65%**: "Custo de implementação muito abaixo/acima do esperado para esta tipologia" (KPI de alerta ao usuário, em ambas as direções)
- Se Despesas Gerais / VGV estiver fora de 10%–15%: "Despesas gerais fora do intervalo usual"
- Se Lucro% < limite inferior da faixa: "Margem de lucro abaixo do esperado para este mercado"
- Se o coeficiente da soma da metragem das unidades por metragem de pavimento < 80%: "Há espaço para otimizar o tamanho das unidades"
- Se o coeficiente da soma da metragem das unidades por metragem de pavimento > 85%: "Unidades grandes demais para a área de aproveitamento — revisar o projeto"

*Os alertas são orientativos, não conclusivos, e não bloqueiam a análise.*

### 4.3 LASTRO SCORE (0-100)

Score baseado em:
- Margem de viabilidade (40 pontos)
- Conformidade de percentuais (30 pontos)
- Risco técnico/regulatório (20 pontos)
- Potencial de mercado (10 pontos)

*Metodologia detalhada a ser definida na fase de desenvolvimento.*

> **Pendência registrada (revisão 1.1):** os **pesos (40/30/20/10)** e os **limiares de recomendação (4.4)** foram mantidos sem alteração nesta revisão. Apenas os **inputs** que alimentam o score foram realinhados às faixas e percentuais das seções 3 e 4.2. A metodologia de pontuação do LASTRO Score segue **pendente de validação** e só pode ser alterada com aprovação explícita.

> ⚠️ **Pendência aberta pela revisão 1.2:** com a retirada da base FipeZap, o critério **"Potencial de mercado (10 pontos)"** fica **sem fonte de dados**. Definir como pontuá-lo (por critério qualitativo, por outro indicador, ou redistribuindo os 10 pontos) é uma alteração do LASTRO Score e **exige aprovação explícita** — não resolver por conta própria na implementação.

### 4.4 Recomendação Final

O rótulo depende do **objetivo da análise** escolhido pelo usuário (ver 2.6); a nota e os limiares são idênticos nos dois casos — só a palavra muda.

**Objetivo "Comprar o terreno" (perspectiva Terrenista):**
- 🟢 **COMPRAR**: Viável, score > 70, todos os percentuais OK
- 🟡 **COMPRAR COM RESSALVAS**: Viável mas score 50-70 ou algum percentual fora do padrão
- 🔴 **NÃO COMPRAR**: Inviável ou score < 50

**Objetivo "Executar o empreendimento" (perspectiva Incorporador):**
- 🟢 **FAZER O EMPREENDIMENTO**: Viável, score > 70, todos os percentuais OK
- 🟡 **FAZER COM RESSALVAS**: Viável mas score 50-70 ou algum percentual fora do padrão
- 🔴 **NÃO FAZER O EMPREENDIMENTO**: Inviável ou score < 50

> **Decisão registrada (revisão pós-F03):** a dualidade já estava prevista na seção 1 (as duas perguntas do produto) e no toggle de perspectiva (2.6), mas a Recomendação Final só tinha rótulo de compra — quem já possui o terreno e lê pela perspectiva Incorporador recebia "COMPRAR", sem sentido. Aprovado explicitamente: o objetivo escolhido pelo usuário decide qual dos dois conjuntos de rótulos aparece. Os pesos do Score (4.3) e os limiares acima **não mudam**.

---

## 5. Fluxo de Usuário

Não há cadastro, login nem histórico. O acesso nasce da compra e se mantém por um link pessoal (ver 2.7).

### 5.1 Primeiro Acesso (pós-compra)
1. Usuário conclui o **checkout de compra** (Kiwify)
2. Compra confirmada → a plataforma notifica a LASTRO, que emite o **link de acesso** (token + validade) para aquele e-mail
3. Em paralelo:
   - Usuário é levado direto à **página inicial do produto**, já com acesso liberado
   - Usuário **recebe o link de acesso por e-mail** (Resend), para voltar depois
4. Onboarding explicando a metodologia
5. "Começar análise" → formulário vazio

### 5.2 Acessos Seguintes
1. Usuário abre o **link recebido por e-mail**
2. Servidor valida o token contra o registro de acessos (válido / expirado / revogado)
   - Link inválido ou expirado → tela explicando o motivo e como recuperar o acesso
3. Acesso liberado → vai direto ao formulário de análise (onboarding fica disponível para consulta, mas não se repete)

### 5.3 Fluxo de Análise
1. **Escolher o objetivo da análise**: comprar o terreno ou executar o empreendimento (ver 2.6) — decide a perspectiva padrão e o rótulo da recomendação
2. **Preencher formulário**: dados do terreno (Etapa 1) e do produto (Etapa 2)
3. **Sistema calcula**: VGV, custo de obra, despesas, resíduo do terreno e viabilidade
4. **Mostra resultado interativo**: Score, decisão (rótulo conforme o objetivo escolhido), composição de custos, alertas
5. **Usuário ajusta**: muda premissas na perspectiva Terrenista ou Incorporador e vê o resultado atualizar
6. **Exporta**: PDF ou HTML — **único meio de conservar a análise**; a interface avisa que o resultado não fica salvo
7. Nova análise → recomeça do formulário vazio; a análise anterior **não** é recuperável pelo usuário

*Nos bastidores, cada análise gerada e os dados de uso são registrados pela LASTRO (ver 2.7 e 6.3), sem qualquer efeito sobre o que o usuário vê.*

---

## 6. Requisitos Técnicos

### 6.1 Stack (React Full-Stack)

**Frontend:**
- React 18+ com TypeScript
- Vite como build tool
- Responsive design (CSS Modules ou Tailwind)
- Estrutura: `/src/components`, `/src/pages`, `/src/hooks`, `/src/types`
- **Design system obrigatório**: toda a parte visual (cor, tipografia, espaçamento, raio, sombra, elevação, ícones, tema claro/escuro) segue os parâmetros definidos em `design-system/` no repositório — tokens em `design-system/tokens/tokens.css`, diretrizes em `design-system/README.md` e o guia visual em `design-system/guide/Lastro Design System.dc.html`. Nenhum componente define cor, fonte, raio ou espaçamento fora desses tokens; ícones restritos ao set Lucide (traço 1.75px, 18px na interface — ver README). Divergência do design system exige justificativa e ajuste do próprio design system, nunca um valor visual avulso no componente

**Backend:**
- Node.js com Express
- RESTful API (`/api/v1/*`)
- Estrutura: `/server/routes`, `/server/middleware`, `/server/models`, `/server/controllers`

**Database:**
- PostgreSQL (Replit Database integrado)
- ORM: Prisma ou TypeORM (TBD)
- Tabelas do MVP — **não há tabela `users`** (sem autenticação):
  - `accesses`: acessos emitidos na compra (e-mail, token, validade, estado). Base da validação do link e dos indicadores de uso
  - `access_events`: eventos de uso (abertura do link, tempo de permanência e afins)
  - `analyses`: resultados gerados, armazenados pela LASTRO para acompanhamento do produto — **não expostos ao usuário** e sem função de histórico na interface
  - `external_data`: versões importadas do CUB
  - `parameters`: premissas e faixas centralizadas e versionadas

**Acesso (sem autenticação):**
- Sem cadastro, login, senha ou sessão de usuário — portanto **sem JWT de usuário e sem bcrypt** no MVP
- Link de acesso com token de alta entropia, validado no servidor contra `accesses`, com expiração e possibilidade de revogação

**Integração Externa:**
- **Kiwify** (checkout): webhook de compra aprovada dispara a emissão do acesso. Exige validação da assinatura do webhook e tratamento idempotente (reenvios não podem gerar acessos duplicados)
- **Resend** (e-mail transacional): envio do e-mail com o link de acesso. Falha de envio precisa ser observável e reprocessável — o usuário que pagou não pode ficar sem link
- **API pública de CEP** (ex.: ViaCEP): GET, sem chave, para auto-preenchimento de logradouro e bairro. Falha na consulta não bloqueia a análise (preenchimento manual como fallback). Disponibilidade e termos de uso a verificar antes da implementação
- **CUB Sinduscon-MG: sem integração via API.** Não há API pública confirmada (o CUB é publicado em boletim mensal PDF). É tratado como **dado de importação periódica**:
  - Rotina administrativa de importação (upload/parse do boletim ou carga de planilha) para a tabela `external_data`
  - Cada carga registra competência, data de emissão e origem; versões anteriores são preservadas
  - Aplicação consome sempre a versão vigente, com fallback para a última versão válida e alerta de dados desatualizados

**Ambiente de Desenvolvimento:**
- Replit.dev (IDE integrado)
- Ambiente variáveis via .env

### 6.2 Performance
- Cálculo de resultado em < 500ms
- Atualização dinâmica em tempo real com ajustes
- Exportação PDF em < 3s

### 6.3 Segurança e Privacidade
- Validação de entrada em formulário (frontend e, obrigatoriamente, backend)
- HTTPS obrigatório
- Proteção de dados sensíveis (dados de terreno não públicos)
- **Link de acesso**: token de alta entropia, imprevisível, transmitido só por e-mail e sobre HTTPS. Como o link é o único fator de acesso, ele precisa ter validade definida (TBD) e poder ser revogado. Quem tiver o link tem acesso — o risco de repasse é aceito nesta versão e some quando a autenticação entrar (seção 8)
- **Webhook de compra**: validar assinatura da Kiwify e tratar reenvios de forma idempotente
- **Dados armazenados pela LASTRO** (resultados de análise e uso): embora o usuário não tenha conta, o e-mail da compra e os dados do terreno analisado são dados pessoais/de negócio. Definir base legal, política de retenção e anonimização conforme a LGPD antes do lançamento — **TBD, não implementar sem essa definição**
- Segredos de Kiwify, Resend e banco somente em variáveis de ambiente, nunca no frontend ou no repositório

### 6.4 Responsividade
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

### 6.5 Browsers Suportados
- Chrome/Edge (últimas 2 versões)
- Firefox (últimas 2 versões)
- Safari (últimas 2 versões)

---

## 7. Não-Funcionais

| Requisito | Descrição |
|-----------|-----------|
| Acesso | Sem autenticação; liberado pela compra e mantido por link pessoal com validade e revogação |
| Armazenamento | Nenhuma análise salva para o usuário — uma análise por acesso, conservada apenas via exportação. A LASTRO armazena internamente os resultados e os dados de uso |
| Atualização de dados | CUB importado periodicamente por processo administrativo (TBD frequência), com versionamento e fallback |
| Idioma | Português (Brasil) v1 |
| Timezone | Horário de Brasília |
| Acessibilidade | WCAG 2.1 Level AA (desejável v1) |

---

## 8. Roadmap Futuro (Fase 2+)

### Curto Prazo (Post-MVP)
1. **Autenticação de usuário** (cadastro/login, JWT, senhas em bcrypt) — adiada no MVP para simplificar a arquitetura
2. **Múltiplas análises, histórico e retomada** — depende da autenticação
3. **Novo tipo de projeto: Loteamento** — modelo de custo de urbanização a definir (não usa CUB)
4. **Novo tipo de projeto: "Comprar a terra / Terra para investir"** — análise de valorização, sem construção
5. Exportação em Excel
6. Comparativo entre múltiplos ativos
7. Refinamento de regras e parâmetros conforme feedback de usuários
8. Validação da metodologia do LASTRO Score (pesos, limiares e o critério de potencial de mercado — ver 4.3)

### Médio Prazo
1. Conjuntos de casas, prédios ou galpões (múltiplas edificações em um mesmo terreno)
2. Uso Misto com mapeamento CUB definido
3. Análise técnica profunda (novo produto: "Lastro Engineering")
4. **Due diligence documental e regulatória** (novo produto): análise aprofundada de lei de uso e ocupação do solo, plano diretor, zoneamento, matrícula e documentação pertinente — complementa o "Lastro Engineering" (técnico) com a camada legal/documental apontada pelos alertas do MVP (ver 2.4)
5. Suporte a mais estados/regiões
6. Base de preços de mercado para validar o preço de venda (fonte a definir)
7. Integração com plataformas imobiliárias
8. Mobile app nativo

### Longo Prazo
1. Marketplace de terrenos
2. Ferramenta de financiamento
3. Análise de portfólio (múltiplos projetos)
4. Relatórios customizados para incorporadoras
5. API pública para integradores

---

## 9. Métricas de Sucesso (MVP)

- ✅ Taxa de conclusão de análise (% que chega ao resultado)
- ✅ Taxa de reuso (% de usuários que fazem 2+ análises)
- ✅ Taxa de compartilhamento (% que exporta resultado)
- ✅ Feedback qualitativo (clareza da recomendação)
- ✅ Tempo de resposta (performance)

---

## 10. Observações e Considerações

### 10.1 Validação de Dados
- Sem base de preços de mercado no MVP: o app devolve o preço por m² calculado e alerta qualitativamente sobre adequação ao perfil do bairro (2.4), cabendo ao usuário o confronto com o mercado
- Alertas não devem impedir a entrada de dados, apenas avisar o usuário

### 10.2 Flexibilidade
- Premissas devem ser ajustáveis (não hardcoded) para permitir cenários "e se"
- Exemplo: "E se eu conseguir vender por 10% mais?"

### 10.3 Simplicidade no Topo
- Resultado inicial deve ser entendível por qualquer pessoa (score + decisão + recomendação)
- Detalhes técnicos acessíveis por expansão/botão "Ver detalhes"

### 10.4 Alertas Não-Bloqueantes
- Alertas técnicos/regulatórios não devem bloquear análise, mas devem ser claros
- Responsabilidade do usuário validar depois

### 10.5 Versioning
- O snapshot das premissas e da versão de dados usadas vai no **resultado exportado** (é o que fica com o usuário) e no **registro interno da LASTRO**
- Permitir auditoria de mudanças de premissas

---

## 11. Assinação e Aprovação

**Preparado por:** Equipe LASTRO  
**Data de Criação:** Setembro 2026  
**Status:** Pronto para Desenvolvimento

---

**Próximo passo:** Aprovação e início do desenvolvimento (Phase Planning, Design, Backend API, Frontend)
