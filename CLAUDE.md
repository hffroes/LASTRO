# CLAUDE.md — LASTRO MVP

## Visão Geral
LASTRO responde: "Devo adquirir este terreno?" via análise econômica preliminar. React 18+/TypeScript frontend, Node.js/Express backend, PostgreSQL. Desenvolvido no Replit. Público: construtores, incorporadoras, engenheiros, corretores, investidores. Região: Minas Gerais. Princípio: "Complexidade por baixo. Clareza por cima."

## Fonte de Verdade
`@PRD.md` é a referência única para produto, escopo (seção 2), dados/parâmetros (seção 3), lógica de cálculo (seção 4), fluxo de usuário (seção 5) e requisitos técnicos (seção 6).

## Arquitetura em Uma Página
```
React (TypeScript)                 Express API             PostgreSQL
├── /src/components            ├── /server/routes       ├── users
├── /src/pages                 ├── /server/controllers  ├── analyses
├── /src/hooks                 ├── /server/middleware   ├── external_data
├── /src/types                 ├── /server/models       └── parameters
└── Motor de cálculo (utils)   └── Domínio (economia)

Fluxo: Interface React → fetch() → API /api/v1/* → Cálculo → PostgreSQL
→ Resultado + Histórico + Exportação (PDF/HTML)
```

## Escopo do MVP
Veja `@PRD.md` seção 2 (IN/OUT). Resumo: análise econômica interativa, até 3 análises salvas/usuário, exportação PDF e HTML, JWT auth, alertas genéricos técnico/regulatórios. Fase 2+ fica fora.

## Regras Críticas de Domínio
- "IA" = Índice/Coeficiente Aproveitamento urbanístico, nunca IA artificial
- Motor de cálculo = funções puras, determinísticas, testáveis, separadas de UI e persistência
- VGV = Unidades × Preço Venda Unitária (não m² × preço/m²)
- CUB Ajustado segue fórmula em `@PRD.md` 3.2 (Tipologia → Topografia → Formato)
- LASTRO Score, viabilidade, recomendação: sem mudanças sem aprovação
- Valores monetários: nunca de strings; percentuais em convenção única (0.10 vs 10%)
- Área real ≠ área equivalente ≠ área construída ≠ área comercializável
- Análise salva preserva snapshot dos parâmetros usados
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
6. **Não invente endpoints, credenciais ou condições FipeZap/Sinduscon-MG**
7. **Verifique disponibilidade real de fonte externa antes de integrar**
8. **Não invente coeficientes, CUB, dados mercado, percentuais, fórmulas, LASTRO Score não definidos**
9. **Parâmetros TBD = provisórios e centralizados, nunca números mágicos**
10. **Comentários em português: explicam motivo, não descrevem literalmente**
11. **Justifique previa: novas pastas nível-1, serviços externos, infraestrutura**
12. **Teste alterações sensíveis antes de considerar concluído**

## Convenções de Código
- TypeScript strict mode, evitar `any` (justificar se indispensável)
- Componentes/classes/tipos: `PascalCase`; funções/variáveis: `camelCase`; constantes: `UPPER_SNAKE_CASE`
- Nomes informativos: `areaTerrenoM2`, `valorTerrenoCentavos`, `taxaLucroPercentual`
- Interface português BR; monetário real apenas na apresentação
- Datas: formato consistente, fuso Brasília
- Validação frontend + obrigatória backend
- Regras negócio centralizadas (sem duplicação frontend/backend)
- Respostas API: formato consistente
- Zero segredos/tokens/credenciais no código ou frontend

## Segurança e Persistência
- JWT: access + refresh tokens
- Senhas: bcrypt
- Variáveis de ambiente: `.env` (TBD: criação/estrutura)
- HTTPS obrigatório
- Sem dados privados públicos
- ORM (Prisma ou TypeORM): TBD

## Testes e Validação
Testes obrigatórios para: fórmulas econômicas/arredondamentos, CUB ajustado, LASTRO Score, limites/alertas normalidade, auth/autorização, limite 3 análises, versionamento premissas, validação API, fallback dados externos.

## Como Rodar
```bash
# Replit: Node.js + npm + PostgreSQL integrados
npm install                    # deps
cp .env.example .env          # vars (DB, JWT secret TBD)
npx prisma migrate dev        # schema (ou TypeORM TBD)
npm start                     # frontend + backend simultâneos
# Frontend: http://localhost:5173 (Vite)
# Backend: http://localhost:3000/api/v1
```

---
**Status:** Pronto para desenvolvimento | Stack: React 18 + Node/Express + PostgreSQL + Replit | Idioma: português BR
