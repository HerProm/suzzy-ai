# Sprint 12

## Objetivo

Transformar a SUZZY AI em uma assistente inteligente capaz de apoiar o corretor na condução de negociações imobiliárias, utilizando uma biblioteca de objeções comuns do mercado.

## Escopo

1. Planejamento.
2. Biblioteca de objeções imobiliárias.
3. Organização das objeções por categoria.
4. Integração da biblioteca à interface.
5. Utilização da objeção selecionada na geração da resposta da IA.
6. Validação.
7. Documentação.

## Fora do escopo

- Alterações na autenticação.
- Alterações na API além do mínimo necessário para suportar a funcionalidade.
- Banco de dados.
- Novas integrações externas.
- Mudanças na arquitetura existente.

## Definition of Done

- Biblioteca inicial de objeções implementada.
- Interface integrada às objeções.
- IA utilizando a objeção selecionada como contexto adicional.
- Nenhuma regressão funcional.
- npm run lint aprovado.
- npm run build aprovado.

## Status

Concluída em 2026-08-03.

## Resumo das funcionalidades implementadas por tarefa

- **Tarefa 2 — Biblioteca de objeções**: criado `lib/real-estate-objections.ts` com `REAL_ESTATE_OBJECTIONS`, contendo 10 objeções reais de negociação (`id`, `categoria`, `nome`, `descricao`, `objetivoResposta`), distribuídas em 5 categorias: Preço, Financiamento, Tempo, Comparação e Decisão Familiar.
- **Tarefa 3 — Organização por categoria**: adicionados `OBJECTION_CATEGORIES` (ordem de exibição) e `OBJECTIONS_BY_CATEGORY`, derivado de `REAL_ESTATE_OBJECTIONS` via `.filter()` — sem duplicar os dados originais — deixando a biblioteca pronta para renderização por categoria.
- **Tarefa 4 — Integração à interface**: `components/dashboard-form.tsx` passou a exibir as objeções agrupadas por categoria, como cards de seleção única (`input type="radio"`, `name="objection"`), com nome, descrição curta e destaque visual quando selecionada, seguindo o mesmo padrão visual já usado para Cenários e Tarefas. Um novo estado local (`selectedObjectionId`) guarda apenas o id da objeção escolhida, sem nenhum outro efeito colateral nesta etapa.
- **Tarefa 5 — Objeção influenciando a geração de resposta**: o `objectionId` selecionado passou a ser enviado para `/api/generate`, que o resolve contra `REAL_ESTATE_OBJECTIONS` no servidor e o repassa para `buildAiInput` (`lib/ai/tasks.ts`), que anexa a objeção ao `input` da IA como dado complementar (categoria, objeção e objetivo da resposta), com o mesmo tratamento de segurança já aplicado ao contexto e ao cenário: dado, não instrução. Sem objeção selecionada, o comportamento permanece idêntico ao das sprints anteriores.
- **Tarefa 6 — Validação**: verificação por inspeção estática de todos os fluxos (biblioteca de objeções, organização por categoria, interface de seleção, envio à API, resolução no servidor, integração com `buildAiInput`, compatibilidade com cenários da Sprint 11, autenticação, login, dashboard, templates, histórico, persistência e hooks). Nenhuma regressão encontrada.
- **Tarefa 7 — Documentação**: este encerramento.

## Arquivos alterados durante a sprint

- `docs/SPRINT-12.md` — criado e atualizado ao longo das tarefas.
- `lib/real-estate-objections.ts` — criado (Tarefas 2 e 3).
- `components/dashboard-form.tsx` — seção de seleção de objeções (Tarefa 4) e envio do `objectionId` na geração (Tarefa 5).
- `lib/ai/tasks.ts` — `buildAiInput` passou a aceitar um quarto parâmetro opcional `objection` (Tarefa 5).
- `app/api/generate/route.ts` — leitura e resolução do `objectionId` recebido do cliente (Tarefa 5).

## Resultado da validação

- Nenhuma regressão funcional encontrada em nenhum fluxo (objeções, cenários, interface, geração, histórico, templates, login, dashboard, hooks).
- Nenhuma funcionalidade das sprints anteriores foi afetada.
- `npm run lint` — aprovado em todas as tarefas da sprint.
- `npm run build` — aprovado em todas as tarefas da sprint, com todas as rotas geradas normalmente.

## Decisões de arquitetura

- A objeção selecionada é tratada como **complemento de contexto**, nunca como substituto de `context`, `task`, `template` ou `cenário` — apenas mais um trecho anexado ao `input` enviado à IA.
- A resolução da objeção acontece **no servidor**, a partir do `id` recebido do cliente e da lista canônica `REAL_ESTATE_OBJECTIONS`, nunca a partir de texto livre enviado pelo cliente — mesma arquitetura de segurança usada para os cenários na Sprint 11.
- `OBJECTIONS_BY_CATEGORY` é derivado de `REAL_ESTATE_OBJECTIONS`, evitando uma segunda fonte de verdade.
- A seleção de objeção na interface usa `input type="radio"` nativo, garantindo seleção única, navegação por teclado e foco visível sem código adicional de acessibilidade — mesmo padrão de Cenários e Tarefas.
- Cenário e objeção são resolvidos e anexados ao `input` de forma independente entre si, permitindo qualquer combinação (nenhum, um ou ambos) sem interferência mútua.
- Toda a lógica de prompt permanece centralizada em `buildAiInput`, sem criação de um segundo caminho de construção de prompt.

## Registro de regressões

Nenhuma regressão foi encontrada durante a Sprint 12.
