# Product Requirements Document (PRD)
## LASTRO - Land Analysis & Acquisition Viability Tool
**Versão:** 1.1 MVP  
**Data:** Setembro 2026  
**Status:** Inicial  
**Nota de revisão:** Seções 2–4, 6 e 8 revisadas com base nas planilhas de Escopo MVP, IDs, Tabela CUB (Sinduscon-MG Ago/2026) e Base de Tipologias fornecidas pelo produto.

---

## 1. Visão Geral do Produto

### Objetivo Principal
Fornecer uma ferramenta web de análise econômica rápida para responder objetivamente: **"Devo ou não adquirir este terreno para fazer x construção?"**

### Público-Alvo
- Pequenos construtores e incorporadoras
- Engenheiros e arquitetos autônomos
- Corretores imobiliários
- Investidores imobiliários
- Proprietários individuais

### Valor Entregue
- **Análise econômica rápida** baseada em premissas de mercado
- **Recomendação clara** (Comprar / Não Comprar / Comprar com Ressalvas)
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
  - Comparação com baseline de mercado (FipeZap) para alertar sobre possíveis superestimativas
- ✅ Taxa de ocupação (parâmetro ajustável, default 0,6 — ver 3.3)
- ✅ Áreas e coeficientes **calculados** e exibidos para o usuário validar junto ao plano diretor:
  - Área utilizada do terreno (m²)
  - Área total construída (m²)
  - Coeficiente de unidade por metragem de pavimento (%)
  - Coeficiente de aproveitamento (IA) atingido

*Nota: os campos exibidos variam conforme a tipologia escolhida. É crucial incluir TODAS as variáveis pertinentes para a classificação correta na tabela CUB Sinduscon-MG (tipo de projeto + tipologia + faixa de pavimentos + padrão).*

#### 2.3 Cálculo Automatizado
- ✅ Cálculo da área utilizada do terreno a partir da taxa de ocupação e da área total construída a partir do número de pavimentos
- ✅ Cálculo do coeficiente de aproveitamento (IA) **atingido** pelo programa, para o usuário validar contra a legislação local
- ✅ Sugestão de m² construído baseada em fórmula, com possibilidade de ajuste manual
- ✅ Ajuste automático do custo de obra conforme faixa de pavimentos (fundação), padrão, topografia e formato do lote

#### 2.4 Alertas Técnicos e Regulatórios
- ✅ Alerta genérico indicando necessidade de validação antes da aquisição:
  - Parâmetros urbanísticos (IA, taxa de ocupação, altura máxima, recuos)
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
  - **Coeficiente de unidade por metragem de pavimento fora da faixa 80%–85%** — abaixo indica que as unidades podem ser otimizadas; acima indica unidades grandes demais para a área de aproveitamento (hall, corredores, escadas e elevadores). Não se aplica a projetos residenciais de casas
- ✅ Alerta qualitativo de adequação ao mercado:
  - Tipologia, preço por m² e padrão de acabamento escolhidos devem ser coerentes com o perfil socioeconômico do bairro/região (evitar produto luxuoso em região de menor poder aquisitivo e vice-versa)
- ✅ Sem análise profunda — apenas apontadores para validação futura

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

#### 2.6 Interatividade
- ✅ Usuário pode ajustar premissas (preço de venda, % de lucro, custos) em tempo real
- ✅ Resultado atualiza dinamicamente com os ajustes
- ✅ Visualização clara do impacto de cada mudança
- ✅ **Toggle de perspectiva** — a mesma análise pode ser lida de dois pontos de vista:
  - **Terrenista**: o lucro do incorporador é fixado pela premissa do padrão e o resultado é o **Resultado Terreno** (quanto o terreno pode valer). O usuário avalia o negócio pela variação do terreno em relação ao todo
  - **Incorporador**: o preço pedido pelo terreno é fixado como dado de entrada e o resultado é a **margem de lucro resultante** para o incorporador
  - Ambos partem da mesma base de cálculo (seção 4.1); muda apenas qual variável é fixada e qual é resolvida

#### 2.7 Persistência de Dados
- ✅ Autenticação obrigatória (login/cadastro)
- ✅ Backend em servidor para armazenar análises
- ✅ Até 3 análises podem ser salvas por usuário
- ✅ Acesso direto ao histórico de análises salvas

#### 2.8 Exportação
- ✅ Relatório em PDF com resultado completo
- ✅ Relatório em HTML compartilhável (link para terceiros)

#### 2.9 Onboarding e UX
- ✅ Se é primeira vez: onboarding explicando a metodologia
- ✅ Se já tem análises: acesso direto ao histórico
- ✅ Responsivo para mobile e desktop
- ✅ Sem dark mode (v1)

#### 2.10 Dados de Baseline
- ✅ Parâmetros centralizados (sem números mágicos no código), versionados e com snapshot na análise salva:
  - Percentuais de terreno e lucro por padrão
  - Tabelas de aditivos (fundação, padrão, topografia, formato)
  - Composição das despesas gerais sobre o VGV
  - Taxa de ocupação default
  - Faixas de normalidade dos KPIs
- ✅ **Dados de importação periódica (processo manual/admin)** — não há API pública confirmada para nenhuma das duas fontes:
  - CUB Sinduscon-MG: custo unitário básico de construção (R$/m²), publicado em boletim mensal em PDF
  - FipeZap: preços de mercado por m² (disponibilidade e formato a verificar — ver 3.4)
- ✅ **Integração com API pública externa:**
  - Consulta de CEP (ex.: ViaCEP) para auto-preenchimento de logradouro e bairro

### OUT (Fora do Escopo MVP)

#### Fase 2+
- ❌ Loteamento como tipo de projeto (modelo de custo de urbanização não usa CUB e ainda não está definido) → *Roadmap, seção 8*
- ❌ "Comprar a terra / Terra para investir" (análise de valorização, sem construção) → *Roadmap, seção 8*
- ❌ Conjuntos de casas, prédios ou galpões (múltiplas edificações em um mesmo terreno)
- ❌ Análise técnica profunda (fundações, solo, topografia detalhada) → *Futuro produto da LASTRO*
- ❌ Mobile app nativo (apenas web responsivo v1)
- ❌ Dark mode
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

### 3.3 Áreas, Taxa de Ocupação e Coeficiente de Aproveitamento (IA)

> **IA = Índice/Coeficiente de Aproveitamento urbanístico.**

No MVP o IA **não** é um coeficiente pré-determinado que dita a área construída. O programa do empreendimento é informado pelo usuário e o IA atingido é **calculado** e devolvido para que ele valide contra o plano diretor e a lei de uso e ocupação do solo do seu município.

**Parâmetro base:**

| Parâmetro | Default | Observação |
|-----------|---------|------------|
| Taxa de Ocupação | 0,6 | Padrão da ferramenta, ajustável pelo usuário. Valor provisório e centralizado, a validar por município |

**Cadeia de cálculo das áreas (as quatro áreas são distintas e não se confundem):**

```
Área Utilizada do Terreno = Área Total do Terreno × Taxa de Ocupação
Área Total Construída     = Área Utilizada do Terreno × Número de Pavimentos
Área Comercializável      = Número Total de Unidades × Área da Unidade Vendida

Coeficiente de Aproveitamento (IA) atingido = Área Total Construída ÷ Área Total do Terreno
Coeficiente de unidade por metragem de pavimento
    = (Unidades por Pavimento × Área da Unidade) ÷ Área Utilizada do Terreno
```

- O **Custo de Obra** incide sobre a **Área Total Construída** (inclui hall, corredores, escadas e elevadores).
- O **VGV** incide sobre as **unidades vendidas** (área comercializável), nunca sobre a área construída.
- O **coeficiente de unidade por metragem de pavimento** deve ficar entre **80% e 85%**; o residual corresponde a hall, corredores, escadas e elevadores. Não se aplica a projetos residenciais de casas.
- **Taxa de ocupação, IA e altura máxima admissíveis por zona**: não embutidos no MVP — o app exibe os valores atingidos e alerta o usuário para validá-los na legislação local.

### 3.4 Dados Externos

- **CUB Sinduscon-MG**: custo unitário básico por projeto-padrão (R$/m²)
  - Base: ABNT NBR 12.721:2006 (série CUB/2006, não comparável à série anterior)
  - Publicado mensalmente pelo Sinduscon-MG em **boletim PDF** — **não há API pública conhecida**
  - **Processo no MVP**: importação periódica/manual por administrador, com registro de competência (mês/ano), data de emissão e arquivo de origem
  - Consultado conforme a classificação do formulário (projeto CUB + padrão) e aplicado com os aditivos da seção 3.2

- **FipeZap**: preços de mercado por m² (segmentado por tipologia e região)
  - Fonte de validação para alertar sobre preços de venda superestimados
  - **Não há API pública confirmada** — disponibilidade, formato e condições de uso **TBD**, exigem verificação real antes de qualquer automação
  - **Processo no MVP**: importação periódica/manual por administrador, mesmo tratamento do CUB

- **API pública de CEP** (ex.: ViaCEP): consulta GET, sem chave
  - Uso: auto-preenchimento de logradouro e bairro a partir do CEP informado
  - Falha ou indisponibilidade **não bloqueia** a análise — o usuário preenche manualmente
  - Sujeita à verificação técnica de disponibilidade e termos de uso antes da implementação

**Armazenamento, Versionamento e Fallback (vale para CUB e FipeZap):**
- Cada importação gera uma versão datada; nada é sobrescrito
- A análise salva preserva o snapshot da versão de dados usada (auditoria de premissas)
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
| Coeficiente de unidade por metragem de pavimento | 80% a 85% | N/A para casas unifamiliares |

**Alertas de Normalidade:**
- Se Preço Pedido pelo Terreno > Resultado Terreno: "Preço ofertado acima do viável para o projeto hipotético — recomenda-se negociar ou ajustar o projeto"
- Se Resultado Terreno / VGV < limite inferior do padrão: "Margem do terreno no limite inferior de viabilidade — é viável, mas apertada"
- Se Custo de Obra / VGV estiver **fora da faixa 40%–65%**: "Custo de implementação muito abaixo/acima do esperado para esta tipologia" (KPI de alerta ao usuário, em ambas as direções)
- Se Despesas Gerais / VGV estiver fora de 10%–15%: "Despesas gerais fora do intervalo usual"
- Se Lucro% < limite inferior da faixa: "Margem de lucro abaixo do esperado para este mercado"
- Se coeficiente de unidade por metragem de pavimento < 80%: "Há espaço para otimizar o tamanho das unidades"
- Se coeficiente de unidade por metragem de pavimento > 85%: "Unidades grandes demais para a área de aproveitamento — revisar o projeto"

*Os alertas são orientativos, não conclusivos, e não bloqueiam a análise.*

### 4.3 LASTRO SCORE (0-100)

Score baseado em:
- Margem de viabilidade (40 pontos)
- Conformidade de percentuais (30 pontos)
- Risco técnico/regulatório (20 pontos)
- Potencial de mercado (10 pontos)

*Metodologia detalhada a ser definida na fase de desenvolvimento.*

> **Pendência registrada (revisão 1.1):** os **pesos (40/30/20/10)** e os **limiares de recomendação (4.4)** foram mantidos sem alteração nesta revisão. Apenas os **inputs** que alimentam o score foram realinhados às faixas e percentuais das seções 3 e 4.2. A metodologia de pontuação do LASTRO Score segue **pendente de validação** e só pode ser alterada com aprovação explícita.

### 4.4 Recomendação Final

- 🟢 **COMPRAR**: Viável, score > 70, todos os percentuais OK
- 🟡 **COMPRAR COM RESSALVAS**: Viável mas score 50-70 ou algum percentual fora do padrão
- 🔴 **NÃO COMPRAR**: Inviável ou score < 50

---

## 5. Fluxo de Usuário

### 5.1 Novo Usuário
1. Acessa app → Redireciona para login/cadastro
2. Após autenticação → Mostra onboarding da metodologia
3. Clica "Começar análise" → Abre formulário vazio

### 5.2 Usuário Retornando
1. Acessa app → Login
2. Mostra histórico de análises salvas (até 3)
3. Pode abrir uma análise anterior ou criar nova

### 5.3 Fluxo de Análise
1. **Preencher formulário**: Dados do terreno e projeto
2. **Sistema calcula**: VGV, custos, viabilidade
3. **Mostra resultado interativo**: Score, decisão, detalhes
4. **Usuário ajusta**: Pode mudar premissas e ver resultado atualizar
5. **Salva análise**: Se satisfeito, salva (máx 3)
6. **Exporta**: PDF para uso pessoal ou HTML para compartilhar

---

## 6. Requisitos Técnicos

### 6.1 Stack (React Full-Stack)

**Frontend:**
- React 18+ com TypeScript
- Vite como build tool
- Responsive design (CSS Modules ou Tailwind)
- Estrutura: `/src/components`, `/src/pages`, `/src/hooks`, `/src/types`

**Backend:**
- Node.js com Express
- RESTful API (`/api/v1/*`)
- Estrutura: `/server/routes`, `/server/middleware`, `/server/models`, `/server/controllers`

**Database:**
- PostgreSQL (Replit Database integrado)
- ORM: Prisma ou TypeORM (TBD)

**Auth:**
- JWT (access + refresh tokens)
- Bcrypt para hash de senhas

**Integração Externa:**
- **API pública de CEP** (ex.: ViaCEP): GET, sem chave, para auto-preenchimento de logradouro e bairro. Falha na consulta não bloqueia a análise (preenchimento manual como fallback). Disponibilidade e termos de uso a verificar antes da implementação
- **CUB Sinduscon-MG e FipeZap: sem integração via API.** Não há API pública confirmada para nenhuma das duas fontes (o CUB é publicado em boletim mensal PDF). São tratados como **dados de importação periódica**:
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

### 6.3 Segurança
- Validação de entrada em formulário
- HTTPS obrigatório
- Proteção de dados sensíveis (dados de terreno não públicos)

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
| Autenticação | Login obrigatório, dados salvos por usuário |
| Armazenamento | Até 3 análises salvas por usuário |
| Atualização de dados | CUB e FipeZap importados periodicamente por processo administrativo (TBD frequência), com versionamento e fallback |
| Idioma | Português (Brasil) v1 |
| Timezone | Horário de Brasília |
| Acessibilidade | WCAG 2.1 Level AA (desejável v1) |

---

## 8. Roadmap Futuro (Fase 2+)

### Curto Prazo (Post-MVP)
1. **Novo tipo de projeto: Loteamento** — modelo de custo de urbanização a definir (não usa CUB)
2. **Novo tipo de projeto: "Comprar a terra / Terra para investir"** — análise de valorização, sem construção
3. Exportação em Excel
4. Comparativo entre múltiplos ativos
5. Refinamento de regras e parâmetros conforme feedback de usuários
6. Validação da metodologia do LASTRO Score (pesos e limiares)

### Médio Prazo
1. Conjuntos de casas, prédios ou galpões (múltiplas edificações em um mesmo terreno)
2. Uso Misto com mapeamento CUB definido
3. Análise técnica profunda (novo produto: "Lastro Engineering")
4. Suporte a mais estados/regiões
5. Integração com plataformas imobiliárias
6. Mobile app nativo
7. Dark mode

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
- Sistema deve alertar se preço de venda for superestimado vs. baseline de mercado
- Não deve impedir entrada, mas avisar o usuário

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
- Guardar histórico de parâmetros usados em cada análise salva
- Permitir auditoria de mudanças de premissas

---

## 11. Assinação e Aprovação

**Preparado por:** Equipe LASTRO  
**Data de Criação:** Setembro 2026  
**Status:** Pronto para Desenvolvimento

---

**Próximo passo:** Aprovação e início do desenvolvimento (Phase Planning, Design, Backend API, Frontend)
