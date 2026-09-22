# CLAUDE.md — LASTRO MVP

## Visão Geral
LASTRO responde: "Devo adquirir este terreno?" e "construir isso neste terreno vai dar dinheiro?" via análise econômica preliminar. React 18+/TypeScript frontend, Node.js/Express backend, PostgreSQL. Desenvolvido no Replit. Público: construtores, incorporadoras, engenheiros, corretores, investidores. Região: Minas Gerais. Princípio: "Complexidade por baixo. Clareza por cima."

## Fonte de Verdade
`@PRD.md` (v1.2) é a referência única para produto, escopo (seção 2), dados/parâmetros (seção 3), lógica de cálculo (seção 4), fluxo de usuário (seção 5) e requisitos técnicos (seção 6).

## Arquitetura em Uma Página
```
React (TypeScript)                 Express API             PostgreSQL
├── /src/components            ├── /server/routes       ├── accesses
├── /src/pages                 ├── /server/controllers  ├── access_events
├── /src/hooks                 ├── /server/middleware   ├── analyses (interno)
├── /src/types                 ├── /server/models       ├── external_data
└── Motor de cálculo (utils)   └── Domínio (economia)   └── parameters
Fluxo: React → fetch() → API /api/v1/* → Cálculo → PostgreSQL → Resultado + Histórico + Exportação (PDF/HTML)
```

## Escopo do MVP
Veja `@PRD.md` seção 2 (IN/OUT). Resumo: análise econômica interativa com toggle Terrenista/Incorporador, exportação PDF e HTML, dark mode, alertas orientativos. **Sem autenticação e sem persistência para o usuário**: acesso por link pós-compra (Kiwify → Resend), uma análise por acesso, conservada só via exportação. Fora do MVP: login/histórico/múltiplas análises, base de preços de mercado, Loteamento, "comprar a terra para investir", conjuntos de edificações e demais itens Fase 2+.

## Regras Críticas de Domínio
- "IA" = Índice/Coeficiente Aproveitamento urbanístico, nunca IA artificial
- Motor de cálculo = funções puras, determinísticas, testáveis, separadas de UI e persistência
- VGV = Unidades × Preço Venda Unitária (não m² × preço/m²)
- Viabilidade pelo resíduo: Resultado Terreno = VGV − Custo Obra − Despesas Gerais − Lucro Incorporador, comparado ao preço pedido (`@PRD.md` 4.1)
- CUB Ajustado = CUB Base × (1 + soma dos aditivos Fundação + Padrão + Topografia + Formato): soma única, nunca multiplicação encadeada (`@PRD.md` 3.2)
- Área Construída = Área Terreno × Taxa Ocupação × Pavimentos (não unidades × área da unidade)
- Área terreno ≠ área utilizada ≠ área construída ≠ área comercializável: obra incide na construída, VGV na comercializável
- Terreno% e Lucro% do VGV variam pelo Padrão (Baixo/Normal/Alto), nunca pela tipologia
- Classificação CUB: tipo + tipologia + faixa de pavimentos → projeto; padrão é coluna separada (não existem códigos tipo `R8-B`)
- Coeficiente de aproveitamento das unidades = **soma** das áreas de todas as unidades do pavimento ÷ área do pavimento (nunca uma unidade isolada), faixa 80–85%
- Dados externos: CUB Sinduscon-MG **sem API** (importação periódica versionada, com fallback); CEP via API pública sem chave, cuja falha não bloqueia a análise. Sem base de preços de mercado no MVP (FipeZap foi retirada). Nunca embutir valores de CUB no código
- LASTRO Score, viabilidade, recomendação: sem mudanças sem aprovação
- Valores monetários: nunca de strings; percentuais em convenção única (0.10 vs 10%)
- Resultado exportado e registro interno preservam snapshot dos parâmetros e da versão de dados usados
- Ajustes do usuário não alteram padrões globais
- Alertas são orientativos, não conclusivos: apontam a due diligence necessária (zoneamento, plano diretor, matrícula/documentação, capacidade de solo) para o usuário avançar com segurança; análise documental/regulatória aprofundada é produto futuro Fase 2+ (`@PRD.md` 8), não escopo do MVP
- Sem login: acesso por link com token validado no backend (validade + revogação); nunca expor ao usuário os dados internos de análises e uso
- **Toda a parte visual segue o design system em `design-system/`** (tokens de cor/tipografia/espaçamento/raio/sombra em `tokens/tokens.css`, diretrizes em `README.md`, guia em `guide/`) — nenhum valor visual hardcoded fora dos tokens (`@PRD.md` 6.1)
- Resultado simples primeiro; detalhes progressivos

## Regras de Comportamento
1. **Plano antes de mudanças não-triviais** (múltiplos arquivos, frontend+backend, contrato API, schema, comportamento)
2. **Não altere stack, arquitetura, DB, auth, dependências principais sem consultar**
3. **Avise antes de conflito com `@PRD.md`**
4. **Nenhuma funcionalidade Fase 2+ sem aprovação**
5. **Não escolha silenciosamente CSS Modules vs Tailwind ou Prisma vs TypeORM**
6. **Não invente endpoints ou credenciais; verifique disponibilidade real da fonte externa antes de integrar**
7. **Não invente coeficientes, CUB, dados mercado, percentuais, fórmulas, LASTRO Score não definidos**
8. **Parâmetros TBD = provisórios e centralizados, nunca números mágicos**
9. **Lacunas da fonte ficam TBD explícito** (CUB padrão Baixo de R-16/CSL/CAL, CAL-16, Uso Misto, despesas gerais 11% vs 12%)
10. **Comentários em português: explicam motivo, não descrevem literalmente**
11. **Justifique previa: novas pastas nível-1, serviços externos, infraestrutura**
12. **Teste alterações sensíveis antes de considerar concluído**

## Convenções de Código
- TypeScript strict mode, evitar `any` (justificar se indispensável)
- Componentes/classes/tipos: `PascalCase`; funções/variáveis: `camelCase`; constantes: `UPPER_SNAKE_CASE`
- Nomes informativos: `areaTerrenoM2`, `valorTerrenoCentavos`, `taxaLucroPercentual`
- Interface português BR; monetário real apenas na apresentação; datas no fuso Brasília
- Validação no frontend e obrigatória no backend; regras de negócio centralizadas (sem duplicação)
- Respostas API em formato consistente; zero segredos/tokens/credenciais no código ou frontend
- CSS/estilos consomem os tokens de `design-system/tokens/tokens.css` (via `var(--lastro-*)`); divergência exige ajustar o design system, nunca um valor avulso no componente

## Segurança e Persistência
Sem JWT de usuário e sem bcrypt (não há login). Link de acesso com token de alta entropia, validado no servidor, com validade e revogação; webhook Kiwify com assinatura verificada e tratamento idempotente. HTTPS obrigatório, sem dados privados públicos, segredos só em `.env`. Retenção/LGPD dos dados internos e ORM (Prisma ou TypeORM): TBD.

## Testes e Validação
Testes obrigatórios para: fórmulas econômicas/arredondamentos, aditivos e CUB ajustado, resíduo do terreno, LASTRO Score, faixas de alerta (obra 40–65%, despesas gerais 10–15%, soma das unidades/pavimento 80–85%), validação do link de acesso (válido/expirado/revogado), idempotência do webhook de compra, versionamento de premissas, validação API, fallback de dados externos.

## Como Rodar
```bash
npm install                   # deps (Replit: Node + npm + PostgreSQL integrados)
cp .env.example .env          # vars (DB, segredos Kiwify/Resend)
npx prisma migrate dev        # schema (ou TypeORM TBD)
npm start                     # front (5173) + back (3000/api/v1)
```

---
**Status:** Pronto para desenvolvimento | Stack: React 18 + Node/Express + PostgreSQL + Replit | Idioma: português BR
