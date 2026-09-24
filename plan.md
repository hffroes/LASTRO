# LASTRO — Plano de Desenvolvimento
## Produto 1: Terreno Viável (MVP)

**Fontes de verdade:** `PRD.md` v1.2 (produto, escopo, regras, fórmulas) · `CLAUDE.md` (arquitetura, stack, convenções, comportamento)
**Abordagem:** desenvolvimento orientado ao uso (*development as usage*) — fatias verticais na ordem da jornada do usuário
**Estado do repositório na criação deste plano:** apenas `PRD.md`, `CLAUDE.md` e `design-system/`. Todo o código de aplicação será criado.

---

## Como ler este plano

- **34 fases** (F00–F33) divididas em duas macroetapas.
- Cada fase é uma fatia vertical: entrega algo **visível e testável no Replit**.
- Nenhuma fase começa sem a **aprovação explícita de UX e produto** da anterior (aprovação técnica não substitui).
- Status: `[ ] Não iniciada` · `[~] Em desenvolvimento` · `[?] Aguardando decisão` · `[>] Aguardando validação no Replit` · `[x] Aprovada`
- Marca `✓opus`: a fase, além de aprovada, passou por revisão com Opus contra o `design-system/guide/` (contraste medido, três faixas, conformidade com o guia). Ver seção E.

---

## Decisões necessárias antes do desenvolvimento

### A. Decisões já resolvidas (registradas)

| ID | Decisão | Resolução | Fase |
|----|---------|-----------|------|
| D-R1 | CSS Modules × Tailwind (`CLAUDE.md` regra 5) | **CSS Modules**, consumindo `var(--lastro-*)` | F00 |
| D-R2 | Prisma × TypeORM (`PRD` 6.1) | **Prisma** | F24 |
| D-R3 | Quando o Postgres entra | **Tarde na M1**: F00–F23 com módulos TS versionados; F24 traz `parameters` + `external_data` | F24 |
| D-R4 | Lacunas do design system (sem tokens de espaçamento, tamanho de fonte ou mecanismo de tema) | **Estender `design-system/tokens/tokens.css`** na F00. A condição "sem alterar valores existentes" foi superada pela revisão pós-F02, que precisou corrigir valores errados — ver D-R5 | F00 |
| D-R5 | Qual é a fonte de verdade visual e o que uma fase visual precisa provar | **O `design-system/guide/` é a referência**, não o `README.md` nem o `tokens.css`, que são resumos incompletos dele. Toda fase visual mede contraste (AA) e confere as três faixas antes do checkpoint — ver seção E | Revisão pós-F02 |
| D-R6 | A recomendação final (`PRD` 4.4) só tinha rótulo de compra ("COMPRAR"), mas o produto responde duas perguntas distintas (`PRD` 1): comprar o terreno ou executar o empreendimento — quem já tem o terreno e lê pela perspectiva Incorporador recebia "COMPRAR" sem sentido | **Objetivo da análise obrigatório e explícito** no início do fluxo ("comprar o terreno" × "executar o empreendimento"), nunca inferido. Decide a perspectiva padrão (Terrenista/Incorporador, `PRD` 2.6) e o rótulo da recomendação (`PRD` 4.4: COMPRAR/NÃO COMPRAR × FAZER/NÃO FAZER O EMPREENDIMENTO). Pesos do Score e limiares não mudam. Onde exatamente essa pergunta aparece na interface é decisão da F05, quando a fase começar | Revisão pós-F03; aplica-se a F05, F16, F19 |

### B. Decisões bloqueantes

Cada uma impede o início da fase indicada. **Não resolver por conta própria.**

| ID | Decisão pendente | Origem | Bloqueia |
|----|------------------|--------|----------|
| D-B1 | Localização do motor único de cálculo. Proposta: motor puro em `src/utils/motor/`, importado tanto pelo React quanto pelo Express (`server/domain/` só adapta), para não duplicar regra de negócio. Exige aprovação por ser decisão arquitetural. | `CLAUDE.md` regras 2 e 11 | F13 |
| D-B2 | **Despesas gerais: 11% ou 12%?** A itemização soma 12,0% mas a planilha aplica 11,0%. O MVP adota 11,0% para reproduzir o exemplo; confirmar. Não ajustar componente algum por conta própria. | `PRD` 4.1 (divergência aritmética) | F13 |
| D-B3 | **Divergência de lucro:** exemplo da planilha "Escopo MVP" aplica 20% a padrão **Normal** (tabelado 22%). Qual prevalece? | `PRD` 3.1 (nota de divergência) | F13 |
| D-B4 | **Fallback do CUB para padrão Baixo** nas combinações sem valor publicado (R-16, CSL-8, CSL-16, CAL-8). Não inventar valor. | `PRD` 3.1 (lacunas) | F12 |
| D-B5 | **CAL-16 não existe** na tabela CUB Sinduscon-MG Ago/2026. Definir fallback ou remover a faixa 8+ de Andares Livres do MVP. | `PRD` 3.1 (lacunas) | F12 |
| D-B6 | **Mapeamento CUB de Uso Misto** — sem correspondência em nenhuma fonte. Definir mapeamento, ou remover a opção do MVP, ou exibi-la desabilitada com aviso. | `PRD` 3.1 e 2.2 | F09 |
| D-B7 | **Metodologia detalhada do LASTRO Score** — como pontuar Margem de viabilidade (40), Conformidade de percentuais (30) e Risco técnico/regulatório (20). Pesos e limiares (4.4) não podem mudar sem aprovação. | `PRD` 4.3 | F19 |
| D-B8 | **Potencial de mercado (10 pontos)** ficou sem fonte após a retirada da FipeZap. Pontuar por critério qualitativo, por outro indicador, ou redistribuir os 10 pontos? Exige aprovação explícita. | `PRD` 4.3 (pendência 1.2) | F19 |
| D-B9 | **Biblioteca e estratégia de exportação PDF** (client-side vs render no servidor; qual lib). Envolve dependência principal. | `PRD` 2.8, 6.2 | F20 |
| D-B10 | **Formato e segurança do HTML compartilhável** — arquivo baixado vs link hospedado; se hospedado, quem pode abrir, por quanto tempo, se é indexável. | `PRD` 2.8, 6.3 | F21 |
| D-B11 | **Comportamento exato de "limpar análise"** — apaga tudo e volta ao formulário vazio? mantém dados do terreno? o que acontece com o registro interno já gravado? | `PRD` 5.3 item 6 | F22 |
| D-B12 | **Fonte e processo de importação do CUB** — upload/parse do boletim PDF, carga de planilha, ou digitação em tela admin. Quem executa e com que frequência. | `PRD` 3.4, 6.1 | F24 |
| D-B13 | **Validade do link de acesso** (dias/meses) e o que acontece ao expirar. | `PRD` 2.7, 6.3 | F27 |
| D-B14 | **Revogação e recuperação de acesso** — autosserviço por e-mail? só admin? quantas reemissões? | `PRD` 2.7, 5.2 | F30 |
| D-B15 | **Base legal, retenção e anonimização (LGPD)** dos dados internos (e-mail de compra + dados do terreno). `PRD` 6.3 diz explicitamente: **não implementar sem essa definição**. | `PRD` 6.3, 7 | F31 |
| D-B16 | **Quais métricas registrar e como calculá-las** (taxa de conclusão, reuso, compartilhamento, tempo de resposta). | `PRD` 9 | F32 |

### C. Decisões adiáveis

Podem ser tomadas depois sem retrabalho relevante.

| ID | Decisão | Sugestão de momento |
|----|---------|---------------------|
| D-A1 | Fonte da lista de municípios de MG (IBGE estático vs API) | F06 — começar com lista estática versionada |
| D-A2 | Persistir rascunho do formulário no navegador (`sessionStorage`) para sobreviver a refresh | F05 — decidir junto com D-B11 |
| D-A3 | Critério de desatualização do CUB (ex.: >30 dias) | F24 — parametrizar com default provisório marcado TBD |
| D-A4 | Quantidade N de versões anteriores de CUB mantidas | F24 — parametrizar |
| D-A5 | Taxa de ocupação default por município (hoje 0,6 global, provisório) | Pós-MVP |
| D-A6 | Ferramenta de observabilidade e alerta de falha de e-mail | F29 |
| D-A7 | Hospedagem, domínio e certificado HTTPS de produção | F25 |
| D-A8 | Copy final de onboarding, textos de alerta e microcopy | F04 e F18 — refinar com o usuário na validação |
| D-A9 | Biblioteca de gráficos (se houver gráfico na composição econômica) | F15 — só se o usuário pedir |
| D-A10 | Estratégia de cache da consulta de CEP | F06 |

### D. Pendências conhecidas do PRD (resumo consolidado)

Todas rastreadas acima: CSS Modules × Tailwind (D-R1) · Prisma × TypeORM (D-R2) · metodologia do LASTRO Score (D-B7) · os 10 pontos de potencial de mercado pós-FipeZap (D-B8) · despesas gerais 11% × 12% (D-B2) · fallback do CUB sem padrão Baixo (D-B4) · ausência de CAL-16 (D-B5) · mapeamento de Uso Misto (D-B6) · critério de desatualização do CUB (D-A3) · quantidade de versões mantidas (D-A4) · fonte e processo de importação do CUB (D-B12) · validade do link (D-B13) · revogação e recuperação (D-B14) · retenção e anonimização (D-B15) · base legal LGPD (D-B15) · biblioteca e estratégia de PDF (D-B9) · formato e segurança do HTML (D-B10) · comportamento de "limpar análise" (D-B11) · métricas (D-B16).

**Regra permanente:** nenhuma dessas pendências pode ser resolvida silenciosamente na implementação. Não inventar fórmulas, percentuais, limiares, dados de mercado, valores de CUB ou regras de fallback. Onde faltar decisão, o parâmetro fica centralizado, marcado `TBD` no código e exposto como pendência na interface quando afetar o resultado.

### E. Regras permanentes de trabalho visual (revisão de UX pós-F02)

A revisão da F02 com Opus abriu o `design-system/guide/Lastro Design System.dc.html` pela primeira vez — nenhuma fase o havia consultado — e encontrou divergências herdadas da F00 que teriam contaminado as 31 fases seguintes. O registro abaixo existe para o erro não se repetir.

1. **O guia é a fonte de verdade visual.** O `README.md` e o `tokens.css` são resumos incompletos dele. Só o guia especifica: botões (md 38px, lg 46px; variantes primária, secundária, contorno, fantasma), alertas (ícone + título + corpo, com borda), o padrão de eyebrow, tracking por nível, entrelinha e larguras de leitura. **Abrir o guia antes de escrever qualquer tela.**
2. **Contraste é medido, nunca estimado.** O `PRD` 7 exige WCAG 2.1 AA. Na F02, o aviso reprovava com 3,24:1 e o link com 4,32:1, ambos passando despercebidos na aprovação visual. Duas cores do próprio guia também reprovam (`#A6650A` a 4,26:1; `#2F6DF0` sobre cinza-50 a 4,32:1) — nesses casos, usar um passo mais escuro do mesmo matiz e registrar a exceção comentada no `tokens.css`.
3. **Toda cor semântica precisa existir nos dois temas.** O bloco `[data-theme="dark"]` não redefinia nenhuma cor de alerta, e o aviso virava uma caixa creme sobre a página navy. Ao criar qualquer token de cor, criar o par escuro junto.
4. **Validar nas três faixas, não só no desktop.** O aceite da F02 pedia "CTA alcançável sem rolagem no desktop" e passou com o botão em 713px de uma tela de 750px no mobile — fora da dobra. Medir a posição dos elementos de ação em 375, 820 e 1280.
5. **Nenhum valor visual avulso.** Quando o guia usar algo que não existe no `tokens.css`, o token entra no design system (`CLAUDE.md`, convenções de código), nunca direto no componente. O lint de tokens cobre cor e as propriedades de tamanho, incluindo as formas longhand.
6. **Ícones são do set Lucide** (`lucide-react`, 18px, traço 1.75), nunca desenhados à mão — `PRD` 6.1 e README do design system.
7. **O Replit não decide design.** Na sincronização da F02, o agente do Replit reescreveu copy e layout por conta própria; o conteúdo aprovado vem do GitHub e sincronização é cópia fiel, não oportunidade de melhoria.

---

## Estrutura de arquivos prevista

Seguindo `CLAUDE.md` (pastas em inglês, arquivos e identificadores em português):

```
/package.json                     /tsconfig.json  /tsconfig.server.json
/vite.config.ts                   /vitest.config.ts
/index.html                       /.env.example
/src/main.tsx  /src/App.tsx  /src/rotas.tsx
/src/styles/global.css
/src/components/layout/            Cabecalho, Rodape, LayoutApp, AlternadorTema
/src/components/ui/                Botao, Campo, Selecao, Cartao, Alerta, Modal, Etapas, Combobox
/src/components/terreno/           FormatoLote, Topografia (SVGs)
/src/components/produto/           SeletorTipologia, PainelAreas
/src/components/resultado/         Veredito, ResumoProjeto, ComposicaoEconomica, TogglePerspectiva,
                                   PainelPremissas, ListaAlertas, AcoesExportacao
/src/pages/                        PaginaInicial, Onboarding, Terreno, Produto, Resultado
/src/hooks/                        useTema, useAnalise, useCep, useDebounce
/src/types/                        terreno.ts, produto.ts, analise.ts, parametros.ts
/src/utils/motor/                  areas.ts, cub.ts, economia.ts, kpis.ts, score.ts, alertas.ts,
                                   parametros.ts, formatacao.ts
/src/utils/motor/dados/            cub-2026-08.ts (snapshot versionado)
/src/utils/motor/__tests__/        *.test.ts
/server/index.ts
/server/routes/                    analises.ts, cep.ts, parametros.ts
/server/controllers/               analisesController.ts, cepController.ts
/server/middleware/                validacao.ts, erros.ts, acesso.ts
/server/models/                    (cliente Prisma e repositórios — a partir da F24)
/server/domain/                    adaptadores do motor (a partir da F13)
/prisma/schema.prisma  /prisma/seed.ts   (nova pasta nível-1, justificada na F24)
/design-system/tokens/tokens.css   (estendido na F00)
```

**Nenhum nome de arquivo acima existe hoje** — todos serão criados nas fases indicadas.

---

# MACROETAPA 1 — Construção e validação do produto

Objetivo: permitir que a jornada completa do Terreno Viável seja percorrida, testada e aprovada **antes** de construir o sistema comercial.

---

## F00 — Fundação técnica e design system aplicado

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Fundação técnica e design system aplicado |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Colocar o projeto de pé no Replit (React+TS+Vite no 5173, Express no 3000) e provar que o design system LASTRO está aplicado e trocando de tema. |
| **4. Parte da jornada** | Nenhuma ainda — é a base sobre a qual toda a jornada será construída. |
| **5. Entrega visível** | Uma página única "lastro — Terreno Viável" com logo, as três famílias tipográficas, uma amostra de tokens (cores, raios, sombras, espaçamentos) e um alternador claro/escuro funcionando. |
| **6. Comportamento esperado** | `npm start` sobe front e back; o alternador troca o tema instantaneamente e respeita `prefers-color-scheme` na primeira visita; `GET /api/v1/saude` responde `{ status: "ok" }`. |
| **7. Escopo incluído** | Scaffold Vite+React+TS (strict), Express+TS, CSS Modules, Vitest, `.env.example`, import de fontes do Google Fonts, `global.css` importando os tokens, extensão do `tokens.css` (espaçamentos 4/8/12/16/24/40/88, tamanhos 54/32/20/15/13.5/14, tokens semânticos `--lastro-surface/text/border/*`, bloco `[data-theme="dark"]`), hook `useTema`, favicon e logos. |
| **8. Fora do escopo** | Rotas, páginas de produto, banco, qualquer regra de negócio. |
| **9. Arquivos criados** | `package.json`, `tsconfig.json`, `tsconfig.server.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `.env.example`, `src/main.tsx`, `src/App.tsx`, `src/styles/global.css`, `src/hooks/useTema.ts`, `src/components/layout/AlternadorTema.tsx` + `.module.css`, `server/index.ts`, `server/routes/saude.ts` |
| **10. Arquivos modificados** | `design-system/tokens/tokens.css` (só **adições**), `.gitignore` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | Nenhuma |
| **13. Dados reais × simulados** | Nada de dados ainda. |
| **14. Regras do PRD** | 6.1 (stack, design system obrigatório), 2.9 (dark mode), 6.4, 6.5 |
| **15. Aceite funcional** | App sobe sem erro; TypeScript strict sem `any`; `/api/v1/saude` responde; tema persiste ao recarregar. |
| **16. Aceite de UX** | Fontes corretas (Space Grotesk / Manrope / IBM Plex Mono); logo com respiro mínimo; contraste AA nos dois temas; wordmark em caixa baixa. |
| **17. Testes** | Teste do `useTema` (default do sistema, alternância, persistência); *smoke test* da rota de saúde; script que varre `src/**/*.module.css` procurando cor/tamanho hardcoded fora de `var(--lastro-*)`. |
| **18. Validar no Replit** | Abrir a URL, conferir as amostras de token, alternar tema, recarregar, abrir `/api/v1/saude`. |
| **19. Responsividade** | Mobile <768, tablet 768–1023, desktop 1024+ — a amostra não pode estourar horizontalmente. |
| **20. Estados de interface** | Tema claro, tema escuro, tema herdado do sistema. |
| **21. Riscos** | Extensão do `tokens.css` conflitar com o guia visual; configuração dupla de TS (browser + node). |
| **22. Decisões necessárias** | D-R1, D-R4 (resolvidas). Confirmar visualmente o diff do `tokens.css`. |
| **23. Complexidade** | Média |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Define stack, build, convenção de estilo e altera o design system — escolhas que todas as 33 fases seguintes herdam. |
| **26. Conclusão** | App roda no Replit, tokens estendidos aprovados, lint de tokens passando. |
| **27. Checkpoint** | `[x]` Usuário aprova a fundação e o diff do `tokens.css`. `✓opus`: revisada contra o guia na revisão pós-F02 — superfícies clara/elevada estavam invertidas, faltavam tracking, entrelinha e o par escuro das cores semânticas (seção E). |

---

## F01 — Shell da aplicação e navegação entre as quatro páginas

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Shell da aplicação e navegação |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Dar ao usuário o esqueleto navegável do produto: cabeçalho, indicador de etapas e as quatro páginas em sequência. |
| **4. Parte da jornada** | Estrutura de "entrar no produto → terreno → produto → resultado". |
| **5. Entrega visível** | Quatro rotas navegáveis (`/`, `/onboarding`, `/terreno`, `/produto`, `/resultado`) com cabeçalho fixo, indicador de etapas e conteúdo placeholder identificado. |
| **6. Comportamento esperado** | Navegação por botões Avançar/Voltar e pelo indicador de etapas; URL muda; etapa atual destacada; rota inexistente cai em uma tela 404 do design system. |
| **7. Escopo incluído** | React Router, `LayoutApp`, `Cabecalho` (logo + alternador de tema), `Rodape`, componente `Etapas`, página 404, componentes `Botao` e `Cartao`. |
| **8. Fora do escopo** | Qualquer campo de formulário, cálculo ou conteúdo definitivo. |
| **9. Arquivos criados** | `src/rotas.tsx`, `src/components/layout/LayoutApp.tsx`, `Cabecalho.tsx`, `Rodape.tsx` (+ `.module.css`), `src/components/ui/Botao.tsx`, `Cartao.tsx`, `Etapas.tsx` (+ `.module.css`), `src/pages/PaginaInicial.tsx`, `Onboarding.tsx`, `Terreno.tsx`, `Produto.tsx`, `Resultado.tsx`, `NaoEncontrada.tsx` |
| **10. Arquivos modificados** | `src/App.tsx`, `package.json` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F00 |
| **13. Dados reais × simulados** | Todo o conteúdo das páginas é **placeholder**, substituído nas fases F02–F14. |
| **14. Regras do PRD** | 5 (fluxo), 2.9, 6.4 |
| **15. Aceite funcional** | As cinco rotas respondem; navegação para frente e para trás preserva o tema; 404 funciona. |
| **16. Aceite de UX** | Indicador de etapas legível em mobile; foco de teclado visível; ordem de tabulação lógica. |
| **17. Testes** | Testes de componente do `Etapas` (etapa ativa, concluída, futura) e de renderização de cada rota. |
| **18. Validar no Replit** | Percorrer as quatro páginas pelos botões e pelo indicador, nos dois temas. |
| **19. Responsividade** | As três faixas; em mobile o indicador de etapas deve colapsar sem quebrar. |
| **20. Estados** | Etapa ativa/concluída/bloqueada, 404, dois temas. |
| **21. Riscos** | Indicador de etapas sugerir liberdade de navegação que as validações depois vão restringir. |
| **22. Decisões** | Confirmar se o usuário pode pular etapas livremente ou só avançar com a etapa válida (afeta F05 e F09). |
| **23. Complexidade** | Baixa |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Composição de layout e roteamento padrão, sem regra de negócio. |
| **26. Conclusão** | Jornada navegável de ponta a ponta com placeholders. |
| **27. Checkpoint** | `[x]` Usuário aprova a estrutura de navegação e o comportamento das etapas. `✓opus`: revisada contra o guia na revisão pós-F02 — `Botao` fechava em 33px contra os 38px do guia e faltavam as variantes contorno e fantasma; `AlternadorTema` virou botão de ícone (seção E). |

---

## F02 — Página inicial

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Página inicial |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Fazer o usuário entender em segundos o que o produto responde e começar uma análise. |
| **4. Parte da jornada** | "Entrar no produto → compreender o que ele faz → começar uma análise". |
| **5. Entrega visível** | Página inicial real: as duas perguntas do produto, o que ele entrega, tempo estimado, aviso de que o resultado só se conserva por exportação, e CTA "Começar análise". Link secundário "Ver a metodologia". |
| **6. Comportamento esperado** | "Começar análise" leva ao onboarding no primeiro acesso e direto ao formulário nos seguintes; "Ver a metodologia" abre o onboarding em modo consulta. |
| **7. Escopo incluído** | Conteúdo e layout definitivos, marcação da flag de "primeiro acesso" no navegador, aviso de não-persistência. |
| **8. Fora do escopo** | Landing pública de vendas (F25), validação de token de acesso (F27). |
| **9. Arquivos criados** | `src/pages/PaginaInicial.module.css`, `src/hooks/usePrimeiroAcesso.ts` |
| **10. Arquivos modificados** | `src/pages/PaginaInicial.tsx`, `src/rotas.tsx` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F01 |
| **13. Dados reais × simulados** | "Primeiro acesso" é **simulado** no navegador; na M2 passa a derivar do registro de acesso (F27). |
| **14. Regras do PRD** | 1 (objetivo), 2.9, 5.1, 2.8 (aviso de exportação) |
| **15. Aceite funcional** | Primeiro acesso → onboarding; acessos seguintes → formulário; flag resetável para teste. |
| **16. Aceite de UX** | Texto em pt-BR, sem jargão; hierarquia display/h1/h2 do design system; CTA alcançável sem rolagem em desktop. |
| **17. Testes** | Teste do `usePrimeiroAcesso` (primeira visita, visita repetida, storage indisponível); teste de renderização e clique do CTA. |
| **18. Validar no Replit** | Abrir em aba anônima (vai ao onboarding), recarregar (vai ao formulário), nos dois temas. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Primeiro acesso, acesso recorrente, storage bloqueado. |
| **21. Riscos** | Depender de `localStorage` que pode estar bloqueado — precisa degradar para "mostrar onboarding". |
| **22. Decisões** | Copy da página (D-A8). |
| **23. Complexidade** | Baixa |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | UI e copy com pequena regra de roteamento condicional. |
| **26. Conclusão** | Página inicial aprovada em conteúdo e comportamento. |
| **27. Checkpoint** | `[x]` Usuário aprova textos, hierarquia e o roteamento do CTA. `✓opus`: revisada contra o guia — aviso e link reprovavam AA (3,24:1 e 4,32:1), CTA ficava fora da dobra no mobile, título em 54px fixos, e o texto violava a regra de caixa baixa da marca (seção E). |

---

## F03 — Onboarding, primeira versão visível

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Onboarding v1 — metodologia |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Explicar a metodologia (método do resíduo do terreno) antes da primeira análise. |
| **4. Parte da jornada** | "Compreender o que ele faz". |
| **5. Entrega visível** | Sequência de passos navegável explicando: o que será perguntado, como o cálculo funciona (VGV → custos → resíduo do terreno) e o que o resultado entrega — um **estudo de viabilidade preliminar**, a base que deixa o usuário apto a avançar com segurança para uma análise mais aprofundada (validação urbanística, técnica e legal). |
| **6. Comportamento esperado** | Avançar/voltar entre os passos, pular para o formulário a qualquer momento, e ao concluir marcar o onboarding como visto. |
| **7. Escopo incluído** | Estrutura de passos, conteúdo textual da metodologia, botões de navegação e "Pular". |
| **8. Fora do escopo** | Ilustrações finais, animações, opção "não mostrar novamente" e refinamento de acessibilidade — tudo na F04. |
| **9. Arquivos criados** | `src/pages/Onboarding.module.css`, `src/components/onboarding/PassoOnboarding.tsx` + `.module.css`, `src/content/onboarding.ts` |
| **10. Arquivos modificados** | `src/pages/Onboarding.tsx` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F02 |
| **13. Dados reais × simulados** | Conteúdo textual real, derivado do PRD 4.1; sem números de exemplo simulados. |
| **14. Regras do PRD** | 2.9, 4.1, 10.3, 10.4 |
| **15. Aceite funcional** | Todos os passos acessíveis; "Pular" leva ao formulário; conclusão marca a flag. |
| **16. Aceite de UX** | Explicação compreensível por não-especialista; "CA" sempre como Coeficiente de Aproveitamento. |
| **17. Testes** | Teste de navegação entre passos e do botão pular. |
| **18. Validar no Replit** | Percorrer os passos, pular no meio, voltar pela página inicial. |
| **19. Responsividade** | As três faixas; passos legíveis em mobile sem rolagem horizontal. |
| **20. Estados** | Primeiro passo, intermediários, último, modo consulta. |
| **21. Riscos** | Texto longo demais e o usuário pular tudo. |
| **22. Decisões** | Quantidade e ordem dos passos (D-A8). |
| **23. Complexidade** | Baixa |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Conteúdo + navegação simples; a explicação precisa ser fiel ao PRD 4.1. |
| **26. Conclusão** | Onboarding percorrível com conteúdo aprovado em substância. |
| **27. Checkpoint** | `[ ]` Usuário aprova a substância da explicação (o polimento vem na F04). |

---

## F04 — Onboarding, refinamento e conclusão

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Onboarding v2 — refinamento |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Fechar o onboarding com apoio visual, acessibilidade e reabertura sob demanda. |
| **4. Parte da jornada** | Mesma da F03, agora completa. |
| **5. Entrega visível** | Onboarding com ilustrações/diagramas do fluxo de cálculo, indicador de progresso, opção "não mostrar novamente" e entrada permanente "Metodologia" no cabeçalho. |
| **6. Comportamento esperado** | Navegação por teclado (setas, Tab, Esc); o onboarting pode ser reaberto do cabeçalho em qualquer página sem perder o formulário em preenchimento. |
| **7. Escopo incluído** | Diagramas em SVG usando tokens, progresso, atalho no cabeçalho, revisão de copy, foco e leitores de tela. |
| **8. Fora do escopo** | Vídeo, tour interativo sobre a interface real. |
| **9. Arquivos criados** | `src/components/onboarding/DiagramaResiduo.tsx`, `ProgressoOnboarding.tsx` (+ `.module.css`) |
| **10. Arquivos modificados** | `src/pages/Onboarding.tsx`, `src/content/onboarding.ts`, `src/components/layout/Cabecalho.tsx` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F03 |
| **13. Dados reais × simulados** | Números nos diagramas são **ilustrativos** e devem ser rotulados como exemplo. |
| **14. Regras do PRD** | 2.9, 7 (WCAG 2.1 AA desejável), 10.3 |
| **15. Aceite funcional** | Reabertura do cabeçalho preserva o estado do formulário; "não mostrar novamente" persiste. |
| **16. Aceite de UX** | Navegação completa por teclado; contraste AA nos diagramas nos dois temas; foco nunca some. |
| **17. Testes** | Teste de navegação por teclado; teste de que reabrir não limpa o formulário. |
| **18. Validar no Replit** | Preencher parte do terreno, abrir metodologia pelo cabeçalho, fechar, conferir que nada se perdeu. |
| **19. Responsividade** | As três faixas; diagramas reflowam em mobile. |
| **20. Estados** | Visto/não visto, modo consulta, foco por teclado. |
| **21. Riscos** | Diagrama com valores fixos parecer resultado real. |
| **22. Decisões** | Copy final (D-A8). |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | SVG, acessibilidade e integração com o estado do formulário. |
| **26. Conclusão** | Onboarding final aprovado, acessível e reabrível. |
| **27. Checkpoint** | `[ ]` Usuário aprova o onboarding como concluído. |

---

## F05 — Estrutura da página de Terreno

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Estrutura da página de Terreno |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Criar o esqueleto do formulário (Etapa 1 do PRD) com estado, validação e mensagens, antes dos campos específicos. |
| **4. Parte da jornada** | "Começar uma análise → identificar o terreno". |
| **5. Entrega visível** | Página de Terreno com seções ("Identificação e localização", "Dados físicos e financeiros", "Características do lote") e o primeiro campo real — nome/identificação do terreno — com validação e mensagem de erro. |
| **6. Comportamento esperado** | Campo obrigatório valida ao sair do foco; "Avançar" bloqueado com resumo de pendências; estado do formulário compartilhado entre páginas. |
| **7. Escopo incluído** | Contexto/estado da análise (`useAnalise`), tipos do terreno, componentes `Campo` e `Alerta`, esquema de validação compartilhado front/back, seções e mensagens em pt-BR. Inclui a pergunta obrigatória do **objetivo da análise** (D-R6): comprar o terreno × executar o empreendimento — a fase decide onde ela aparece no fluxo (tela própria antes da Etapa 1, ou primeiro campo dela). |
| **8. Fora do escopo** | CEP, cidade, área, preço, formato, topografia (F06–F08). Uso do objetivo para decidir a perspectiva padrão do resultado (F16) e o rótulo da recomendação (F19) — aqui só se captura e persiste no estado da análise. |
| **9. Arquivos criados** | `src/hooks/useAnalise.ts`, `src/types/terreno.ts`, `src/types/analise.ts`, `src/utils/validacao/terreno.ts`, `src/components/ui/Campo.tsx`, `Alerta.tsx` (+ `.module.css`), `src/pages/Terreno.module.css` |
| **10. Arquivos modificados** | `src/pages/Terreno.tsx`, `src/App.tsx` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F01 |
| **13. Dados reais × simulados** | Estado real em memória; nada persistido ainda. |
| **14. Regras do PRD** | 2.2 (Etapa 1), 2.6 (objetivo da análise), 6.3 (validação no front e obrigatória no back), 10.1 |
| **15. Aceite funcional** | Validação dispara corretamente; estado sobrevive à navegação entre páginas; recarregar a página descarta (comportamento esperado até D-A2). |
| **16. Aceite de UX** | Mensagem de erro específica e em pt-BR; erro associado ao campo via `aria-describedby`; nenhum alerta bloqueia digitação. |
| **17. Testes** | Testes unitários do esquema de validação (vazio, só espaços, limite de tamanho); teste do `useAnalise`; teste do bloqueio de "Avançar". |
| **18. Validar no Replit** | Tentar avançar vazio, preencher, navegar para Produto e voltar. |
| **19. Responsividade** | As três faixas; campos em coluna única no mobile. |
| **20. Estados** | Vazio, preenchido, inválido, foco, desabilitado. |
| **21. Riscos** | Perda acidental do formulário ao recarregar — mitigação depende de D-A2/D-B11. |
| **22. Decisões** | D-A2 (rascunho no navegador); liberdade de pular etapas (herdado da F01); posição exata do objetivo da análise no fluxo (D-R6 já resolve o quê e o porquê, falta o onde). |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Define o padrão de formulário e validação de todo o produto, mas sem regra econômica. |
| **26. Conclusão** | Esqueleto do formulário com validação aprovada. |
| **27. Checkpoint** | `[ ]` Usuário aprova o padrão de campo, erro e navegação entre etapas. |

---

## F06 — Identificação e localização do terreno (cidade + CEP)

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Identificação e localização do terreno |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Permitir localizar o terreno: cidade de MG com busca por digitação e CEP com autopreenchimento, sem nunca bloquear a análise. |
| **4. Parte da jornada** | "Identificar o terreno". |
| **5. Entrega visível** | Combobox de municípios de Minas Gerais filtrando conforme digitação; campo de CEP que, ao completar, preenche logradouro e bairro; campos de endereço editáveis manualmente. |
| **6. Comportamento esperado** | CEP válido → preenchimento automático com indicação da origem; CEP inexistente → aviso e preenchimento manual; API fora do ar ou lenta → aviso não-bloqueante e preenchimento manual. |
| **7. Escopo incluído** | Lista estática versionada dos municípios de MG, componente `Combobox` acessível, `useCep` com debounce e timeout, proxy no backend `GET /api/v1/cep/:cep` (evita CORS e centraliza o timeout), estados de carregando/erro/indisponível. |
| **8. Fora do escopo** | Mapa, geolocalização, validação de endereço. |
| **9. Arquivos criados** | `src/components/ui/Combobox.tsx` + `.module.css`, `src/hooks/useCep.ts`, `src/data/municipios-mg.ts`, `server/routes/cep.ts`, `server/controllers/cepController.ts` |
| **10. Arquivos modificados** | `src/pages/Terreno.tsx`, `src/types/terreno.ts`, `src/utils/validacao/terreno.ts`, `server/index.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F05 |
| **13. Dados reais × simulados** | **Reais**: lista de municípios de MG e consulta de CEP via API pública. Verificar disponibilidade e termos de uso **antes** de integrar (`CLAUDE.md` regra 6, PRD 3.4). |
| **14. Regras do PRD** | 2.2, 3.4, 3.5 (só MG), 6.1 (integração externa), 6.3 |
| **15. Aceite funcional** | Autopreenchimento funciona; falha da API não impede avançar; busca de município é acento-insensível. |
| **16. Aceite de UX** | Combobox navegável por teclado com anúncio de resultados; mensagem de indisponibilidade explica que é possível preencher à mão. |
| **17. Testes** | Testes do `useCep` (sucesso, 404, timeout, rede fora); teste do proxy no backend; teste de acessibilidade do combobox; teste de que o formulário continua submetível com a API caída. |
| **18. Validar no Replit** | Digitar um CEP real de MG; digitar um CEP inexistente; simular queda da API (desligar o proxy) e confirmar que dá para seguir. |
| **19. Responsividade** | As três faixas; lista do combobox não pode sair da viewport no mobile. |
| **20. Estados** | Vazio, digitando, carregando, sucesso, não encontrado, indisponível, preenchido manualmente. |
| **21. Riscos** | Rate limit ou indisponibilidade da API pública; latência degradando a digitação. |
| **22. Decisões** | D-A1 (fonte dos municípios), D-A10 (cache). Confirmar a API de CEP escolhida antes de codar. |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Integração externa de complexidade moderada com fallback bem definido no PRD. |
| **26. Conclusão** | Localização preenchível com e sem a API disponível. |
| **27. Checkpoint** | `[ ]` Usuário aprova o comportamento do CEP e da busca de município. |

---

## F07 — Dados físicos e financeiros do terreno

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Dados físicos e financeiros do terreno |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Capturar área e preço pedido e devolver o primeiro número calculado do produto: o preço unitário do terreno. |
| **4. Parte da jornada** | "Identificar o terreno" (dados econômicos). |
| **5. Entrega visível** | Campos de área total (m²) e preço pedido (R$) com máscara monetária, e um campo calculado, somente leitura, com o preço em R$/m² atualizando em tempo real. |
| **6. Comportamento esperado** | Digitação monetária formata em pt-BR; o valor interno é numérico (nunca string); área zero ou negativa é rejeitada; R$/m² só aparece com os dois insumos válidos. |
| **7. Escopo incluído** | Utilitários de parsing/formatação monetária e de arredondamento, campo numérico com máscara, cálculo do preço unitário, validação de faixas. |
| **8. Fora do escopo** | Qualquer cálculo de viabilidade. |
| **9. Arquivos criados** | `src/utils/motor/formatacao.ts`, `src/utils/motor/__tests__/formatacao.test.ts`, `src/components/ui/CampoMoeda.tsx`, `CampoNumero.tsx`, `CampoCalculado.tsx` (+ `.module.css`) |
| **10. Arquivos modificados** | `src/pages/Terreno.tsx`, `src/types/terreno.ts`, `src/utils/validacao/terreno.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F06 |
| **13. Dados reais × simulados** | Reais, informados pelo usuário. |
| **14. Regras do PRD** | 2.2 (área, preço, preço unitário calculado), 6.3 |
| **15. Aceite funcional** | R$/m² = preço ÷ área, com arredondamento definido e testado; valores monetários nunca derivados de string; percentuais em convenção única. |
| **16. Aceite de UX** | Máscara não atrapalha a digitação nem o colar; unidades explícitas; campo calculado visivelmente diferente de campo editável. |
| **17. Testes** | Testes de arredondamento monetário (meio para cima, centavos, valores grandes); parsing de entradas com ponto, vírgula e separador de milhar; divisão por zero. |
| **18. Validar no Replit** | Digitar 1.000 m² e R$ 1.200.000 e conferir R$ 1.200,00/m²; testar 0 e negativo; colar valores formatados. |
| **19. Responsividade** | As três faixas; teclado numérico no mobile. |
| **20. Estados** | Vazio, parcial, válido, inválido, calculado. |
| **21. Riscos** | Erro de arredondamento propagando para o motor econômico. |
| **22. Decisões** | Nenhuma bloqueante. |
| **23. Complexidade** | Média |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Fixa a convenção monetária e de arredondamento que todo o motor econômico vai herdar — erro aqui contamina o resultado inteiro. |
| **26. Conclusão** | Preço unitário correto e testes de arredondamento passando. |
| **27. Checkpoint** | `[ ]` Usuário aprova máscara, unidades e o valor calculado. |

---

## F08 — Formato do lote e topografia com representação gráfica

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Formato do lote e topografia |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Capturar formato e topografia de modo que o usuário entenda visualmente o que está escolhendo — são insumos diretos dos aditivos do CUB. |
| **4. Parte da jornada** | Conclusão de "identificar o terreno". |
| **5. Entrega visível** | Seleção de formato (Regular/Irregular) com desenho do lote e de topografia (Plana/Regular/Irregular/Acidentada) com perfil topográfico ilustrado, cada opção com uma frase explicativa. |
| **6. Comportamento esperado** | Seleção por clique ou teclado; opção escolhida claramente destacada; avançar para Produto habilitado quando a Etapa 1 estiver completa. |
| **7. Escopo incluído** | SVGs em tokens, cartões de seleção acessíveis (`radiogroup`), textos explicativos, conclusão da validação da Etapa 1. |
| **8. Fora do escopo** | Aplicação dos aditivos no cálculo (F12), desenho da geometria real do lote. |
| **9. Arquivos criados** | `src/components/terreno/FormatoLote.tsx`, `Topografia.tsx`, `CartaoOpcao.tsx` (+ `.module.css`), `src/components/terreno/ilustracoes/*.tsx` |
| **10. Arquivos modificados** | `src/pages/Terreno.tsx`, `src/types/terreno.ts`, `src/utils/validacao/terreno.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F07 |
| **13. Dados reais × simulados** | Reais. As ilustrações são esquemáticas — não representam o lote do usuário. |
| **14. Regras do PRD** | 2.2 (representação gráfica), 3.2 C e D (aditivos) |
| **15. Aceite funcional** | Os quatro valores de topografia e os dois de formato correspondem exatamente às tabelas do PRD 3.2; Etapa 1 conclui e libera a Etapa 2. |
| **16. Aceite de UX** | `radiogroup` navegável por setas; seleção distinguível sem depender só de cor; ilustrações legíveis nos dois temas. |
| **17. Testes** | Teste de seleção por teclado e mouse; teste de que a Etapa 1 só conclui com tudo preenchido; snapshot das ilustrações. |
| **18. Validar no Replit** | Selecionar cada opção com mouse e teclado; conferir os desenhos nos dois temas; avançar para Produto. |
| **19. Responsividade** | As três faixas; cartões empilham no mobile. |
| **20. Estados** | Nenhum selecionado, selecionado, foco, inválido. |
| **21. Riscos** | Ilustração ambígua levar a classificação errada e, portanto, a aditivo errado. |
| **22. Decisões** | Aprovar o desenho de cada opção com o usuário. |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | SVG e componente de seleção; a regra por trás é tabela fixa do PRD. |
| **26. Conclusão** | Etapa 1 do formulário completa e aprovada. |
| **27. Checkpoint** | `[ ]` Usuário aprova as ilustrações e conclui a página de Terreno. |

---

## F09 — Estrutura da página de Produto: tipo, tipologia e padrão

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Estrutura da página de Produto — tipo, tipologia e padrão |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Capturar a classificação do empreendimento, que determina a consulta ao CUB e os percentuais de terreno e lucro. |
| **4. Parte da jornada** | "Definir o empreendimento". |
| **5. Entrega visível** | Página de Produto com seleção de Tipo (Residencial, Comercial, Galpões), Tipologia dependente do tipo, e Padrão (Baixo, Normal, Alto) com o que cada padrão significa. |
| **6. Comportamento esperado** | Trocar o tipo reseta a tipologia; os campos exibidos variam por tipologia; Uso Misto tratado conforme D-B6. |
| **7. Escopo incluído** | Taxonomia do PRD 3.1, seleção em cascata, explicação do padrão, estrutura da Etapa 2. |
| **8. Fora do escopo** | Pavimentos, unidades, áreas, cálculo (F10–F13). |
| **9. Arquivos criados** | `src/types/produto.ts`, `src/data/tipologias.ts`, `src/components/produto/SeletorTipologia.tsx`, `SeletorPadrao.tsx` (+ `.module.css`), `src/pages/Produto.module.css`, `src/utils/validacao/produto.ts` |
| **10. Arquivos modificados** | `src/pages/Produto.tsx`, `src/hooks/useAnalise.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F08 |
| **13. Dados reais × simulados** | Taxonomia real do PRD 3.1. **Uso Misto fica pendente** (D-B6) — exibido desabilitado com aviso até a decisão. |
| **14. Regras do PRD** | 2.2 (Etapa 2), 3.1 (taxonomia e classificação CUB), nota sobre campos variáveis por tipologia |
| **15. Aceite funcional** | Combinações válidas correspondem à tabela do PRD 3.1; nenhuma combinação inventada; percentuais variam por padrão, nunca por tipologia. |
| **16. Aceite de UX** | Padrão explicado em termos concretos (o que cobre cada nível); Uso Misto com motivo claro do bloqueio. |
| **17. Testes** | Testes da taxonomia (tipologias por tipo, reset em cascata); teste de que nenhuma combinação fora do PRD é selecionável. |
| **18. Validar no Replit** | Percorrer todas as combinações; trocar o tipo e conferir o reset. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Nada selecionado, cascata parcial, completo, opção desabilitada com aviso. |
| **21. Riscos** | Classificação errada aqui invalida todo o custo de obra. |
| **22. Decisões** | **D-B6 (bloqueante)** — mapeamento de Uso Misto. |
| **23. Complexidade** | Média |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | A taxonomia é a chave de consulta do CUB; erro de modelagem aqui é sistêmico e caro de reverter. |
| **26. Conclusão** | Classificação correta e fiel ao PRD 3.1. |
| **27. Checkpoint** | `[ ]` Usuário aprova a taxonomia e decide sobre Uso Misto. |

---

## F10 — Pavimentos, unidades e preço de venda

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Pavimentos, unidades e preço de venda |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Capturar o programa do empreendimento e devolver o preço por m² vendido para o usuário confrontar com o mercado. |
| **4. Parte da jornada** | "Definir o empreendimento". |
| **5. Entrega visível** | Campos de número de pavimentos, unidades por pavimento, total de unidades (calculado), área da unidade vendida e preço de venda da unidade, mais o preço por m² vendido calculado em tempo real. |
| **6. Comportamento esperado** | Casa e Galpões travam em 1 unidade por pavimento e 1 unidade total, com explicação; total de unidades = pavimentos × unidades por pavimento; preço/m² = preço da unidade ÷ área da unidade. |
| **7. Escopo incluído** | Campos, regras de restrição por tipologia, cálculos derivados, validação de inteiros positivos, nota de que o MVP não consulta base de preços de mercado. |
| **8. Fora do escopo** | Áreas do terreno e indicadores urbanísticos (F11); alerta qualitativo de mercado (F18). |
| **9. Arquivos criados** | `src/components/produto/ProgramaEmpreendimento.tsx` + `.module.css` |
| **10. Arquivos modificados** | `src/pages/Produto.tsx`, `src/types/produto.ts`, `src/utils/validacao/produto.ts`, `src/data/tipologias.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F09 |
| **13. Dados reais × simulados** | Reais. Nenhuma base de preços é consultada (PRD 3.4 — FipeZap retirada). |
| **14. Regras do PRD** | 2.2 (unidades, restrição de casa/galpão, preço/m² devolvido), 3.3, 4.1 (VGV = unidades × preço, nunca m² × preço/m²) |
| **15. Aceite funcional** | Restrição de casa/galpão aplicada; total de unidades correto; preço/m² correto; mudar a tipologia reavalia as restrições. |
| **16. Aceite de UX** | Fica claro que o preço/m² é informativo e que cabe ao usuário comparar com o mercado; campos travados explicam o motivo em vez de só desabilitar. |
| **17. Testes** | Testes das restrições por tipologia; total de unidades; preço/m² com área zero; troca de tipologia com valores já preenchidos. |
| **18. Validar no Replit** | Escolher Prédio (4 pavimentos × 4 unidades = 16); trocar para Casa e conferir o travamento e a explicação. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Vazio, válido, inválido, travado por tipologia, calculado. |
| **21. Riscos** | Usuário confundir área da unidade com área construída. |
| **22. Decisões** | Nenhuma bloqueante. |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Formulário com regras condicionais claras já especificadas no PRD. |
| **26. Conclusão** | Programa do empreendimento completo e derivados corretos. |
| **27. Checkpoint** | `[ ]` Usuário aprova campos, travas e o preço por m². |

---

## F11 — Áreas calculadas e indicadores urbanísticos

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Áreas calculadas e indicadores urbanísticos |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Entregar a cadeia de áreas e os dois coeficientes para o usuário validar contra o plano diretor — primeira peça do motor puro. |
| **4. Parte da jornada** | "Conferir áreas e premissas". |
| **5. Entrega visível** | Painel ao fim da página de Produto com Taxa de Ocupação (ajustável, default 0,6), Área Utilizada, Área Total Construída, Área Comercializável, CA atingido e o coeficiente da soma das unidades por pavimento, todos recalculando em tempo real. |
| **6. Comportamento esperado** | Ajustar qualquer insumo atualiza o painel instantaneamente; o coeficiente de unidades some para casas unifamiliares; cada número mostra a fórmula que o gerou. |
| **7. Escopo incluído** | Módulo puro `areas.ts`, parâmetro centralizado da taxa de ocupação, painel, explicação de cada fórmula, testes unitários. |
| **8. Fora do escopo** | Faixas de alerta (F18), CUB e custo (F12), limites legais por zona (fora do MVP). |
| **9. Arquivos criados** | `src/utils/motor/areas.ts`, `src/utils/motor/parametros.ts`, `src/utils/motor/__tests__/areas.test.ts`, `src/components/produto/PainelAreas.tsx` + `.module.css`, `src/types/parametros.ts` |
| **10. Arquivos modificados** | `src/pages/Produto.tsx`, `src/types/produto.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F10 |
| **13. Dados reais × simulados** | Reais e calculados. Taxa de ocupação 0,6 é **parâmetro provisório centralizado**, marcado como tal. |
| **14. Regras do PRD** | 3.3 (cadeia completa), 2.3, 2.2. As quatro áreas são distintas: terreno ≠ utilizada ≠ construída ≠ comercializável. CA é Coeficiente de Aproveitamento, nunca confundir com IA (inteligência artificial). |
| **15. Aceite funcional** | `Área Utilizada = Área Terreno × Taxa Ocupação`; `Construída = Utilizada × Pavimentos`; `Comercializável = Total Unidades × Área da Unidade`; `CA = Construída ÷ Área Terreno`; `Coef. unidades = (Unidades por pavimento × Área da unidade) ÷ Área Utilizada` (soma de todas as unidades do pavimento, nunca uma isolada). |
| **16. Aceite de UX** | Cada área nomeada sem ambiguidade; fórmula acessível por expansão; unidade de medida sempre visível. |
| **17. Testes** | Testes unitários de cada fórmula com o exemplo de referência do PRD; casos de borda (1 pavimento, 1 unidade, taxa 0, taxa 1); teste de que casas não produzem o coeficiente de unidades. |
| **18. Validar no Replit** | 1.000 m², taxa 0,6, 4 pavimentos → utilizada 600, construída 2.400, CA 2,4. Mexer na taxa e ver tudo reagir. |
| **19. Responsividade** | As três faixas; painel vira lista no mobile. |
| **20. Estados** | Insuficiente para calcular, calculado, taxa alterada pelo usuário. |
| **21. Riscos** | Confundir área construída com comercializável — erro que muda custo e VGV. |
| **22. Decisões** | Nenhuma bloqueante (D-A5 adiável). |
| **23. Complexidade** | Média |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Primeira peça do motor de cálculo; a distinção entre as quatro áreas é regra crítica de domínio do `CLAUDE.md`. |
| **26. Conclusão** | Áreas e coeficientes corretos, testes verdes, painel aprovado. |
| **27. Checkpoint** | `[ ]` Usuário confere os números contra um caso conhecido e aprova. |

---

## F12 — Parâmetros centralizados e base CUB versionada

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Parâmetros centralizados e base CUB versionada |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Implementar a classificação CUB, os quatro aditivos e o CUB Ajustado, com todos os parâmetros centralizados e versionados. |
| **4. Parte da jornada** | "Conferir áreas e premissas" (custo unitário da obra). |
| **5. Entrega visível** | No painel de áreas, um bloco novo: Projeto CUB classificado, CUB base, os quatro aditivos discriminados, a soma e o CUB Ajustado em R$/m², com a competência da base exibida. |
| **6. Comportamento esperado** | Mudar padrão, pavimentos, topografia ou formato reclassifica e recalcula na hora; combinação sem valor publicado exibe pendência explícita em vez de um número inventado. |
| **7. Escopo incluído** | `cub.ts` (classificação + aditivos + CUB ajustado), snapshot versionado da tabela em módulo TS separado, faixas de pavimentos, registro de competência, tratamento explícito das lacunas. |
| **8. Fora do escopo** | Banco de dados (F24), rotina de importação (F24), custo total de obra (F13). |
| **9. Arquivos criados** | `src/utils/motor/cub.ts`, `src/utils/motor/dados/cub-2026-08.ts`, `src/utils/motor/dados/index.ts`, `src/utils/motor/__tests__/cub.test.ts`, `src/components/produto/PainelCub.tsx` + `.module.css` |
| **10. Arquivos modificados** | `src/utils/motor/parametros.ts`, `src/types/parametros.ts`, `src/components/produto/PainelAreas.tsx` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F11 |
| **13. Dados reais × simulados** | Valores CUB **reais** da competência Ago/2026 do PRD 3.1, isolados em módulo de dados versionado com competência e origem — **nunca embutidos na lógica**. Esse módulo é substituído pela tabela `external_data` na F24; para evitar dívida, a lógica consome uma interface de repositório desde já. |
| **14. Regras do PRD** | 3.1 (classificação em duas etapas, sem códigos tipo `R8-B`), 3.2 (quatro aditivos somados em **uma única multiplicação**), 2.3, 3.4 |
| **15. Aceite funcional** | `CUB Ajustado = CUB Base × (1 + soma dos aditivos)`. Caso de referência do PRD: prédio Normal, 4 pavimentos, topografia Regular, formato Regular → 7% + 15% + 1,5% + 0% = 23,5% → 2.554,58 × 1,235 = **R$ 3.154,91/m²**. Nenhuma multiplicação encadeada. |
| **16. Aceite de UX** | Aditivos discriminados um a um; competência da base visível; pendência de fallback comunicada com clareza, sem parecer erro do usuário. |
| **17. Testes** | Classificação para todas as combinações da tabela 3.1; os quatro aditivos isolados e somados; o exemplo de referência com precisão de centavos; lacunas (R-16/CSL/CAL padrão Baixo, CAL-16) retornando pendência e não valor. |
| **18. Validar no Replit** | Reproduzir o exemplo de referência e conferir R$ 3.154,91/m²; selecionar uma combinação sem padrão Baixo e ver a pendência. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Classificado, pendente por lacuna, base desatualizada (preparado, ativado na F24). |
| **21. Riscos** | Inventar valor de fallback — proibido. Classificação por faixa de pavimentos ambígua nos limites (4, 8, 16). |
| **22. Decisões** | **D-B4 (bloqueante)** fallback padrão Baixo · **D-B5 (bloqueante)** CAL-16 · D-A3 e D-A4 (adiáveis). |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Regra econômica sensível com lacunas de fonte e risco real de o modelo "completar" dados ausentes. |
| **26. Conclusão** | CUB Ajustado reproduz o exemplo do PRD e as lacunas aparecem como pendência. |
| **27. Checkpoint** | `[ ]` Usuário valida o CUB Ajustado e decide D-B4 e D-B5. |

---

## F13 — Motor econômico e API de análise

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Motor econômico e API de análise |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Implementar o método do resíduo do terreno como funções puras e expô-lo por API com validação obrigatória no backend. |
| **4. Parte da jornada** | "Gerar a análise". |
| **5. Entrega visível** | Botão "Gerar análise" na página de Produto que leva ao Resultado exibindo, ainda em formato cru, os números do cálculo: VGV, Custo de Obra, Despesas Gerais, Lucro Incorporador, Resultado Terreno e Resultado Líquido. |
| **6. Comportamento esperado** | `POST /api/v1/analises` valida tudo de novo no servidor, calcula em < 500ms e devolve o resultado com o snapshot das premissas e da versão de dados usada. |
| **7. Escopo incluído** | `economia.ts` puro, composição das despesas gerais parametrizada, perspectiva Terrenista, rota/controller/validação no Express, formato de resposta consistente, tratamento de erro, snapshot de premissas. |
| **8. Fora do escopo** | Score, recomendação, alertas, toggle de perspectiva, ajuste de premissas, apresentação final. |
| **9. Arquivos criados** | `src/utils/motor/economia.ts`, `src/utils/motor/__tests__/economia.test.ts`, `server/routes/analises.ts`, `server/controllers/analisesController.ts`, `server/middleware/validacao.ts`, `server/middleware/erros.ts`, `server/domain/motorAdapter.ts`, `src/hooks/useAnaliseRemota.ts` |
| **10. Arquivos modificados** | `src/pages/Produto.tsx`, `src/pages/Resultado.tsx`, `src/types/analise.ts`, `src/utils/motor/parametros.ts`, `server/index.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F12 |
| **13. Dados reais × simulados** | Cálculo real. **Despesas gerais em 11,0%** conforme o PRD, marcado como pendente até D-B2. Nada persistido. |
| **14. Regras do PRD** | 4.1 integral, 2.1, 6.2 (< 500ms), 6.3 (validação obrigatória no backend) |
| **15. Aceite funcional** | `VGV = Unidades × Preço da Unidade` (nunca m² × preço/m²); `Custo de Obra = CUB Ajustado × Área Total Construída`; `Despesas = % × VGV`; `Lucro = % do padrão × VGV`; `Resultado Terreno = VGV − Obra − Despesas − Lucro`; `Resultado Líquido = Resultado Terreno − Preço Pedido`; viável se ≥ 0. Regra de negócio existe uma única vez, compartilhada por front e back. |
| **16. Aceite de UX** | Estado de carregando durante o cálculo; erro do servidor explicado em pt-BR com caminho de volta. |
| **17. Testes** | Testes unitários de cada fórmula; caso completo de ponta a ponta com números do PRD; arredondamento em cada etapa; teste de integração da rota (payload válido, inválido, incompleto); teste de que o snapshot de premissas acompanha a resposta; teste de performance < 500ms. |
| **18. Validar no Replit** | Preencher um cenário conhecido, gerar a análise, conferir cada linha com calculadora; enviar payload inválido pela API e ver a recusa. |
| **19. Responsividade** | As três faixas (layout ainda cru). |
| **20. Estados** | Carregando, sucesso, erro de validação, erro de servidor, dados insuficientes. |
| **21. Riscos** | Duplicar regra entre front e back; divergência de arredondamento entre os dois. |
| **22. Decisões** | **D-B1** (localização do motor único) · **D-B2** (11% × 12%) · **D-B3** (20% × 22% no exemplo). |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Coração econômico do produto, contrato de API e decisão arquitetural — a fase de maior risco da Macroetapa 1. |
| **26. Conclusão** | Motor reproduz o cenário de referência, API validando, testes verdes. |
| **27. Checkpoint** | `[ ]` Usuário confere os números contra sua própria planilha e decide D-B1, D-B2 e D-B3. |

---

## F14 — Resultado, primeira versão visível

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Resultado v1 — resumo e preço máximo recomendado |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Transformar os números crus na primeira leitura útil: o que foi analisado e quanto o terreno pode valer. |
| **4. Parte da jornada** | "Entender a recomendação" (primeira camada). |
| **5. Entrega visível** | Página de Resultado com resumo do projeto, potencial preliminar (m² construídos, m² comercializáveis, unidades), preço pedido, **preço máximo recomendado** e sobra/déficit destacado. |
| **6. Comportamento esperado** | Leitura de cima para baixo com o essencial primeiro; sobra e déficit visualmente distintos; sem jargão na primeira dobra. |
| **7. Escopo incluído** | Componentes de resumo e destaque, formatação monetária de apresentação, hierarquia visual. |
| **8. Fora do escopo** | Score e recomendação (F19), composição detalhada (F15), alertas (F18), exportação (F20–F21). |
| **9. Arquivos criados** | `src/components/resultado/ResumoProjeto.tsx`, `PotencialPreliminar.tsx`, `PrecoMaximo.tsx` (+ `.module.css`), `src/pages/Resultado.module.css` |
| **10. Arquivos modificados** | `src/pages/Resultado.tsx` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F13 |
| **13. Dados reais × simulados** | Reais, vindos da API. |
| **14. Regras do PRD** | 2.5 (estrutura do output), 10.3 (simplicidade no topo) |
| **15. Aceite funcional** | O preço máximo recomendado é exatamente o Resultado Terreno da perspectiva Terrenista; sobra/déficit = Resultado Líquido. |
| **16. Aceite de UX** | Compreensível por quem não é do setor; monetário só formatado na apresentação; cor não é o único sinal de sobra/déficit. |
| **17. Testes** | Testes de componente para cenário viável, inviável e de empate; formatação monetária de apresentação. |
| **18. Validar no Replit** | Gerar uma análise viável e outra inviável e comparar as leituras. |
| **19. Responsividade** | As três faixas; números grandes não podem quebrar no mobile. |
| **20. Estados** | Viável, inviável, sem dados (acesso direto à URL). |
| **21. Riscos** | Parecer conclusivo antes de existirem score e alertas. |
| **22. Decisões** | Nenhuma bloqueante. |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Apresentação sobre um motor já testado. |
| **26. Conclusão** | Primeira leitura do resultado aprovada. |
| **27. Checkpoint** | `[ ]` Usuário aprova hierarquia e clareza da primeira dobra. |

---

## F15 — Composição econômica detalhada

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Composição econômica detalhada |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Abrir a "complexidade por baixo": a tabela de composição de custos do PRD 2.5. |
| **4. Parte da jornada** | "Entender a recomendação" (segunda camada). |
| **5. Entrega visível** | Seção expansível "Ver detalhes" com a tabela VGV → Custo de Obra → Despesas Gerais → Lucro Incorporador → Resultado Terreno → Preço Pedido → Sobra/Déficit, em R$ e % do VGV, mais o detalhamento das despesas gerais e do CUB Ajustado. |
| **6. Comportamento esperado** | Recolhida por padrão; expandir não reordena a página; cada linha mostra sua fórmula sob demanda. |
| **7. Escopo incluído** | Tabela acessível, cálculo de percentuais sobre o VGV, detalhamento das despesas e dos aditivos, snapshot de premissas visível. |
| **8. Fora do escopo** | Edição de premissas (F17), gráficos (D-A9). |
| **9. Arquivos criados** | `src/components/resultado/ComposicaoEconomica.tsx`, `DetalheDespesas.tsx`, `DetalheCub.tsx`, `src/components/ui/Expansivel.tsx` (+ `.module.css`) |
| **10. Arquivos modificados** | `src/pages/Resultado.tsx`, `src/types/analise.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F14 |
| **13. Dados reais × simulados** | Reais. |
| **14. Regras do PRD** | 2.5 (tabela), 4.1, 3.2, 10.3, 10.5 (snapshot) |
| **15. Aceite funcional** | Linhas e percentuais batem com a tabela do PRD 2.5; a soma fecha; percentuais em convenção única. |
| **16. Aceite de UX** | Tabela legível em mobile (vira lista de pares); cabeçalhos associados às células; fonte mono nos números. |
| **17. Testes** | Testes de cálculo dos percentuais; fechamento da soma; snapshot de renderização em mobile e desktop. |
| **18. Validar no Replit** | Expandir, conferir cada percentual, reduzir a janela e checar a tabela no mobile. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Recolhida, expandida, valor negativo, VGV zero. |
| **21. Riscos** | Percentual calculado sobre base errada. |
| **22. Decisões** | D-A9 (gráficos, adiável). |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Apresentação de dados já calculados, com atenção a acessibilidade de tabela. |
| **26. Conclusão** | Composição fiel ao PRD e legível nos três tamanhos. |
| **27. Checkpoint** | `[ ]` Usuário aprova a tabela e o nível de detalhe. |

---

## F16 — Toggle Terrenista × Incorporador

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Perspectiva Terrenista × Incorporador |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Entregar as duas leituras da mesma base de cálculo, respondendo às duas perguntas do produto. |
| **4. Parte da jornada** | "Entender a recomendação" / início de "explorar cenários". |
| **5. Entrega visível** | Toggle no topo do resultado. Em **Terrenista**, o lucro é fixo pelo padrão e o Resultado Terreno é a resposta. Em **Incorporador**, o preço pedido é fixo e a **margem de lucro resultante** é a resposta. |
| **6. Comportamento esperado** | Alternar troca a variável resolvida e o destaque, sem recarregar; cada perspectiva explica em uma frase o que está fixo e o que está sendo resolvido. |
| **7. Escopo incluído** | Função de perspectiva no motor, toggle acessível, adaptação do destaque e da composição, `Lucro Resultante = VGV − Obra − Despesas − Preço Pedido`. |
| **8. Fora do escopo** | Ajuste de premissas (F17). |
| **9. Arquivos criados** | `src/components/resultado/TogglePerspectiva.tsx` + `.module.css`, `src/components/resultado/MargemResultante.tsx` |
| **10. Arquivos modificados** | `src/utils/motor/economia.ts`, `src/utils/motor/__tests__/economia.test.ts`, `src/pages/Resultado.tsx`, `src/components/resultado/ComposicaoEconomica.tsx`, `src/types/analise.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F15 |
| **13. Dados reais × simulados** | Reais. |
| **14. Regras do PRD** | 2.6 (perspectiva + objetivo da análise), 4.1 ("Perspectiva de leitura"), 1 (as duas perguntas) |
| **15. Aceite funcional** | As duas perspectivas usam a mesma base; a margem resultante segue exatamente a fórmula do PRD 4.1; alternar não altera nenhum insumo. |
| **16. Aceite de UX** | Fica evidente o que está fixo em cada modo; toggle operável por teclado com estado anunciado. |
| **17. Testes** | Testes unitários da margem resultante; teste de consistência (no ponto de equilíbrio as duas leituras coincidem); teste do toggle. |
| **18. Validar no Replit** | Alternar e conferir que os insumos não mudam e que a margem resultante fecha com a tabela. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Terrenista, Incorporador, margem negativa. |
| **21. Riscos** | Usuário achar que o toggle muda o cenário, e não a leitura. |
| **22. Decisões** | ~~Qual perspectiva é a padrão ao abrir o resultado~~ — resolvida por D-R6: a padrão é a do objetivo da análise escolhido na F05 (comprar → Terrenista; executar → Incorporador). |
| **23. Complexidade** | Média |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Mexe no motor econômico e na interpretação do resultado — regra crítica de domínio. |
| **26. Conclusão** | Duas leituras corretas e coerentes entre si. |
| **27. Checkpoint** | `[ ]` Usuário aprova as duas perspectivas e a perspectiva padrão herdada do objetivo. |

---

## F17 — Premissas ajustáveis e cenários em tempo real

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Premissas ajustáveis e análise de cenários |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Permitir "e se..." em tempo real sem contaminar os padrões globais. |
| **4. Parte da jornada** | "Explorar cenários". |
| **5. Entrega visível** | Painel de premissas no resultado com preço de venda da unidade, % de lucro, % de despesas gerais, taxa de ocupação e CUB Ajustado, cada um com o valor padrão à vista, o valor ajustado e um "restaurar padrão". |
| **6. Comportamento esperado** | Ajustar recalcula em tempo real (< 500ms); premissas alteradas ficam marcadas; "restaurar tudo" volta ao original; o ajuste **não** altera padrões globais nem persiste entre análises. |
| **7. Escopo incluído** | Camada de sobreposição de premissas sobre os parâmetros, recálculo com debounce, indicação visual de valor alterado, snapshot registrando padrão e ajustado. |
| **8. Fora do escopo** | Salvar cenários, comparar cenários lado a lado (Fase 2+). |
| **9. Arquivos criados** | `src/components/resultado/PainelPremissas.tsx`, `PremissaAjustavel.tsx` (+ `.module.css`), `src/hooks/usePremissas.ts`, `src/utils/motor/premissas.ts` |
| **10. Arquivos modificados** | `src/pages/Resultado.tsx`, `src/utils/motor/economia.ts`, `src/types/parametros.ts`, `server/controllers/analisesController.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F16 |
| **13. Dados reais × simulados** | Reais. |
| **14. Regras do PRD** | 2.6, 10.2 (flexibilidade), 10.5 (versionamento), 2.10 |
| **15. Aceite funcional** | Recálculo correto e imediato; ajustes isolados por análise; snapshot distingue premissa padrão de premissa ajustada. |
| **16. Aceite de UX** | Impacto de cada mudança perceptível; sempre possível voltar ao padrão; nenhum ajuste fora de faixas plausíveis sem aviso. |
| **17. Testes** | Testes de sobreposição de premissas; teste de que o padrão global não muda após ajuste; teste de performance do recálculo; teste do "restaurar". |
| **18. Validar no Replit** | Subir o preço de venda em 10% e ver o resultado reagir; restaurar; iniciar nova análise e confirmar que o padrão voltou. |
| **19. Responsividade** | As três faixas; painel vira gaveta no mobile. |
| **20. Estados** | Padrão, ajustado, restaurado, recalculando, valor implausível. |
| **21. Riscos** | Ajuste vazar para o padrão global (proibido pelo `CLAUDE.md`); excesso de recálculos travando a interface. |
| **22. Decisões** | Quais premissas são ajustáveis e com que limites. |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Toca o motor, os parâmetros e o snapshot de auditoria ao mesmo tempo. |
| **26. Conclusão** | Cenários funcionando sem contaminar padrões, com snapshot correto. |
| **27. Checkpoint** | `[ ]` Usuário aprova quais premissas são ajustáveis e o comportamento do recálculo. |

---

## F18 — Alertas econômicos, técnicos e regulatórios

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Alertas |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Entregar os alertas de normalidade, eficiência de projeto, adequação de mercado e o checklist de validação pré-aquisição. |
| **4. Parte da jornada** | "Identificar riscos". |
| **5. Entrega visível** | Seção de alertas no resultado, agrupada em Econômicos, Projeto, Mercado e Regulatórios/Técnicos, cada alerta com o valor encontrado, a faixa esperada e o que fazer. |
| **6. Comportamento esperado** | Alertas recalculam junto com as premissas; são orientativos e nunca bloqueiam; ausência de alerta também é comunicada. |
| **7. Escopo incluído** | `kpis.ts` e `alertas.ts` puros, todas as faixas do PRD 4.2, o alerta de coeficiente de unidades (não aplicável a casas), o alerta qualitativo de adequação ao mercado e o checklist regulatório fixo do PRD 2.4. |
| **8. Fora do escopo** | Score (F19); qualquer análise técnica profunda (fora do MVP). |
| **9. Arquivos criados** | `src/utils/motor/kpis.ts`, `src/utils/motor/alertas.ts`, `src/utils/motor/__tests__/kpis.test.ts`, `alertas.test.ts`, `src/components/resultado/ListaAlertas.tsx`, `CartaoAlerta.tsx`, `ChecklistValidacao.tsx` (+ `.module.css`), `src/content/alertas.ts` |
| **10. Arquivos modificados** | `src/pages/Resultado.tsx`, `src/types/analise.ts`, `src/utils/motor/parametros.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F17 |
| **13. Dados reais × simulados** | Faixas reais do PRD. O alerta de adequação ao mercado é **qualitativo**: o MVP não consulta base de preços. |
| **14. Regras do PRD** | 2.4 integral, 4.2 integral, 10.1, 10.4 |
| **15. Aceite funcional** | Faixas exatas: Custo de Obra/VGV **40%–65%**; Despesas Gerais/VGV **10%–15%**; coeficiente de unidades por pavimento **80%–85%**; Resultado Terreno/VGV e Lucro/VGV conforme o padrão (8/9/10% e 20/22/25%); preço pedido acima do Resultado Terreno gera alerta. Nenhum alerta bloqueia a análise. |
| **16. Aceite de UX** | Linguagem orientativa, nunca conclusiva; severidade sinalizada além da cor; alerta explica a consequência prática. |
| **17. Testes** | Testes de limite em cada faixa (abaixo, no limite inferior, dentro, no limite superior, acima); teste de não aplicabilidade para casas; teste de que nenhum alerta impede exportar ou avançar. |
| **18. Validar no Replit** | Forçar cada alerta via premissas ajustáveis e conferir o texto; testar exatamente 40%, 65%, 80% e 85%. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Sem alertas, só informativos, com atenção, com alerta grave, não aplicável. |
| **21. Riscos** | Alerta soar como veredito; erro de inclusão nos limites das faixas. |
| **22. Decisões** | Copy dos alertas (D-A8). |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Faixas de normalidade são regra crítica testável e o tom dos alertas tem impacto direto na decisão do usuário. |
| **26. Conclusão** | Todos os alertas do PRD 2.4 e 4.2 implementados com testes de limite verdes. |
| **27. Checkpoint** | `[ ]` Usuário aprova faixas, textos e o tom dos alertas. |

---

## F19 — LASTRO Score e recomendação final

| Campo | Conteúdo |
|---|---|
| **1. Nome** | LASTRO Score e recomendação |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Entregar o veredito do produto: score 0–100 e a recomendação, com o rótulo do objetivo escolhido na F05 — Comprar / Comprar com Ressalvas / Não Comprar, ou Fazer / Fazer com Ressalvas / Não Fazer o Empreendimento (D-R6). |
| **4. Parte da jornada** | "Entender a recomendação" (fecho). |
| **5. Entrega visível** | Topo da página de Resultado com o score, a decisão com seu sinal (🟢/🟡/🔴), a composição do score por critério e o texto de recomendação com principal risco/oportunidade. |
| **6. Comportamento esperado** | Score e decisão recalculam com as premissas; a composição do score é auditável critério a critério. |
| **7. Escopo incluído** | `score.ts` puro conforme a metodologia aprovada em D-B7/D-B8, limiares do PRD 4.4 inalterados, veredito, detalhamento por critério, texto de recomendação e risco/oportunidade. O rótulo (comprar × executar) vem do objetivo da análise (D-R6), não é reescolhido aqui. |
| **8. Fora do escopo** | Qualquer alteração de pesos ou limiares sem aprovação. |
| **9. Arquivos criados** | `src/utils/motor/score.ts`, `src/utils/motor/__tests__/score.test.ts`, `src/components/resultado/Veredito.tsx`, `ComposicaoScore.tsx`, `RiscoOportunidade.tsx` (+ `.module.css`), `src/content/recomendacoes.ts` |
| **10. Arquivos modificados** | `src/pages/Resultado.tsx`, `src/types/analise.ts`, `server/controllers/analisesController.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F18 |
| **13. Dados reais × simulados** | **Esta fase não começa sem D-B7 e D-B8.** Nenhuma metodologia pode ser inventada. Se "potencial de mercado" ficar sem fonte, a decisão do usuário define entre critério qualitativo, outro indicador ou redistribuição dos 10 pontos. |
| **14. Regras do PRD** | 4.3 (pesos 40/30/20/10 e pendências), 4.4 (limiares e os dois conjuntos de rótulos), 2.5, 2.6 (objetivo da análise) |
| **15. Aceite funcional** | 🟢 viável, score > 70 e todos os percentuais OK · 🟡 viável mas score 50–70 ou algum percentual fora · 🔴 inviável ou score < 50 — mostrado como Comprar/Ressalvas/Não Comprar ou Fazer/Ressalvas/Não Fazer conforme o objetivo (D-R6). Score sempre entre 0 e 100. |
| **16. Aceite de UX** | Decisão compreensível sem ler o resto; composição do score acessível por expansão; sinal não depende só de cor. |
| **17. Testes** | Testes de cada critério isolado; casos de fronteira 49/50/70/71; score fora de [0,100] impossível; determinismo (mesma entrada → mesma saída); coerência entre decisão e alertas. |
| **18. Validar no Replit** | Gerar cenários que caiam em cada uma das três decisões e nas fronteiras. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Três decisões, fronteiras, critério pendente de decisão. |
| **21. Riscos** | **Alto:** inventar metodologia. O `CLAUDE.md` proíbe mudar o LASTRO Score sem aprovação. |
| **22. Decisões** | **D-B7 e D-B8 (bloqueantes).** |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Regra mais sensível do produto, com pendência aberta e proibição explícita de alteração autônoma. |
| **26. Conclusão** | Score e recomendação implementados exatamente conforme a metodologia aprovada. |
| **27. Checkpoint** | `[ ]` Usuário aprova a metodologia **antes** da implementação e o resultado depois. |

---

## F20 — Exportação em PDF

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Exportação em PDF |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Dar ao usuário o único meio de conservar a análise. |
| **4. Parte da jornada** | "Exportar o resultado". |
| **5. Entrega visível** | Botão "Exportar PDF" que gera um relatório completo com identidade LASTRO: veredito, resumo, potencial, composição, alertas, checklist e o snapshot de premissas e da versão de dados. |
| **6. Comportamento esperado** | Geração em < 3s com indicador de progresso; o PDF reflete as premissas ajustadas no momento; falha explica o que fazer. |
| **7. Escopo incluído** | Biblioteca definida em D-B9, template do relatório, cabeçalho/rodapé com logo e data em horário de Brasília, snapshot de auditoria, nome de arquivo com a identificação do terreno. |
| **8. Fora do escopo** | Excel (fora do MVP), personalização do relatório, envio por e-mail. |
| **9. Arquivos criados** | `src/components/resultado/AcoesExportacao.tsx` + `.module.css`, `src/utils/exportacao/pdf.ts`, `src/components/exportacao/RelatorioPdf.tsx` + `.module.css`, `src/utils/exportacao/__tests__/pdf.test.ts` |
| **10. Arquivos modificados** | `src/pages/Resultado.tsx`, `package.json`, `src/types/analise.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F19 |
| **13. Dados reais × simulados** | Reais, incluindo o snapshot de premissas. |
| **14. Regras do PRD** | 2.8, 6.2 (< 3s), 10.5 (auditoria), 6.1 (design system) |
| **15. Aceite funcional** | PDF contém todas as seções do PRD 2.5 e o snapshot; abre corretamente em leitores comuns; < 3s. |
| **16. Aceite de UX** | Relatório apresentável a terceiros; tipografia e cores do design system; legível impresso em preto e branco. |
| **17. Testes** | Teste de geração com cenário completo; teste de que o snapshot está presente; teste de erro na geração; medição do tempo. |
| **18. Validar no Replit** | Ajustar premissas, exportar, abrir o PDF e conferir seção a seção; imprimir em P&B. |
| **19. Responsividade** | Botão acessível nas três faixas; geração precisa funcionar no navegador mobile. |
| **20. Estados** | Pronto, gerando, sucesso, falha, sem dados. |
| **21. Riscos** | Nova dependência principal (exige consulta, `CLAUDE.md` regra 2); peso do bundle; divergência entre tela e PDF. |
| **22. Decisões** | **D-B9 (bloqueante).** |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Decisão de dependência principal e artefato que fica com o usuário — é o entregável final do produto. |
| **26. Conclusão** | PDF completo, fiel ao resultado, dentro do tempo. |
| **27. Checkpoint** | `[ ]` Usuário aprova a biblioteca (antes) e o layout do relatório (depois). |

---

## F21 — Exportação e compartilhamento em HTML

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Exportação e compartilhamento em HTML |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Permitir compartilhar o resultado com terceiros (sócio, cliente, banco). |
| **4. Parte da jornada** | "Exportar o resultado". |
| **5. Entrega visível** | Botão "Compartilhar HTML" que entrega o relatório em HTML conforme o formato decidido em D-B10, com aviso claro de quem poderá abri-lo. |
| **6. Comportamento esperado** | Gera o relatório autocontido; se for link hospedado, informa validade e alcance antes de gerar. |
| **7. Escopo incluído** | Geração do HTML com CSS inline a partir dos tokens, snapshot de auditoria, aviso de privacidade, reuso do mesmo template do PDF. |
| **8. Fora do escopo** | Edição pelo destinatário, comentários, colaboração (fora do MVP). |
| **9. Arquivos criados** | `src/utils/exportacao/html.ts`, `src/components/exportacao/RelatorioHtml.tsx`, `src/utils/exportacao/__tests__/html.test.ts` e — se D-B10 optar por link hospedado — `server/routes/relatorios.ts`, `server/controllers/relatoriosController.ts` |
| **10. Arquivos modificados** | `src/components/resultado/AcoesExportacao.tsx`, `src/pages/Resultado.tsx`, `server/index.ts` (se hospedado) |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F20 |
| **13. Dados reais × simulados** | Reais. |
| **14. Regras do PRD** | 2.8, 6.3 (proteção de dados não públicos), 10.5 |
| **15. Aceite funcional** | HTML abre em qualquer navegador dos suportados; conteúdo idêntico ao PDF; sem segredo, token ou dado interno embutido. |
| **16. Aceite de UX** | Fica explícito quem consegue abrir o link e por quanto tempo; aviso antes de compartilhar dados de terreno. |
| **17. Testes** | Teste de conteúdo e de escapamento de HTML (nome do terreno é texto livre — risco de injeção); teste de ausência de dados sensíveis; se hospedado, teste de expiração e de não indexação. |
| **18. Validar no Replit** | Gerar, abrir em outro navegador, conferir dark mode e impressão; tentar abrir um link expirado. |
| **19. Responsividade** | O HTML exportado precisa ser responsivo nas três faixas. |
| **20. Estados** | Gerando, pronto, copiado, expirado, falha. |
| **21. Riscos** | Vazamento de dados de terreno por link público; injeção via campos de texto livre. |
| **22. Decisões** | **D-B10 (bloqueante).** |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Decisão de segurança e privacidade sobre dados de negócio de terceiros. |
| **26. Conclusão** | HTML compartilhável seguro e fiel ao resultado. |
| **27. Checkpoint** | `[ ]` Usuário decide formato e segurança (antes) e aprova o resultado (depois). |

---

## F22 — Limpar análise e iniciar nova

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Limpar análise e nova análise |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Fechar o ciclo protegendo o usuário contra a perda acidental do trabalho. |
| **4. Parte da jornada** | "Limpar ou iniciar nova análise". |
| **5. Entrega visível** | Ação "Nova análise" com modal de confirmação avisando que a análise atual será apagada e que **a exportação é a única forma de conservá-la**, com atalho para exportar antes de confirmar. |
| **6. Comportamento esperado** | Confirmar limpa tudo e volta ao formulário vazio; cancelar preserva; o aviso de não-persistência também aparece ao tentar sair da tela de resultado com análise não exportada. |
| **7. Escopo incluído** | Modal acessível, limpeza de estado conforme D-B11, aviso de saída, memória de "já exportou" na sessão. |
| **8. Fora do escopo** | Histórico ou recuperação da análise anterior (fora do MVP). |
| **9. Arquivos criados** | `src/components/ui/Modal.tsx` + `.module.css`, `src/components/resultado/ConfirmarNovaAnalise.tsx`, `src/hooks/useAvisoSaida.ts` |
| **10. Arquivos modificados** | `src/pages/Resultado.tsx`, `src/hooks/useAnalise.ts`, `src/components/layout/Cabecalho.tsx` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F21 |
| **13. Dados reais × simulados** | Real. O efeito sobre o registro interno depende de D-B11 e da F31. |
| **14. Regras do PRD** | 2.7 (uma análise por acesso), 2.8 (exportação é a única forma de conservar), 5.3 item 6 |
| **15. Aceite funcional** | Limpeza total conforme decidido; cancelar não perde nada; o aviso não aparece se já exportou. |
| **16. Aceite de UX** | Foco preso no modal, `Esc` fecha, foco volta ao gatilho; ação destrutiva claramente diferenciada da segura. |
| **17. Testes** | Testes do modal (foco, teclado, cancelar); teste de limpeza completa do estado; teste do aviso de saída com e sem exportação prévia. |
| **18. Validar no Replit** | Tentar sair sem exportar; exportar e tentar de novo; confirmar e checar que o formulário voltou vazio. |
| **19. Responsividade** | As três faixas; modal utilizável no mobile. |
| **20. Estados** | Modal aberto/fechado, já exportado, não exportado, limpando. |
| **21. Riscos** | Perda acidental de trabalho — o PRD trata isso como requisito explícito. |
| **22. Decisões** | **D-B11 (bloqueante)** e D-A2. |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Componente de UI com foco em acessibilidade e gestão de estado; a regra vem pronta da decisão. |
| **26. Conclusão** | Ciclo completo fechado, com proteção contra perda acidental. |
| **27. Checkpoint** | `[ ]` Usuário aprova o comportamento de limpeza e os avisos. |

---

## F23 — Varredura de qualidade: responsividade, tema, acessibilidade e estados

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Varredura de qualidade da jornada |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Fechar a jornada com qualidade uniforme nos três tamanhos, nos dois temas e por teclado. |
| **4. Parte da jornada** | Toda a jornada da Macroetapa 1. |
| **5. Entrega visível** | Produto revisado ponta a ponta: nenhuma quebra de layout, contraste AA nos dois temas, navegação completa por teclado e todos os estados de carregamento, erro, vazio e indisponibilidade cobertos. |
| **6. Comportamento esperado** | Toda página responde às três faixas; todo estado assíncrono tem carregando, sucesso e erro; nenhum caminho leva a tela em branco. |
| **7. Escopo incluído** | Auditoria de contraste, ordem de foco, rótulos e `aria`, esqueletos de carregamento, páginas de erro, verificação de que nenhum valor visual está hardcoded, testes de fluxo crítico ponta a ponta. |
| **8. Fora do escopo** | Funcionalidade nova. |
| **9. Arquivos criados** | `src/components/ui/Esqueleto.tsx`, `EstadoVazio.tsx`, `EstadoErro.tsx` (+ `.module.css`), `src/__tests__/fluxo-completo.test.tsx` |
| **10. Arquivos modificados** | Ajustes pontuais em componentes e `.module.css` de F00–F22; possivelmente `design-system/tokens/tokens.css` se faltar token |
| **11. Arquivos removidos** | Estilos duplicados identificados na varredura |
| **12. Dependências** | F22 |
| **13. Dados reais × simulados** | Reais. |
| **14. Regras do PRD** | 6.4, 6.5, 7 (WCAG 2.1 AA), 2.9, 10.4 |
| **15. Aceite funcional** | Teste de fluxo completo (início → terreno → produto → resultado → exportação → nova análise) passando; nenhum erro no console; navegadores suportados verificados. |
| **16. Aceite de UX** | Contraste AA em ambos os temas; foco sempre visível; nenhuma informação transmitida só por cor; textos de erro acionáveis. |
| **17. Testes** | Teste de integração do fluxo completo; auditoria automatizada de acessibilidade; lint de tokens; snapshots nas três larguras. |
| **18. Validar no Replit** | Percorrer a jornada inteira só com teclado, no tema escuro, em janela de 360px; desligar o backend e conferir os erros. |
| **19. Responsividade** | As três faixas em todas as páginas. |
| **20. Estados** | Carregando, vazio, sucesso, erro de validação, erro de servidor, integração indisponível, offline. |
| **21. Riscos** | Ajustes de layout regredirem telas já aprovadas. |
| **22. Decisões** | Nenhuma bloqueante. |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Refinamento amplo mas com padrões já estabelecidos. |
| **26. Conclusão** | Jornada aprovada em qualidade nos três tamanhos e dois temas. |
| **27. Checkpoint** | `[ ]` Usuário percorre a jornada completa e aprova. |

---

## F24 — Persistência de parâmetros e base CUB no PostgreSQL

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Persistência de parâmetros e CUB |
| **2. Macroetapa** | 1 |
| **3. Objetivo** | Migrar parâmetros e CUB dos módulos TS para o banco, com versionamento, importação administrativa, fallback e alerta de desatualização. |
| **4. Parte da jornada** | Invisível ao usuário, exceto pela competência exibida e pelo alerta de dados desatualizados. |
| **5. Entrega visível** | O resultado passa a exibir a competência vinda do banco; uma tela administrativa simples permite importar uma nova versão do CUB e ver o histórico; com base vencida, aparece o alerta de desatualização. |
| **6. Comportamento esperado** | A aplicação consome sempre a versão vigente; nova importação não sobrescreve as anteriores; banco indisponível → fallback para a última versão válida em cache, com aviso. |
| **7. Escopo incluído** | Prisma + PostgreSQL, tabelas `parameters` e `external_data`, migrations, seed a partir do snapshot atual, repositórios, rotina de importação conforme D-B12, fallback, alerta de desatualização, `.env.example`. |
| **8. Fora do escopo** | `accesses`, `access_events`, `analyses` (Macroetapa 2). |
| **9. Arquivos criados** | `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/`, `server/models/prisma.ts`, `server/models/parametrosRepo.ts`, `server/models/cubRepo.ts`, `server/routes/parametros.ts`, `server/routes/admin/cub.ts`, `server/controllers/cubController.ts`, `src/pages/admin/ImportacaoCub.tsx` + `.module.css`, testes de repositório |
| **10. Arquivos modificados** | `src/utils/motor/cub.ts` e `parametros.ts` (passam a receber os dados por injeção), `server/controllers/analisesController.ts`, `.env.example`, `package.json`, `CLAUDE.md` (registrar Prisma como ORM adotado) |
| **11. Arquivos removidos** | `src/utils/motor/dados/cub-2026-08.ts` deixa de ser fonte em produção e passa a servir apenas como *fixture* de teste (movido para `src/utils/motor/__tests__/fixtures/`) — **é assim que o mock da F12 deixa de ser dívida técnica**. |
| **12. Dependências** | F23 |
| **13. Dados reais × simulados** | Reais e persistidos. |
| **14. Regras do PRD** | 2.10, 3.4 (importação periódica, versionamento, fallback, alerta), 6.1 (tabelas), 10.5 |
| **15. Aceite funcional** | Nenhum valor de CUB embutido no código de produção; cada importação registra competência, data de emissão e origem; versões anteriores preservadas; fallback funciona com o banco fora do ar. |
| **16. Aceite de UX** | Alerta de desatualização orientativo e não bloqueante; tela admin deixa claro qual versão está vigente. |
| **17. Testes** | Testes de repositório; teste de versionamento (importar duas vezes preserva a anterior); teste de fallback; teste de que o resultado calculado antes e depois da migração é idêntico. |
| **18. Validar no Replit** | Rodar `npx prisma migrate dev` e o seed; gerar uma análise e comparar com o resultado da F19; importar uma competência nova e ver a troca. |
| **19. Responsividade** | Tela admin utilizável em desktop; mobile não é requisito. |
| **20. Estados** | Base vigente, base desatualizada, banco indisponível, importação em andamento, importação inválida. |
| **21. Riscos** | Regressão no cálculo após a migração; `prisma/` é nova pasta nível-1 (justificada: exigência do ORM aprovado em D-R2). |
| **22. Decisões** | **D-B12 (bloqueante)** · D-A3 e D-A4 (adiáveis, parametrizar). |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Persistência, versionamento de premissas, fallback e migração de fonte de dados sem alterar resultado. |
| **26. Conclusão** | Cálculo idêntico ao da F19 agora servido pelo banco, com versionamento e fallback testados. **Fim da Macroetapa 1.** |
| **27. Checkpoint** | `[ ]` Usuário aprova a Macroetapa 1 completa e autoriza o início da Macroetapa 2. |

---

# MACROETAPA 2 — Aquisição, pagamento e liberação de acesso

**Só começa após a aprovação explícita da Macroetapa 1.**

---

## F25 — Funil de vendas e página de oferta

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Funil de vendas e página de oferta |
| **2. Macroetapa** | 2 |
| **3. Objetivo** | Apresentar publicamente o Terreno Viável e levar ao checkout. |
| **4. Parte da jornada** | "Conhecer a oferta". |
| **5. Entrega visível** | Landing pública em `/` com problema, solução, demonstração do resultado, preço e CTA de compra. O produto passa a viver em `/app`. |
| **6. Comportamento esperado** | Landing acessível sem token; CTA leva ao checkout; o produto exige acesso (validado a partir da F27). |
| **7. Escopo incluído** | Landing, reorganização de rotas (público × produto), exemplo de resultado com dados claramente fictícios, aviso de LGPD/uso. |
| **8. Fora do escopo** | Checkout (F26), webhook (F28), e-mail (F29). |
| **9. Arquivos criados** | `src/pages/publico/Oferta.tsx` + `.module.css`, `src/components/publico/*`, `src/data/exemplo-resultado.ts` |
| **10. Arquivos modificados** | `src/rotas.tsx`, `src/components/layout/LayoutApp.tsx` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F24 |
| **13. Dados reais × simulados** | Exemplo de resultado **simulado**, obrigatoriamente rotulado como exemplo; preço real conforme definido pelo usuário. |
| **14. Regras do PRD** | 5.1, 9 (métricas de funil) |
| **15. Aceite funcional** | Landing pública funciona sem acesso; rotas do produto isoladas sob `/app`. |
| **16. Aceite de UX** | Promessa alinhada ao que o produto entrega; dark mode e responsividade. |
| **17. Testes** | Testes de rota pública × protegida; teste de renderização da landing. |
| **18. Validar no Replit** | Abrir a landing em aba anônima; conferir que `/app` não vaza sem acesso. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Padrão, dois temas. |
| **21. Riscos** | Exemplo fictício ser confundido com resultado real. |
| **22. Decisões** | Preço, copy e posicionamento (usuário) · D-A7. |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Página de conteúdo com reorganização simples de rotas. |
| **26. Conclusão** | Landing aprovada e rotas separadas. |
| **27. Checkpoint** | `[ ]` Usuário aprova oferta, preço e copy. |

---

## F26 — Checkout Kiwify e retorno pós-compra

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Checkout Kiwify e retorno pós-compra |
| **2. Macroetapa** | 2 |
| **3. Objetivo** | Conectar a oferta ao checkout e tratar o retorno do comprador. |
| **4. Parte da jornada** | "Comprar → confirmar pagamento". |
| **5. Entrega visível** | CTA abre o checkout Kiwify; após a compra, o usuário volta a uma página de confirmação que explica que o link de acesso foi enviado por e-mail e o leva ao produto. |
| **6. Comportamento esperado** | Se o acesso já estiver emitido, entra direto; se o webhook ainda não chegou, a página aguarda com estado de processamento e orienta a checar o e-mail. |
| **7. Escopo incluído** | Configuração do checkout, URL de retorno, página de confirmação com estados, tratamento da corrida entre retorno e webhook. |
| **8. Fora do escopo** | Processamento do webhook (F28), envio do e-mail (F29). |
| **9. Arquivos criados** | `src/pages/publico/Confirmacao.tsx` + `.module.css`, `server/routes/compras.ts` |
| **10. Arquivos modificados** | `src/pages/publico/Oferta.tsx`, `src/rotas.tsx`, `.env.example` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F25, F27 (emissão de acesso) |
| **13. Dados reais × simulados** | Checkout real em ambiente de testes da Kiwify. |
| **14. Regras do PRD** | 5.1 (passos 1 a 3), 6.1 |
| **15. Aceite funcional** | Retorno identifica a compra; nenhum segredo da Kiwify chega ao frontend. |
| **16. Aceite de UX** | Espera nunca parece erro; sempre há caminho de suporte. |
| **17. Testes** | Teste dos estados da confirmação; teste da corrida retorno-antes-do-webhook. |
| **18. Validar no Replit** | Compra de teste ponta a ponta no sandbox da Kiwify. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Processando, acesso liberado, falha, compra não encontrada. |
| **21. Riscos** | Depender do retorno síncrono do checkout; credenciais no lugar errado. |
| **22. Decisões** | Confirmar as capacidades reais da Kiwify antes de integrar (`CLAUDE.md` regra 6). |
| **23. Complexidade** | Média |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Integração de pagamento com segredos e condição de corrida. |
| **26. Conclusão** | Compra de teste leva o usuário ao produto. |
| **27. Checkpoint** | `[ ]` Usuário aprova o fluxo de retorno. |

---

## F27 — Emissão e validação do link de acesso

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Emissão e validação do link de acesso |
| **2. Macroetapa** | 2 |
| **3. Objetivo** | Implementar o único fator de acesso do MVP: token de alta entropia validado no servidor. |
| **4. Parte da jornada** | "Acessar por link". |
| **5. Entrega visível** | Abrir `/app?acesso=<token>` libera o produto; token inválido, expirado ou revogado leva a telas distintas explicando o motivo e como recuperar. |
| **6. Comportamento esperado** | Toda rota do produto e toda rota de API passam pelo middleware de acesso; o token é guardado com hash seguro, nunca em claro; validade conforme D-B13. |
| **7. Escopo incluído** | Tabela `accesses`, geração de token, hash, middleware de acesso no Express, guarda de rota no React, telas de erro, emissão vinculada ao e-mail da compra. |
| **8. Fora do escopo** | Webhook (F28), e-mail (F29), revogação self-service (F30). |
| **9. Arquivos criados** | `server/middleware/acesso.ts`, `server/models/acessosRepo.ts`, `server/services/tokenAcesso.ts`, `server/routes/acesso.ts`, `src/hooks/useAcesso.ts`, `src/components/layout/GuardaAcesso.tsx`, `src/pages/publico/AcessoInvalido.tsx` + `.module.css`, testes |
| **10. Arquivos modificados** | `prisma/schema.prisma`, `server/index.ts`, `src/rotas.tsx`, `.env.example` |
| **11. Arquivos removidos** | `src/hooks/usePrimeiroAcesso.ts` passa a derivar do registro de acesso (a flag local da F02 é substituída) |
| **12. Dependências** | F25 |
| **13. Dados reais × simulados** | Reais. Sem JWT de usuário e sem bcrypt (não há login) — `CLAUDE.md`. |
| **14. Regras do PRD** | 2.7, 5.2, 6.1 (`accesses`), 6.3 (token de alta entropia, validade, revogação) |
| **15. Aceite funcional** | Token válido libera; expirado, revogado e inexistente têm tratamentos distintos; token nunca aparece em log; validação ocorre no servidor, não no cliente. |
| **16. Aceite de UX** | Cada motivo de bloqueio explica o próximo passo; nada de mensagem genérica. |
| **17. Testes** | Testes de token válido, expirado, revogado, malformado e ausente; teste de que a API recusa sem token; teste de entropia e unicidade; teste de que só o e-mail emissor acessa. |
| **18. Validar no Replit** | Emitir um acesso de teste, abrir o link, forçar expiração e revogação no banco e conferir cada tela. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Válido, expirado, revogado, inexistente, malformado, servidor fora. |
| **21. Riscos** | **Alto:** o link é o único fator de acesso. Vazamento em log, referrer ou histórico compromete a conta. |
| **22. Decisões** | **D-B13 (bloqueante).** |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Segurança e controle de acesso — a fase de maior risco da Macroetapa 2. |
| **26. Conclusão** | Acesso por link funcionando com os quatro estados tratados e testados. |
| **27. Checkpoint** | `[ ]` Usuário decide a validade e aprova as telas de bloqueio. |

---

## F28 — Webhook de compra aprovada com assinatura e idempotência

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Webhook Kiwify: assinatura e idempotência |
| **2. Macroetapa** | 2 |
| **3. Objetivo** | Emitir o acesso automaticamente na compra aprovada, sem duplicar em reenvios. |
| **4. Parte da jornada** | "Confirmar pagamento → receber acesso". |
| **5. Entrega visível** | Compra de teste aprovada gera o acesso sozinha; a tela admin mostra o evento recebido, a assinatura validada e o acesso emitido. |
| **6. Comportamento esperado** | Assinatura inválida → rejeição; evento repetido → mesmo acesso, nunca um segundo; falha → registro reprocessável. |
| **7. Escopo incluído** | Endpoint do webhook, verificação de assinatura, chave de idempotência, registro de eventos, emissão do acesso, tela admin de compras. |
| **8. Fora do escopo** | E-mail (F29). |
| **9. Arquivos criados** | `server/routes/webhooks/kiwify.ts`, `server/controllers/webhookKiwifyController.ts`, `server/services/assinaturaKiwify.ts`, `server/services/emissaoAcesso.ts`, `server/models/eventosCompraRepo.ts`, `src/pages/admin/Compras.tsx`, testes |
| **10. Arquivos modificados** | `prisma/schema.prisma`, `server/index.ts`, `.env.example` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F27 |
| **13. Dados reais × simulados** | Webhook real do sandbox da Kiwify. |
| **14. Regras do PRD** | 5.1, 6.1, 6.3 (assinatura e idempotência) |
| **15. Aceite funcional** | Assinatura verificada antes de qualquer efeito; reenvio do mesmo evento não cria acesso duplicado; segredos só em `.env`. |
| **16. Aceite de UX** | Admin consegue diagnosticar uma compra sem acesso emitido. |
| **17. Testes** | Testes de assinatura válida e inválida; idempotência com entregas duplicadas e simultâneas; payload malformado; evento fora de ordem. |
| **18. Validar no Replit** | Disparar o webhook de teste duas vezes e confirmar um único acesso; disparar com assinatura errada e ver a rejeição. |
| **19. Responsividade** | Tela admin em desktop. |
| **20. Estados** | Recebido, assinatura inválida, duplicado, processado, falho. |
| **21. Riscos** | **Alto:** acesso emitido para compra falsa, ou acessos duplicados. |
| **22. Decisões** | Confirmar o formato real de assinatura da Kiwify antes de implementar. |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Segurança de webhook e idempotência — explicitamente marcados como Opus no `CLAUDE.md` e no PRD. |
| **26. Conclusão** | Emissão automática confiável e idempotente. |
| **27. Checkpoint** | `[ ]` Usuário aprova o comportamento em reenvio e em assinatura inválida. |

---

## F29 — Envio do e-mail de acesso via Resend

| Campo | Conteúdo |
|---|---|
| **1. Nome** | E-mail de acesso (Resend) |
| **2. Macroetapa** | 2 |
| **3. Objetivo** | Entregar o link ao comprador e garantir que ninguém que pagou fique sem acesso. |
| **4. Parte da jornada** | "Receber acesso". |
| **5. Entrega visível** | E-mail com identidade LASTRO contendo o link pessoal; painel admin com status de envio, falhas e botão de reenvio. |
| **6. Comportamento esperado** | Envio disparado pela emissão do acesso; falha fica visível e reprocessável; reenvio não gera token novo (salvo se D-B14 decidir o contrário). |
| **7. Escopo incluído** | Integração Resend, template HTML e texto, fila/retentativa, registro de status, reenvio manual, observabilidade. |
| **8. Fora do escopo** | Marketing por e-mail, sequências. |
| **9. Arquivos criados** | `server/services/email.ts`, `server/templates/emailAcesso.ts`, `server/models/enviosRepo.ts`, `server/routes/admin/envios.ts`, `src/pages/admin/Envios.tsx`, testes |
| **10. Arquivos modificados** | `server/services/emissaoAcesso.ts`, `prisma/schema.prisma`, `.env.example` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F28 |
| **13. Dados reais × simulados** | Resend real em modo de teste. |
| **14. Regras do PRD** | 5.1, 6.1 (falha observável e reprocessável), 6.3 |
| **15. Aceite funcional** | E-mail chega com link funcional; falha registrada e reprocessável; chave do Resend só no servidor. |
| **16. Aceite de UX** | E-mail legível em clientes comuns e no mobile; explica o que é o link e sua validade. |
| **17. Testes** | Testes de envio com sucesso e com falha; retentativa; conteúdo do template; teste de que o token não aparece em log. |
| **18. Validar no Replit** | Compra de teste → conferir a caixa de entrada; forçar falha e usar o reenvio. |
| **19. Responsividade** | Template de e-mail responsivo. |
| **20. Estados** | Enfileirado, enviado, falhou, reenviado. |
| **21. Riscos** | E-mail em spam; comprador sem acesso por falha silenciosa. |
| **22. Decisões** | D-A6 (observabilidade); domínio remetente e SPF/DKIM. |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Entrega do acesso pago; falha aqui é falha comercial direta. |
| **26. Conclusão** | E-mail entregue com status observável e reenvio funcionando. |
| **27. Checkpoint** | `[ ]` Usuário aprova template e fluxo de reenvio. |

---

## F30 — Recuperação e revogação de acesso

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Recuperação e revogação de acesso |
| **2. Macroetapa** | 2 |
| **3. Objetivo** | Dar saída ao usuário que perdeu o link e à LASTRO que precisa revogar um acesso. |
| **4. Parte da jornada** | "Recuperar ou revogar acesso". |
| **5. Entrega visível** | Página "Perdi meu acesso" que reenvia o link para o e-mail da compra, e ação administrativa de revogação com efeito imediato. |
| **6. Comportamento esperado** | Recuperação conforme D-B14; resposta idêntica para e-mail existente e inexistente (não vazar quem comprou); acesso revogado bloqueia na hora. |
| **7. Escopo incluído** | Fluxo de recuperação com limite de tentativas, revogação no admin, telas correspondentes, registro de auditoria. |
| **8. Fora do escopo** | Autenticação (Fase 2+). |
| **9. Arquivos criados** | `src/pages/publico/RecuperarAcesso.tsx` + `.module.css`, `server/routes/recuperacao.ts`, `server/controllers/recuperacaoController.ts`, `src/pages/admin/Acessos.tsx`, testes |
| **10. Arquivos modificados** | `server/models/acessosRepo.ts`, `server/middleware/acesso.ts`, `server/services/email.ts`, `src/rotas.tsx` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F29 |
| **13. Dados reais × simulados** | Reais. |
| **14. Regras do PRD** | 2.7, 5.2, 6.3 |
| **15. Aceite funcional** | Recuperação só envia para o e-mail registrado; revogação tem efeito imediato em todas as rotas; tentativas limitadas. |
| **16. Aceite de UX** | Mensagem neutra que não revela se o e-mail existe; instruções claras de suporte. |
| **17. Testes** | Testes de recuperação com e-mail válido e inválido; limite de tentativas; revogação durante sessão ativa; enumeração de e-mails impossível. |
| **18. Validar no Replit** | Pedir recuperação com e-mail comprado e não comprado; revogar um acesso ativo e recarregar o produto. |
| **19. Responsividade** | As três faixas. |
| **20. Estados** | Formulário, enviado, limite atingido, revogado. |
| **21. Riscos** | Enumeração de compradores; abuso do reenvio. |
| **22. Decisões** | **D-B14 (bloqueante).** |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Segurança de acesso e exposição de dados pessoais. |
| **26. Conclusão** | Recuperação e revogação funcionando sem vazar informação. |
| **27. Checkpoint** | `[ ]` Usuário decide a política e aprova o fluxo. |

---

## F31 — Registro interno de análises e eventos de uso

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Registro interno de análises e eventos de uso |
| **2. Macroetapa** | 2 |
| **3. Objetivo** | Armazenar internamente resultados e uso para acompanhamento do produto, respeitando a LGPD. |
| **4. Parte da jornada** | Invisível ao usuário, com transparência no aviso de privacidade. |
| **5. Entrega visível** | Tela admin com análises geradas (agregadas) e eventos de uso; aviso de privacidade atualizado no produto. |
| **6. Comportamento esperado** | Cada análise gerada é registrada com snapshot de premissas e versão de dados; eventos de abertura e permanência registrados; **nada disso volta ao usuário nem vira histórico**. |
| **7. Escopo incluído** | Tabelas `analyses` e `access_events`, gravação no controller de análises, retenção e anonimização conforme D-B15, tela admin, aviso de privacidade. |
| **8. Fora do escopo** | Qualquer funcionalidade de histórico para o usuário (fora do MVP). |
| **9. Arquivos criados** | `server/models/analisesRepo.ts`, `eventosRepo.ts`, `server/services/retencao.ts`, `server/routes/admin/analises.ts`, `src/pages/admin/Analises.tsx`, `src/pages/publico/Privacidade.tsx`, testes |
| **10. Arquivos modificados** | `prisma/schema.prisma`, `server/controllers/analisesController.ts`, `src/hooks/useAnalise.ts`, `src/rotas.tsx` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F30 |
| **13. Dados reais × simulados** | Reais. **Não implementar sem D-B15** (PRD 6.3 é explícito). |
| **14. Regras do PRD** | 2.7, 5.3 (nota), 6.1, 6.3, 7, 10.5 |
| **15. Aceite funcional** | Snapshot completo gravado; nenhum dado interno exposto ao usuário; retenção e anonimização aplicadas conforme a política aprovada. |
| **16. Aceite de UX** | Aviso de privacidade claro sobre o que é guardado e por quê. |
| **17. Testes** | Teste de gravação do snapshot; teste de que nenhum endpoint do usuário devolve dados internos; teste da rotina de retenção/anonimização. |
| **18. Validar no Replit** | Gerar análises, conferir o admin, confirmar que o produto não mostra histórico. |
| **19. Responsividade** | Admin em desktop. |
| **20. Estados** | Registro gravado, falha de gravação (não pode quebrar a análise do usuário), anonimizado. |
| **21. Riscos** | **Alto:** dados pessoais e de negócio sob LGPD; falha de gravação não pode afetar o usuário. |
| **22. Decisões** | **D-B15 (bloqueante).** |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Persistência de dados pessoais com exigência legal explícita. |
| **26. Conclusão** | Registro interno completo, isolado do usuário e conforme a política aprovada. |
| **27. Checkpoint** | `[ ]` Usuário aprova a política de retenção antes da implementação. |

---

## F32 — Métricas do funil e de uso do produto

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Métricas do funil e de uso |
| **2. Macroetapa** | 2 |
| **3. Objetivo** | Instrumentar as métricas de sucesso do MVP. |
| **4. Parte da jornada** | "Acompanhar métricas de aquisição e uso". |
| **5. Entrega visível** | Painel admin com taxa de conclusão de análise, taxa de reuso, taxa de exportação, tempo de resposta e conversão do funil. |
| **6. Comportamento esperado** | Métricas calculadas a partir de `access_events` e `analyses`, com período selecionável e definição de cada métrica visível no painel. |
| **7. Escopo incluído** | Eventos instrumentados, cálculo conforme D-B16, painel, definições documentadas. |
| **8. Fora do escopo** | Ferramenta externa de analytics, se não decidida. |
| **9. Arquivos criados** | `server/services/metricas.ts`, `server/routes/admin/metricas.ts`, `src/pages/admin/Metricas.tsx` + `.module.css`, testes |
| **10. Arquivos modificados** | `src/hooks/useAnalise.ts`, `src/components/resultado/AcoesExportacao.tsx`, `server/models/eventosRepo.ts` |
| **11. Arquivos removidos** | Nenhum |
| **12. Dependências** | F31 |
| **13. Dados reais × simulados** | Reais. |
| **14. Regras do PRD** | 9, 2.7, 6.2 |
| **15. Aceite funcional** | Cada métrica do PRD 9 calculada com fórmula documentada; nenhuma métrica expõe dado pessoal. |
| **16. Aceite de UX** | Definição de cada métrica visível junto ao número. |
| **17. Testes** | Testes de cálculo com dados sintéticos; teste de que a instrumentação não afeta a performance do cálculo. |
| **18. Validar no Replit** | Gerar acessos e análises de teste e conferir os números no painel. |
| **19. Responsividade** | Admin em desktop. |
| **20. Estados** | Sem dados, com dados, período vazio. |
| **21. Riscos** | Métrica calculada de forma ambígua levar a decisão errada de produto. |
| **22. Decisões** | **D-B16 (bloqueante).** |
| **23. Complexidade** | Média |
| **24. Modelo** | **Sonnet** |
| **25. Justificativa** | Agregação sobre dados já modelados, com as definições vindas prontas da decisão. |
| **26. Conclusão** | Todas as métricas do PRD 9 disponíveis e documentadas. |
| **27. Checkpoint** | `[ ]` Usuário aprova as definições e o painel. |

---

## F33 — Endurecimento de segurança, privacidade e observabilidade

| Campo | Conteúdo |
|---|---|
| **1. Nome** | Segurança, privacidade e observabilidade |
| **2. Macroetapa** | 2 |
| **3. Objetivo** | Fechar o MVP pronto para produção. |
| **4. Parte da jornada** | Toda a jornada, do funil ao uso. |
| **5. Entrega visível** | Produto com HTTPS obrigatório, cabeçalhos de segurança, limite de requisições, logs sem dado sensível, monitoramento de falhas e checklist de LGPD cumprido. |
| **6. Comportamento esperado** | Requisição sem HTTPS é redirecionada; abuso é limitado; nenhum token, segredo ou dado pessoal aparece em log; falha crítica gera alerta. |
| **7. Escopo incluído** | Cabeçalhos de segurança, rate limiting nas rotas sensíveis, sanitização de logs, monitoramento, revisão completa de segredos, auditoria final contra PRD 6.3 e 7, revisão de acessibilidade das telas da M2. |
| **8. Fora do escopo** | Funcionalidade nova. |
| **9. Arquivos criados** | `server/middleware/seguranca.ts`, `limiteRequisicoes.ts`, `server/services/observabilidade.ts`, `docs/checklist-seguranca.md`, testes |
| **10. Arquivos modificados** | `server/index.ts`, todos os controllers (sanitização de log), `.env.example`, `CLAUDE.md` (registrar decisões consolidadas) |
| **11. Arquivos removidos** | Logs de depuração remanescentes |
| **12. Dependências** | F32 |
| **13. Dados reais × simulados** | Reais. |
| **14. Regras do PRD** | 6.3 integral, 7, 6.5 |
| **15. Aceite funcional** | Checklist de segurança 100% cumprido; nenhum segredo no repositório ou no bundle; rate limiting ativo no webhook, na recuperação e na consulta de CEP. |
| **16. Aceite de UX** | Bloqueio por limite explica o motivo e quando tentar de novo. |
| **17. Testes** | Testes de cabeçalhos; teste de rate limiting; varredura de segredos; teste de sanitização de log; revisão de acessibilidade das telas da M2. |
| **18. Validar no Replit** | Rodar o checklist; tentar abusar da recuperação; inspecionar logs atrás de token. |
| **19. Responsividade** | Telas da M2 nas três faixas. |
| **20. Estados** | Normal, limitado, erro monitorado. |
| **21. Riscos** | Rate limiting agressivo demais bloqueando uso legítimo. |
| **22. Decisões** | D-A6, D-A7. |
| **23. Complexidade** | Alta |
| **24. Modelo** | **Opus** |
| **25. Justificativa** | Segurança de ponta a ponta antes do lançamento. |
| **26. Conclusão** | MVP pronto para produção com checklist cumprido. **Fim da Macroetapa 2.** |
| **27. Checkpoint** | `[ ]` Usuário aprova o lançamento. |

---

# Protocolo obrigatório de execução

Vale para **toda** sessão futura de implementação.

1. **Uma fase por vez.** Nunca iniciar duas.
2. **Antes de implementar**, reler a fase inteira neste arquivo e confirmar que todas as dependências estão `[x] Aprovada` e que nenhuma decisão bloqueante da fase está em aberto. Se houver decisão aberta → marcar `[?]` e **perguntar**, sem implementar.
3. **Apresentar um plano curto da fase** (5–10 linhas) antes de escrever código.
4. **Implementar somente o escopo daquela fase.** Nada de "já que estou aqui".
5. **Rodar os testes** listados na fase, mais a suíte completa para checar regressão.
6. **Informar como visualizar e testar no Replit**, passo a passo, incluindo os estados e as larguras a conferir.
7. **Esperar a avaliação do usuário.** Não seguir adiante.
8. **Fazer as iterações solicitadas** quantas vezes forem necessárias.
9. **Solicitar aprovação explícita** ("Posso considerar a fase X aprovada?").
10. **Atualizar o status da fase** neste `plan.md` e commitar.
11. **Só então** iniciar a fase seguinte.

> **Testes verdes não são aprovação.** A aprovação de UX e de produto é condição obrigatória e separada. O Claude nunca inicia a próxima fase automaticamente.

**Regras permanentes durante a execução**
- Respeitar integralmente o `CLAUDE.md`: React+TS, Node/Express, PostgreSQL, motor puro e determinístico separado de UI e persistência, validação no frontend **e** obrigatoriamente no backend, parâmetros centralizados e versionados, design system sem valor visual hardcoded, interface em pt-BR, dark mode, responsividade, convenção monetária e percentual única, segredos só em `.env`.
- Não alterar stack, arquitetura, banco, acesso ou dependências principais sem consultar.
- Nenhuma funcionalidade de Fase 2+ sem aprovação explícita.
- Não inventar coeficientes, CUB, dados de mercado, percentuais, fórmulas ou metodologia de score.
- Parâmetro TBD fica provisório, centralizado e marcado — nunca número mágico.
- Comentários em português explicando o motivo, não o literal.

---

# Matriz de rastreabilidade

| Requisito / seção do PRD | Macro | Fase | Critério de aceite | Teste | Status |
|---|---|---|---|---|---|
| 1 — Duas perguntas do produto | 1 | F02, F16 | Ambas respondidas pelas duas perspectivas | Teste de perspectiva | `[ ]` |
| 2.1 — Análise econômica completa | 1 | F13 | Fórmulas do 4.1 corretas | `economia.test.ts` | `[ ]` |
| 2.1 — Percentuais por padrão | 1 | F12, F13 | 8/9/10% e 20/22/25% por padrão | `parametros`/`economia` | `[ ]` |
| 2.1 — Preço máximo recomendado | 1 | F14 | = Resultado Terreno | Teste de componente | `[ ]` |
| 2.2 — Etapa 1 terreno | 1 | F05–F08 | Todos os campos do PRD | Validação + componentes | `[ ]` |
| 2.2 — CEP com fallback manual | 1 | F06 | Falha não bloqueia | `useCep` (4 cenários) | `[ ]` |
| 2.2 — Formato e topografia gráficos | 1 | F08 | 2 e 4 opções com ilustração | Snapshot + teclado | `[ ]` |
| 2.2 — Etapa 2 produto | 1 | F09, F10 | Taxonomia do 3.1; restrição casa/galpão | Testes de taxonomia | `[ ]` |
| 2.2 — Preço por m² vendido | 1 | F10 | preço ÷ área da unidade | Teste de cálculo | `[ ]` |
| 2.3 — Áreas e CA calculados | 1 | F11 | Cadeia do 3.3 | `areas.test.ts` | `[ ]` |
| 2.3 — Ajuste do custo por faixa/padrão/topografia/formato | 1 | F12 | Quatro aditivos somados | `cub.test.ts` | `[ ]` |
| 2.4 — Alertas regulatórios e técnicos | 1 | F18 | Checklist completo do 2.4 | `alertas.test.ts` | `[ ]` |
| 2.4 — Obra/VGV 40–65% | 1 | F18 | Limites exatos | Teste de limite | `[ ]` |
| 2.4 — Despesas/VGV 10–15% | 1 | F18 | Limites exatos | Teste de limite | `[ ]` |
| 2.4 — Coef. unidades 80–85% | 1 | F18 | Soma de todas as unidades; N/A casas | Teste de limite | `[ ]` |
| 2.4 — Alerta qualitativo de mercado | 1 | F18 | Sem base de preços | Teste de conteúdo | `[ ]` |
| 2.5 — Estrutura do output | 1 | F14, F15, F19 | Todas as seções do 2.5 | Testes de componente | `[ ]` |
| 2.6 — Interatividade em tempo real | 1 | F17 | Recálculo < 500ms | Teste de performance | `[ ]` |
| 2.6 — Toggle de perspectiva | 1 | F16 | Mesma base, variável distinta | `economia.test.ts` | `[ ]` |
| 2.7 — Acesso por link, sem login | 2 | F27 | Token validado no servidor | Testes de acesso | `[ ]` |
| 2.7 — Uma análise por acesso | 1/2 | F22, F31 | Sem histórico ao usuário | Teste de isolamento | `[ ]` |
| 2.7 — Armazenamento interno | 2 | F31 | Snapshot gravado, não exposto | Teste de repositório | `[ ]` |
| 2.8 — PDF | 1 | F20 | Completo, < 3s | Teste de geração | `[ ]` |
| 2.8 — HTML compartilhável | 1 | F21 | Seguro e fiel | Teste de conteúdo | `[ ]` |
| 2.8 — Aviso de não-persistência | 1 | F02, F22 | Antes de sair do resultado | Teste do aviso | `[ ]` |
| 2.9 — Onboarding | 1 | F03, F04 | Primeiro acesso + reabertura | Testes de navegação | `[ ]` |
| 2.9 — Responsivo | 1 | F23 | Três faixas | Snapshots | `[ ]` |
| 2.9 — Dark mode | 1 | F00, F23 | Dois temas AA | Teste de tema + contraste | `[ ]` |
| 2.10 — Parâmetros centralizados e versionados | 1 | F11, F12, F24 | Sem número mágico | Lint + testes | `[ ]` |
| 2.10 — Importação periódica do CUB | 1 | F24 | Versionada com fallback | Teste de versionamento | `[ ]` |
| 3.1 — Classificação CUB | 1 | F09, F12 | Duas etapas, sem código combinado | `cub.test.ts` | `[ ]` |
| 3.1 — Lacunas (Baixo, CAL-16, Uso Misto) | 1 | F09, F12 | Pendência, nunca valor inventado | Teste de lacuna | `[?]` |
| 3.2 — Aditivos e CUB Ajustado | 1 | F12 | Soma única; exemplo R$ 3.154,91 | `cub.test.ts` | `[ ]` |
| 3.3 — Quatro áreas distintas | 1 | F11 | Obra na construída, VGV na comercializável | `areas.test.ts` | `[ ]` |
| 3.4 — API de CEP | 1 | F06 | Sem chave, falha não bloqueia | `useCep` | `[ ]` |
| 3.4 — CUB sem API | 1 | F24 | Importação manual versionada | Teste de importação | `[ ]` |
| 3.5 — Só Minas Gerais | 1 | F06 | Lista restrita a MG | Teste da lista | `[ ]` |
| 4.1 — Método do resíduo | 1 | F13 | Fórmula exata | `economia.test.ts` | `[ ]` |
| 4.1 — Despesas gerais (11% × 12%) | 1 | F13 | Conforme D-B2 | Teste parametrizado | `[?]` |
| 4.2 — Normalidade dos KPIs | 1 | F18 | Cinco indicadores | `kpis.test.ts` | `[ ]` |
| 4.3 — LASTRO Score | 1 | F19 | Metodologia aprovada | `score.test.ts` | `[?]` |
| 4.3 — Potencial de mercado (10 pts) | 1 | F19 | Conforme D-B8 | `score.test.ts` | `[?]` |
| 4.4 — Recomendação | 1 | F19 | Limiares 50 e 70 | Teste de fronteira | `[ ]` |
| 5.1 — Primeiro acesso pós-compra | 2 | F26, F28, F29 | Produto + e-mail | Teste ponta a ponta | `[ ]` |
| 5.2 — Acessos seguintes | 2 | F27 | Quatro estados do token | Testes de acesso | `[ ]` |
| 5.3 — Fluxo de análise | 1 | F05–F22 | Jornada completa | `fluxo-completo.test.tsx` | `[ ]` |
| 6.1 — Stack e design system | 1 | F00 | Tokens sem hardcode | Lint de tokens | `[ ]` |
| 6.1 — Tabelas do MVP | 1/2 | F24, F27, F28, F31 | Cinco tabelas, sem `users` | Testes de repositório | `[ ]` |
| 6.2 — Performance | 1 | F13, F17, F20 | < 500ms e < 3s | Testes de tempo | `[ ]` |
| 6.3 — Validação no backend | 1 | F13 | Obrigatória | Teste de integração | `[ ]` |
| 6.3 — Token de acesso | 2 | F27 | Alta entropia, validade, revogação | Testes de segurança | `[?]` |
| 6.3 — Webhook assinado e idempotente | 2 | F28 | Sem duplicação | Testes de idempotência | `[ ]` |
| 6.3 — LGPD | 2 | F31 | Conforme D-B15 | Teste de retenção | `[?]` |
| 6.4 / 6.5 — Responsividade e browsers | 1 | F23 | Três faixas, browsers do PRD | Snapshots | `[ ]` |
| 7 — Acessibilidade WCAG AA | 1 | F23, F33 | Teclado e contraste | Auditoria automatizada | `[ ]` |
| 9 — Métricas de sucesso | 2 | F32 | Cinco métricas | Testes de cálculo | `[?]` |
| 10.5 — Versionamento e snapshot | 1 | F13, F17, F20, F24 | No exportado e no interno | Teste de snapshot | `[ ]` |

---

# Itens explicitamente fora do escopo

Nenhum destes pode ser implementado sem aprovação explícita (PRD seção 2 — OUT, e seção 8):

- Loteamento como tipo de projeto
- "Comprar a terra / Terra para investir" (valorização sem construção)
- Conjuntos de casas, prédios ou galpões no mesmo terreno
- Autenticação de usuário (cadastro, login, senha, conta, JWT de usuário, bcrypt)
- Múltiplas análises, histórico e retomada de análise salva
- Base de preços de mercado (FipeZap retirada)
- Análise técnica profunda (fundações, solo, topografia detalhada)
- Mobile app nativo
- Integração com plataformas (OLX, imobiliárias)
- Marketplace de terrenos
- Cálculos de financiamento e empréstimos
- Colaboração multiusuário em tempo real
- Análise geográfica e mapas
- Cálculo detalhado de impostos e tributos
- Comparativo automático entre múltiplos ativos
- Exportação em Excel
- Metodologia de área equivalente da NBR 12.721
- Limites de taxa de ocupação, CA e altura por zona embutidos no app
- Os projetos CUB `PP-4`, `PIS` e `RP1Q` (sem tipologia LASTRO correspondente)

---

# Quadro-resumo

| Ordem | Macro | Fase | Entrega visível | Complexidade | Modelo | Decisão bloqueante | Status |
|---|---|---|---|---|---|---|---|
| 1 | 1 | F00 Fundação e design system | App no ar com tokens e dark mode | Média | Opus | D-R1, D-R4 (resolvidas) | `[x]` ✓opus |
| 2 | 1 | F01 Shell e navegação | Quatro páginas navegáveis | Baixa | Sonnet | — | `[x]` ✓opus |
| 3 | 1 | F02 Página inicial | Página inicial real com CTA | Baixa | Sonnet | — | `[x]` ✓opus |
| 4 | 1 | F03 Onboarding v1 | Metodologia em passos | Baixa | Sonnet | — | `[ ]` |
| 5 | 1 | F04 Onboarding v2 | Diagramas, teclado, reabertura | Média | Sonnet | — | `[ ]` |
| 6 | 1 | F05 Estrutura do Terreno | Formulário com validação | Média | Sonnet | — | `[ ]` |
| 7 | 1 | F06 Localização e CEP | Município + autopreenchimento | Média | Sonnet | — | `[ ]` |
| 8 | 1 | F07 Dados físicos e financeiros | Preço em R$/m² calculado | Média | Opus | — | `[ ]` |
| 9 | 1 | F08 Formato e topografia | Seleção ilustrada | Média | Sonnet | — | `[ ]` |
| 10 | 1 | F09 Tipo, tipologia e padrão | Classificação em cascata | Média | Opus | **D-B6** | `[ ]` |
| 11 | 1 | F10 Pavimentos e unidades | Programa + preço por m² | Média | Sonnet | — | `[ ]` |
| 12 | 1 | F11 Áreas e indicadores | Painel de áreas e CA | Média | Opus | — | `[ ]` |
| 13 | 1 | F12 Parâmetros e CUB | CUB Ajustado discriminado | Alta | Opus | **D-B4, D-B5** | `[ ]` |
| 14 | 1 | F13 Motor econômico e API | Resultado cru completo | Alta | Opus | **D-B1, D-B2, D-B3** | `[ ]` |
| 15 | 1 | F14 Resultado v1 | Resumo e preço máximo | Média | Sonnet | — | `[ ]` |
| 16 | 1 | F15 Composição econômica | Tabela de custos | Média | Sonnet | — | `[ ]` |
| 17 | 1 | F16 Terrenista × Incorporador | Toggle de perspectiva | Média | Opus | — | `[ ]` |
| 18 | 1 | F17 Premissas ajustáveis | Cenários em tempo real | Alta | Opus | — | `[ ]` |
| 19 | 1 | F18 Alertas | Alertas e checklist | Alta | Opus | — | `[ ]` |
| 20 | 1 | F19 LASTRO Score | Score e recomendação | Alta | Opus | **D-B7, D-B8** | `[ ]` |
| 21 | 1 | F20 Exportação PDF | Relatório em PDF | Alta | Opus | **D-B9** | `[ ]` |
| 22 | 1 | F21 Exportação HTML | Relatório compartilhável | Alta | Opus | **D-B10** | `[ ]` |
| 23 | 1 | F22 Limpar análise | Modal e aviso de perda | Média | Sonnet | **D-B11** | `[ ]` |
| 24 | 1 | F23 Varredura de qualidade | Jornada revisada | Média | Sonnet | — | `[ ]` |
| 25 | 1 | F24 Persistência de parâmetros e CUB | Banco + importação admin | Alta | Opus | **D-B12** | `[ ]` |
| 26 | 2 | F25 Funil de vendas | Landing pública | Média | Sonnet | — | `[ ]` |
| 27 | 2 | F26 Checkout Kiwify | Compra e confirmação | Média | Opus | — | `[ ]` |
| 28 | 2 | F27 Link de acesso | Acesso por token | Alta | Opus | **D-B13** | `[ ]` |
| 29 | 2 | F28 Webhook | Emissão automática idempotente | Alta | Opus | — | `[ ]` |
| 30 | 2 | F29 E-mail Resend | Link entregue e reenviável | Alta | Opus | — | `[ ]` |
| 31 | 2 | F30 Recuperação e revogação | Recuperar e revogar acesso | Alta | Opus | **D-B14** | `[ ]` |
| 32 | 2 | F31 Registro interno | Análises e eventos no admin | Alta | Opus | **D-B15** | `[ ]` |
| 33 | 2 | F32 Métricas | Painel de métricas | Média | Sonnet | **D-B16** | `[ ]` |
| 34 | 2 | F33 Endurecimento | Produto pronto para produção | Alta | Opus | — | `[ ]` |

**Macroetapa 1:** 25 fases (F00–F24) · **Macroetapa 2:** 9 fases (F25–F33) · **Total: 34 fases**
**Decisões bloqueantes em aberto: 16** (D-B1 a D-B16) · **Decisões já resolvidas: 4** (D-R1 a D-R4) · **Decisões adiáveis: 10** (D-A1 a D-A10)

---

*Documento gerado a partir de `PRD.md` v1.2 e `CLAUDE.md`. Atualize o status das fases neste arquivo a cada aprovação.*
