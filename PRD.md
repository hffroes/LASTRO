# Product Requirements Document (PRD)
## LASTRO - Land Analysis & Acquisition Viability Tool
**Versão:** 1.0 MVP  
**Data:** Setembro 2026  
**Status:** Inicial

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
- ✅ Cálculo de VGV (Valor Geral de Venda) baseado em m² e preço de mercado
- ✅ Aplicação de premissas flexíveis por tipologia:
  - Percentual de custo do terreno (8-10% do VGV, ajustável por tipo)
  - Percentual de lucro do incorporador (20-25% do VGV, ajustável por tipo)
  - Custos de construção (CUB/m² com ajustes por tipologia, topografia, formato)
  - Impostos, corretagem e outros custos (hardcoded)
- ✅ Identificação se percentuais estão na normalidade (não apenas lucro > 0)
- ✅ Cálculo do preço máximo recomendado para o terreno

#### 2.2 Formulário de Entrada de Dados
- ✅ Área do terreno (m²)
- ✅ Formato do lote (regular, irregular)
- ✅ Topografia (plana, regular, irregular, acidentada)
- ✅ Valor pedido pelo terreno (R$)
- ✅ Tipologia do empreendimento:
  - Unifamiliar (casa)
  - Loteamentos
  - Multifamiliar (prédios)
  - Galpões
  - Lojas comerciais
  - Uso misto
  - Padrão: Baixo, Normal, Alto
- ✅ Detalhes construtivos:
  - Número de pavimentos
  - Quantidade de unidades por pavimento
  - Tamanho das unidades (m²)
- ✅ Preço de venda esperado por m² (com baseline de mercado para validação)

#### 2.3 Cálculo Automatizado
- ✅ Conversão de área do terreno em área útil de construção (via coeficiente de aproveitamento pré-determinado)
- ✅ Sugestão de m² construído baseada em fórmula, com possibilidade de ajuste manual
- ✅ Ajuste automático de custos de construção conforme tipologia, topografia e formato

#### 2.4 Alertas Técnicos e Regulatórios
- ✅ Alerta genérico indicando necessidade de validação antes da aquisição:
  - Parâmetros urbanísticos (IA, altura máxima, recuos)
  - Zoneamento adequado
  - Capacidade de solo/fundações
  - Infraestrutura (acesso, utilidades)
  - Impacto da topografia na execução
  - Legislação local e ambiental
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
- ✅ Hardcoded:
  - Regras de percentuais por tipologia/padrão
  - Impostos, corretagem e outros custos
  - Coeficientes de aproveitamento por tipo de zona
- ✅ Integração com bases externas (atualização rotineira):
  - FipeZap: preços de mercado por m²
  - CUB: custo unitário básico de construção/m²

### OUT (Fora do Escopo MVP)

#### Fase 2+
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

| Tipologia | Padrão | Terreno (% VGV) | Lucro (% VGV) | CUB Ajuste |
|-----------|--------|-----------------|---------------|-----------| 
| Unifamiliar | Baixo | 10% | 18% | -5% |
| Unifamiliar | Normal | 9% | 22% | 0% |
| Unifamiliar | Alto | 8% | 25% | +5% |
| Loteamento | Baixo | 12% | 15% | -8% |
| Loteamento | Normal | 10% | 20% | 0% |
| Loteamento | Alto | 8% | 25% | +5% |
| Multifamiliar | Baixo | 9% | 20% | -3% |
| Multifamiliar | Normal | 8% | 23% | 0% |
| Multifamiliar | Alto | 7% | 27% | +8% |
| Galpão | Baixo | 15% | 18% | -10% |
| Galpão | Normal | 12% | 22% | 0% |
| Galpão | Alto | 10% | 25% | +3% |
| Comercial | Baixo | 12% | 20% | -5% |
| Comercial | Normal | 10% | 24% | 0% |
| Comercial | Alto | 8% | 28% | +5% |
| Uso Misto | Normal | 9% | 22% | 0% |

*Nota: Esses valores serão refinados e validados durante o desenvolvimento com base em estudos de mercado.*

### 3.2 Ajustes Aplicados ao CUB

- **Topografia**:
  - Plana: 0%
  - Regular: +2%
  - Irregular: +5%
  - Acidentada: +10%

- **Formato do lote**:
  - Regular: 0%
  - Irregular: +3%

*Estes ajustes impactam o custo de construção final.*

### 3.3 Coeficientes de Aproveitamento (IA)

Será definido durante desenvolvimento conforme normas de zoneamento de Minas Gerais.

### 3.4 Dados Externos

- **FipeZap**: Preços de mercado por m² (segmentado por tipologia e região)
- **CUB**: Custo unitário básico atualizado mensalmente

Ambos serão integrados com atualização rotineira. Sistema deve alertar se preço de venda informado desviar significativamente da baseline.

### 3.5 Região de Cobertura (MVP)

- **Minas Gerais** (v1)
- Expansão para outros estados em roadmap futuro

---

## 4. Lógica de Cálculo

### 4.1 Fórmula Geral de Viabilidade

```
Viabilidade = VGV - Custo Terreno - Custo Construção - Lucro Incorporador - Outros Custos >= 0
```

Onde:
- **VGV** = m² Construído × Preço de Venda/m²
- **Custo Terreno** = (Valor Pedido pelo Terreno) ou (% do VGV × VGV) — usar o maior
- **Custo Construção** = CUB/m² (ajustado) × m² Construído
- **Lucro Incorporador** = % do VGV × VGV
- **Outros Custos** = Impostos, corretagem (hardcoded)

### 4.2 LASTRO SCORE (0-100)

Score baseado em:
- Margem de viabilidade (40 pontos)
- Conformidade de percentuais (30 pontos)
- Risco técnico/regulatório (20 pontos)
- Potencial de mercado (10 pontos)

*Metodologia detalhada a ser definida na fase de desenvolvimento.*

### 4.3 Recomendação Final

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

### 6.1 Stack Recomendado
- **Frontend**: React, TypeScript, Responsive Design
- **Backend**: Node.js/Express ou similar, API RESTful
- **Database**: PostgreSQL ou MongoDB
- **Auth**: JWT ou similar
- **Integração Externa**: APIs FipeZap, CUB

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
| Atualização de dados | FipeZap e CUB atualizados rotineiramente (TBD frequência) |
| Idioma | Português (Brasil) v1 |
| Timezone | Horário de Brasília |
| Acessibilidade | WCAG 2.1 Level AA (desejável v1) |

---

## 8. Roadmap Futuro (Fase 2+)

### Curto Prazo (Post-MVP)
1. Exportação em Excel
2. Comparativo entre múltiplos ativos
3. Refinamento de regras e parâmetros conforme feedback de usuários

### Médio Prazo
1. Análise técnica profunda (novo produto: "Lastro Engineering")
2. Suporte a mais estados/regiões
3. Integração com plataformas imobiliárias
4. Mobile app nativo
5. Dark mode

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
