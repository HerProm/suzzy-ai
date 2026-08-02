# Sprint 11

## Objetivo

Transformar a SUZZY AI em um assistente inteligente especializado no dia a dia de corretores de imóveis.

## Escopo

1. Planejamento.
2. Biblioteca de cenários imobiliários.
3. Organização dos cenários por categoria.
4. Integração da biblioteca à interface.
5. Refinamentos de UX.
6. Validação.
7. Documentação.

## Fora do escopo

- Alterações na autenticação.
- Alterações na API.
- Banco de dados.
- Novas integrações externas.
- Mudanças na arquitetura existente.

## Definition of Done

- Biblioteca inicial de cenários imobiliários implementada.
- Interface integrada aos cenários.
- Nenhuma regressão funcional.
- npm run lint aprovado.
- npm run build aprovado.

## Status

Concluída em 2026-08-02.

## Resumo das funcionalidades implementadas por tarefa

- **Tarefa 2 — Biblioteca de cenários**: criado `lib/real-estate-scenarios.ts` com `REAL_ESTATE_SCENARIOS`, contendo 11 cenários reais do dia a dia do corretor (`id`, `categoria`, `nome`, `descricao`), distribuídos em 4 categorias: Atendimento, Negociação, Captação e Marketing.
- **Tarefa 3 — Organização por categoria**: adicionados `SCENARIO_CATEGORIES` (ordem de exibição) e `SCENARIOS_BY_CATEGORY`, este último derivado de `REAL_ESTATE_SCENARIOS` via `.filter()` — sem duplicar os dados originais — deixando a biblioteca pronta para ser percorrida por categoria na interface.
- **Tarefa 4 — Integração à interface**: `components/dashboard-form.tsx` passou a exibir os cenários agrupados por categoria, como cards de seleção única (`input type="radio"`, `name="scenario"`), com nome, descrição curta e destaque visual quando selecionado. Um novo estado local (`selectedScenarioId`) guarda apenas o id do cenário escolhido, sem nenhum outro efeito colateral nesta etapa.
- **Tarefa 5 — Cenário influenciando a geração de resposta**: o `scenarioId` selecionado passou a ser enviado para `/api/generate`, que o resolve contra `REAL_ESTATE_SCENARIOS` no servidor e o repassa para `buildAiInput` (`lib/ai/tasks.ts`), que anexa o cenário ao `input` da IA como dado complementar (mesmo tratamento de segurança já aplicado ao contexto do usuário: dado, não instrução). Sem cenário selecionado, o comportamento permanece idêntico ao das sprints anteriores.
- **Tarefa 6 — Validação**: verificação por inspeção estática de todos os fluxos (biblioteca de cenários, interface, geração de respostas, histórico, templates, login e dashboard). Nenhuma regressão encontrada.
- **Tarefa 7 — Documentação**: este encerramento.

## Arquivos alterados durante a sprint

- `docs/SPRINT-11.md` — criado e atualizado ao longo das tarefas.
- `lib/real-estate-scenarios.ts` — criado (Tarefas 2 e 3).
- `components/dashboard-form.tsx` — seção de seleção de cenários (Tarefa 4) e envio do `scenarioId` na geração (Tarefa 5).
- `lib/ai/tasks.ts` — `buildAiInput` passou a aceitar um cenário opcional (Tarefa 5).
- `app/api/generate/route.ts` — leitura e resolução do `scenarioId` recebido do cliente (Tarefa 5).
- `app/auth/callback/route.ts` — correção pontual do redirecionamento pós-login (ver seção "Correções realizadas").

## Resultado da validação

- Nenhuma regressão funcional encontrada em nenhum fluxo (cenários, interface, geração, histórico, templates, login, dashboard).
- `npm run lint` — aprovado em todas as tarefas da sprint.
- `npm run build` — aprovado em todas as tarefas da sprint, com todas as rotas geradas normalmente.

## Decisões de arquitetura

- O cenário selecionado é tratado como **complemento de contexto**, nunca como substituto de `context`, `task` ou `template` — apenas um trecho adicional é anexado ao `input` enviado à IA.
- A resolução do cenário acontece **no servidor**, a partir do `id` recebido do cliente e da lista canônica `REAL_ESTATE_SCENARIOS`, nunca a partir de texto livre enviado pelo cliente — mesma cautela de segurança já aplicada às instruções internas de tarefa.
- `SCENARIOS_BY_CATEGORY` é derivado de `REAL_ESTATE_SCENARIOS`, evitando uma segunda fonte de verdade para os cenários.
- A seleção de cenário na interface usa `input type="radio"` nativo (em vez de componentes customizados), garantindo de forma nativa seleção única, navegação por teclado e foco visível, sem código adicional de acessibilidade.
- Toda a lógica de prompt permanece centralizada em `buildAiInput`, sem criação de um segundo caminho de construção de prompt.

## Correções realizadas durante a sprint

- **Redirecionamento pós-login via Magic Link**: identificado que `app/auth/callback/route.ts` redirecionava para `/` após uma troca de código por sessão bem-sucedida, em vez de `/dashboard`. Corrigido para `NextResponse.redirect(`${origin}/dashboard`)`. Essa mesma rota é compartilhada pelo login via Google, então a correção também alinhou o destino final desse fluxo, sem alterar o mecanismo de autenticação do Google.
