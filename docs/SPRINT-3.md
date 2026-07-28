# SPRINT 3 - Dashboard: contexto e seleção de tarefa

## Objetivo

Substituir o placeholder atual do dashboard por uma interface mínima que permita ao usuário informar o contexto em texto e escolher uma das tarefas aprovadas, preparando a base para a geração de resposta por IA (Sprint 4).

## Funcionalidades entregues

- Layout mínimo do dashboard (sem estilização elaborada), mantendo a verificação de sessão no servidor.
- Campo de texto para o usuário informar o contexto manualmente.
- Seleção de uma das quatro tarefas aprovadas: responder um lead, criar follow-up, gerar texto de anúncio, sugerir próximos passos.
- Botão de ação ("Gerar resposta") com validação mínima de preenchimento e feedback local — sem chamada real à IA.

## Fora do escopo

- Integração com IA / endpoint de geração de resposta (Sprint 4).
- Histórico de respostas.
- Qualquer persistência em banco de dados.
- Estilização elaborada ou identidade visual.
- Papéis, permissões, múltiplos usuários por conta.

## Tarefas previstas

### 1. Preparar o layout do dashboard (Server Component)
- Manter a proteção de rota existente em `app/dashboard/page.tsx` (verificação de sessão no servidor, redirecionamento para `/login` quando não autenticado).
- Adicionar apenas um layout mínimo (título e área de conteúdo) ao redor do componente de interação, sem transformar a página em Client Component.
- **Critério de aceitação:** a rota `/dashboard` continua protegida no servidor; usuário não autenticado é redirecionado antes de qualquer renderização de conteúdo interativo.

### 2. Criar o componente cliente de interação
- Criar um Client Component separado (ex.: `DashboardForm`), renderizado dentro da página do dashboard, para concentrar toda a parte interativa (contexto, seleção de tarefa e botão de ação).
- **Critério de aceitação:** apenas esse componente utiliza `"use client"`; a página do dashboard permanece um Server Component responsável somente pela verificação de sessão e pelo layout.

### 3. Criar o campo de contexto
- Textarea controlada dentro do Client Component, com label associado.
- **Critério de aceitação:**
  - texto contendo apenas espaços é tratado como vazio (validação com `trim()`);
  - o campo possui label associado (via `htmlFor`/`id` ou `aria-label`);
  - o foco no campo é visível ao navegar por teclado.

### 4. Criar a seleção da tarefa
- Componente de escolha única com as quatro tarefas aprovadas.
- **Critério de aceitação:**
  - usuário consegue selecionar exatamente uma tarefa por vez;
  - a seleção é utilizável inteiramente por teclado (tab/setas/enter, conforme o elemento escolhido);
  - o foco é visível durante a navegação por teclado.

### 5. Adicionar botão de ação com validação e feedback local
- Botão "Gerar resposta" desabilitado enquanto o contexto (após `trim()`) estiver vazio ou nenhuma tarefa estiver selecionada.
- Ao ser clicado, exibe apenas uma mensagem local informando que a geração será implementada na Sprint 4 — nenhuma chamada de rede deve ocorrer.
- **Critério de aceitação:**
  - o estado desabilitado é identificável tanto visualmente quanto por atributo (`disabled`/`aria-disabled`);
  - ao clicar, nenhuma requisição de rede é disparada;
  - a mensagem de feedback local é exibida corretamente.

### 6. Validar o fluxo de UI localmente — concluída
- Testar manualmente preenchimento do contexto, seleção da tarefa, habilitação do botão, feedback local e navegação por teclado.
- **Critério de aceitação:** fluxo funciona sem erros de console; `npm run lint` e `npm run build` passam sem erros.

## Resultado da validação (Tarefa 6)

Validação manual realizada em 2026-07-27:

- **Dashboard**: renderiza corretamente após autenticação.
- **Campo de contexto**: funciona normalmente (edição livre em estado local).
- **Contexto apenas com espaços**: mantém o botão "Gerar resposta" desabilitado.
- **Seleção de tarefa**: funciona corretamente; apenas uma tarefa pode ser selecionada por vez.
- **Botão "Gerar resposta"**: habilita somente quando o contexto é válido (após `trim()`) e uma tarefa está selecionada.
- **Clique no botão**: exibe a mensagem local "A geração por IA será implementada na Sprint 4."
- **Integração com IA**: nenhuma foi realizada, conforme escopo.
- **`npm run lint`**: executado com sucesso.
- **`npm run build`**: executado com sucesso.

## Dependências entre tarefas

- Tarefa 1 é pré-requisito para a Tarefa 2 (o Client Component é renderizado dentro do layout do Server Component).
- Tarefa 2 é pré-requisito para as Tarefas 3 e 4 (campo de contexto e seleção de tarefa vivem dentro do Client Component).
- Tarefas 3 e 4 são independentes entre si, mas ambas são pré-requisito para a Tarefa 5.
- Tarefa 5 depende das Tarefas 3 e 4 concluídas.
- Tarefa 6 depende da conclusão das Tarefas 1 a 5.

## Definição de pronto (Definition of Done)

A Sprint 3 estará concluída quando:

- a rota `/dashboard` continuar protegida no servidor, sem regressão na verificação de sessão;
- a parte interativa estiver isolada em um Client Component separado, sem transformar a página inteira em Client Component;
- o dashboard exibir o campo de contexto e a seleção de tarefa dentro de um layout mínimo;
- o usuário autenticado conseguir preencher o contexto e escolher uma tarefa;
- o botão de ação refletir corretamente o estado de preenchimento (habilitado/desabilitado), tratando texto apenas com espaços como vazio;
- o clique no botão exibir apenas feedback local (sem chamada de IA e sem requisição de rede);
- os critérios mínimos de acessibilidade forem atendidos: label associado ao textarea, seleção utilizável por teclado, foco visível e estado desabilitado identificável;
- nenhuma funcionalidade fora do escopo do MVP (CRM, papéis, histórico, persistência) tiver sido introduzida;
- `npm run lint` e `npm run build` passarem sem erros.
