# CLAUDE.md — LASTRO MVP

## Visão Geral
LASTRO responde: "Devo adquirir este terreno?" via análise econômica preliminar. React 18+/TypeScript frontend, Node.js/Express backend, PostgreSQL. Desenvolvido no Replit. Público: construtores, incorporadoras, engenheiros, corretores, investidores. Região: Minas Gerais. Princípio: "Complexidade por baixo. Clareza por cima."

## Fonte de Verdade
`@PRD.md` (v1.1) é a referência única para produto, escopo (seção 2), dados/parâmetros (seção 3), lógica de cálculo (seção 4), fluxo de usuário (seção 5) e requisitos técnicos (seção 6).

## Arquitetura em Uma Página
```
React (TypeScript)                 Express API             PostgreSQL
├── /src/components            ├── /server/routes       ├── users
├── /src/pages                 ├── /server/controllers  ├── analyses
├── /src/hooks                 ├── /server/middleware   ├── external_data
├── /src/types                 ├── /server/models       └── parameters
└── Motor de cálculo (utils)   └── Domínio (economia)
Fluxo: React → fetch() → API /api/v1/* → Cálculo → PostgreSQL → Resultado + Histórico + Exportação (PDF/HTML)
```

## Escopo do MVP
Veja `@PRD.md` seção 2 (IN/OUT). Resumo: análise econômica interativa com toggle Terrenista/Incorporador, até 3 análises salvas/usuário, exportação PDF e HTML, JWT auth, alertas orientativos. Fora do MVP: Loteamento, "comprar a terra para investir", conjuntos de edificações e demais itens Fase 2+.

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
- Dados externos: CUB Sinduscon-MG e FipeZap **sem API** (importação periódica versionada, com fallback); CEP via API pública sem chave, cuja falha não bloqueia a análise. Nunca embutir valores de CUB/mercado no código
- LASTRO Score, viabilidade, recomendação: sem mudanças sem aprovação
- Valores monetários: nunca de strings; percentuais em convenção única (0.10 vs 10%)
- Análise salva preserva snapshot dos parâmetros e da versão de dados usados
- Ajustes do usuário não alteram padrões globais
- Alertas são orientativos, não conclusivos
- Limite 3 análises: validado no backend
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

## Segurança e Persistência
JWT (access + refresh), senhas em bcrypt, HTTPS obrigatório, sem dados privados públicos. Variáveis em `.env` e ORM (Prisma ou TypeORM): TBD.

## Testes e Validação
Testes obrigatórios para: fórmulas econômicas/arredondamentos, aditivos e CUB ajustado, resíduo do terreno, LASTRO Score, faixas de alerta (obra 40–65%, despesas gerais 10–15%, unidade/pavimento 80–85%), auth/autorização, limite 3 análises, versionamento de premissas, validação API, fallback de dados externos.

## Como Rodar
```bash
npm install                   # deps (Replit: Node + npm + PostgreSQL integrados)
cp .env.example .env          # vars (DB, JWT secret TBD)
npx prisma migrate dev        # schema (ou TypeORM TBD)
npm start                     # front (5173) + back (3000/api/v1)
```

---
**Status:** Pronto para desenvolvimento | Stack: React 18 + Node/Express + PostgreSQL + Replit | Idioma: português BR
