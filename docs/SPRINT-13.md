# Sprint 13

## Objetivo

Evoluir a SUZZY AI de uma geradora de respostas para uma assistente inteligente de negociação imobiliária.

## Escopo

1. Planejamento.
2. Biblioteca de recomendações estratégicas.
3. Organização das recomendações.
4. Geração do bloco "Próximo passo recomendado".
5. Geração do bloco "Por que estou sugerindo isso?".
6. Validação.
7. Documentação.

## Fora do escopo

- Alterações na autenticação.
- Banco de dados.
- Integrações externas.
- CRM.
- WhatsApp.
- Landing Page (será desenvolvida na Sprint 14).

## Definition of Done

- Biblioteca criada.
- Próximo passo recomendado implementado.
- Explicação estratégica implementada.
- Nenhuma regressão.
- npm run lint aprovado.
- npm run build aprovado.

## Status

Concluída em 2026-08-03.

## Resumo das tarefas executadas

- **Tarefa 1 — Planejamento**: criação deste documento (`docs/SPRINT-13.md`) com objetivo, escopo, fora do escopo e Definition of Done.
- **Tarefa 2 — Biblioteca de estratégias**: criado `lib/real-estate-strategies.ts` com `REAL_ESTATE_STRATEGIES`, contendo 10 estratégias de negociação (`id`, `categoria`, `nome`, `descricao`, `recomendacao`, `objetivo`), distribuídas em 5 categorias: Primeiro Contato, Follow-up, Negociação, Pós-visita e Fechamento.
- **Tarefa 3 — Organização das recomendações**: adicionados `STRATEGY_CATEGORIES` (ordem de exibição) e `STRATEGIES_BY_CATEGORY`, derivado de `REAL_ESTATE_STRATEGIES` via `.filter()` — mesmo padrão arquitetural das Sprints 11 e 12, sem duplicar dados.
- **Tarefa 4 — Bloco "Próximo passo recomendado"**: `app/api/generate/route.ts` passou a resolver automaticamente, no servidor, uma categoria de estratégia relevante (a partir da tarefa escolhida, do cenário ou da presença de uma objeção) e a repassar as estratégias correspondentes para `buildAiInput` (`lib/ai/tasks.ts`), que ganhou um quinto parâmetro opcional `strategies`. Quando há estratégias, o prompt passa a instruir a IA a produzir também um bloco "Próximo passo recomendado".
- **Tarefa 5 — Bloco "Por que estou sugerindo isso?"**: a instrução de formatação em `buildAiInput` foi expandida para pedir três blocos estruturados na resposta ("Resposta sugerida", "Próximo passo recomendado" e "Por que estou sugerindo isso?"), com a explicação orientando o corretor em linguagem simples, no tom de um gerente comercial experiente.
- **Tarefa 6 — Validação**: verificação por inspeção estática de todos os fluxos (biblioteca de estratégias, seleção automática no servidor, construção do prompt, estrutura de três blocos, compatibilidade com Sprints 11 e 12, autenticação, login, dashboard, hooks, templates, histórico e persistência). Nenhuma regressão encontrada.
- **Tarefa 7 — Documentação**: este encerramento.

## Arquivos alterados durante a sprint

- `docs/SPRINT-13.md` — criado e atualizado ao longo das tarefas.
- `lib/real-estate-strategies.ts` — criado (Tarefas 2 e 3).
- `lib/ai/tasks.ts` — `buildAiInput` passou a aceitar um quinto parâmetro opcional `strategies` e a instruir a estrutura de três blocos (Tarefas 4 e 5).
- `app/api/generate/route.ts` — seleção automática, no servidor, da categoria de estratégia relevante e resolução das estratégias correspondentes (Tarefa 4).

Nenhum arquivo de interface (`components/dashboard-form.tsx`), autenticação, hooks, persistência, histórico, templates ou das bibliotecas de cenários e objeções foi alterado.

## Resultado da validação

- Nenhuma regressão funcional encontrada em nenhum fluxo.
- `npm run lint` — aprovado em todas as tarefas da sprint.
- `npm run build` — aprovado em todas as tarefas da sprint, com todas as rotas geradas normalmente.

## Decisões de arquitetura

- **A interface permaneceu inalterada**: nenhum campo, estado ou componente novo foi criado no dashboard. O corretor continua vendo exatamente a mesma tela das Sprints 11 e 12.
- **As estratégias são resolvidas automaticamente no servidor**: `app/api/generate/route.ts` decide a categoria relevante com base em sinais já existentes na requisição (tarefa, cenário, objeção) e busca as estratégias em `STRATEGIES_BY_CATEGORY`, sem depender de nenhum dado extra vindo do cliente.
- **O usuário não seleciona estratégias**: o corpo da requisição enviado pelo navegador continua contendo apenas `context`, `task`, `scenarioId` e `objectionId` — não existe (e nunca existiu) um campo de estratégia vindo do cliente.
- Estratégias são tratadas como "dado de apoio, não instrução", seguindo a mesma convenção de segurança usada para contexto, cenário e objeção.
- Toda a montagem do prompt permanece centralizada em `buildAiInput`; `TASK_PROMPTS` e o campo `instructions` não foram tocados em nenhuma tarefa da sprint.
- A estrutura de três blocos só é solicitada à IA quando há estratégias relevantes; sem elas, o comportamento é idêntico ao das sprints anteriores.

## Confirmação

Nenhuma regressão foi encontrada durante a Sprint 13. Com esta sprint, a SUZZY AI evoluiu de uma geradora de respostas para uma assistente de negociação: além da resposta principal, ela agora orienta o corretor com um próximo passo recomendado e a lógica estratégica por trás dele, sempre que houver contexto suficiente (tarefa, cenário ou objeção) para embasar essa orientação.
