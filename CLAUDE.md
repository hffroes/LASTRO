# CLAUDE.md — LASTRO MVP

## Visão Geral
LASTRO responde: "Devo adquirir este terreno?" via análise econômica preliminar. React 18+/TypeScript frontend, Node.js/Express backend, PostgreSQL. Desenvolvido no Replit. Público: construtores, incorporadoras, engenheiros, corretores, investidores. Região: Minas Gerais. Princípio: "Complexidade por baixo. Clareza por cima."

## Fonte de Verdade
- `@PRD.md` é a referência única para produto, escopo (seção 2), dados/parâmetros (seção 3), lógica de cálculo (seção 4), fluxo de usuário (seção 5) e requisitos técnicos (seção 6).
- `@plan.md` é o roadmap executivo: 12 fases, cronograma, dependências, checkpoints, decisões técnicas obrigatórias.

## Arquitetura em Uma Página
```
React (TypeScript)                 Express API             PostgreSQL
├── /src/components            ├── /server/routes       ├── users
├── /src/pages                 ├── /server/controllers  ├── analyses
├── /src/hooks                 ├── /server/middleware   ├── external_data
├── /src/types                 ├── /server/models       └── parameters
└── Motor de cálculo (utils)   ├── /server/services/adapters (FipeZap/CUB)
                                └── Domínio (economia)

/shared/schemas — validação Zod compartilhada front+back

Fluxo: Interface React → fetch() → API /api/v1/* → Cálculo → PostgreSQL
→ Resultado + Histórico + Exportação (PDF/HTML)
```

**Serving:** monólito single-port — um processo Express serve `/api/v1/*` e os arquivos estáticos do build Vite. Replit expõe uma única porta pública; same-origin elimina CORS em produção. Dev: Vite (5173) com proxy `/api` → Express (3000).

**Stack técnico decidido** (ver `@plan.md` para justificativas): Prisma (ORM) · Tailwind (CSS) · Zod (validação) · pdfkit (PDF) · Vitest (testes) · cache in-memory + snapshot Postgres, sem Redis · Replit Deployments nativo (sem Docker/CI de build).

**Dados externos (FipeZap/CUB):** consumidos via Adapter Pattern (`MarketDataAdapter`/`CubDataAdapter`). Padrão é `StaticAdapter` (JSON versionado em `/server/data`); `HttpAdapter` só entra após confirmação real de API pública (regra #6/#7).

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
- JWT: access token 15min (JSON) + refresh token 7 dias (httpOnly cookie)
- Senhas: bcrypt
- Variáveis de ambiente: `.env` (estrutura definida em `@plan.md`, seção Decisões Técnicas)
- HTTPS obrigatório
- Sem dados privados públicos
- ORM: **Prisma** (decisão final)
- Rate limiting: `express-rate-limit` (memory store) em rotas de auth e análises

## Testes e Validação
Testes obrigatórios para: fórmulas econômicas/arredondamentos, CUB ajustado, LASTRO Score, limites/alertas normalidade, auth/autorização, limite 3 análises, versionamento premissas, validação API, fallback dados externos.

## Plano de Implementação

Veja `@plan.md` para roadmap executivo em 12 fases. Resumo:

**Modelos por Fase:**
- **Sonnet**: Fases 0-11 (todas as fases de desenvolvimento e refinamento)
- **Opus**: Fase 12 (testes E2E e validação final)

**Timeline:** 31 dias (6-7 semanas, 1 dev full-time)  
**Critical Path:** 17 dias mínimos (fases 0→1→3→5→6→7)

**Checkpoints:** plan.md lista validações obrigatórias antes de cada fase.

## Como Rodar
```bash
# Replit: Node.js + npm + PostgreSQL (addon Neon) integrados
npm install                    # deps
cp .env.example .env          # DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
npx prisma migrate dev        # schema via Prisma
npm run dev                   # dev: Vite (5173, proxy /api) + Express (3000) simultâneos
npm run build && npm start    # prod: Express único serve API + estáticos, mesma porta
```

---
**Status:** Pronto para desenvolvimento | Stack: React 18 + Node/Express + PostgreSQL + Replit | Idioma: português BR  
**Referências:** @PRD.md (produto) | @plan.md (roadmap)
