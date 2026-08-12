# Sprint 18 — Go/No-Go para Produção

## Objetivo

Auditar o estado real da SUZZY AI após as Sprints 15, 16 e 17 e definir a menor sequência de tarefas necessária para chegar a uma decisão real de **Go/No-Go para produção** — sem presumir novas funcionalidades, sem alterar código.

Esta tarefa (Tarefa 1) é exclusivamente de auditoria e planejamento. Nenhum arquivo além deste foi criado ou alterado; nenhuma dependência foi instalada, atualizada ou corrigida automaticamente.

## Metodologia

Auditoria por leitura direta do código, configuração e documentação das Sprints 15–17, mais comandos somente de leitura (`git status`, `git diff`, `npm audit`, `npm outdated`, `node --version`). Nenhum valor de `.env.local` foi lido, copiado ou reproduzido. Cada achado abaixo é marcado como **implementado**, **configurado apenas localmente**, **pendente** ou **não comprovado pelo repositório** — nunca presumido.

---

## 1. Hospedagem / Produção

**Não comprovado pelo repositório.** Não existe `vercel.json`, nem pasta `.vercel` versionada (o `.gitignore` já prevê ignorá-la, o que é neutro — nem confirma nem descarta um deploy existente), nem qualquer variável `VERCEL_*`/`NEXT_PUBLIC_VERCEL_*` usada no código. A única menção à Vercel é em `CLAUDE.md`, na seção "Stack prevista" — um plano, não uma confirmação de que a aplicação está hospedada ali hoje. `next.config.ts` não define nenhuma configuração específica de plataforma (sem `output`, sem `images.domains`, sem headers customizados).

**Achado relevante e verificável**: `NEXT_PUBLIC_APP_URL` é usado em `app/login/page.tsx` (linhas 19 e 37) para montar o `redirectTo`/`emailRedirectTo` do login (Google OAuth e Magic Link). Em `.env.example`, seu valor de exemplo é `http://localhost:3000`. Se essa variável não for explicitamente configurada com o domínio real de produção no provedor de hospedagem, **o login inteiro quebra em produção** (o usuário seria redirecionado de volta para `localhost`). Esse não é um risco teórico — é uma linha de código real que depende diretamente dessa variável.

**Impacto sobre o rate limiting do Assist**: `lib/rate-limit/identifier.ts` já documenta essa limitação (herdada da Tarefa 3 da Sprint 17) — a extração de IP via `x-forwarded-for`/`x-real-ip` só é confiável se a camada de borda da hospedagem final sobrescrever esses headers antes de chegar à aplicação. Isso continua **não confirmado**, porque a hospedagem final também não está confirmada. Sem essa confirmação, o identificador de rate limiting do Assist segue sendo tratado como melhor esforço, nunca como prova de origem — o fallback seguro (`unknown` compartilhado) já existe para o pior caso, mas a eficácia contra abuso direcionado depende dessa confirmação futura.

**Node.js**: `package.json` não declara `"engines"`; não existe `.nvmrc` na raiz do projeto. O ambiente local usado nesta auditoria roda Node `v24.13.0` — uma versão bastante recente. Sem fixar uma versão mínima, o provedor de hospedagem pode usar um Node diferente do testado localmente, o que é um risco silencioso de incompatibilidade.

## 2. Segurança e dependências

`npm audit` executado (sem `--fix`, sem `--force`). Resultado: **6 vulnerabilidades altas, 0 críticas, 0 moderadas, 0 baixas.**

| Pacote | Severidade | Direta/transitiva | Prod/dev | Caminho de dependência | Correção disponível | Exige major? | Risco prático | Recomendação |
|---|---|---|---|---|---|---|---|---|
| `next` | Alta | Direta | **Produção** | `next@16.2.11` | Sim → `16.3.0` | **Não** (semver menor) | Vulnerabilidades herdadas de `postcss`/`sharp` internos ao `next` | Atualizar (baixo risco, correção não-major) |
| `postcss` | Alta | Transitiva | Produção (via `next`) e dev (via `@tailwindcss/postcss`) | `next/node_modules/postcss`, `node_modules/postcss` | Sim → resolvido junto com o `next@16.3.0` | Não | XSS via `</style>` não escapado e leitura arbitrária de arquivo via `sourceMappingURL` — exploráveis apenas se a aplicação processar CSS de origem não confiável em tempo de execução, o que **não é o caso aqui** (CSS é só o do próprio projeto, compilado em build) | Atualizar junto com o `next` |
| `sharp` | Alta | Transitiva | Produção (dependência do `next` para `next/image`) | `node_modules/sharp` (via `next`) | Sim → resolvido junto com o `next@16.3.0` | Não | **Risco prático baixo hoje**: confirmado por busca no código que `next/image`/`<Image>` **não é usado em nenhum lugar da aplicação** — o pipeline de otimização de imagem que usa `sharp` nunca é acionado por este projeto | Atualizar (a correção já vem "de graça" com o `next`, mesmo sem exposição real hoje) |
| `brace-expansion` | Alta | Transitiva | **Somente dev** (via `eslint`/`@typescript-eslint`) | `eslint→minimatch→brace-expansion`, `typescript-eslint→...→brace-expansion` | Sim | Não | DoS por expansão ilimitada — só acionável em tempo de lint/build local, nunca em runtime de produção (não é enviado ao bundle) | Baixa prioridade — resolver quando as demais forem tratadas |
| `js-yaml` | Alta | Transitiva | **Somente dev** (via `eslint`) | `eslint→@eslint/eslintrc→js-yaml` | Sim | Não | Consumo de CPU quadrático ao interpretar YAML — só relevante se o `eslint` interpretar YAML não confiável, o que não ocorre neste projeto | Baixa prioridade |
| `nanoid` | Alta | Transitiva | Dev/build (via `postcss`, usado pelo Tailwind e pelo `next` em build) | `@tailwindcss/postcss→postcss→nanoid`, `next→postcss→nanoid` | Sim | Não | Loop infinito só ocorre com geradores customizados usando tamanho zero — não é o uso feito pelo `postcss` internamente | Baixa prioridade |

**Nenhuma das 6 vulnerabilidades depende de `@upstash/redis` ou `@upstash/ratelimit`** — confirmado rastreando a árvore de dependências de cada pacote com `npm ls`.

**Resumo prático**: as três vulnerabilidades de produção (`next`, `postcss`, `sharp`) têm uma única correção em comum — atualizar `next` de `16.2.11` para `16.3.0`, uma versão **menor**, não major, o que reduz bastante o risco de regressão. As outras três são exclusivamente de ferramentas de desenvolvimento (nunca chegam ao bundle enviado ao navegador nem ao runtime do servidor em produção).

**`npm outdated`** (informativo, nenhum pacote foi alterado):
- `next` 16.2.11 → 16.3.0 disponível (menor).
- `@supabase/ssr` 0.12.3 → 0.12.4, `@supabase/supabase-js` 2.110.8 → 2.112.2 (patches/menores).
- `openai` 6.49.0 → **7.4.0 disponível (major)** — não recomendado migrar sem avaliação dedicada (mudanças de API major podem afetar `client.responses.create(...)`, usado nas três rotas de IA).
- `eslint` 9 → 10 (major, dev-only) e `typescript`/`@types/node` com majors disponíveis — sem urgência, dev-only.

## 3. OpenAI — controle de custos

**O que o código já controla hoje:**
- Modelo único em todo o projeto: `gpt-5-mini`, via `client.responses.create(...)` (Responses API), sem streaming.
- `/api/assist` e `/api/support`: `max_output_tokens: 500` e `reasoning: { effort: "minimal" }`, além do rate limiting real da Sprint 17 (5/60s + 40/dia por IP pseudonimizado no Assist; 10/60s + 100/dia por `sub` no Support).
- `/api/generate` (o fluxo pago principal): **não define `max_output_tokens`, não tem `reasoning`, e não tem rate limiting** — apenas exige autenticação (`getClaims()`) e limita o `context` de entrada a 5000 caracteres (`MAX_CONTEXT_LENGTH`). Isso é uma decisão herdada de antes da Sprint 17 (explicitamente registrada como "fora do escopo, a menos que necessidade comprovada" em `docs/SPRINT-17.md`), não um bug novo — mas continua sendo uma **exposição real de custo não limitado por chamada nem por frequência**, restrita apenas a quem tem uma conta autenticada.

**O que depende do painel da OpenAI (não verificável pelo código):**
- Orçamento/limite de gasto mensal configurado na conta.
- Alertas de consumo.
- Acompanhamento de uso por período.

Esses itens **exigem verificação direta na conta/documentação oficial da OpenAI** — não foram inventados nem presumidos aqui.

## 4. Upstash — controle operacional

**O que já está implementado em código** (Sprint 17, sem alterações nesta tarefa): `lib/rate-limit/` com políticas nomeadas (`ASSIST_RATE_LIMIT_POLICY`, `SUPPORT_RATE_LIMIT_POLICY`), cliente Redis memoizado que retorna `null` de forma segura quando as credenciais estão ausentes, e decisão de **fail-closed** documentada e implementada nas duas rotas (`/api/assist`, `/api/support`) — se o Upstash falhar, a rota responde `503` em vez de seguir para a OpenAI sem controle.

**O que depende do painel/conta da Upstash (não verificável pelo código, nenhum valor de credencial solicitado aqui):**
- Plano e cotas atuais (o banco `suzzy-ai-ratelimit` foi criado no plano Free, com limite de 256 MB + 500.000 comandos/mês, conforme já registrado na Sprint 17 — deve ser reconfirmado antes do lançamento se o volume de tráfego esperado for maior).
- Uso atual e histórico de comandos.
- Alertas/monitoramento disponíveis no painel.
- **Confirmar qual banco Redis é usado em produção** — se será o mesmo banco já testado nas Sprints 17/18 (o que pode misturar contadores de teste com contadores reais) ou um banco separado para produção.

## 5. Variáveis de ambiente

Todas as variáveis realmente usadas no código foram levantadas por busca direta (`process.env.*`, excluindo `node_modules`) e comparadas com `.env.example` — **nenhuma divergência encontrada**: `.env.example` reflete corretamente todas as seis variáveis em uso, sem nenhuma a mais ou a menos.

| Variável | Tipo | Obrigatória? | Uso |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Sim | Cliente/servidor Supabase (auth) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Pública | Sim | Cliente/servidor Supabase (auth) — chave publicável, projetada para ser exposta |
| `NEXT_PUBLIC_APP_URL` | Pública | Sim | Redirect de login (Google OAuth / Magic Link) — **crítica**: valor errado quebra o login em produção |
| `OPENAI_API_KEY` | **Privada** | Sim | As três rotas de IA (`/api/generate`, `/api/assist`, `/api/support`) |
| `UPSTASH_REDIS_REST_URL` | **Privada** | Sim (para rate limiting funcionar; fail-closed se ausente) | `lib/rate-limit/redis.ts` |
| `UPSTASH_REDIS_REST_TOKEN` | **Privada** | Sim (idem) | `lib/rate-limit/redis.ts` |

Nenhum valor de `.env.local` foi aberto, copiado ou registrado nesta auditoria.

**Checklist para configuração em produção** (a ser executado pelo proprietário do produto, diretamente no painel do provedor de hospedagem escolhido — nunca commitado):
- [ ] `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` apontando para o projeto Supabase correto (confirmar se é o mesmo projeto usado em desenvolvimento ou um projeto de produção separado — não determinável pelo repositório).
- [ ] `NEXT_PUBLIC_APP_URL` configurada com o domínio real de produção (não `localhost`).
- [ ] `OPENAI_API_KEY` configurada como variável privada (nunca `NEXT_PUBLIC_`).
- [ ] `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` configuradas como variáveis privadas, apontando para o banco Redis correto de produção.
- [ ] Nenhuma dessas variáveis privadas commitada em nenhum arquivo do repositório (confirmado: `.env.local` está no `.gitignore`, apenas `.env.example` — sem valores — é versionado).

## 6. Jurídico

Sem nenhuma alteração nesta tarefa. Pendências já registradas nas Sprints 15–17, **ainda não resolvidas**, e que exigem ação do proprietário do produto e/ou de um profissional habilitado — não de mais código:
- Responsável legal / razão social.
- CNPJ, se aplicável.
- Endereço, se necessário.
- Canal oficial de privacidade/LGPD.
- **Revisão jurídica profissional** dos quatro documentos-base (`docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/AI_TRANSPARENCY.md`, `docs/COOKIES_POLICY.md`) e das páginas públicas correspondentes.

## 7. Comercial / operacional

**O que existe hoje**: nenhuma integração de cobrança, checkout, gateway de pagamento, assinatura, controle de expiração de teste gratuito, ou fluxo de cancelamento — confirmado por ausência total de dependências relacionadas (`Stripe` ou equivalente não está em `package.json`) e por ausência de qualquer lógica de expiração/trial no código. O login (Google OAuth ou Magic Link) concede acesso completo e permanente ao Dashboard, sem nenhuma verificação de plano ou prazo.

**O que a Landing Page promete** (`app/page.tsx`, texto real conferido): teste gratuito de 15 dias sem cartão de crédito, e após esse período, cobrança dos planos "Corretor Autônomo" (R$ 97/mês) ou "Pequena Imobiliária" (R$ 247/mês, "em desenvolvimento"), além de benefícios do "Programa Fundadores".

**Lacuna identificada — registrada como possível bloqueador, não como bug a corrigir automaticamente**: hoje **não existe nenhum mecanismo técnico que transforme a promessa de "15 dias grátis, depois cobrança" em realidade** — um usuário que se cadastra tem acesso ilimitado e permanente, sem nunca ser cobrado. Isso não é necessariamente um erro: pode ser uma decisão consciente de MVP ("validar o produto antes de cobrar", alinhado ao `CLAUDE.md`). Mas, se a intenção for realmente começar a cobrar no lançamento, isso **é um bloqueador comercial real**, não jurídico nem técnico. Esta é uma decisão que só o proprietário do produto pode tomar — não foi presumida aqui.

**Também ausentes**: canal de suporte humano de retaguarda (caso os agentes de IA não resolvam a dúvida do usuário) e monitoramento operacional formal (ver seção 9).

## 8. Backup / recuperação / observabilidade

- **Logs**: apenas `console.error` nas rotas de API (erros genéricos, sem PII/segredos, conforme já auditado na Sprint 17). Visíveis apenas nos logs brutos do provedor de hospedagem — **nenhum serviço de agregação, alerta ou monitoramento de erros está instalado** (nenhuma dependência tipo Sentry no `package.json`).
- **Tratamento de erros de UI**: não existe `app/error.tsx` nem `app/global-error.tsx` — uma exceção não tratada em uma página cairia na página de erro genérica padrão do Next.js, sem tratamento customizado.
- **Banco de dados de aplicação**: confirmado, por busca no código, que **nenhuma chamada `supabase.from(...)` ou `.storage` existe em todo o projeto** — o Supabase é usado exclusivamente para autenticação. Não há dados de aplicação (histórico, contexto, conversas) armazenados em banco algum; tudo o que existe é local ao navegador (`localStorage`) ou efêmero em memória (chats), por decisão de arquitetura já documentada.
- **Backup de dados de autenticação**: gerido inteiramente pela infraestrutura/plano da Supabase — não verificável nem configurável a partir deste repositório.
- **Dependências externas**: Supabase (auth), OpenAI (IA), Upstash (rate limiting) — a disponibilidade da aplicação depende da disponibilidade dos três; nenhum tem fallback além do fail-closed já implementado para o Upstash.

---

## 9. Achados classificados (P0 / P1 / P2)

### P0 — bloqueia lançamento

**P0-1. `NEXT_PUBLIC_APP_URL` não configurada corretamente em produção quebra o login por completo.**
- **Risco**: se essa variável continuar apontando para `localhost` (ou qualquer valor incorreto) no ambiente de produção, tanto o login via Google OAuth quanto via Magic Link redirecionam o usuário para o lugar errado — ninguém consegue entrar na plataforma.
- **Por que bloqueia**: é o próprio mecanismo de acesso ao produto; sem login funcional, nada mais importa.
- **Ação que resolve**: configurar `NEXT_PUBLIC_APP_URL` com o domínio real de produção diretamente no painel do provedor de hospedagem, como parte do processo de deploy — item de checklist, não de código.

**P0-2. Ambiente de hospedagem em produção ainda não confirmado.**
- **Risco**: sem uma plataforma real definida, não há onde configurar variáveis de ambiente, não há domínio real para `NEXT_PUBLIC_APP_URL`/redirect OAuth, e a confiabilidade dos headers de IP do Assist permanece indeterminada.
- **Por que bloqueia**: é um pré-requisito físico para todos os outros itens de infraestrutura — não é possível declarar "Go" sem saber onde a aplicação vai rodar.
- **Ação que resolve**: decisão explícita do proprietário do produto sobre a plataforma de hospedagem (Vercel, conforme `CLAUDE.md`, ou outra), seguida da configuração real das variáveis de ambiente nela.
- **Atualização da Tarefa 3**: a avaliação técnica já foi feita — Vercel é tecnicamente adequada, no plano **Pro** (não Hobby, ver Tarefa 3, seção 3). Este P0 permanece aberto porque a **decisão/contratação real e o deploy em si** ainda não aconteceram — a auditoria técnica não substitui a ação.

*(Nenhum outro achado foi classificado como P0 — os itens jurídicos e comerciais abaixo bloqueiam especificamente o "lançamento comercial completo", não a prontidão técnica em si; por isso aparecem separados no checklist de Go/No-Go da seção 11, e não duplicados aqui.)*

### P1 — deve ser resolvido antes ou imediatamente no lançamento

- ~~**P1-1.** Atualizar `next` de `16.2.11` para `16.3.0` (correção não-major das 3 vulnerabilidades altas de produção do `npm audit`).~~ **Resolvido na Tarefa 2.**
- **P1-2.** `/api/generate` (fluxo pago principal) não tem `max_output_tokens` nem rate limiting — decisão explícita necessária: aceitar o risco documentado (por ser autenticado) ou aplicar a mesma proteção já usada em Assist/Support.
- **P1-3.** Confirmar quais headers de IP (`x-forwarded-for`/`x-real-ip`) são realmente confiáveis na plataforma de hospedagem escolhida, depois que o P0-2 for resolvido.
- **P1-4.** Configurar manualmente, no painel da OpenAI: orçamento/limite de gasto e alertas de consumo.
- **P1-5.** Configurar/confirmar manualmente, no painel da Upstash: plano/cotas para o volume esperado, e qual banco Redis será usado em produção (o mesmo já testado, ou um novo).
- **P1-6.** Fixar a versão mínima do Node.js exigida pelo projeto (`engines` em `package.json` e/ou `.nvmrc`), para evitar divergência entre o ambiente local e o de produção.
- **P1-7.** Decisão do proprietário do produto sobre cobrança: manter o produto gratuito por enquanto (e ajustar a comunicação da Landing Page, se necessário) ou implementar de fato o mecanismo de cobrança/expiração do teste gratuito antes de anunciar publicamente os preços atuais.
- **P1-8.** Definir um canal mínimo de suporte humano de retaguarda antes de expor a plataforma a usuários reais pagantes.
- **P1-9.** Confirmar, junto ao painel/plano da Supabase, a política de backup/recuperação dos dados de autenticação (não verificável pelo repositório).
- **P1-10.** Revisão jurídica profissional dos quatro documentos-base e dados institucionais pendentes (responsável legal, CNPJ, endereço, canal LGPD) — bloqueia especificamente o lançamento **comercial**, não a prontidão técnica.

### P2 — melhoria posterior

- **P2-1.** Atualizar `brace-expansion`, `js-yaml`, `nanoid` (vulnerabilidades altas, mas restritas a ferramentas de desenvolvimento/build, sem exposição em runtime de produção).
- **P2-2.** Adicionar `app/error.tsx`/`app/global-error.tsx` para uma página de erro customizada em vez da padrão do Next.js.
- **P2-3.** Avaliar um serviço mínimo de monitoramento/alerta de erros em produção (ex.: Sentry ou equivalente), hoje inexistente.
- **P2-4.** Avaliar a migração major do pacote `openai` (6.x → 7.x) — sem urgência, requer avaliação dedicada de mudanças de API.
- **P2-5.** Considerar separar o banco Redis de teste/desenvolvimento do banco de produção, para não misturar contadores de rate limiting.

---

## 10. Plano da Sprint 18

Sequência mínima proposta, priorizada conforme solicitado (segurança → infraestrutura de produção → custos → jurídico → operação comercial). Cada tarefa segue o mesmo padrão já usado no projeto: uma entrega pequena e verificável por vez, com aprovação explícita antes de avançar.

1. **Auditoria de prontidão e plano da sprint** (esta tarefa).
2. **Segurança de dependências** — avaliar e, se aprovado, aplicar a atualização não-major do `next` (16.2.11 → 16.3.0), com teste real de lint/build/smoke test antes e depois. Decidir separadamente sobre as vulnerabilidades de dev-only (P2, baixa prioridade).
3. **Checklist de infraestrutura de produção** (tarefa mista: parte checklist manual, parte código mínimo) — confirmar a plataforma de hospedagem real (decisão do proprietário do produto); configurar corretamente `NEXT_PUBLIC_APP_URL` e as demais variáveis no provedor; fixar a versão do Node (`engines`/`.nvmrc`); revalidar, nesse ambiente real, quais headers de IP são confiáveis para o rate limiting do Assist.
4. **Decisão e, se necessário, ajuste de custo do `/api/generate`** — decisão do proprietário do produto sobre aplicar limite de tokens de saída/rate limiting ao fluxo principal pago, ou aceitar formalmente o risco atual (documentado). Se aprovado aplicar proteção, implementação reaproveitando a infraestrutura já existente em `lib/rate-limit/`.
5. **Checklist de custos e monitoramento (OpenAI/Upstash)** — tarefa majoritariamente manual, executada pelo proprietário do produto nos respectivos painéis (orçamento, alertas, confirmação do banco Redis de produção); o assistente cria o checklist específico, mas não pode executar essas ações por fora do repositório.
6. **Checklist jurídico** — consolidar, sem editar os documentos jurídicos nesta sprint (a menos que uma nova sprint seja aberta especificamente para isso), a lista final de pendências que dependem do proprietário do produto e/ou de profissional habilitado.
7. **Decisão comercial/operacional** — decisão explícita do proprietário do produto sobre cobrança real vs. continuar gratuito nesta fase, canal de suporte humano, e ajuste da comunicação da Landing Page caso a decisão exija.
8. **Validação final e decisão formal de Go/No-Go** — aplicar o checklist da seção 11 com o estado real após as tarefas anteriores, e registrar a decisão.

*Nenhuma tarefa acima presume novas funcionalidades de produto — todas resolvem lacunas já existentes ou pedem decisões pendentes.*

## 11. Critérios de Go/No-Go

Cada item é verificável objetivamente (por código, teste real, ou confirmação explícita do proprietário do produto).

### Técnico
- [x] `/api/generate`, `/api/assist`, `/api/support` funcionais, sem regressão (Sprints 11–17).
- [x] Autenticação Supabase funcional (Google OAuth + Magic Link) em ambiente de desenvolvimento.
- [ ] Login validado de ponta a ponta no domínio real de produção (depende do P0-2/P0-1).
- [ ] Versão do Node fixada (`engines`/`.nvmrc`).

### Segurança
- [x] Rate limiting real e testado em `/api/assist` e `/api/support` (Sprint 17).
- [x] Fail-closed confirmado nos dois agentes.
- [x] Nenhuma credencial exposta ao cliente/OpenAI (Sprint 17).
- [x] Vulnerabilidades altas de produção do `npm audit` resolvidas (P1-1 — `next@16.3.0`, Tarefa 2). Restam 3 vulnerabilidades altas, todas de ferramentas de desenvolvimento (P2-1), sem exposição em runtime de produção.
- [ ] Decisão registrada sobre proteção de custo em `/api/generate` (P1-2).

### Infraestrutura
- [ ] Plataforma de hospedagem de produção confirmada (P0-2).
- [ ] Todas as variáveis de ambiente configuradas corretamente no provedor (seção 5).
- [ ] Headers de IP confiáveis confirmados no ambiente real (P1-3).
- [ ] Banco Redis de produção confirmado (mesmo de teste ou novo).

### Custos
- [ ] Orçamento/alertas configurados no painel da OpenAI (P1-4).
- [ ] Plano/cotas e monitoramento confirmados no painel da Upstash (P1-5).

### Jurídico
- [ ] Revisão jurídica profissional concluída.
- [ ] Dados institucionais confirmados (responsável legal, CNPJ, endereço, canal LGPD).

### Comercial/operacional
- [ ] Decisão explícita sobre cobrança real vs. fase gratuita, com a Landing Page ajustada de acordo.
- [ ] Canal de suporte humano de retaguarda definido.

**GO PARA PRODUÇÃO**: só pode ser declarado quando todos os grupos **Técnico**, **Segurança** e **Infraestrutura** estiverem 100% marcados — isso representa prontidão para uma exposição técnica segura e estável. Os grupos **Custos**, **Jurídico** e **Comercial/operacional** têm impacto direto no risco financeiro/legal e devem estar 100% marcados antes de qualquer divulgação pública ou comercial ampla — mas, dependendo da decisão do proprietário do produto, um lançamento técnico controlado (ex.: acesso restrito/beta fechado, sem cobrança) poderia ocorrer com os três primeiros grupos completos e os últimos três explicitamente aceitos como risco temporário, nunca ignorados.

**NO-GO**: enquanto qualquer item dos grupos Técnico, Segurança ou Infraestrutura estiver pendente — hoje, esse é o estado real do projeto.

---

## Tarefa 2 — Atualização de segurança não-major do Next.js (concluída)

**Versão anterior**: `next@16.2.11`. **Versão nova**: `next@16.3.0` (mesma major, atualização menor — `isSemVerMajor: false` confirmado pelo `npm audit` antes de aplicar).

**Confirmação prévia**: `npm audit`/`npm outdated` reexecutados antes da mudança — resultado idêntico ao da Tarefa 1 (6 vulnerabilidades altas; `next`, `postcss` e `sharp` corrigidas por `next@16.3.0`, não-major). Nenhuma divergência encontrada, então a atualização prosseguiu.

**Arquivos alterados**: `package.json` (uma única linha: `"next": "16.2.11"` → `"next": "16.3.0"`, mantendo o mesmo estilo de versão exata já usado) e `package-lock.json`. Nenhum outro pacote foi adicionado, removido ou promovido deliberadamente.

**O que o npm ajustou automaticamente no lockfile, como consequência direta do `next@16.3.0`** (documentado conforme pedido, nada foi escolhido manualmente):
- `next` e todos os binários `@next/swc-*`/`@next/env`: `16.2.11` → `16.3.0`.
- `sharp` (dependência do `next` para otimização de imagem, não usada pela aplicação — nenhum `next/image` é importado no projeto) e seus binários `@img/sharp-*`/`@img/sharp-libvips-*`: `0.34.5` → `0.35.3` (libvips `1.2.4` → `1.3.2`).
- `postcss`: a cópia aninhada `next/node_modules/postcss@8.4.31` foi removida e a cópia compartilhada `node_modules/postcss` passou de `8.5.22` para `8.5.23` (versão única agora satisfaz tanto o `next@16.3.0` quanto o `@tailwindcss/postcss`, já existente).
- Nenhuma outra dependência (`react`, `openai`, `@supabase/*`, `@upstash/*`, `eslint`, `typescript` etc.) foi alterada — `eslint-config-next` permanece deliberadamente em `16.2.11`, sem relação com esta correção.

**Efeito colateral encontrado e revertido — reportado antes de prosseguir**: ao rodar `next dev` pela primeira vez com a versão `16.3.0`, uma funcionalidade nova dessa versão **escreveu automaticamente um bloco em `CLAUDE.md`** (`<!-- BEGIN:nextjs-agent-rules -->`, gerado por `node_modules/next/dist/server/lib/generate-agent-files.js`), fora do escopo autorizado desta tarefa (que permitia alterar somente `package.json`/`package-lock.json`). A alteração foi imediatamente revertida com `git checkout -- CLAUDE.md`. **Importante**: essa é uma funcionalidade nova e persistente do `next dev` na versão `16.3.0` — o próprio texto gerado avisa que o bloco "é escrito e readicionado por `next dev`" a cada execução local, e só pode ser desativado com `agentRules: false` em `next.config.ts`. Como alterar `next.config.ts` está fora do escopo explícito desta tarefa, **nenhuma mudança foi feita nele** — isso fica registrado como uma decisão pendente para a próxima vez que o servidor de desenvolvimento for iniciado localmente (ver "Resultado" na mensagem de encerramento desta tarefa).

**npm audit — antes/depois**:
| | Antes | Depois |
|---|---|---|
| Total de vulnerabilidades altas | 6 | 3 |
| `next` (produção) | presente | **eliminada** |
| `postcss` (produção, via `next`) | presente | **eliminada** |
| `sharp` (produção, via `next`) | presente | **eliminada** |
| `brace-expansion` (dev, via `eslint`) | presente | mantida (fora do escopo desta tarefa) |
| `js-yaml` (dev, via `eslint`) | presente | mantida (fora do escopo desta tarefa) |
| `nanoid` (dev/build, via `postcss`) | presente | mantida (fora do escopo desta tarefa) |

**Testes**: `npm run lint` ✅ | `npm run build` ✅ (mesmas 15 rotas geradas, nenhuma nova, nenhuma removida) | `/` → `200` ✅ | `/login` → `200` ✅ | `/privacidade`, `/termos`, `/ia`, `/cookies` → `200` ✅ | `/dashboard` sem sessão → `307` para `/login` ✅ | `/api/support` sem sessão → `401` ✅ | `/api/assist` — rate limiting confirmado ainda ativo (`429` reproduzido com payloads inválidos, sem nenhuma chamada à OpenAI). Nenhuma chamada desnecessária à OpenAI foi feita nesta tarefa.

**Incompatibilidade real de código**: nenhuma encontrada — build, lint e todos os testes de regressão passaram sem exigir nenhuma alteração estrutural.

**Confirmações de escopo**: nenhuma variável de ambiente, integração Supabase, integração Upstash ou política de rate limiting foi alterada (`git diff --stat` vazio para `.env.example`, `lib/rate-limit/`, `lib/supabase/`, `app/api/`). Nenhum código de aplicação foi alterado — apenas `package.json`/`package-lock.json` (e o efeito colateral em `CLAUDE.md`, já revertido).

---

## Microtarefa — Desativação da reescrita automática de `CLAUDE.md` pelo Next.js 16.3.0 (concluída)

Higiene de projeto realizada entre as Tarefas 2 e 3, para resolver o efeito colateral registrado no encerramento da Tarefa 2 (o `next dev` da versão `16.3.0` reescrevia automaticamente um bloco em `CLAUDE.md` a cada execução local).

**Arquivo alterado**: `next.config.ts` — adicionada apenas a chave `agentRules: false` ao objeto `nextConfig` já existente. Nenhuma outra configuração foi tocada (`turbopack.root` permanece exatamente como estava). `CLAUDE.md` não foi tocado nesta tarefa, nem código de aplicação, nem dependências.

**Testes**: `npm run lint` ✅ | `npm run build` ✅ (TypeScript aceitou `agentRules` sem erro; mesmas 15 rotas geradas) | `npm run dev` iniciado brevemente — o log **não exibiu mais** a mensagem "Generated CLAUDE.md for AI agents" (presente antes da correção) — e `git status` confirmou que `CLAUDE.md` **não** aparece como modificado após o servidor rodar e servir requisições reais.

**Resultado**: a modificação automática de `CLAUDE.md` está desativada de forma permanente para este projeto.

---

## Tarefa 3 — Auditoria e preparação da infraestrutura de produção (concluída)

Tarefa exclusivamente de auditoria e pesquisa. **Nenhum deploy foi realizado, nenhum domínio configurado, nenhuma credencial acessada/exposta, e nenhum código ou dependência foi alterado.**

### 1. Auditoria do projeto

Revisão confirma o mesmo estado já documentado nas Tarefas 1–2, sem nenhuma alteração desde então: `next.config.ts` (agora com `agentRules: false`, sem nenhuma outra configuração de plataforma), `package.json`/`package-lock.json` (`next@16.3.0`), `.env.example` (6 variáveis, ver seção 5), `proxy.ts`/`lib/supabase/proxy.ts` (autenticação Supabase renovada a cada requisição via `@supabase/ssr`), `/api/generate`, `/api/assist`, `/api/support` e `lib/rate-limit/` sem nenhuma exportação de `runtime` — ou seja, as três rotas de API rodam no runtime **Node.js** por padrão (não Edge). O fluxo de login usa Google OAuth e Magic Link (`app/login/page.tsx`), ambos dependentes de `NEXT_PUBLIC_APP_URL` para montar a URL de redirecionamento.

**Achado relevante**: o comentário já existente em `lib/supabase/proxy.ts` — *"With Fluid compute, don't put this client in a global environment variable. Always create a new one on each request."* — é um trecho literal do guia oficial de integração Supabase + Next.js/Vercel, o que confirma que o código de autenticação já foi originalmente escrito seguindo a orientação oficial para esse ambiente, mesmo antes de a hospedagem ser formalmente decidida.

### 2. Compatibilidade com Vercel

Verificado em documentação oficial atual (não presumido):

- **Next.js 16.3.0**: a Vercel é mantenedora do Next.js e publica suporte no mesmo dia para novas versões; nenhuma incompatibilidade relatada com as APIs usadas neste projeto (Route Handlers, Server Components, Middleware). O único problema relatado publicamente para a série 16.2/16.3 é específico do runtime **Bun** (`bunVersion` ignorado), que este projeto não usa.
- **Runtime das três APIs**: `/api/generate`, `/api/assist`, `/api/support` não declaram `export const runtime`, então rodam como **Vercel Functions no runtime Node.js** (padrão da Vercel quando nenhuma configuração adicional é definida) — não Edge.
- **`node:crypto`** (usado em `lib/rate-limit/identifier.ts` para o hash SHA-256 do IP do Assist): **compatível**. Runtime Node.js da Vercel expõe a biblioteca padrão do Node.js completa — a própria documentação oficial da Vercel usa `import crypto from 'crypto'` como exemplo em uma Vercel Function (verificação de assinatura de webhook), confirmando suporte nativo.
- **`@upstash/redis`/`@upstash/ratelimit`**: compatíveis com Vercel Functions Node.js e Edge — o SDK usa a API REST do Upstash (chamadas `fetch`, sem conexão TCP persistente), desenhada especificamente para ambientes serverless; a Upstash mantém integração oficial no Vercel Marketplace.
- **`@supabase/ssr`**: padrão oficial recomendado pela própria Supabase para Next.js na Vercel (ver achado da seção 1) — sem incompatibilidade conhecida.
- **Server Components / Route Handlers**: sem requisito especial não coberto pela configuração já existente do projeto.

### 3. Plano da Vercel — Hobby vs. Pro

**Limitações técnicas do Hobby**: tecnicamente, o projeto funcionaria no plano Hobby (Serverless Functions, variáveis de ambiente, HTTPS automático, domínios customizados — todos disponíveis no Hobby).

**Restrição comercial/de termos — destacada conforme pedido, não deve ser ignorada**: a documentação oficial da Vercel (Fair Use Guidelines) define uso comercial como **qualquer deployment usado para ganho financeiro de qualquer pessoa envolvida na produção do projeto**, e lista exemplos que incluem explicitamente "anunciar um produto ou serviço" e "ser pago para criar ou hospedar o site". O plano **Hobby é restrito a uso pessoal, não comercial**; qualquer uso comercial exige Pro ou Enterprise.

**Aplicação direta à SUZZY AI**: a Landing Page (`app/page.tsx`) já anuncia publicamente planos pagos (R$ 97/mês, R$ 247/mês) e o "Programa Fundadores" — isso é, pela própria definição da Vercel, uso comercial, **independentemente de o sistema de cobrança já estar implementado ou não**. Portanto: **não recomendo o plano Hobby para a SUZZY AI em nenhuma fase**, nem mesmo para uma primeira fase "controlada" — não é uma questão de capacidade técnica, é uma violação dos termos de uso da própria Vercel desde o primeiro deploy com a Landing Page atual no ar. **O plano Pro (US$ 20/mês por membro) é o recomendado.**

### 4. IP e rate limiting do Assist

Verificado na documentação oficial da Vercel (`vercel.com/docs/headers/request-headers`, atualizada em 2025-12-13):

- `x-forwarded-for`: *"O endereço IP público do cliente que fez a requisição. (...) nós atualmente sobrescrevemos o header X-Forwarded-For e não repassamos IPs externos. Essa restrição existe para prevenir IP spoofing."* — ou seja, **na Vercel, esse header não pode ser forjado pelo cliente** (a única exceção é um cliente Enterprise com "trusted proxy" habilitado, contratado à parte).
- `x-real-ip`: documentado como **idêntico** ao `x-forwarded-for` na Vercel.
- Existe também `x-vercel-forwarded-for`: idêntico ao `x-forwarded-for`, mas **preservado mesmo que um proxy adicional na frente da Vercel sobrescreva o `x-forwarded-for`** — um sinal ainda mais robusto, não usado hoje pelo projeto.

**Comparação com `lib/rate-limit/identifier.ts`**: a implementação atual (`x-forwarded-for` → fallback `x-real-ip` → fallback `"unknown"`) já é exatamente a estratégia correta para a Vercel — os dois headers usados são confiáveis nesse ambiente especificamente, ao contrário da premissa cautelosa registrada no próprio comentário do código ("ambiente de hospedagem não confirmado"), que motivou tratar isso como "melhor esforço" até agora.

**Classificação**: **A) implementação atual adequada para a Vercel** — com uma melhoria futura opcional, não urgente: usar `x-vercel-forwarded-for` como sinal primário (mais resistente a um eventual proxy adicional na frente da Vercel no futuro), mantendo `x-forwarded-for`/`x-real-ip` como fallback. Registrado como P2, não implementado nesta tarefa (fora do escopo — apenas auditoria).

### 5. Variáveis de ambiente na Vercel

Nenhum valor de `.env.local` foi lido ou exibido.

| Variável | Tipo | Obrigatória | Client/Server | Escopo recomendado |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Sim | Ambos | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Pública | Sim | Ambos | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Pública | Sim | Ambos | **Valor diferente por ambiente** — domínio real em Production; ver seção 6 e 11 para Preview |
| `OPENAI_API_KEY` | **Privada** | Sim | Somente servidor | Production, Preview (marcar como *Sensitive* no painel da Vercel) |
| `UPSTASH_REDIS_REST_URL` | **Privada** | Sim | Somente servidor | Production, Preview (*Sensitive*) |
| `UPSTASH_REDIS_REST_TOKEN` | **Privada** | Sim | Somente servidor | Production, Preview (*Sensitive*) |

Não há, hoje, nenhuma variável privada específica do Supabase (a chave usada é a publicável/anônima, projetada para ser exposta) e nenhuma variável opcional — todas as seis são obrigatórias para o funcionamento completo.

### 6. `NEXT_PUBLIC_APP_URL`

Usada em exatamente dois pontos, ambos em `app/login/page.tsx`: `redirectTo` do `signInWithOAuth` (Google) e `emailRedirectTo` do `signInWithOtp` (Magic Link) — ambos montados como `` `${NEXT_PUBLIC_APP_URL}/auth/callback` ``.

**Valor conceitual em produção**: `https://<domínio-real-da-aplicação>` — não inventado aqui, depende da escolha de domínio (seção 10).

**O que precisa ser configurado quando o domínio real for definido** (nenhuma ação executada nesta tarefa):
- Na Vercel: `NEXT_PUBLIC_APP_URL` = domínio real, no ambiente Production.
- No Supabase (Authentication → URL Configuration): **Site URL** = domínio real; **Redirect URLs** deve incluir `https://<domínio-real>/auth/callback`.
- No Google Cloud Console (OAuth 2.0 Client): **Authorized redirect URIs** deve incluir a URL de callback do próprio Supabase (não a da aplicação — é o Supabase quem troca o código OAuth, não o Next.js diretamente) — confirmar o valor exato no painel do Supabase (Authentication → Providers → Google), não presumido aqui.

### 7. Checklist Supabase para produção

- [ ] **Site URL** configurada com o domínio real de produção.
- [ ] **Redirect URLs** incluindo `https://<domínio-real>/auth/callback` (exato, não wildcard, para produção).
- [ ] Redirect URL adicional com wildcard (`https://*-<projeto>.vercel.app/auth/callback` ou equivalente) se Preview Deployments forem usados para testar login — Supabase suporta padrões de wildcard especificamente para isso.
- [ ] Provedor Google OAuth configurado e testado (client ID/secret já devem existir de sprints anteriores — não reconfirmados nesta tarefa, apenas o checklist).
- [ ] Magic Link testado com o domínio real (o e-mail enviado leva ao domínio configurado em `NEXT_PUBLIC_APP_URL`).
- [ ] Confirmar se o projeto Supabase usado é o mesmo de desenvolvimento ou um projeto separado de produção (não determinável pelo repositório — decisão do proprietário do produto, já registrada como pendência na Tarefa 1).
- [ ] Teste real de login → `/dashboard` → logout, no domínio de produção.
- [ ] Confirmar que `/dashboard` continua redirecionando para `/login` sem sessão (comportamento já validado localmente nas Tarefas 1/2, deve ser revalidado no domínio real).

### 8. Checklist Upstash para produção

- [ ] Confirmar se o banco `suzzy-ai-ratelimit` (já criado, região São Paulo, plano Free — Sprint 17) será o mesmo usado em produção, ou se um banco separado será criado (nenhum banco novo foi criado nesta tarefa).
- [ ] `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` configuradas na Vercel como variáveis privadas (nunca `NEXT_PUBLIC_`).
- [ ] Teste de conexão real após o primeiro deploy (mesma técnica seguraja usada na Sprint 17 — sem expor token).
- [ ] Rate limiting do Assist testado no ambiente real (5/60s + 40/dia).
- [ ] Rate limiting do Support testado no ambiente real, com sessão autenticada real (10/60s + 100/dia) — pendente desde a Sprint 17 por falta de sessão real no ambiente automatizado.
- [ ] Confirmar plano/cotas da Upstash para o volume esperado (já registrado como P1-5 na Tarefa 1).

### 9. Checklist OpenAI para produção

- [ ] `OPENAI_API_KEY` configurada na Vercel como variável privada (nunca `NEXT_PUBLIC_`) — confirmado por código: usada apenas em `lib/ai/client.ts`, `app/api/generate/route.ts`, `app/api/assist/route.ts`, `app/api/support/route.ts`, nunca em componente cliente.
- [ ] As três rotas de API dependem dela; nenhuma chave é enviada ao navegador (já auditado nas Sprints 16/17, reconfirmado aqui por leitura de código).
- Orçamento/alertas no painel da OpenAI: fora do escopo desta tarefa, já registrado como P1-4 na Tarefa 1.

### 10. Checklist de domínio (quando definido — nenhuma compra/configuração feita)

1. Domínio adquirido/definido pelo proprietário do produto.
2. Domínio adicionado ao projeto na Vercel.
3. DNS apontado conforme instruções da Vercel (registros fornecidos no painel no momento da configuração real).
4. HTTPS emitido automaticamente pela Vercel após a validação do DNS.
5. `NEXT_PUBLIC_APP_URL` atualizada na Vercel (ambiente Production) para o domínio real.
6. Supabase: Site URL + Redirect URLs atualizados (seção 7).
7. Google Cloud Console: Authorized redirect URIs confirmados (seção 6).
8. Testes finais reais de autenticação (Google + Magic Link) no domínio definitivo.

### 11. Estratégia recomendada: Preview antes de Production

**Recomendado fazer um Preview Deployment antes do primeiro deploy de produção.**

**Vantagens**: valida o build real na infraestrutura da Vercel (diferente do ambiente local) antes de expor o domínio de produção; permite testar as três rotas de API, o rate limiting real via Upstash, e a renderização de todas as páginas sem risco para usuários reais.

**Variáveis necessárias no Preview**: as mesmas seis variáveis da seção 5. `OPENAI_API_KEY` e as duas variáveis do Upstash podem (e devem) ser as mesmas de produção, já que são apenas credenciais de serviço, não dados sensíveis específicos de ambiente — mas isso significa que **testes em Preview consumem cota real da OpenAI e contadores reais do Upstash**, o que já é uma prática aceita neste projeto (mesma abordagem usada nos testes reais das Sprints 17/18).

**Cuidado específico com OAuth**: cada Preview Deployment da Vercel recebe uma URL única e imprevisível (`*.vercel.app`), o que não é compatível, por padrão, com uma lista fixa de Redirect URLs no Supabase/Google. **Duas opções, nenhuma aplicada aqui**:
- (a) Registrar uma Redirect URL com wildcard no Supabase para cobrir URLs de preview (suportado oficialmente pelo Supabase para esse cenário exato) — mais simples, mas amplia a lista de origens aceitas.
- (b) Testar o fluxo completo de OAuth/Magic Link apenas em produção (ou em um domínio de staging fixo, se um for criado), e usar o Preview apenas para validar tudo que não depende do redirect exato (build, renderização, rate limiting, `/api/generate`/`/api/assist`/`/api/support`, páginas jurídicas).

**Preview não deve usar as mesmas variáveis de produção sem critério** apenas quando isso envolver dado sensível específico de ambiente — não é o caso aqui, já que todas as credenciais deste projeto são de serviço (Supabase, OpenAI, Upstash), não segredos por-ambiente.

### 12. Segurança

- Confirmado por leitura de código: nenhuma variável privada (`OPENAI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) é referenciada com prefixo `NEXT_PUBLIC_` em nenhum arquivo.
- Comportamento em serverless: as três rotas de API já são compatíveis com execução serverless sem estado local — nenhuma delas depende de memória do processo entre requisições (o rate limiting já usa Upstash, externo e compartilhado, desde a Sprint 17; não há cache em memória em nenhuma rota).
- Rate limiting compartilhado via Upstash: correto para múltiplas instâncias serverless simultâneas da Vercel — é exatamente o problema que a escolha do Upstash (Sprint 17, Tarefa 1) resolveu, ao contrário de uma solução em memória local.
- Diferença relevante entre localhost e Vercel identificada nesta tarefa: os headers de IP (`x-forwarded-for`/`x-real-ip`) só são realmente confiáveis (não-forjáveis) na Vercel — em `localhost`, qualquer valor pode ser enviado manualmente (como já foi feito propositalmente nos testes das Sprints 17/18 para simular cenários). Isso não é uma falha, é a diferença esperada entre os dois ambientes, e reforça que a auditoria desta tarefa (seção 4) só podia ser concluída com a hospedagem real (Vercel) identificada.

### 13. Achados classificados

**P0 — bloqueia deploy/produção**: nenhum novo além dos já registrados na Tarefa 1 (plataforma de hospedagem confirmada — **agora respondida: Vercel é tecnicamente adequada**; `NEXT_PUBLIC_APP_URL` configurada corretamente continua sendo pré-requisito de deploy, não uma pendência de auditoria).

**P1 — resolver antes do lançamento**:
- **P1-11 (novo).** Escolher o plano **Pro** da Vercel (não Hobby) antes de qualquer deploy — restrição de termos de uso, não técnica (seção 3). Ação: assinatura Pro pelo proprietário do produto.
- **P1-12 (novo).** Configurar as Redirect URLs do Supabase (exata para produção + wildcard opcional para preview) e confirmar as Authorized redirect URIs do Google quando o domínio for definido (seção 6/7). Ação: manual, painel do Supabase/Google.
- Itens já registrados na Tarefa 1 que esta auditoria reforça, sem alteração de status: P1-3 (headers de IP — **agora resolvido/confirmado como adequado para Vercel**, ver seção 4), P1-4, P1-5, P1-6, P1-9.

**P2 — melhoria futura**:
- **P2-6 (novo).** Adotar `x-vercel-forwarded-for` como sinal primário em `lib/rate-limit/identifier.ts`, mantendo os headers atuais como fallback (mais robusto a um eventual proxy futuro na frente da Vercel) — não implementado nesta tarefa.

### Resumo executivo da Tarefa 3

- **Vercel é tecnicamente adequada** para hospedar a SUZZY AI — Next.js 16.3.0, `node:crypto`, `@upstash/redis`/`@upstash/ratelimit` e `@supabase/ssr` são todos compatíveis, sem incompatibilidade encontrada.
- **Plano recomendado: Pro**, não Hobby — a Landing Page já constitui uso comercial pela própria definição da Vercel, independentemente da cobrança ainda não estar implementada.
- **`lib/rate-limit/identifier.ts` não precisa ser alterado** para funcionar corretamente na Vercel — classificado como **A) adequado**; existe uma melhoria opcional (P2) não urgente.
- P0 de hospedagem da Tarefa 1 agora tem resposta técnica (Vercel); o P0 de `NEXT_PUBLIC_APP_URL` correta continua valendo no momento do deploy real.

---

## Tarefa 4 — Proteção de custo do `/api/generate` (auditoria — implementação NÃO autorizada ainda)

**Nenhum código foi alterado nesta tarefa.** `docs/SPRINT-18.md` não contém, antes desta tarefa, nenhuma política numérica de rate limiting já aprovada para `/api/generate` — confirmado por busca no próprio documento antes de iniciar. Conforme a regra explícita desta tarefa, o resultado é **auditoria + proposta**, não implementação. `npm run lint`/`npm run build` não foram executados, por não haver alteração de código.

### 1–2. Auditoria da rota e do cliente

**`app/api/generate/route.ts`** (lido integralmente):
- **Autenticação**: `supabase.auth.getClaims()`, `401` se ausente — mesmo padrão de `/api/assist`/`/api/support`.
- **Modelo**: `gpt-5-mini`, via `client.responses.create({ model, instructions, input })`.
- **`max_output_tokens`**: **ausente**. Diferente de `/api/assist`/`/api/support`, que fixam `500`.
- **`reasoning.effort`**: **ausente**. Os dois agentes de chat usam `"minimal"`; `/api/generate` usa o padrão do modelo (potencialmente mais caro por chamada, não apenas por não ter teto de saída).
- **Tamanho máximo de input**: `context` limitado a `MAX_CONTEXT_LENGTH = 5000` caracteres; `task` validado contra `ALLOWED_TASKS` (enum fixo); `scenarioId`/`objectionId` são apenas chaves de busca em listas internas fixas (`REAL_ESTATE_SCENARIOS`/`REAL_ESTATE_OBJECTIONS`) — se não encontrados, viram `undefined` silenciosamente, sem custo adicional real (não são texto livre enviado ao modelo, são apenas chaves de lookup).
- **Chamadas à OpenAI por requisição**: exatamente **uma** (`client.responses.create` é chamado uma única vez, dentro de um único `try/catch`, sem retry, sem loop).
- **Comportamento em erro**: qualquer exceção (rede, OpenAI, resposta vazia) retorna `502` com mensagem genérica — nenhum retry automático no servidor.
- **Dados enviados à OpenAI**: `instructions` (prompt fixo por tarefa, de `lib/ai/tasks.ts`) + `input` (o `context` do usuário, mais texto fixo de cenário/objeção/estratégias quando aplicável — nunca e-mail, `sub` ou qualquer identificador de conta).
- **Chamadas repetidas pelo mesmo usuário**: **possível e não controlada no servidor** — nada impede um usuário autenticado de enviar `POST /api/generate` repetidamente fora da interface (ex.: via script), já que não há rate limiting nem no código nem em nenhuma camada de infraestrutura hoje.

**`components/dashboard-form.tsx`** (lido integralmente — único ponto de chamada a `/api/generate` em todo o projeto, confirmado por busca em todo o repositório):
- `handleGenerate()` tem um guard explícito no topo — `if (isLoading) return;` — e os dois botões que a chamam ("Gerar resposta" e "Gerar novamente") ficam `disabled` enquanto `isLoading` é verdadeiro. **Dupla proteção contra clique duplicado**: nenhuma ação do usuário na interface consegue disparar duas requisições simultâneas.
- **"Gerar novamente"** reusa exatamente a mesma função `handleGenerate()`, com o mesmo `context`/`task`/`scenarioId`/`objectionId` já preenchidos — ou seja, é uma nova chamada completa a `/api/generate`, não uma variação client-side.
- **Nenhum retry automático** existe em nenhum lugar do fluxo — um erro apenas exibe a mensagem e para.
- **Nenhum outro componente ou hook chama `/api/generate`** — confirmado por busca textual em todo o projeto (apenas `dashboard-form.tsx`, além de documentação).

**Conclusão de bug de envio duplicado/retry**: **nenhum encontrado.** A proteção client-side existente é correta e suficiente contra o cenário que ela cobre (clique duplicado de um usuário real na interface). Ela não cobre, e não tem como cobrir, chamadas feitas fora da interface — é exatamente essa lacuna que rate limiting server-side resolveria.

### 3. Identificador proposto

`generate:<sub>` — mesmo padrão já usado e validado em `/api/support` (`support:<sub>`). O claim `sub` já está disponível na própria checagem de autenticação que a rota já faz (sem custo adicional de implementação), nunca seria enviado à OpenAI (mesma garantia já aplicada a `/api/support`, reforçada na seção 10) e nunca logado.

### 4. Política de rate limiting — proposta, não aprovada, não implementada

**Não copiada de Assist/Support** — construída considerando o uso real desta rota especificamente:

| | Janela curta | Limite diário |
|---|---|---|
| **`/api/generate` (proposto)** | **8 requisições / 60 segundos** | **150 requisições / dia** |

**Justificativa da janela curta (8/60s)**: mais generosa que a do Support (10/60s seria o "copiar", evitado propositalmente) não é o objetivo — o objetivo é permitir 2–3 cliques em "Gerar novamente" em sequência (um corretor insatisfeito com a primeira resposta) sem fricção, mas ainda impedir um laço automatizado. Um pouco mais restritiva que a janela do Support faria sentido porque cada chamada aqui é mais cara (sem teto de tokens de saída, três blocos de resposta quando há estratégia aplicada) — mas não tão restritiva a ponto de atrapalhar o uso normal do produto pago principal. 8/60s foi escolhido como equilíbrio, não copiado de nenhum outro endpoint.

**Justificativa do limite diário (150/dia)**: deliberadamente **mais generoso** que o do Support (100/dia), porque `/api/generate` é a funcionalidade paga central do produto — um corretor pode legitimamente gerar dezenas de respostas ao longo de um dia real de trabalho (leads, follow-ups, anúncios, próximos passos), o que não se compara ao volume esperado de um chat de dúvidas operacionais. 150/dia cobre, com folga, um uso intenso realista (ex.: uma geração a cada ~3 minutos por 8 horas seriam ~160 gerações) sem abrir a porta para uso automatizado/revenda do endpoint.

**Fase atual (pré-cobrança)**: como não existe hoje diferenciação de plano (Corretor Autônomo, Pequena Imobiliária) nem cobrança real, **este limite seria único para todos os usuários autenticados** — uma política **provisória e pré-cobrança**, pensada para proteger contra abuso/custo descontrolado, não para modelar o valor comercial de cada plano. Quando planos pagos existirem de fato, esses números devem ser revisitados (e possivelmente diferenciados por plano) — isso não é implementado nem decidido nesta tarefa.

**Estes números não estão aprovados.** Por regra explícita desta tarefa, **não foram implementados**. Aguardando aprovação explícita antes de qualquer código.

### 5. Limite de output (`max_output_tokens`) — proposta, não implementada

Hoje **ausente**. Diferente do caso do Assist/Support (Sprint 16), **não há evidência real registrada nesta auditoria de truncamento ou de tamanho típico de resposta** para `/api/generate` especificamente — nenhum bug equivalente ao "histórico > limite" foi observado aqui, porque esta rota não tem histórico (é de tiro único).

**Risco identificado, mesmo sem evidência de truncamento**: sem teto, o custo de saída por chamada é **imprevisível** — especialmente quando `buildAiInput()` ativa o formato de três blocos ("Resposta sugerida" + "Próximo passo recomendado" + "Por que estou sugerindo isso?", ver `lib/ai/tasks.ts`), que é estruturalmente mais longo que uma resposta de chat simples e mais longo que o que Assist/Support geram (capados em 500 tokens de saída).

**Recomendação**: aplicar um teto de saída deliberadamente **maior** que os 500 tokens do Assist/Support — proposta inicial de **1200 tokens**, por ser uma resposta com três blocos estruturados, não uma única mensagem curta de chat — mas **esta é uma estimativa por raciocínio, não uma medição real** (ao contrário do 2000/2500 caracteres do Assist/Support, que vieram de respostas reais observadas em produção). Recomendo, se esta proposta for aprovada, validar com 3–5 gerações reais (incluindo pelo menos uma com estratégia aplicada, o caso de resposta mais longa) antes de fixar o número definitivamente, para não repetir o mesmo tipo de bug já corrigido no Assist/Support (teto menor que uma resposta legítima real).

**Não implementado nesta tarefa.**

### 5.1 Microvalidação com evidência real (pós-auditoria, antes de fixar o número)

A estimativa de 1200 tokens da seção 5 foi tratada como não confiável o suficiente para implementar sem medição — por isso, antes de qualquer implementação, foi feita uma validação com **6 gerações reais contra o mesmo modelo/`buildAiInput()` usados por `/api/generate`** (via uma rota de diagnóstico temporária, `app/api/tmp-generate-output-test/route.ts`, que reproduzia exatamente a lógica da rota real sem exigir sessão — removida por completo ao final, confirmado via `git status`), cobrindo as combinações de tarefa/cenário/objeção mais prováveis de gerar a resposta mais longa (formato de três blocos, categoria "Negociação").

| # | Tarefa | Categoria de estratégia | Caracteres | `output_tokens` | `reasoning_tokens` |
|---|---|---|---|---|---|
| 1 | `sugerir_proximos_passos` (sem estratégia) | — | 3649 | **1384** | 512 |
| 2 | `responder_lead` (sem cenário/objeção) | Primeiro Contato | 1649 | **1462** | 1088 |
| 3 | `responder_lead` + objeção de preço | Negociação | 2204 | **1673** | 1152 |
| 4 | `criar_follow_up` + objeção de tempo | Negociação | 1442 | **1263** | 896 |
| 5 | `responder_lead` + cenário "recebeu proposta" | Negociação | 2055 | **1620** | 1152 |
| 6 | `gerar_anuncio` (sem estratégia) | — | 671 | **691** | 512 |

**Achado crítico — a estimativa da seção 5 estava errada e não deveria ser implementada como estava**: 5 das 6 gerações reais (todas exceto a mais simples, `gerar_anuncio`) já ultrapassam os 1200 tokens estimados, chegando a **1673** no pior caso observado. Se o valor de 1200 tivesse sido implementado sem esta validação, a maioria dos usos normais e legítimos da funcionalidade paga principal teria sido truncada — exatamente o mesmo tipo de bug já corrigido no Assist/Support (Sprint 16), desta vez evitado antes de acontecer.

**Causa raiz do tamanho**: `/api/generate` não define `reasoning.effort` (diferente de Assist/Support, que usam `"minimal"`), então o modelo usa seu esforço de raciocínio padrão — **entre 512 e 1152 tokens de raciocínio por chamada nesta amostra**, que contam integralmente dentro de `max_output_tokens` na Responses API (não é texto visível, mas consome o mesmo orçamento). Isso explica a diferença de ordem de grandeza em relação aos 500 tokens totais do Assist/Support.

**Recomendação revisada, com base em evidência real**: **2500 tokens** (não mais 1200) — cerca de 50% de margem acima do maior valor observado (1673), consistente com a mesma lógica de margem de segurança já usada para os limites de histórico do Assist/Support (Sprint 16), e prudente diante da amostra pequena (6 chamadas) e da variação relevante já observada nos tokens de raciocínio (512 a 1152, mais que o dobro entre o menor e o maior).

**Observação separada, fora do escopo desta validação**: reduzir `reasoning.effort` (ex.: para `"low"`) reduziria custo e tornaria o tamanho de saída mais previsível, mas isso é uma mudança de comportamento/qualidade da resposta do produto pago principal, não apenas uma proteção de custo — não avaliado nem recomendado aqui, é uma decisão de produto separada que cabe ao dono do produto considerar.

**Ainda não implementado.** Aguardando aprovação do número revisado (2500 tokens) antes de qualquer código.

### 6. Tamanho do input — auditado, nenhuma lacuna encontrada

`context` já limitado a 5000 caracteres; `task` já é um enum fechado; `scenarioId`/`objectionId` já são apenas chaves de busca em listas fixas internas, não texto livre — um payload com esses campos "excessivamente grandes" não gera custo adicional real (a busca falha e o campo vira `undefined`; o texto extra nunca chega a `input`). **Nenhuma lacuna de tamanho de input foi identificada.** Nenhuma mudança de contrato é necessária ou recomendada aqui.

### 7. Reaproveitamento de `lib/rate-limit/` — proposta de design, não implementada

Se e quando aprovado, o desenho reaproveitaria integralmente a infraestrutura existente, sem infraestrutura paralela:
- Nova política nomeada em `lib/rate-limit/policies.ts` (ex.: `GENERATE_RATE_LIMIT_POLICY`), mesmo formato já usado por `ASSIST_RATE_LIMIT_POLICY`/`SUPPORT_RATE_LIMIT_POLICY`.
- Novo `getGenerateRateLimiters()` em `lib/rate-limit/limiters.ts`, espelhando `getAssistRateLimiters()`/`getSupportRateLimiters()` (memoizado, `null` seguro sem credenciais).
- Reaproveitamento direto de `checkRateLimit()` (já genérico, recebe limitadores + identificador).
- Mesma ordem já validada em `/api/support`: autenticação → identificador (`generate:<sub>`) → checagem no Upstash → validação do payload → OpenAI.
- Mesmo fail-closed: sem limitadores válidos ou falha na checagem → `503`, sem chamar a OpenAI (nunca `429` para mascarar uma falha de infraestrutura).
- `429` só quando o limite for de fato excedido, sem chamar a OpenAI.
- Nenhuma dependência de memória local — mesma garantia já válida para Assist/Support, herdada do uso do Upstash.

### 8. UX de erros — avaliação, sem alteração de componente

`components/dashboard-form.tsx` já trata qualquer resposta não-`OK` de forma genérica (`setError(data.error ?? NETWORK_ERROR_MESSAGE)`), sem inspecionar o status code — o mesmo padrão que já funcionou sem alteração para os `429`/`503` do Support. Se a política desta tarefa for aprovada e implementada, o componente **não precisará ser alterado**, desde que as mensagens de erro do servidor sigam o mesmo padrão já usado (nunca mencionar Upstash, Redis, contadores ou identificadores) — mesma disciplina já aplicada em `/api/assist`/`/api/support`. Nenhuma alteração de componente foi feita nesta tarefa (nenhum bug real encontrado que a justificasse, e a política ainda não foi aprovada).

### 9. Custos e planos futuros

Os números propostos na seção 4 são explicitamente uma **política provisória pré-cobrança**, única para todos os usuários autenticados, porque não existe hoje nenhuma diferenciação de plano (Corretor Autônomo, Pequena Imobiliária) nem cobrança real nem controle de trial de 15 dias implementado no código (confirmado nas Tarefas 1 do Sprint 18 e nas Sprints 15–17). Nenhum entitlement/plano foi implementado ou desenhado nesta tarefa — fica registrado que, quando cobrança real existir, estes números (e possivelmente a própria arquitetura de limite único) devem ser revisitados.

### 10. Segurança e privacidade do identificador proposto

Confirmado, por desenho (mesmo padrão já auditado e aprovado em `/api/support`): `generate:<sub>` seria usado exclusivamente como chave de rate limiting no Redis. Nada além de um contador numérico seria armazenado — nunca contexto, mensagens geradas, respostas, e-mail, nome, dados de cliente ou qualquer conteúdo do Dashboard.

### 11. Classificação

- **Necessidade de rate limiting em `/api/generate`**: **P1.** Real e verificável (nenhum controle server-side contra chamadas repetidas), mas não P0 — a rota já exige autenticação, o que já elimina o vetor de abuso anônimo em massa que motivou o P0 do Assist na Sprint 17. Deve ser resolvido antes do lançamento comercial pleno, não bloqueia a operação técnica atual.
- **Necessidade de `max_output_tokens`**: **P1.** Custo por chamada hoje imprevisível; sem evidência de um incidente real (diferente do Assist/Support), mas o risco é estrutural e cresce com o volume de uso.
- **Necessidade de limite de input**: **Nenhuma lacuna — já adequado.** Não é um item pendente.
- **Bug de envio duplicado/retry**: **Nenhum encontrado.** Proteção client-side (`isLoading` + botões desabilitados) já é correta e suficiente para o que ela deveria cobrir.

### 12. Decisão de implementação

Conforme a regra desta tarefa: como não existia, antes desta auditoria, nenhuma política numérica já aprovada para `/api/generate`, **nada foi implementado**. Os números propostos são: seção 4 (8/60s + 150/dia de rate limiting) e seção 5.1 (**2500 tokens de saída, já com base em evidência real de 6 gerações — valor revisado do estimado inicial de 1200, que a própria validação mostrou ser baixo demais**). Ambos são **recomendações aguardando aprovação explícita**, não uma decisão tomada.

### 13. Implementação (aprovada e concluída)

Após aprovação explícita dos números (8/60s + 150/dia de rate limiting, identificador `generate:<sub>`, `max_output_tokens: 2500`), a proteção foi implementada.

**Arquivos alterados**:
- `lib/rate-limit/policies.ts` — nova `GENERATE_RATE_LIMIT_POLICY` (`shortWindow: 8/60s`, `daily: 150/1d`), mesmo formato de `ASSIST_RATE_LIMIT_POLICY`/`SUPPORT_RATE_LIMIT_POLICY`.
- `lib/rate-limit/limiters.ts` — novo `getGenerateRateLimiters()`, memoizado, mesmo padrão de `getAssistRateLimiters()`/`getSupportRateLimiters()`, prefixo `ratelimit:generate`.
- `lib/rate-limit/index.ts` — exporta `getGenerateRateLimiters`/`GENERATE_RATE_LIMIT_POLICY`; comentário de decisão fail-closed atualizado para registrar que agora também cobre `/api/generate`.
- `app/api/generate/route.ts` — rate limiting inserido logo após a autenticação (mesmo fluxo de `/api/support`: auth → identificador `generate:<sub>` → Upstash → validação de payload → OpenAI), `RATE_LIMIT_MESSAGE`/`SERVICE_UNAVAILABLE_MESSAGE` no mesmo padrão, `MAX_OUTPUT_TOKENS = 2500` adicionado à chamada `client.responses.create`. **Nada mais foi alterado nessa chamada** — mesmo `model: "gpt-5-mini"`, mesmo `instructions`/`input` de `buildAiInput()`, sem `reasoning.effort` (mantido ausente, conforme instruído).

**Nenhuma infraestrutura paralela**: reaproveitado 100% de `lib/rate-limit/` já existente — nenhum novo pacote, nenhum novo cliente Redis.

**`components/dashboard-form.tsx`**: **não alterado**. Confirmado que já trata qualquer resposta não-`OK` de forma genérica (`setError(data.error ?? NETWORK_ERROR_MESSAGE)`), sem inspecionar o status — o mesmo padrão que já funcionou sem alteração para os `429`/`503` do Support; nenhum bug real de integração foi encontrado que justificasse mexer no componente.

**Testes reais executados**:
- **A**: `POST /api/generate` sem sessão → `401` (real, contra a rota real).
- **B**: geração dentro do limite → coberta pela própria microvalidação anterior e pelos testes I/H abaixo (rota real exige sessão Supabase, indisponível neste ambiente automatizado — mesma limitação já registrada para o Support na Sprint 17).
- **C**: limite curto — 8 requisições permitidas (`remaining` decrescente de 7 a 0), a 9ª bloqueada (`success:false`), via rota de diagnóstico temporária (`app/api/tmp-generate-ratelimit-test/route.ts`, removida por completo ao final, confirmado via `git status`) usando a mesma infraestrutura/política real.
- **D**: requisição bloqueada → `429` em 359ms (sem latência de OpenAI, que leva vários segundos), confirmando que nenhuma chamada à OpenAI ocorreu.
- **E**: recuperação — após o reset real da janela (confirmado por polling), uma nova requisição voltou a `success:true`.
- **F**: falha do Upstash (fail-closed) — testada com segurança, sobrescrevendo `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` apenas no processo de um servidor de desenvolvimento isolado (sem tocar `.env.local`, sem expor credenciais reais). Confirmado: `POST /api/generate` sem sessão continuou `401` (autenticação independe do Upstash); a mesma infraestrutura usada pela rota real retornou `503` em log limpo (nenhum segredo, nenhuma stack trace).
- **G**: "Gerar novamente" — não é uma chamada diferente da geração normal (reusa a mesma função/payload no cliente, ver auditoria da seção 2); coberto pelos mesmos testes de geração real (I/H).
- **H**: geração com objeção (`preco-esta-caro`, categoria "Negociação") sob o teto real de 2500 tokens → `charLength: 2148`, consistente com o formato de três blocos (a lógica de `buildAiInput()`/`TASK_PROMPTS` não foi alterada nesta tarefa).
- **I**: mesma geração acima → `incompleteDetails: null` e `output_tokens: 1115`, bem abaixo do teto de 2500 — **resposta representativa não foi truncada**.

Total de chamadas reais à OpenAI nesta tarefa (incluindo a microvalidação da mensagem anterior): 6 (microvalidação) + 1 (validação do teto aplicado) = 7, todas deliberadas e justificadas pelo próprio roteiro de teste; nenhuma chamada desnecessária.

**Lint**: ✅ aprovado. **Build**: ✅ aprovado (mesmas 15 rotas, nenhuma rota temporária remanescente).

**Privacidade**: confirmado por leitura de código — `generate:<sub>` só é usado como chave em `checkRateLimit()`, nunca aparece em `instructions`/`input` enviados à OpenAI, nunca é logado (os `console.error` desta rota só registram mensagens genéricas ou tipo de exceção). Redis recebe apenas a chave com hash implícito do identificador (mesma mecânica já usada por Assist/Support) e contadores — nunca contexto, resposta, cenário, objeção, tarefa, e-mail ou nome.

**Regressão**: `/api/assist`, `/api/support`, `lib/rate-limit/redis.ts`, `lib/rate-limit/check.ts`, `lib/rate-limit/identifier.ts` e `components/dashboard-form.tsx` — **zero diferenças** (`git diff --stat` vazio para todos), confirmando que nada relacionado aos agentes ou à autenticação foi tocado.

---

## Tarefa 5 — Controle operacional de custos OpenAI e Upstash (concluída)

Tarefa de auditoria e checklist operacional. **Nenhum código, endpoint, rate limiting, modelo, `max_output_tokens` ou dependência foi alterado.** Nenhuma credencial foi acessada, aberta ou exibida — `.env.local` não foi lido.

### 1. Estado atual do código (confirmado, não alterado)

| Endpoint | Rate limiting | `max_output_tokens` | `reasoning.effort` |
|---|---|---|---|
| `/api/assist` (público, IP c/ hash) | 5/60s + 40/dia | 500 | `"minimal"` |
| `/api/support` (autenticado, `sub`) | 10/60s + 100/dia | 500 | `"minimal"` |
| `/api/generate` (autenticado, `sub`) | 8/60s + 150/dia | 2500 | ausente (padrão do modelo) |

Todos os três já têm fail-closed (sem Upstash válido → `503`, nunca chamam a OpenAI) e nunca enviam identificador/segredo ao modelo — confirmado nas Tarefas 3/4 da Sprint 17 e Tarefa 4 da Sprint 18.

### 2. OpenAI — o que a documentação oficial atual confirma

Consultado diretamente em `developers.openai.com/api/docs/guides/spend-limits` (não presumido):

- **Spend limits (limites de gasto)** — a documentação descreve dois comportamentos possíveis, e **qual deles está de fato disponível depende da conta/projeto**: em contas onde o enforcement rígido está disponível, um spend limit configurado como hard limit faz com que, ao ser cruzado, *"affected API requests return a `429` error"* (`organization_spend_limit_exceeded` ou `project_spend_limit_exceeded`, conforme o nível). Em outras configurações, o spend limit funciona apenas como monitoramento/alerta, sem bloquear tráfego. **Não presumimos aqui qual dos dois comportamentos está habilitado para a conta/projeto da SUZZY AI** — isso precisa ser confirmado manualmente no painel (seção 3).
  - **Ressalva oficial, mesmo quando o enforcement rígido está disponível**: *"Enforcement is not instantaneous, so recorded spend can slightly exceed the configured amount."* — ou seja, mesmo um hard limit não é uma garantia matemática absoluta de "nunca gastar um centavo a mais", apenas um teto que interrompe o tráfego pouco depois de ser cruzado.
  - Depois de atingido, é preciso aumentar/remover o limite manualmente para o tráfego voltar a funcionar.
- **Spend alerts (alertas de gasto)** — quando configurados apenas como alerta (sem enforcement), **não bloqueiam nada**, são notificação. A própria documentação resume: alertas "enviam uma notificação; o tráfego da API continua." Servem para aviso antecipado, não substituem um controle que efetivamente pare requisições.
- **Cobrança pré-paga/créditos** — quando o saldo/crédito da conta se esgota, novas chamadas também tendem a falhar com erro de quota. Isso **não deve ser tratado como proteção instantânea perfeita**: o comportamento exato (se há tolerância, atraso na atualização de saldo, ou pequena margem de excesso) depende da configuração de cobrança da conta, e não foi possível confirmar esse detalhe com precisão na documentação pública consultada — mais um ponto a validar diretamente no painel antes do lançamento.
- **Usage limits (limite de uso)** — um teto mensal que a própria OpenAI atribui à organização, com base no "usage tier" da conta — diferente de qualquer spend limit configurado pelo usuário; não é algo que se "decide" um valor, é atribuído pela OpenAI.
- **Rate limits** — controles técnicos **separados** (requisições/tokens por minuto), documentados à parte; protegem contra picos técnicos, não foram desenhados como controle de gasto acumulado ao longo do tempo.

**Conclusão prudente**: a documentação da OpenAI descreve tanto um comportamento de bloqueio real (spend limit com enforcement, quando disponível) quanto comportamentos que são só monitoramento (alertas, e possivelmente o próprio spend limit, dependendo da conta) — **a configuração realmente disponível para a conta/projeto usado pela SUZZY AI ainda não foi confirmada** e precisa ser verificada manualmente no painel (seção 3) antes do lançamento, em vez de presumida a partir da documentação genérica.

### 3. OpenAI — checklist manual (para o proprietário executar no painel)

| Configuração | Onde procurar | Finalidade | Valor | Bloqueia tráfego ou só monitora/alerta? |
|---|---|---|---|---|
| Spend limit — organização | Organization → Limits | Teto mensal de gasto — bloqueia com `429` **se o enforcement rígido estiver disponível para esta conta**; caso contrário, funciona só como referência/alerta | **DECISÃO DO PROPRIETÁRIO** | **A confirmar no painel** — pode ser hard cap ou só monitoramento, dependendo da conta |
| Spend limit — projeto (se o projeto da SUZZY AI for isolado de outros usos da conta) | Project settings → Limits | Mesmo efeito, mas isolado a este projeto específico | **DECISÃO DO PROPRIETÁRIO** | **A confirmar no painel**, mesma ressalva acima |
| Spend alerts | Organization/Project → Limits (mesma tela dos spend limits) | Aviso antecipado de gasto | **DECISÃO DO PROPRIETÁRIO** (ex.: um valor abaixo do spend limit) | Só alerta — não bloqueia |
| Cobrança pré-paga/saldo de créditos | Billing (painel de faturamento da conta) | Entender se a conta é pré-paga e o que ocorre quando o saldo se esgota | Não aplicável | **A confirmar no painel** — pode gerar erro de quota, mas sem garantia documentada de precisão instantânea |
| Usage dashboard | `platform.openai.com/usage` (ou equivalente atual no painel) | Acompanhar gasto real e uso por dia/modelo | Não aplicável (só visualização) | Nenhum dos dois — é observabilidade |
| Confirmar a qual organização/projeto a `OPENAI_API_KEY` atual pertence | Painel de API Keys | Garantir que qualquer limite configurado realmente se aplica à chave usada pela SUZZY AI | Não aplicável | — |

Nenhum valor monetário foi decidido ou sugerido aqui — todos marcados **DECISÃO DO PROPRIETÁRIO**, conforme instruído. A coluna de bloqueio/alerta foi deliberadamente marcada como **"a confirmar no painel"** onde a documentação genérica não garante qual comportamento se aplica à conta específica da SUZZY AI.

### 4. Upstash — estado da conta (documentação oficial, sem acessar credenciais)

Consultado em `upstash.com/pricing` e documentação de métricas/console:

- **Free** (plano já usado pelo banco `suzzy-ai-ratelimit`, região São Paulo, conforme já registrado na Sprint 17): 256 MB de armazenamento, **500.000 comandos/mês**, 10 GB de bandwidth/mês, até 10.000 comandos/segundo.
- **Pay as You Go**: sem limite de comandos fixo — US$ 0,20 a cada 100.000 comandos, armazenamento além do primeiro GB cobrado à parte, bandwidth grátis até 200 GB/mês. Banco ocioso custa US$ 0.
- **Fixed**: planos de US$ 10 a US$ 1.500/mês, por faixa de armazenamento (250 MB a 500 GB), com comandos "ilimitados" dentro de um teto de comandos/segundo por faixa.
- **Comportamento ao atingir a cota**: a documentação pública confirma esse comportamento explicitamente **apenas para o plano Pay as You Go** — *"We send email notifications when limits are exceeded. We do our best to keep your database running, but we may rate limit depending on the case."* Para o **Free especificamente, a documentação consultada não detalha de forma explícita** o que ocorre ao ultrapassar os 500K comandos/mês (bloqueio total, apenas mais lento, ou erro) — **isso fica registrado como incerteza, não inventado**, e como um item do checklist manual (seção 6) para confirmar diretamente no console quando o uso se aproximar do limite.
- **Alertas de orçamento** (70%/90% do orçamento mensal): documentados como recurso do plano **Pay as You Go**, não do Free — o Free tem um teto fixo, não um "orçamento" configurável com alertas automáticos. Ou seja, **no plano atual (Free), não há alerta automático de proximidade do limite** — apenas os painéis de métricas do console, que exigem checagem manual.
- **Observabilidade disponível**: o console Upstash expõe métricas por banco (comandos, throughput, latência) tanto na listagem de bancos quanto na página de detalhe de cada banco — suficiente para checagem manual periódica, mas sem alerta proativo automático no Free.

**Não recomendo upgrade** — nenhuma necessidade comprovada de tráfego que justifique sair do Free agora (ver estimativa na seção 5).

### 5. Upstash — estimativa de uso (baseada na implementação real, não em suposição)

Cada chamada a `checkRateLimit()` (usada pelos três endpoints) dispara **duas** verificações em paralelo — `shortWindow.limit()` e `daily.limit()` (`lib/rate-limit/check.ts`, `Promise.all`). Cada uma dessas chamadas do SDK `@upstash/ratelimit` executa uma avaliação de script Lua no Redis por via REST — na prática, **aproximadamente 2 comandos Redis por verificação de rate limit**, uma para cada janela. **Esta é uma estimativa de ordem de grandeza, não uma contagem exata** — o metering interno de comandos da Upstash para uma única chamada de script não é garantido pela documentação pública consultada, então não afirmamos um número exato.

Importante: essa verificação acontece em **toda** requisição que chega à rota (autenticada ou não, válida ou não, dentro ou fora do limite) — inclusive requisições bloqueadas, porque o rate limit é checado antes da validação do payload nos três endpoints.

**Estimativa para desenvolvimento + beta fechado + tráfego inicial pequeno** (ordem de grandeza, não precisão):
- Um cenário razoável de beta fechado (dezenas de usuários ativos, uso diário moderado de Support/Generate, tráfego leve no Assist público) fica, por estimativa, na casa de **poucos milhares a poucas dezenas de milhares de comandos por mês** — bem abaixo dos 500.000/mês do Free.
- Mesmo um cenário mais intenso (centenas de usuários ativos gerando dezenas de ações por dia cada) tende a ficar dentro da faixa de **algumas centenas de milhares de comandos/mês** — ainda plausivelmente dentro do Free, mas mais perto do teto.
- **Fator de incerteza real**: como o Assist é público e a checagem de rate limit acontece antes de qualquer validação, tráfego automatizado/bots contra a Landing Page consome comandos Redis mesmo sem gerar nenhuma resposta de IA — esse é o fator mais difícil de estimar com precisão, e o que mais poderia aproximar o uso real do teto do Free antes do esperado.

**Conclusão**: o plano **Free parece suficiente** para desenvolvimento, beta fechado e tráfego inicial pequeno, com folga razoável — mas o consumo deve ser observado no console à medida que o tráfego público (Assist) crescer, já que é o vetor menos previsível.

### 6. Upstash — checklist manual (para o proprietário verificar no console)

| Item | O que verificar |
|---|---|
| Banco correto | Confirmar que o banco usado em produção é o `suzzy-ai-ratelimit` já criado (ou um banco de produção separado, se essa decisão — já registrada como pendência na Tarefa 1 — for tomada) |
| Região | Confirmar que continua em São Paulo (ou a região efetivamente usada em produção) |
| Plano atual | Confirmar que ainda é Free (ou identificar se já migrou) |
| Comandos utilizados no mês | Console → banco → métricas de comandos, comparar com o teto de 500K |
| Armazenamento usado | Console → banco → métricas de armazenamento, comparar com 256 MB |
| Bandwidth usado | Console → banco → métricas de bandwidth, comparar com 10 GB/mês |
| Orçamento/alertas | Confirmar que, no Free, não há alerta automático — decidir se checagem manual periódica é suficiente por ora, ou se migrar para Pay as You Go (que tem alertas em 70%/90%) faz sentido **apenas quando houver necessidade real comprovada**, não preventivamente |

Nenhuma solicitação de upgrade ou cartão foi feita — permanecendo no Free, conforme instruído.

### 7. Proteções em camadas

| Camada | O que é | Protege contra gasto ou só detecta? |
|---|---|---|
| **1. Rate limiting da aplicação (Upstash)** | Políticas por endpoint (seção 1), fail-closed | **Protege de verdade** — impede volume de chamadas acima do configurado, inclusive bloqueando antes de qualquer chamada à OpenAI |
| **2. `max_output_tokens` da aplicação** | Teto de tokens de saída por chamada (500/500/2500) | **Protege de verdade** — limita o custo máximo de cada chamada individual, independente de quantas chamadas ocorrem |
| **3. Rate limits/controles da OpenAI** | Limites técnicos de requisições/tokens por minuto da própria API | **Protege parcialmente** — é uma rede de segurança técnica adicional, não configurada por nós, não pensada para controle de custo por produto |
| **4. Orçamento/monitoramento operacional (OpenAI + Upstash)** | Hard spend limit da OpenAI (protege de verdade, seção 2) + alertas (só detectam) + métricas de console (só detectam) | **Mista** — o hard spend limit da OpenAI protege de verdade; tudo o mais nesta camada (alertas, dashboards) apenas ajuda a detectar, não impede gasto |

**Resumo**: as camadas 1 e 2 (já implementadas em código) são a proteção real e automática contra custo descontrolado. A camada 4 só se torna uma proteção real se o hard spend limit da OpenAI (seção 3) for de fato configurado pelo proprietário — sem isso, um cenário em que as camadas 1/2 falhem ou sejam contornadas (ex.: uma chave vazada usada fora da aplicação) não tem nenhum teto real de gasto.

### 8. Cenários de falha — comportamento atual esperado (sem alterar código)

| Cenário | Comportamento atual |
|---|---|
| **A. OpenAI indisponível** | A chamada `client.responses.create()` lança exceção → `catch` retorna `502` genérico nos três endpoints (comportamento já existente, não alterado por rate limiting) |
| **B. Crédito/saldo/limite da OpenAI atingido** | A chamada à OpenAI falha (erro de quota) → mesmo `catch` → `502` genérico. O usuário final não recebe detalhes internos, mas também não há hoje um tratamento diferenciado desse erro específico — fica registrado como comportamento atual, não como bug novo |
| **C. Upstash indisponível** | Fail-closed nos três endpoints → `503`, sem chamar a OpenAI (comportamento já implementado e testado nas Sprints 17/18) |
| **D. Cota Upstash atingida** (500K comandos/mês do Free) | Comportamento exato **não confirmado pela documentação pública** para o Free (seção 4) — na prática, se o Upstash rejeitar comandos, o SDK lançaria exceção, e o `try/catch` de `checkRateLimit()` já existente trataria isso como fail-closed (`503`) pelo mesmo mecanismo do cenário C. Ou seja: **mesmo sem confirmação exata do comportamento da Upstash, o código já está preparado para tratar isso como fail-closed**, não como fail-open |
| **E. Tráfego anormal (ex.: bot/scraper no Assist)** | Bloqueado pelo rate limiting por IP com hash (Camada 1) a partir da 6ª requisição em 60s ou 41ª no dia — nunca chega à OpenAI |
| **F. Usuário legítimo atingindo o limite da aplicação** | Recebe `429` com mensagem amigável (sem detalhes internos) e `Retry-After` calculado a partir do reset real — comportamento já testado nas Sprints 17/18 para os três endpoints |

### 9. Segredos — confirmado, nada acessado/exposto

Confirmado por busca em todo o projeto (sem abrir `.env.local`, sem imprimir valores): `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` só aparecem em arquivos server-side (`app/api/*/route.ts`, `lib/ai/client.ts`, `lib/rate-limit/redis.ts`) e em `.env.example` (sem valores). Nenhuma delas tem prefixo `NEXT_PUBLIC_`, nenhuma é referenciada em nenhum componente cliente (`"use client"`) ou enviada ao navegador — mesma confirmação já feita nas Tarefas 1/3 da Sprint 18, reconfirmada aqui.

### 10. Classificação

- **P0**: nenhum. A ausência de dashboards avançados ou de alertas automáticos no Free não foi tratada como P0, conforme instruído — as camadas 1/2 (já implementadas) já protegem de verdade contra gasto descontrolado.
- **P1**:
  - Configurar o **hard spend limit** da OpenAI (organização e/ou projeto) — hoje é o único elo real de proteção de custo que ainda depende inteiramente de uma ação manual do proprietário; sem ele, um cenário fora do controle da aplicação (ex.: chave vazada/usada fora do código) não tem teto algum.
  - Confirmar, no console da Upstash, o comportamento real ao se aproximar do teto do Free (não documentado publicamente com precisão) — checagem simples, não bloqueante hoje, mas relevante antes de qualquer crescimento real de tráfego.
- **P2**:
  - Configurar spend alerts da OpenAI (camada de aviso, não de proteção) como complemento ao hard spend limit.
  - Reavaliar plano do Upstash (Free → Pay as You Go) **somente se e quando** o uso real se aproximar do teto — não uma ação atual.
  - Tratamento diferenciado para o cenário B (erro de quota da OpenAI) no futuro, se desejado — hoje cai no mesmo erro genérico `502`, o que já é seguro (não expõe detalhes), só não é diferenciado.

### 11. Ações manuais do proprietário

**OPENAI**
1. Decidir e configurar um **hard spend limit** (organização e/ou projeto) em Organization/Project → Limits — valor em dinheiro é **DECISÃO DO PROPRIETÁRIO**, não sugerido aqui.
2. Configurar **spend alerts** (aviso antecipado, abaixo do hard limit) — valor também **DECISÃO DO PROPRIETÁRIO**.
3. Confirmar a qual organização/projeto a `OPENAI_API_KEY` em uso pela SUZZY AI pertence, para garantir que o limite configurado realmente se aplica a ela.
4. Verificar periodicamente o Usage dashboard da OpenAI para acompanhar gasto real.

**UPSTASH**
1. Confirmar no console qual banco/região está sendo usado (`suzzy-ai-ratelimit`, São Paulo, ou outro definido para produção).
2. Verificar o plano atual (Free) e as métricas de comandos/armazenamento/bandwidth do mês.
3. Observar a tendência de uso à medida que o tráfego público (Assist) crescer — sem ação imediata necessária hoje.
4. Decidir, **somente quando houver necessidade real**, se migra para Pay as You Go (que passaria a oferecer alertas automáticos de orçamento em 70%/90%).

**Nenhuma decisão financeira foi tomada por mim.** Os dois valores de hard spend limit/spend alert da OpenAI precisam da sua decisão explícita antes de serem configurados — não é algo que eu deva ou possa decidir sozinho.

---

## Tarefa 6 — Auditoria final de prontidão jurídica e dados institucionais (concluída)

Tarefa de auditoria e planejamento. **Nenhum documento jurídico, página pública ou código foi alterado.** Nenhum dado institucional foi inventado. Nenhuma interpretação jurídica definitiva foi apresentada como conclusão — apenas constatações técnicas e pontos marcados para revisão profissional.

### 1. Fontes revisadas

Lidos integralmente e comparados nesta tarefa: os quatro documentos-base (`docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/AI_TRANSPARENCY.md`, `docs/COOKIES_POLICY.md`), as quatro páginas públicas correspondentes, e os registros de pendências de `docs/SPRINT-15.md` a `docs/SPRINT-18.md` (Tarefas 1–5 já concluídas desta sprint).

### 2. Dados institucionais

| Dado | Status |
|---|---|
| Responsável legal / razão social | **Pendente de decisão do proprietário** — placeholder `[A CONFIRMAR ANTES DO LANÇAMENTO]` nos 4 documentos |
| Nome comercial ("SUZZY AI") | **Já definido** — usado de forma consistente em todos os documentos e páginas |
| CPF/CNPJ | **Depende de orientação jurídica** — a própria auditoria não presume que CNPJ seja obrigatório em qualquer cenário (ex.: pessoa física operando como autônomo/MEI vs. pessoa jurídica constituída); qual formato de identificação se aplica depende do modelo de negócio efetivamente adotado, algo que só o proprietário (com apoio jurídico) pode definir |
| Endereço | **Pendente de decisão do proprietário** — placeholder em Política de Privacidade e Termos de Uso |
| Cidade/UF/país | **Pendente**, decorrente do item anterior — hoje só se afirma "mercado brasileiro" como escopo de lançamento (Termos, seção 1), sem endereço específico |
| Canal oficial de contato geral | **Pendente** — cada documento tem sua própria seção de contato, todas com placeholder |
| Canal específico de privacidade/LGPD | **Pendente** — Política de Privacidade, seções 9 e 15, ambas com placeholder |
| Encarregado/DPO | **Depende de orientação jurídica** — a LGPD não torna a nomeação de encarregado obrigatória para todos os controladores em todas as situações; se é ou não necessário para o modelo da SUZZY AI é uma pergunta para o checklist do advogado (seção 8 abaixo), não uma decisão técnica |
| Data de vigência dos documentos | **Pendente** — todos os quatro documentos têm `[A CONFIRMAR ANTES DO LANÇAMENTO]` no cabeçalho de versão/data |

Nenhum dado pessoal sensível foi solicitado nesta auditoria, e nenhum é necessário no repositório — os itens acima são dados institucionais/empresariais, não pessoais sensíveis.

### 3. Privacidade / LGPD — cobertura auditada

Confirmado, por comparação linha a linha com o código já auditado nas Tarefas anteriores das Sprints 15–18, que a Política de Privacidade descreve corretamente: autenticação (Supabase, Google OAuth/Magic Link), geração principal, Suzzy Assist, Suzzy Support, OpenAI (três fluxos), Supabase, Upstash, rate limiting, pseudonimização do IP do Assist (nunca chamada de "anônima"), ausência de persistência das conversas dos dois chats, histórico local do Dashboard via `localStorage`, cookies de autenticação, e a ressalva prudente sobre transferências internacionais (incluindo a nota específica sobre a região São Paulo do Upstash, tratada como fato técnico, não conclusão jurídica).

**Nenhuma base legal nova foi criada nesta auditoria** — a seção 5 (Bases legais) já existente permanece como está, já registrada como "enquadramento preliminar", sujeita a revisão profissional.

**Inconsistência factual encontrada — ver seção 12 (decisão B)**: a Política de Privacidade e as páginas públicas descrevem o uso do Upstash e do rate limiting **apenas em relação à Suzzy Assist e à Suzzy Support** (seções 3-E, 6, 8 e 13 de `docs/PRIVACY_POLICY.md`). Desde a Tarefa 4 desta própria Sprint 18, **`/api/generate` (a geração principal, o fluxo pago central) também usa a mesma infraestrutura Upstash, com o mesmo tipo de identificador (`sub`, já usado e divulgado para a Suzzy Support) sob o namespace `generate:<sub>`** — e isso ainda não está refletido em nenhum dos quatro documentos nem nas quatro páginas públicas.

### 4. Termos de Uso — cobertura auditada

Confirmado que os Termos atuais contemplam: natureza da ferramenta de apoio, uso de IA nos três fluxos, possibilidade de erros, necessidade de revisão humana, limitações dos dois agentes de conversa (Support orienta/não executa; Assist informa/não executa ações ou navegação), disponibilidade sem SLA, e rate limiting (seção 11) — com a mesma lacuna da seção 3 acima: a menção a rate limiting cita "os assistentes de conversa Suzzy Assist e Suzzy Support" sem mencionar que `/api/generate` também está protegido dessa forma agora.

**Cláusulas que dependem de cobrança/trial/cancelamento/reembolso/renovação/plano** (seção 10, "Planos, teste gratuito e cobrança"): já tratadas de forma correta e prudente — o documento já afirma explicitamente que **nenhuma** dessas regras está implementada ou é uma obrigação contratual definitiva hoje, e marca a regulamentação comercial definitiva como `[A CONFIRMAR ANTES DO LANÇAMENTO]`. Como a cobrança realmente não existe no código (confirmado repetidamente desde a Sprint 15), **nenhuma regra comercial foi inventada aqui** — o texto atual já é coerente com o estado real do produto.

### 5. Cookies — consistência técnica confirmada

Reconfirmado por auditoria de código (não apenas repetição do já escrito): os dois chats não criam cookie próprio; nenhum dos dois usa `localStorage`; a Suzzy Support continua dependendo exclusivamente da autenticação Supabase já existente (nenhum mecanismo novo introduzido); o rate limiting dos três endpoints pagos (incluindo `/api/generate`, ver seção 3) não depende de cookie nem de armazenamento local — usa exclusivamente Upstash, do lado do servidor; o histórico principal do Dashboard continua sendo `localStorage`, sem sincronização com servidor. A conclusão sobre ausência de necessidade de banner de consentimento **continua explicitamente qualificada como constatação técnica, não parecer jurídico definitivo** (seção 6 de `docs/COOKIES_POLICY.md`) — nenhuma mudança necessária aqui além do mesmo ajuste de escopo do rate limiting (seção 3).

### 6. Transparência sobre IA — cobertura auditada

Confirmado: os três usos atuais (geração principal, Suzzy Assist, Suzzy Support) estão descritos com finalidade, limitações, necessidade de revisão humana, fornecedor (OpenAI) e ausência de autonomia para executar ações — de forma consistente com o código real. Nenhum prompt interno, regra de segurança ou mecanismo anti-manipulação é revelado (confirmado por leitura das seções 2 e 4 de `docs/AI_TRANSPARENCY.md`). Este documento **não menciona rate limiting em detalhe** (só uma frase genérica na seção 3, "mecanismo técnico de controle de limite de uso... operado por outro fornecedor", sem nomear `/api/generate`) — mesma lacuna de escopo já registrada, mas de impacto menor aqui porque o documento já era propositalmente genérico nesse ponto (remete à Política de Privacidade para detalhes).

### 7. Fornecedores — mapeamento

| Fornecedor | Uso real (código) | Citado nos documentos? |
|---|---|---|
| Supabase | Autenticação (login, sessão, logout) | Sim, nos 4 documentos |
| Google | Login OAuth opcional | Sim, nos 4 documentos |
| OpenAI | IA nos três fluxos (geração principal, Assist, Support) | Sim, nos 4 documentos |
| Upstash | Rate limiting de `/api/assist`, `/api/support` **e `/api/generate`** (este último não documentado ainda — seção 3) | Parcialmente — citado, mas com escopo desatualizado |
| Provedor de hospedagem (Vercel, avaliado tecnicamente na Tarefa 3, ainda **não contratado**) | Nenhum uso real ainda — nenhum deploy realizado | Corretamente **não citado** hoje, já que não há contratação real; será necessário adicionar como fornecedor quando a hospedagem for efetivamente contratada |

Nenhuma certificação, país de processamento específico, garantia contratual ou cláusula de suboperador foi inventada — todos os pontos não confirmáveis pelo código permanecem, corretamente, como placeholder ou remetidos à revisão jurídica.

### 8. Checklist para revisão com advogado(a)

Perguntas objetivas, não respondidas aqui como parecer jurídico — apenas levantadas para validação profissional:

- [ ] A identificação do fornecedor do serviço (pessoa física/MEI/pessoa jurídica) está correta e completa para os documentos publicados?
- [ ] O modelo operacional da SUZZY AI (SaaS de apoio via IA, sem armazenamento de dados de clientes de terceiros em banco próprio) está corretamente enquadrado à luz da LGPD?
- [ ] As bases legais listadas (execução de contrato, legítimo interesse, cumprimento de obrigação legal) são as mais adequadas para cada finalidade descrita, ou outras bases deveriam ser consideradas?
- [ ] Os direitos dos titulares descritos (seção 9 da Política de Privacidade) estão completos e corretamente exercíveis diante do estágio atual do produto (sem funcionalidade de autoatendimento para exclusão de conta)?
- [ ] Os prazos/critérios de retenção descritos (dados de conta, histórico local, contadores de rate limiting) são juridicamente suficientes, ou é necessário definir prazos adicionais?
- [ ] Os fornecedores/suboperadores atuais (Supabase, Google, OpenAI, Upstash) exigem cláusulas contratuais específicas (DPA — Data Processing Agreement) já assinadas ou a assinar?
- [ ] Há necessidade de detalhar mais as transferências internacionais de dados (Supabase, Google, OpenAI, e a exceção operacional do Upstash em São Paulo) além do que já está registrado como "ponto a confirmar"?
- [ ] O tratamento de cookies/autenticação atual realmente dispensa banner de consentimento, ou a análise técnica registrada nesta sprint precisa de complementação jurídica?
- [ ] A forma como a IA e suas limitações são comunicadas (Transparência sobre IA) atende aos requisitos de transparência algorítmica aplicáveis?
- [ ] Os termos comerciais atuais (ausência de cobrança, teste gratuito de 15 dias comunicado mas não implementado, "Programa Fundadores") estão adequadamente qualificados como não vinculantes, ou precisam de ajuste de redação?
- [ ] Quando a cobrança for implementada, quais cláusulas de trial, cancelamento e reembolso são exigidas pelo Código de Defesa do Consumidor para esse tipo de serviço?
- [ ] A seção de responsabilidade e limitação de responsabilidade está redigida de forma válida perante o CDC e a legislação civil brasileira?
- [ ] Qual deve ser o canal oficial de privacidade/LGPD, e ele precisa de algum requisito formal específico (e-mail dedicado, prazo de resposta, etc.)?
- [ ] É necessária a nomeação de um encarregado (DPO) para o modelo atual da SUZZY AI, ou isso pode ficar para uma fase posterior?

### 9. Beta fechado vs. lançamento comercial

**Não existe isenção legal por ser beta gratuito.** A LGPD se aplica a qualquer tratamento de dados pessoais de pessoas no Brasil, independentemente de haver cobrança — um beta fechado e gratuito ainda trata e-mail, dados de autenticação, e potencialmente dados pessoais de terceiros que o corretor insira no contexto.

**Pendências que continuariam existindo mesmo em beta fechado** (não eliminadas pela ausência de cobrança):
- Identificação do responsável legal, CNPJ (se aplicável), endereço, canal de privacidade — a LGPD exige transparência sobre quem trata os dados, independentemente de haver receita.
- Revisão jurídica profissional dos documentos — a ausência de cobrança não torna os documentos "menos jurídicos".
- A lacuna de escopo do rate limiting do `/api/generate` nos documentos (seção 3) — é uma questão de precisão factual, não de estágio comercial.
- Direitos dos titulares e retenção de dados — aplicáveis a qualquer usuário, convidado ou não.

**O que muda genuinamente entre os dois cenários**:
- **A. Beta fechado gratuito**: sem cláusulas comerciais vinculantes (cobrança, trial, cancelamento, reembolso) sendo efetivamente testadas com usuários reais — o risco comercial/consumerista é menor, mas o risco de proteção de dados (LGPD) **não** diminui.
- **B. Lançamento público/comercial com planos anunciados**: exige que as cláusulas comerciais (hoje corretamente marcadas como não vinculantes) sejam formalizadas e implementadas antes de cobrar de fato — cobrar sem essas definições e sem revisão do CDC é um risco adicional que não existe em um beta fechado sem cobrança.

Ou seja: um beta fechado reduz o risco comercial/consumerista, mas **não resolve nem adia** as pendências de identificação institucional, canal de privacidade e revisão jurídica geral — essas seriam necessárias mesmo para convidar um único usuário de teste de forma responsável.

### 10. Classificação

**P0 — bloqueia lançamento público/comercial:**
- **Revisão jurídica profissional dos quatro documentos-base.** Problema: nenhum documento foi revisado por advogado(a) habilitado(a); todos trazem aviso interno reconhecendo isso. Quem resolve: **advogado(a)**, contratado(a) pelo proprietário.
- **Identificação institucional completa** (responsável legal, CNPJ se aplicável, endereço, canal de privacidade). Problema: sem isso, os documentos não podem ser publicados em sua forma final — hoje têm placeholders visíveis apenas nos documentos-base internos (as páginas públicas já omitem essa seção, ver Sprint 15, mas o Termos de Uso público também precisaria desses dados numa versão final). Quem resolve: **proprietário**, com apoio de **advogado(a)** para as questões de enquadramento (pessoa física vs. jurídica, necessidade de CNPJ).

**P1 — deve ser resolvido antes ou imediatamente no lançamento:**
- Atualizar a Política de Privacidade, os Termos de Uso e a página de Cookies para mencionar explicitamente que `/api/generate` também usa Upstash/rate limiting com o identificador `sub` (mesma categoria de dado já divulgada para a Suzzy Support) — correção factual pontual, não uma reescrita. **Quem resolve: desenvolvimento** (edição de texto, já autorizada como tarefa futura, não nesta).
- Definir formalmente as regras comerciais (preço final, cobrança, trial, cancelamento, reembolso) **antes** de qualquer cobrança real ser ativada — hoje corretamente marcado como pendente, mas precisa virar decisão antes do lançamento comercial. **Quem resolve: proprietário**, com revisão de **advogado(a)** quanto ao CDC.
- Decidir se e quando implementar exclusão de conta/dados via autoatendimento, ou manter "mediante solicitação" — impacta o texto da seção de direitos do titular. **Quem resolve: proprietário** (produto) + **desenvolvimento** (se implementado).

**P2 — melhoria posterior:**
- Detalhar de forma mais rica a seção de transferências internacionais assim que a hospedagem for contratada e mais informações dos fornecedores forem conhecidas.
- Avaliar necessidade de encarregado/DPO formal — provavelmente não urgente no estágio atual (poucos usuários, sem dados sensíveis em escala), mas fica registrado no checklist do advogado.
- Adicionar o provedor de hospedagem como fornecedor nos documentos assim que for contratado (Vercel ou outro).

### 11. Checklist do proprietário

- [ ] Definir a identificação institucional: responsável legal/razão social, CNPJ (se aplicável), endereço.
- [ ] Definir o canal oficial de contato geral e o canal específico de privacidade/LGPD.
- [ ] Contratar/consultar advogado(a) para revisão dos quatro documentos-base, usando o checklist da seção 8 como ponto de partida.
- [ ] Confirmar, com apoio jurídico, se a operação exige CNPJ/pessoa jurídica ou pode operar como pessoa física/autônomo nesta fase.
- [ ] Decidir se o lançamento inicial será beta fechado gratuito ou já com cobrança real — essa decisão direciona a urgência das pendências comerciais (seção 9).
- [ ] Definir as regras comerciais definitivas (preço final, forma de cobrança, trial, cancelamento, reembolso, condições do Programa Fundadores) quando a cobrança for implementada.
- [ ] Fornecer, quando decidido, os dados institucionais acima para atualização dos documentos — **não enviar CPF, documentos pessoais, senhas ou credenciais neste chat**; apenas os dados institucionais textuais necessários (razão social, CNPJ, endereço, canal de contato).

### 12. Decisão sobre alteração dos documentos

**B — existe uma inconsistência factual comprovada, documentada na seção 3, que exige correção de conteúdo**: os quatro documentos jurídicos (com maior relevância em `docs/PRIVACY_POLICY.md` e `docs/TERMS_OF_USE.md`) descrevem o uso do Upstash/rate limiting apenas em relação à Suzzy Assist e à Suzzy Support, mas desde a Tarefa 4 desta sprint `/api/generate` também usa essa infraestrutura com o identificador `sub`. **Não corrigido nesta tarefa** — fica registrado, classificado como P1 (seção 10), aguardando aprovação explícita antes de qualquer edição dos documentos ou páginas públicas.

Fora esse ponto pontual, os quatro documentos estão **tecnicamente coerentes** com a implementação real — a auditoria não encontrou nenhuma outra afirmação não comprovada, nenhuma promessa técnica inexistente, nenhum uso indevido do termo "anônimo", e nenhuma base legal inventada. O que falta, além do ponto acima, é **dado institucional e revisão profissional** (grupo A), não correção de conteúdo técnico.

---

## Microcorreção — Escopo do rate limiting nos documentos jurídicos e páginas públicas (concluída)

Correção de consistência factual, aprovada e aplicada, referente à inconsistência B registrada no fechamento da Tarefa 6: os quatro documentos-base e as quatro páginas públicas descreviam o uso do Upstash/rate limiting apenas em relação à Suzzy Assist e à Suzzy Support, sem mencionar que `POST /api/generate` também usa a mesma infraestrutura desde a Tarefa 4 desta sprint. **Nenhuma política de rate limiting, endpoint, autenticação ou dependência foi alterada** — apenas texto.

**Arquivos alterados**:
- `docs/PRIVACY_POLICY.md` — seção 3-E (título e parágrafos de rate limiting, unificando o identificador de Support/geração principal), seção 4 (finalidades), seção 6 (Upstash), seção 7 (cookies/armazenamento), seção 8 (retenção) e seção 13 (transferências internacionais).
- `docs/TERMS_OF_USE.md` — seção 11 (disponibilidade/rate limiting).
- `docs/AI_TRANSPARENCY.md` — seção 3 (processamento por fornecedor externo/Upstash).
- `docs/COOKIES_POLICY.md` — seção 4 (chats), com uma nova linha específica para a geração principal.
- `app/privacidade/page.tsx`, `app/termos/page.tsx`, `app/ia/page.tsx`, `app/cookies/page.tsx` — mesmas correções, espelhando os documentos-base, sem alterar padrão visual nem adicionar detalhe técnico desnecessário (nenhum namespace como `generate:<sub>` foi exposto ao público — apenas "identificador interno de conta", mesma linguagem já usada para a Suzzy Support).

**O que foi corrigido**: em todos os pontos relevantes, o texto passou de "rate limiting da Suzzy Assist e da Suzzy Support" para "rate limiting da geração principal, da Suzzy Assist e da Suzzy Support" (ou variação equivalente), com o identificador da geração principal descrito como o mesmo tipo já usado pela Suzzy Support — um identificador interno de conta, reaproveitado da autenticação, nunca enviado à OpenAI.

**Consistência confirmada após a correção**:
- Os três fluxos de IA (geração principal, Suzzy Assist, Suzzy Support) ficam cobertos pela menção ao rate limiting em todos os quatro documentos e páginas.
- A pseudonimização de IP continua descrita **somente** para a Suzzy Assist — não alterado, não estendido a nenhum outro fluxo.
- O identificador interno de conta é descrito para Suzzy Support **e** geração principal, de forma unificada (mesmo tipo de dado, mesmo tratamento).
- Nenhum identificador é chamado de "anônimo" em nenhum documento ou página (confirmado por revisão de todo o texto alterado).
- Todos os pontos reforçam explicitamente que nenhum identificador é enviado à OpenAI.
- Todos os pontos reforçam explicitamente que o conteúdo do contexto, das respostas geradas e das mensagens dos chats nunca é armazenado no Redis pelo rate limiting — apenas identificador e contador.

**Testes**: `npm run lint` ✅ | `npm run build` ✅ (mesmas 15 rotas, nenhuma regressão).

**Confirmação de escopo**: `git status` confirma que, além dos quatro documentos e quatro páginas, nenhum outro arquivo foi tocado nesta correção — `app/api/generate/route.ts`, `lib/rate-limit/*`, autenticação, Dashboard, Landing Page (fora do rodapé/links já existentes) e dependências permanecem exatamente como estavam ao final da Tarefa 4.

---

## Tarefa 7 — Auditoria de prontidão comercial e operacional (concluída)

Tarefa de auditoria e planejamento. **Nenhum código, dependência, endpoint, autenticação, Landing Page ou documento jurídico foi alterado.**

### 1–2. Inventário das promessas comerciais (Landing Page real, `app/page.tsx`, lida integralmente)

| Promessa/recurso | Onde aparece | O que o usuário entende | Existe tecnicamente? | Depende de cobrança? | Classificação |
|---|---|---|---|---|---|
| Teste gratuito de 15 dias | Hero, FAQ, Planos, CTA final | Tem 15 dias de uso, depois é cobrado ou perde acesso | **Não** — login dá acesso completo e permanente, sem expiração de trial no código | Sim (a transição trial→cobrança) | **P0 para lançamento comercial real; P2 para beta gratuito** (a ausência de expiração não prejudica ninguém se ninguém for cobrado) |
| "Sem cartão de crédito" | Hero, FAQ, Planos, CTA final | Não precisa inserir cartão para testar | **Sim, literalmente verdadeiro hoje** — mas por não existir cobrança alguma, não por ser uma política deliberada de trial sem cartão | Não | Nenhuma ação necessária hoje; reavaliar quando cobrança existir |
| Cobrança de R$ 97/mês após o trial | Seção Planos | Será cobrado automaticamente após 15 dias | **Não** — nenhuma infraestrutura de cobrança existe (seção 3) | Sim | **P0 para lançamento comercial; não aplicável a beta gratuito** |
| Plano "Pequena Imobiliária" (R$ 247/mês) | Seção Planos | Ainda não disponível | **Corretamente sinalizado como indisponível** — badge "Em desenvolvimento", botão "Avise-me quando estiver disponível" **desabilitado** (`disabled`, sem `onClick`) — não coleta nenhum contato, é puramente decorativo | Não | **P2** — se a intenção é realmente coletar interesse, falta implementar; se não, o botão desabilitado já é honesto (não promete o que não faz) |
| Programa Fundadores — preço garantido por 12 meses | Seção dedicada | Preço não muda por 1 ano | **Não** — não há conceito de "assinatura" nem de preço vinculado a conta alguma | Sim | **P0 para lançamento comercial com cobrança; P2 para beta** |
| Programa Fundadores — "100 primeiros assinantes" | Seção dedicada | Vaga limitada, cadastro após o 100º não teria a oferta | **Não** — não existe contador de assinantes, nem qualquer registro de quem é "fundador"; qualquer pessoa que se cadastre (1ª ou 1000ª) recebe exatamente o mesmo acesso | Sim (é uma oferta comercial) | **P0 para lançamento comercial** (risco de propaganda enganosa se a vaga limitada não for real); **P1 para beta fechado** (se o beta em si já for limitado por convite, a contagem pode ser feita manualmente) |
| Programa Fundadores — acesso antecipado a funcionalidades | Seção dedicada | Vê novidades antes dos demais usuários | **Não** — não existe nenhuma segmentação de usuários; todos usam exatamente a mesma versão do produto | Não necessariamente | **P2** — só relevante quando houver um segundo grupo de usuários "não fundadores" para comparar |
| "Histórico" como recurso do plano | Lista de features do plano | Histórico de gerações disponível | **Sim, mas local ao navegador** (`localStorage`), sem sincronização — já corretamente descrito assim nos documentos jurídicos | Não | Nenhuma ação — a Landing Page não promete mais do que isso (não diz "na nuvem" nem "em qualquer dispositivo") |
| "Respostas com IA", "Cenários", "Objeções", "Estratégias de negociação" | Lista de features, seções de recursos | Funcionalidades centrais do produto | **Sim, implementadas e funcionais** | Não | Nenhuma ação |
| "Sem compromisso" | CTA final | Pode parar de usar quando quiser, sem obrigação | **Verdadeiro hoje**, pela mesma razão do "sem cartão" — não há nada a cancelar porque não há cobrança | Não | Reavaliar quando cobrança existir (aí "sem compromisso" precisaria virar uma política real de cancelamento) |

### 3. Cobrança — infraestrutura real

Busca em todo o repositório (código, não documentação) por: checkout, assinatura, pagamento, webhook, customer ID, subscription ID, controle de plano, trial técnico, bloqueio pós-trial, upgrade/downgrade, cancelamento, reembolso, fatura, status de assinatura, Stripe, Mercado Pago.

**Nenhum desses itens existe no código.** Os únicos resultados encontrados foram menções em texto/documentação (`docs/SPRINT-15.md`, `docs/SPRINT-18.md`) e nos campos de dados da base de conhecimento da Suzzy Assist (`lib/agents/assist-knowledge.ts`), que **já lista explicitamente como "não confirmado"**: cobrança automática, meios de pagamento aceitos, política de reembolso, renovação automática — ou seja, o próprio agente de IA já foi instruído a não prometer nada disso. `package.json` não tem nenhuma dependência de gateway de pagamento.

**Registrado explicitamente**: não existe checkout, assinatura, pagamento, webhook, customer ID, subscription ID, controle de plano, trial técnico, bloqueio após trial, upgrade/downgrade, cancelamento, reembolso, fatura ou status de assinatura em nenhuma parte do código.

### 4. Acesso atual ao produto (autenticação vs. autorização comercial)

Evidência direta de código (`app/login/page.tsx`, `app/dashboard/page.tsx`, `app/api/generate/route.ts`):

- **Qualquer usuário autenticado consegue usar `/api/generate`?** Sim — o único portão é `supabase.auth.getClaims()`. Não há nenhuma checagem de plano, status de pagamento ou trial.
- **Existe distinção entre plano gratuito/pago?** Não — não existe o conceito de "plano" em lugar nenhum do código (confirmado por busca por `user_metadata`/`app_metadata`/`role`/`plan` em `lib/supabase/`: nenhuma ocorrência).
- **Existe limite de gerações ligado ao plano?** Não — o único limite existente é o rate limiting técnico da Tarefa 4 (8/60s + 150/dia), igual para todo mundo, não ligado a plano algum.
- **Existe expiração de trial?** Não.
- **Existe bloqueio por status de pagamento?** Não.
- **Existe papel administrativo (admin)?** Não — nenhuma rota, componente ou checagem de "role" foi encontrada em todo o projeto.
- **Existe aprovação manual de conta?** Não — o texto do próprio login confirma: *"Novo por aqui? Sua conta é criada automaticamente no primeiro acesso."*
- **Existe mecanismo de convite/beta fechado?** Não — login é público (Google OAuth ou Magic Link, sem lista de convidados, sem allowlist de e-mail).

**Conclusão**: **autenticação** (provar quem é o usuário) está implementada e funciona bem. **Autorização comercial** (o que esse usuário tem direito de usar, conforme plano/pagamento) **não existe** — hoje, "autenticado" e "tem acesso completo para sempre, de graça" são a mesma coisa.

### 5. Programa Fundadores — promessa vs. implementação

| Item prometido | Classificação |
|---|---|
| 100 vagas | **Marketing** — nenhum contador técnico existe |
| 12 meses de preço garantido | **Marketing** — não há conceito de assinatura para "garantir" nada |
| Acesso antecipado | **Marketing** — não há segmentação de usuários |
| Forma de entrada | **Tecnicamente implementada, mas genérica** — é o mesmo login de qualquer usuário, sem nenhum passo específico de "virar Fundador" |
| Controle técnico das vagas | **Inexistente** |
| Controle da data de início/fim | **Inexistente** |
| Vínculo do benefício à conta | **Inexistente** — nenhum dado é gravado na conta indicando que ela é "Fundadora" |

**Hoje, o Programa Fundadores é inteiramente uma promessa de marketing, sem nenhum suporte técnico ou operacional.** Isso não é necessariamente um problema para um beta fechado sem cobrança (ninguém é prejudicado por uma vaga "não contada"), mas é um risco real assim que houver cobrança e divulgação pública ampla — nesse ponto, "100 vagas" precisa corresponder a um número real e verificável.

### 6. Modelo operacional mínimo para beta fechado (proposta, não implementada)

- **Como limitar quem entra**: hoje não há allowlist técnica. No curto prazo, a única forma de limitar é **operacional**: convidar pessoas individualmente (link direto, sem divulgação pública do login) e/ou revisar manualmente quem se cadastrou, removendo acesso de quem não foi convidado (não há função de bloqueio de conta implementada — teria que ser feito diretamente no painel do Supabase).
- **Quantos usuários iniciais seriam administráveis**: **recomendação operacional, não requisito técnico** — uma faixa pequena (dezenas, não centenas) é mais administrável manualmente, dado que hoje não há painel administrativo, nem alertas de uso por conta, nem processo de suporte formal. O número exato é uma decisão do proprietário, não algo que a auditoria determina tecnicamente.
- **Precisa de cobrança no beta?** Não, tecnicamente — o produto já funciona de ponta a ponta sem cobrança nenhuma. A decisão de cobrar ou não no beta é comercial (seção 11).
- **Como coletar feedback**: hoje não há mecanismo formal nenhum (sem formulário, sem pesquisa, sem canal dedicado) — precisaria ser um processo manual (e-mail direto, conversa, formulário externo).
- **Como oferecer suporte**: ver seção 7 — hoje só a Suzzy Support (IA), sem canal humano.
- **Como acompanhar custo**: já coberto na Tarefa 5 desta sprint (painéis da OpenAI e da Upstash) — nenhuma novidade aqui, só reforçando que isso vale também para o beta.
- **Como remover acesso em caso de abuso**: hoje, apenas manualmente pelo painel do Supabase (desabilitar/excluir o usuário) — não existe um mecanismo de suspensão de conta no código da aplicação.
- **Recursos que podem permanecer manuais temporariamente**: convite/seleção de quem entra, feedback, suporte administrativo, controle de vagas do Programa Fundadores, remoção de acesso em abuso — todos podem ser geridos manualmente por enquanto, desde que o volume de usuários seja pequeno o suficiente para isso ser administrável (daí a recomendação da faixa reduzida acima).

**Comparação dos três modelos**:

| | A. Beta fechado gratuito | B. Beta fechado pago | C. Lançamento público/comercial |
|---|---|---|---|
| Cobrança real necessária | Não | **Sim** — mas não existe infraestrutura (seção 3) | **Sim** — mesma lacuna |
| Promessas do Programa Fundadores precisam ser reais | Reduzido (sem dinheiro envolvido) | **Sim** — cobrar com base em uma promessa não cumprida tecnicamente é risco real | **Sim** |
| Canal humano de suporte | Recomendado, não bloqueante para poucos usuários convidados | **Necessário** — há dinheiro e expectativa de atendimento envolvidos | **Necessário** |
| Controle de acesso/convite | Pode ser manual | Pode ser manual, mas cobrança sem controle de acesso é mais arriscada | Login público, sem controle — coerente com "lançamento público" |
| Pendências jurídicas (Tarefa 6) | Ainda existem (LGPD não depende de cobrança) | Ainda existem, **mais urgentes** (CDC entra em jogo) | Mais urgentes ainda |

### 7. Suporte humano

**Não existe, hoje, nenhum canal de suporte humano visível ou funcional** — nenhum e-mail, formulário, chat humano ou telefone foi encontrado em nenhuma página pública ou documento (os placeholders de contato em todos os quatro documentos jurídicos seguem como `[A CONFIRMAR ANTES DO LANÇAMENTO]`, conforme já registrado na Tarefa 6).

**Distinção importante, já registrada nos documentos jurídicos (Tarefa 5/6) e reforçada aqui**: a Suzzy Assist (pública, informativa) e a Suzzy Support (autenticada, orientação de uso) são agentes de IA — **não substituem** um canal humano para questões administrativas, de cobrança, de privacidade/LGPD ou de problemas de conta. Nenhuma delas tem acesso a dados de conta, não pode alterar cobrança (que nem existe), não pode excluir dados, e ambas já são instruídas (bases de conhecimento) a não prometer ações que não executam.

**Mínimo necessário antes de cada estágio**:
- **Beta fechado**: um canal informal (e-mail pessoal do proprietário, por exemplo) já cobre um pequeno grupo convidado — não é preciso uma central de atendimento.
- **Cobrança real**: um canal de suporte minimamente formal, capaz de responder sobre cobrança/cancelamento em tempo hábil — mesmo que seja uma única pessoa, precisa existir e estar divulgado.
- **Lançamento público**: um canal de suporte com capacidade de responder ao volume esperado, mais o canal específico de privacidade/LGPD (já pendente na Tarefa 6).

Nenhum e-mail ou endereço fictício foi criado ou sugerido aqui — a decisão de qual canal usar é do proprietário (seção 11).

### 8. Cancelamento e exclusão de conta

**A. Cancelamento comercial**: não existe, porque não existe cobrança para cancelar (seção 3). Não aplicável hoje.

**B. Exclusão de conta/dados**: **não existe nenhum fluxo de autoatendimento** — confirmado por inventário completo de rotas do projeto (`app/auth/logout/route.ts`, `app/auth/callback/route.ts`, `app/api/generate|assist|support/route.ts` são as únicas cinco rotas do projeto). `logout` apenas encerra a sessão (`supabase.auth.signOut()`) — **não exclui a conta nem qualquer dado**. Isso já está corretamente documentado na Política de Privacidade e nos Termos de Uso (Tarefa 15, "não existe... funcionalidade de autoatendimento para exclusão de conta").

**O que pode ser manual no beta**: uma solicitação de exclusão pode ser atendida manualmente pelo proprietário diretamente no painel do Supabase (exclusão do usuário) — funcional para um pequeno número de usuários.

**O que precisará de fluxo formal antes de escala/cobrança**: um mecanismo de autoatendimento (ou processo documentado com prazo de resposta) para exclusão de conta/dados, exigido pela LGPD independentemente de haver cobrança — e um fluxo de cancelamento comercial formal assim que a cobrança existir.

### 9. Monitoramento operacional

Reconfirmado nesta tarefa (mesmo estado já registrado na Tarefa 1 desta sprint, sem mudanças desde então):

| Área | Existe no código? | Existe via fornecedor? | Processo manual/inexistente |
|---|---|---|---|
| Erros | `console.error` genérico nas 3 rotas de IA (sem PII/segredos) | — | Sem agregação/alerta automático |
| Logs | Só os logs brutos do runtime (visíveis no provedor de hospedagem, quando houver) | Depende do provedor de hospedagem (ainda não contratado) | — |
| Disponibilidade | — | Depende do uptime da Vercel/Supabase/OpenAI/Upstash (fora do nosso controle) | Nenhum monitoramento próprio de uptime |
| Custos OpenAI | `max_output_tokens` limita custo por chamada | Usage dashboard da OpenAI (Tarefa 5) | Hard spend limit ainda não configurado (Tarefa 5) |
| Uso Upstash | Rate limiting em si já é a proteção | Métricas do console Upstash (Tarefa 5) | Sem alerta automático no plano Free |
| Abuso | Rate limiting (Camada 1, Tarefa 4/5) | — | Sem detecção de padrões anômalos além do rate limit |
| Falhas de autenticação | `401` padronizado nas rotas protegidas | Painel do Supabase (logs de auth) | — |
| Falhas de geração | `502` genérico, sem detalhe exposto | — | Sem alerta quando a taxa de erro sobe |
| Incidentes | — | — | **Nenhum processo formal de resposta a incidentes existe hoje** |

Nenhuma ferramenta de observabilidade foi instalada nesta tarefa — apenas confirmado o estado já existente.

### 10. Backup e recuperação

Reconfirmado por auditoria de código: **nenhuma chamada `supabase.from(...)` ou `.storage` existe em todo o projeto** — o Supabase é usado exclusivamente para autenticação. Portanto:
- **Dados que exigem backup**: só os registros de autenticação dos usuários (e-mail, identificador `sub`, metadados do provedor OAuth) — geridos inteiramente pela infraestrutura/plano do Supabase, não verificável nem configurável a partir deste repositório.
- **Dados que permanecem só no navegador** (sem backup algum, por design): histórico de gerações (`localStorage`) e as conversas dos chats Assist/Support (nem sequer `localStorage`, só memória da página).
- **Risco de perda de dados**: real, mas **aceito por design** — o histórico local já é documentado nos termos como não sincronizado nem recuperável se perdido localmente. Não é uma falha nova encontrada nesta tarefa, é uma característica já conhecida e comunicada.
- **Plano de recuperação formal**: não existe um plano documentado para incidente de indisponibilidade/perda de dados do lado do Supabase — depende inteiramente da política de backup do plano contratado no Supabase, não confirmada aqui (mesma pendência já registrada na Tarefa 1).

Nada foi afirmado aqui sobre a existência de backup automático sem comprovação — o que não pôde ser confirmado ficou explicitamente marcado como não verificável.

### 11. Decisões comerciais/operacionais do proprietário

- [ ] Beta fechado ou lançamento público?
- [ ] Beta gratuito ou pago?
- [ ] Manter as promessas atuais de trial de 15 dias (e implementá-las tecnicamente) ou ajustar a comunicação enquanto não há cobrança?
- [ ] Quando implementar cobrança real?
- [ ] Qual gateway de pagamento considerar — decisão para uma comparação dedicada futura, não recomendada aqui.
- [ ] Como funcionará o cancelamento comercial quando a cobrança existir?
- [ ] Como funcionará a exclusão de conta/dados (autoatendimento vs. solicitação manual)?
- [ ] Qual será o canal humano de suporte (e quando ele precisa existir, conforme a seção 7)?
- [ ] Como operar o Programa Fundadores enquanto não há controle técnico de vagas — pausar a divulgação, controlar manualmente, ou implementar o controle antes de continuar divulgando?
- [ ] Quais métricas determinam a saída do beta fechado para a próxima fase (número de usuários, feedback, estabilidade, custo observado)?

Nenhuma dessas decisões foi tomada nesta auditoria.

### 12. Classificação (P0/P1/P2) — dependente do modelo de lançamento

**P0 para lançamento público/comercial com cobrança real** (não necessariamente P0 para beta gratuito — diferença registrada explicitamente):
- Ausência total de infraestrutura de cobrança (checkout, assinatura, webhook, cancelamento) — bloqueia qualquer cobrança real.
- Programa Fundadores sem nenhum controle técnico de vagas/benefício — risco de propaganda enganosa se divulgado amplamente com dinheiro envolvido.
- Ausência de canal humano de suporte — inaceitável para clientes pagantes.
- Pendências jurídicas já P0 na Tarefa 6 (revisão profissional, dados institucionais) — continuam P0 aqui.

**P1 — resolver antes ou imediatamente no lançamento (do modelo escolhido)**:
- Decisão explícita sobre o texto de trial/cobrança da Landing Page enquanto a cobrança não existe (mantê-lo como está — arriscado se divulgado amplamente — ou ajustar a comunicação).
- Fluxo de exclusão de conta/dados (ao menos processo manual documentado, formalizado antes de escalar).
- Processo mínimo de resposta a incidentes (ainda que informal) antes de qualquer tráfego real não controlado.

**P2 — melhoria posterior**:
- Painel administrativo mínimo (hoje inexistente, tudo é feito diretamente no painel do Supabase).
- Mecanismo de coleta de feedback formal.
- Segmentação técnica de usuários "Fundadores" (só relevante quando houver usuários não-Fundadores para comparar).
- Observabilidade/monitoramento de erros além do `console.error`.

### 13. Go/No-Go por cenário (insumo para a Tarefa 8 — não é a decisão final da sprint)

**A. Beta fechado gratuito**
**GO COM CONDIÇÕES.**
- Bloqueadores: nenhum técnico. Prontidão técnica já aprovada (Sprint 17/Tarefas 1–5 desta sprint).
- Condições mínimas: convite manual/controlado (sem divulgação pública do login), decisão consciente de manter ou ajustar o texto de trial/cobrança da Landing Page para não criar expectativa de cobrança que não vai ocorrer, canal de suporte informal definido, processo manual de exclusão de conta caso solicitado.
- Pendências jurídicas (Tarefa 6) continuam existindo, mas não são um bloqueador técnico para convidar um grupo pequeno e controlado.

**B. Beta fechado pago**
**NO-GO, hoje.**
- Bloqueadores: nenhuma infraestrutura de cobrança existe; Programa Fundadores sem controle técnico; sem canal humano de suporte formal; pendências jurídicas do CDC mais urgentes ao cobrar de verdade.
- Condições mínimas para virar GO: implementar cobrança real (fora do escopo desta tarefa), definir e divulgar canal de suporte, revisão jurídica ao menos dos termos comerciais.

**C. Lançamento público/comercial**
**NO-GO, hoje.**
- Bloqueadores: todos os itens P0 da seção 12, mais os P0 já registrados nas Tarefas 1, 3 e 6 desta sprint (hospedagem não confirmada/contratada, identificação institucional, revisão jurídica profissional).
- Condições mínimas para virar GO: resolver todos os P0 técnicos (Tarefas 1–5), jurídicos (Tarefa 6) e comerciais (esta tarefa) — decisão formal fica para a Tarefa 8.

---

## Tarefa 8 — Validação final, encerramento e decisão formal de Go/No-Go (concluída)

Tarefa de validação e documentação. **Nesta Tarefa 8, o único arquivo alterado foi `docs/SPRINT-18.md`.** Todas as demais alterações listadas no `git status` (`app/api/generate/route.ts`, as quatro páginas públicas, os quatro documentos jurídicos, `lib/rate-limit/*`, `next.config.ts`, `package.json`/`package-lock.json`) são **acumuladas das Tarefas 2, 4 e da microcorreção desta sprint** — não foram tocadas agora, e o `git diff --stat HEAD` confirma exatamente esse conjunto (15 arquivos, os mesmos desde a microcorreção).

### 1–3. Estado final confirmado por leitura direta do código (não presumido dos relatórios anteriores)

Os três arquivos de rota (`app/api/generate/route.ts`, `app/api/assist/route.ts`, `app/api/support/route.ts`), `lib/rate-limit/policies.ts`, `next.config.ts` e `package.json` foram lidos integralmente nesta tarefa. Confirmado, sem divergência em relação ao já registrado:

| | Generate | Assist | Support |
|---|---|---|---|
| Autenticação antes do rate limiting | ✅ (`getClaims()` → `401` antes de qualquer consulta ao Upstash) | não aplicável (pública) | ✅ |
| Janela curta | 8/60s | 5/60s | 10/60s |
| Diário | 150/dia | 40/dia | 100/dia |
| Identificador | `generate:<sub>` (interno de conta) | `assist:<hash sha256 do IP>` | `support:<sub>` (interno de conta) |
| Fail-closed (Upstash indisponível → `503`, sem chamar OpenAI) | ✅ | ✅ | ✅ |
| `429` com `Retry-After` ao exceder | ✅ | ✅ | ✅ |
| Identificador enviado à OpenAI | **Nunca** (confirmado: `identifier`/`sub`/hash não aparecem em `input`/`instructions` em nenhuma das três rotas) | **Nunca** | **Nunca** |
| Redis recebe conteúdo de conversa/geração | **Não** — só chave + contador (mesma conclusão de `checkRateLimit()`, inalterada) | **Não** | **Não** |
| Modelo | `gpt-5-mini` | `gpt-5-mini` | `gpt-5-mini` |
| `max_output_tokens` | **2500** | 500 | 500 |
| `reasoning.effort` | ausente (padrão do modelo) | `"minimal"` | `"minimal"` |
| Chamadas à OpenAI por requisição | Exatamente 1, sem retry | Exatamente 1, sem retry | Exatamente 1, sem retry |
| Resultado representativo sem truncamento | ✅ — validado na Tarefa 4 (`incompleteDetails: null`, 1115/2500 tokens usados no pior caso testado sob o teto real) | Já validado nas Sprints 16/17 | Já validado nas Sprints 16/17 |

`next.config.ts` confirma `agentRules: false` (microtarefa entre as Tarefas 2 e 3) e `turbopack.root`, nada além disso. `package.json` confirma `next@16.3.0`, nenhuma dependência nova além de `@upstash/redis`/`@upstash/ratelimit` (já da Sprint 17) — **sem `engines`**, pendência de fixação de versão do Node ainda aberta (Tarefa 1).

### 4. Segurança e segredos

Reconfirmado por leitura de código (sem abrir `.env.local`): `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` são **privadas**, usadas somente em arquivos server-side (`app/api/*/route.ts`, `lib/ai/client.ts`, `lib/rate-limit/redis.ts`), nenhuma com prefixo `NEXT_PUBLIC_`. `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` são **públicas por design** (chave publicável do Supabase). Busca no bundle cliente do build desta tarefa (`.next/static`) por `UPSTASH`/`OPENAI_API_KEY` — **nenhuma ocorrência**. Nenhum identificador de rate limiting é enviado à OpenAI (confirmado acima, seção 1–3).

### 5. `npm audit`

3 vulnerabilidades altas, 0 críticas/moderadas/baixas — `brace-expansion`, `js-yaml`, `nanoid`, todas transitivas de ferramentas de desenvolvimento (`eslint`/`@tailwindcss/postcss`), nenhuma runtime/produção. **Idêntico ao estado pós-Tarefa 2** — nenhuma vulnerabilidade nova, nenhuma das três de produção (`next`, `postcss`, `sharp`) permanece (já resolvidas na Tarefa 2). Nenhuma correção executada nesta tarefa.

### 6. Lint e build

`npm run lint` ✅. `npm run build` ✅ — 15 rotas geradas (7 estáticas: `/`, `/_not-found`, `/cookies`, `/ia`, `/login`, `/privacidade`, `/termos`; 6 dinâmicas: `/api/assist`, `/api/generate`, `/api/support`, `/auth/callback`, `/auth/logout`, `/dashboard`; mais o Proxy/Middleware) — mesma contagem de todas as tarefas anteriores desta sprint, nenhuma rota nova nem removida.

### 7. Regressão funcional (testes reais)

Servidor local iniciado e testado ao vivo: `/` → `200`; `/login` → `200`; `/privacidade`, `/termos`, `/ia`, `/cookies` → `200`; `/dashboard` sem sessão → `307` para `/login`; `POST /api/support` sem sessão → `401`; `POST /api/generate` sem sessão → `401`; `POST /api/assist` com payloads inválidos em sequência → `400` × 5 seguido de `429` na 6ª (rate limiting confirmado ativo). Nenhuma chamada à OpenAI foi feita nesta bateria de testes (nenhuma delas exigia).

**Declarado claramente, como nas Sprints 17 e 18 anteriores**: não há sessão Supabase autenticada disponível neste ambiente automatizado — portanto, uma geração real via `/api/generate`/`/api/support` com sessão real não pôde ser testada agora. A validação de que uma resposta representativa não é truncada sob o teto de 2500 tokens já foi feita com evidência real na Tarefa 4 (não repetida aqui para não gastar chamadas OpenAI desnecessárias). Recomenda-se um teste manual real no navegador, autenticado, antes do início de qualquer beta com usuários reais.

### 8. Documentação jurídica — correspondência final

Confirmado por busca direta: a expressão "geração principal" aparece nos quatro documentos-base **e** nas quatro páginas públicas (31 ocorrências no total), confirmando que os três fluxos de IA (geração principal, Suzzy Assist, Suzzy Support) estão cobertos de forma consistente em ambos os lados, incluindo a menção ao rate limiting da geração principal corrigida na microcorreção desta sprint. Nenhuma nova interpretação jurídica foi feita — apenas confirmação de correspondência textual/factual.

### 9. Infraestrutura de produção — estado real

| Item | Estado |
|---|---|
| Hospedagem | **NÃO CONFIGURADO** — avaliada tecnicamente como adequada (Vercel, Tarefa 3), mas não contratada nem deployada. Ausência de domínio **não é tratada como bug de código** — é pendência operacional. |
| Domínio | **NÃO CONFIGURADO** — nenhum domínio definido; não inventado aqui. |
| `NEXT_PUBLIC_APP_URL` | **NÃO CONFIGURADO** para produção — `.env.example` mantém `http://localhost:3000` como valor de exemplo; crítico configurar antes de qualquer login real (Tarefa 1). |
| Supabase Site URL/Redirect URLs | **DEPENDE DO DEPLOY FINAL** — só pode ser configurado quando o domínio real existir. |
| Google OAuth Redirect URI | **DEPENDE DO DEPLOY FINAL**, mesma razão. |
| OpenAI controls (hard spend limit) | **NÃO CONFIGURADO** — ação manual pendente do proprietário (Tarefa 5). |
| Upstash | **CONFIGURADO** para desenvolvimento/testes (banco `suzzy-ai-ratelimit`, São Paulo, Free) — **NÃO CONFIRMADO** se será o mesmo banco em produção. |
| Node version | **NÃO CONFIGURADO** — sem `engines` em `package.json`, sem `.nvmrc` na raiz (confirmado nesta tarefa; só existe um `.nvmrc` irrelevante dentro de `node_modules`). |

**Achado novo, menor**: o comentário em `.env.example` (linha 8) ainda diz "usado por `/api/assist` e `/api/support`" para as variáveis do Upstash — desatualizado desde a Tarefa 4 desta sprint, que estendeu o uso a `/api/generate`. Não corrigido nesta tarefa (fora do escopo — só `docs/SPRINT-18.md` pode ser alterado aqui); registrado como **P2** na tabela de pendências.

### 10. Custos — quatro camadas, estado final

1. **Rate limiting da aplicação** — ✅ implementado em código, nos três endpoints (seção 1–3).
2. **`max_output_tokens`** — ✅ implementado em código, nos três endpoints.
3. **Controles/rate limits da própria OpenAI** — existem por padrão da plataforma, fora do nosso controle direto, não configurados por nós.
4. **Orçamento/monitoramento operacional** — ❌ ação manual do proprietário ainda pendente (hard spend limit e spend alerts da OpenAI; confirmação de plano/cotas da Upstash) — Tarefa 5.

As camadas 1 e 2 são as únicas que já protegem de verdade contra gasto hoje, de forma automática.

### 11. Comercial — reconfirmado, sem mudança desde a Tarefa 7

Reconfirmado por nova leitura de `app/page.tsx`, `app/login/page.tsx`, `app/dashboard/page.tsx` e busca no repositório: cobrança **continua inexistente**; trial de 15 dias **continua apenas textual** (login dá acesso completo e permanente, sem expiração); **continua sem** distinção técnica de planos, papel administrativo, ou controle de acesso; Programa Fundadores **continua** sem qualquer contador ou enforcement técnico; cancelamento comercial **continua** não aplicável (nada a cancelar); exclusão de conta **continua** sem autoatendimento (só as cinco rotas do projeto existem: `auth/callback`, `auth/logout`, `api/generate`, `api/assist`, `api/support`); suporte humano **continua** inexistente. **Nenhum fato mudou desde a Tarefa 7.**

### 12. Pendências por responsável

| Pendência | Prioridade | Responsável | Beta gratuito? | Beta pago? | Lançamento público? |
|---|---|---|---|---|---|
| Contratar/confirmar hospedagem (Vercel Pro) e fazer o primeiro deploy | P0 | Proprietário + Vercel | **Sim** | Sim | Sim |
| Configurar `NEXT_PUBLIC_APP_URL` real + Supabase Site URL/Redirect URLs + Google OAuth Redirect URI | P0 | Proprietário + Supabase/Google | **Sim** | Sim | Sim |
| Revisão jurídica profissional dos 4 documentos | P0 (bloqueia comercial pleno) | Advogado(a) | Não | Recomendado antes de cobrar | **Sim** |
| Identificação institucional completa | P0 (bloqueia comercial pleno) | Proprietário (+ advogado) | Não | Recomendado | **Sim** |
| Infraestrutura de cobrança (checkout/assinatura/webhook) | P0 | Desenvolvimento | Não | **Sim** | **Sim** |
| Programa Fundadores sem controle técnico de vagas | P0 se divulgado com cobrança real | Desenvolvimento/Proprietário | Não (se não divulgado amplamente) | **Sim** | **Sim** |
| Canal humano de suporte | P0 para pago; recomendado para beta | Proprietário | Recomendado | **Sim** | **Sim** |
| Hard spend limit + spend alerts da OpenAI | P1 | Proprietário | Recomendado | Sim | Sim |
| Confirmar comportamento do Free do Upstash perto da cota | P1 | Proprietário/Upstash | Não | Recomendado | Sim |
| Fixar versão do Node (`engines`/`.nvmrc`) | P1 | Desenvolvimento | Recomendado | Sim | Sim |
| Fluxo de exclusão de conta (ao menos processo manual documentado) | P1 | Proprietário/Desenvolvimento | Recomendado | Sim | Sim |
| Processo mínimo de resposta a incidentes | P1 | Proprietário | Recomendado | Sim | Sim |
| Regras comerciais definitivas (preço, cancelamento, reembolso) | P1 | Proprietário + Advogado | Não | **Sim** | **Sim** |
| Ajustar texto de trial/cobrança da Landing Page enquanto não há cobrança | P1 | Proprietário | Recomendado | Não aplicável (seria real) | Não aplicável |
| Corrigir comentário desatualizado em `.env.example` (linha 8) | P2 | Desenvolvimento | Não | Não | Não |
| Painel administrativo mínimo | P2 | Desenvolvimento | Não | Não | Recomendado |
| Observabilidade/monitoramento de erros além de `console.error` | P2 | Desenvolvimento | Não | Recomendado | Recomendado |
| 3 vulnerabilidades altas de dev-tooling remanescentes | P2 | Desenvolvimento | Não | Não | Não |
| `x-vercel-forwarded-for` como sinal primário de IP | P2 | Desenvolvimento | Não | Não | Não |

### 13–15. Decisões formais de Go/No-Go

**A. Beta fechado gratuito — GO COM CONDIÇÕES.**
Condições: (1) hospedagem contratada e primeiro deploy realizado, com `NEXT_PUBLIC_APP_URL`/Supabase/Google configurados corretamente para o domínio real usado — sem isso, ninguém consegue logar; (2) acesso restrito por convite manual/controlado, sem divulgação pública do link de login; (3) decisão consciente sobre o texto de trial/cobrança da Landing Page (mantê-lo, sabendo que ninguém será de fato cobrado, ou ajustar a comunicação); (4) canal de suporte informal definido; (5) processo manual de exclusão de conta definido, caso solicitado. **Nenhuma dessas condições exige cobrança** — beta gratuito não elimina obrigações de LGPD (identificação institucional e revisão jurídica seguem como pendências reais, só não bloqueiam tecnicamente um grupo pequeno e controlado de convidados).

**B. Beta fechado pago — NO-GO.**
Bloqueadores: nenhuma infraestrutura de cobrança existe; Programa Fundadores sem nenhum controle técnico; sem canal humano de suporte formal; regras comerciais (CDC) ainda não revisadas juridicamente; mesmas pendências de infraestrutura do cenário A.

**C. Lançamento público/comercial — NO-GO.**
Bloqueadores: todos os P0 da tabela da seção 12 — infraestrutura de produção, revisão jurídica profissional, identificação institucional, infraestrutura de cobrança, Programa Fundadores sem enforcement, ausência de suporte humano.

### 16. Recomendação de próxima fase

**C. Resolver infraestrutura de produção.**

Justificativa: toda a prontidão técnica (rate limiting, proteção de custo, segurança, regressões) já está aprovada desde as Tarefas 1–5 desta sprint. As pendências jurídicas (Tarefa 6) dependem de um terceiro externo (advogado) e podem correr em paralelo. As pendências comerciais de cobrança (Tarefa 7) **não bloqueiam** o cenário mais provável de próximo passo (beta fechado gratuito). Mas a infraestrutura de produção — hospedagem contratada, domínio, `NEXT_PUBLIC_APP_URL`, Supabase/Google reconfigurados — é o **único item que bloqueia literalmente qualquer usuário real de conseguir logar**, mesmo em um beta fechado com uma única pessoa convidada. É o gargalo comum a todos os três cenários (A, B e C) e o pré-requisito físico para executar a própria condição (1) do "GO COM CONDIÇÕES" do cenário A. Resolver isso primeiro é o que efetivamente destrava a próxima fase, qualquer que ela seja.

---

## Encerramento da Sprint 18

**Status**: Sprint 18 — Go/No-Go para Produção — **concluída**.

### Resumo das 8 tarefas

1. **Auditoria de prontidão e plano da sprint** — mapeamento completo do estado real (hospedagem, dependências, custos, jurídico, comercial, observabilidade), 2 P0 e 10 P1 identificados, sequência de 8 tarefas proposta.
2. **Atualização de segurança não-major do Next.js** — `16.2.11` → `16.3.0`, eliminando as 3 vulnerabilidades altas de produção (`next`, `postcss`, `sharp`); efeito colateral (reescrita automática de `CLAUDE.md`) identificado e corrigido em microtarefa (`agentRules: false`).
3. **Auditoria e preparação da infraestrutura de produção** — Vercel confirmada tecnicamente adequada (plano Pro, não Hobby — uso comercial já declarado na Landing Page); estratégia de identificação de IP do Assist confirmada como adequada para a Vercel; checklists de Supabase, Upstash, OpenAI e domínio produzidos.
4. **Proteção de custo do `/api/generate`** — auditoria, microvalidação real (6 gerações), rate limiting 8/60s + 150/dia e `max_output_tokens: 2500` implementados e testados ao vivo, após aprovação explícita dos números.
5. **Controle operacional de custos OpenAI e Upstash** — pesquisa em documentação oficial (hard spend limits vs. alertas), estimativa de consumo Redis, checklists manuais para o proprietário, sem nenhuma decisão financeira tomada automaticamente.
6. **Auditoria final de prontidão jurídica e dados institucionais** — checklist de dados institucionais, checklist para advogado(a), inconsistência factual encontrada (escopo do rate limiting nos documentos) e corrigida em microtarefa dedicada.
7. **Auditoria de prontidão comercial e operacional** — inventário completo das promessas comerciais da Landing Page vs. implementação real; confirmado: cobrança, trial, Programa Fundadores e suporte humano são hoje apenas marketing/texto, sem suporte técnico algum.
8. **Validação final, encerramento e decisão formal de Go/No-Go** (esta tarefa).

### Principais melhorias da sprint

- Três endpoints de IA (`/api/generate`, `/api/assist`, `/api/support`) agora protegidos por rate limiting real via Upstash, com políticas específicas e justificadas para cada um.
- `/api/generate` ganhou teto de custo por chamada (`max_output_tokens: 2500`), validado com evidência real.
- Vulnerabilidades de produção do `npm audit` eliminadas (Next.js atualizado).
- Hospedagem tecnicamente avaliada e aprovada (Vercel), com toda a estratégia de IP/rate limiting confirmada como correta para esse ambiente.
- Documentação jurídica mantida factualmente correta e sincronizada com o código real, inclusive após a expansão do rate limiting.
- Estado comercial real (ausência de cobrança/trial técnico/suporte humano) totalmente mapeado e transparente, sem nenhuma implementação prematura de cobrança.

### Vulnerabilidades remanescentes

3 altas, todas de ferramentas de desenvolvimento (`brace-expansion`, `js-yaml`, `nanoid`, via `eslint`/`@tailwindcss/postcss`), sem exposição em runtime de produção. Nenhuma ação automática executada.

### Estado técnico

**Aprovado.** Rate limiting, proteção de custo, segurança de segredos, lint e build validados nesta própria tarefa. Nenhuma regressão encontrada em nenhum teste real executado.

### Estado jurídico

**Documentos tecnicamente coerentes com o código**, mas **não prontos para lançamento comercial**: revisão profissional e dados institucionais continuam pendentes (P0 para lançamento público, não bloqueantes para um beta fechado pequeno e controlado).

### Estado comercial

**Sem infraestrutura de cobrança, trial técnico, controle de plano ou suporte humano.** Todas as promessas comerciais da Landing Page hoje são texto, não implementação. Adequado para um beta gratuito bem comunicado; não adequado para cobrança real.

### Estado de infraestrutura

**Hospedagem não contratada, domínio não definido.** Tecnicamente avaliada e pronta para ser configurada (Vercel), mas nenhuma ação de deploy foi realizada — pendência operacional, não técnica.

### Decisões formais de Go/No-Go

- **A. Beta fechado gratuito**: **GO COM CONDIÇÕES** (infraestrutura de produção configurada, convite controlado, comunicação de trial ajustada/aceita, suporte informal, exclusão de conta manual).
- **B. Beta fechado pago**: **NO-GO.**
- **C. Lançamento público/comercial**: **NO-GO.**

### Pendências

Ver tabela completa na Tarefa 8, seção 12 — 7 itens P0, 8 itens P1, 6 itens P2, cada um com responsável explícito (proprietário, desenvolvimento, advogado(a), Vercel, OpenAI, Upstash, Supabase/Google).

### Próxima direção recomendada

**Resolver infraestrutura de produção** — é o único bloqueador comum aos três cenários e o pré-requisito físico para qualquer usuário real (mesmo em beta fechado) conseguir logar na plataforma.

---

## Status

Sprint 18 concluída em 2026-08-10. Tarefas 1–8 executadas e aprovadas nesta conversa. Não iniciada nova sprint — aguardando decisão do proprietário sobre a próxima direção.
