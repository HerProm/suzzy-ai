# Sprint 16 — Agentes Inteligentes da SUZZY AI

## Objetivo

Planejar e, nas tarefas seguintes, implementar dois agentes conversacionais de IA:

1. **Suzzy Assist** — agente público, no chat flutuante da Landing Page, para visitantes.
2. **Suzzy Support** — agente autenticado, dentro do Dashboard, para usuários já logados.

Esta tarefa (Tarefa 1) é só auditoria e arquitetura. Nenhum componente, endpoint ou dependência foi criado.

## Contexto

Até a Sprint 15, a SUZZY AI tem um único ponto de contato com IA: `/api/generate`, autenticado, de tiro único (uma requisição gera uma resposta, sem estado de conversa), dedicado a produzir a resposta de negociação do corretor. A Sprint 16 introduz um tipo de interação novo — **chat conversacional, multi-turno** — em dois contextos com necessidades de autenticação opostas: público (Assist) e autenticado (Support). Isso é uma mudança de natureza, não apenas mais uma tarefa, e por isso esta sprint começa com auditoria e arquitetura antes de qualquer código.

## Auditoria técnica

*(nenhum segredo, token ou valor de variável de ambiente é reproduzido abaixo — apenas nomes de variáveis já documentados na Sprint 15)*

**Estrutura da Landing Page**
- `app/page.tsx`: página única (`/`), Server Component, sem estado de cliente próprio. Contém cabeçalho fixo, Hero, seções estáticas (Problema, Recursos, Como funciona, Benefícios, Público, Programa Fundadores, Planos, FAQ, CTA Final) e rodapé. Não há, hoje, nenhum componente de chat, modal ou widget flutuante nela.

**Estrutura do Dashboard**
- `app/dashboard/page.tsx`: Server Component, protegido por `supabase.auth.getClaims()` com `redirect("/login")` caso não autenticado. Renderiza `components/dashboard-form.tsx`, um Client Component com todo o estado do formulário de geração (contexto, tarefa, cenário, objeção, histórico, cópia).
- Não existe, hoje, nenhuma área de "ajuda" ou "suporte" no dashboard.

**API atual de geração com IA**
- `app/api/generate/route.ts`: único endpoint de IA do projeto. `POST`, exige sessão Supabase válida (401 se ausente), valida `context` (string não vazia, até 5000 caracteres) e `task` (contra `ALLOWED_TASKS`), resolve `scenarioId`/`objectionId` opcionais e estratégias automáticas, e chama `buildAiInput()` (`lib/ai/tasks.ts`) para montar `instructions`/`input` enviados à OpenAI. É **de tiro único**: não há histórico de mensagens, não há conceito de "conversa" — cada requisição é independente.
- O cliente OpenAI é instanciado inline dentro da rota: `new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`, sem um helper compartilhado hoje.

**Autenticação**
- Supabase Auth (`@supabase/ssr`), dois métodos: Google OAuth e Magic Link. Sessão via cookies renovados no `proxy.ts` (middleware). Rotas públicas (`/`, `/login`, `/termos`, `/privacidade`, `/ia`, `/cookies`) não passam pelo guard de autenticação; `/dashboard` e `/api/generate` exigem `getClaims()` válido.

**Componentes existentes**
- `components/dashboard-form.tsx` — formulário de geração (não reutilizável para chat, é orientado a um único envio, não a uma conversa contínua).
- `components/legal-page-layout.tsx` — layout compartilhado das páginas jurídicas (Sprint 15), não relacionado a chat.
- Não existe nenhum componente de chat, bolha de mensagem, ou janela flutuante no projeto hoje.

**Modelo OpenAI utilizado**
- `gpt-5-mini`, via `client.responses.create({ model, instructions, input })` (Responses API, sem streaming). É o único modelo usado no projeto até aqui.

**Variáveis de ambiente existentes**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_APP_URL` — as mesmas quatro identificadas na auditoria da Sprint 15. Nenhuma variável nova foi adicionada desde então.

**Possibilidade de reutilizar infraestrutura atual**
- O cliente Supabase server-side (`lib/supabase/server.ts`) pode ser reutilizado para exigir autenticação no Suzzy Support, exatamente como já é feito em `/api/generate` e em `app/dashboard/page.tsx`.
- A chave `OPENAI_API_KEY` e o pacote `openai` já instalado podem ser reutilizados pelos dois agentes, sem depender de nova conta ou dependência.
- O padrão de "dado, não instrução" usado em `buildAiInput()` para tratar contexto do usuário, cenário e objeção como dados (não comandos) é diretamente aplicável para tratar as mensagens do visitante/usuário no chat da mesma forma — mitigação natural de prompt injection, já validada neste projeto.

**Riscos de misturar o agente principal de geração com Assist/Support**
- `/api/generate` é autenticado; o Suzzy Assist precisa ser público. Adicionar um caminho não autenticado dentro da mesma rota que hoje é 100% protegida aumenta a superfície de risco de uma regressão de segurança na funcionalidade paga principal do produto.
- `/api/generate` é de tiro único; um chat é multi-turno (precisa carregar e limitar histórico de mensagens). Misturar os dois contratos de requisição/resposta na mesma rota aumentaria a complexidade e o risco de regressão no fluxo já em produção.
- `TASK_PROMPTS` (as instruções internas de geração de resposta) são um ativo específico do produto pago; não há necessidade de que o Assist ou o Support tenham qualquer acesso a esse conteúdo — mantê-los na mesma função/módulo aumentaria a chance de vazamento acidental.

**Implicações de segurança e custo**
- O Suzzy Assist, por ser público e não autenticado, é o maior risco de custo/abuso: qualquer visitante (ou bot) pode chamar o endpoint repetidamente, sem nenhum controle de identidade.
- O Suzzy Support, por exigir autenticação, herda a mesma rastreabilidade que `/api/generate` já tem hoje (cada chamada é atribuível a uma sessão), mas ainda assim precisa de limites de tamanho/custo, pois hoje nenhuma rota do projeto tem limite de uso por usuário/tempo.
- Não existe, em nenhuma parte do projeto, qualquer mecanismo de rate limiting, cache ou fila — toda chamada à OpenAI é síncrona e imediata.

## Arquitetura recomendada

**Recomendação: endpoints separados (`/api/assist` e `/api/support`), com uma camada interna compartilhada — não reutilizar `/api/generate`.**

Avaliando as três opções apresentadas:

- **(A) Reutilizar `/api/generate` — não recomendado.** Exigiria tornar uma rota hoje 100% autenticada em parcialmente pública (para o Assist), misturar um contrato de tiro único com um contrato de chat multi-turno, e colocar prompts de chat público no mesmo módulo que guarda `TASK_PROMPTS` proprietários. O risco de regressão na funcionalidade paga principal supera qualquer economia de código.
- **(B) Endpoints separados (`/api/assist`, `/api/support`) — recomendado.** Cada rota tem seu próprio contrato (mensagem + histórico curto, em vez de contexto/tarefa/cenário/objeção), seu próprio requisito de autenticação (Assist público, Support autenticado) e sua própria base de conhecimento, sem tocar em `/api/generate`. Isso confirma a preferência inicial informada — e a auditoria técnica sustenta essa escolha, não apenas a preferência.
- **(C) Camada compartilhada interna — recomendado como complemento, não como alternativa a B.** Para evitar duplicar código entre `/api/assist`, `/api/support` e (opcionalmente) `/api/generate`, propõe-se extrair:
  - `lib/ai/client.ts` — helper único para instanciar o cliente OpenAI (hoje duplicado inline em `route.ts`, seria duplicado de novo em mais duas rotas sem essa extração);
  - `lib/agents/limits.ts` — validação compartilhada de tamanho de mensagem e de histórico entre Assist e Support (as duas rotas de chat têm o mesmo tipo de risco: mensagens grandes e históricos crescentes).

Nenhuma dessas extrações altera `/api/generate` — apenas evita que o mesmo padrão de código (`new OpenAI(...)`, validação de tamanho) seja escrito três vezes de formas ligeiramente diferentes.

## Arquitetura da Suzzy Assist

- **Rota**: `/api/assist`, pública (sem `getClaims()`), `POST`.
- **Componente**: chat flutuante em `app/page.tsx` (ou um componente Client dedicado importado por ela), com botão discreto no canto inferior direito, janela de conversa ao clicar, opção de fechar/minimizar, responsivo.
- **Conhecimento**: base própria e controlada, refletindo apenas conteúdo já público e aprovado (Hero, Problema, Solução, Como funciona, Benefícios, Público, Programa Fundadores, Planos, FAQ, e um resumo do conteúdo das páginas jurídicas) — nunca `TASK_PROMPTS`, nunca lógica interna de geração.
- **Sem acesso a**: dados de outros usuários, dashboard, histórico, autenticação, segredos do sistema, variáveis de ambiente, prompts internos de `/api/generate`.
- **Pode direcionar para**: `/login`, `#planos` (ou `/#planos`, já que "Planos" é uma seção ancorada na própria Landing Page, não uma rota própria), `/privacidade`, `/termos`, `/ia`, `/cookies` — como sugestões de link na resposta, não como ação automática.

## Arquitetura da Suzzy Support

- **Rota**: `/api/support`, autenticada (mesmo padrão de `supabase.auth.getClaims()` já usado em `/api/generate` e em `app/dashboard/page.tsx`), `POST`.
- **Componente**: chat dentro de `app/dashboard/page.tsx` (ou um componente Client dedicado), visível apenas para usuários autenticados.
- **Conhecimento**: base própria explicando o funcionamento operacional da plataforma (como preencher contexto, o que são cenários/objeções/estratégias, como usar o histórico, como interpretar as recomendações) — não o conteúdo comercial/público do Assist.
- **Primeira versão: agente de orientação, não executor.** Não deve alterar dados, executar ações no dashboard, apagar histórico, fazer chamadas administrativas, nem ver dados de outros usuários. Isso significa que o endpoint `/api/support` não deve ter acesso de escrita a nenhum dado do usuário — apenas gera texto de orientação.

## Personalidade

Uma personalidade-base compartilhada pelos dois agentes, com pequenas variações de função:

- cordial, objetiva, profissional;
- linguagem natural, não excessivamente formal;
- respostas relativamente curtas (chat, não parágrafos longos);
- especializada no mercado imobiliário, como o restante do produto;
- **sempre transparente sobre ser uma assistente de IA** — nunca finge ser uma pessoa humana, nunca omite que é a "Suzzy Assist"/"Suzzy Support" quando perguntada.
- Suzzy Assist tem um tom levemente mais voltado à apresentação do produto e à condução natural ao teste gratuito, sem pressão comercial agressiva.
- Suzzy Support tem um tom mais de "colega ensinando a usar a ferramenta", focado em desbloquear o usuário que está com dúvida operacional.

Evitar, nos dois: respostas robóticas, textos enormes, pressão comercial agressiva, ou qualquer simulação de atendimento humano.

## Segurança

Riscos identificados e estratégia de mitigação (por design, na próxima tarefa de implementação):

- **Prompt injection / pedidos para revelar instruções internas**: aplicar o mesmo padrão já usado em `buildAiInput()` — tratar a mensagem do usuário como **dado, não instrução**, e nunca incluir, no `input` enviado à OpenAI, nenhum conteúdo que o agente não possa revelar (ver ponto de "conhecimento" abaixo: se o segredo não está no prompt, não pode vazar do prompt).
- **Pedidos de chaves/tokens/segredos**: nenhuma chave, token ou segredo é colocado no `input`/`instructions` de nenhum dos dois agentes — a instrução do sistema deve reforçar a recusa educada a esse tipo de pedido, mas a proteção real é nunca expor o segredo ao modelo.
- **Tentativa de obter informações privadas** (dados de outros usuários, histórico alheio): estruturalmente impossível nesta arquitetura, já que nenhum dos dois endpoints consulta dados de outros usuários — o Support só teria, na primeira versão, acesso ao que o próprio usuário digitar na conversa, sem consultar histórico ou dados armazenados.
- **Abuso do endpoint público (Assist)**: o maior risco em aberto. Sem rate limiting, um visitante (ou bot) pode gerar custo de API sem limite prático.
- **Mensagens excessivamente grandes**: propor um limite de caracteres por mensagem em ambos os endpoints, no mesmo espírito do `MAX_CONTEXT_LENGTH` já usado em `/api/generate` (o valor exato deve ser decidido na tarefa de implementação, provavelmente menor que os 5000 caracteres do contexto de geração, já que mensagens de chat tendem a ser mais curtas).
- **Custos descontrolados de API**: ver seção seguinte.

## Controle de custos

- **Limite de tamanho de mensagem**: aplicar em ambos os endpoints (Assist e Support).
- **Limite de histórico enviado ao modelo**: como o chat é multi-turno (diferente de `/api/generate`), é necessário limitar quantas mensagens anteriores da conversa são reenviadas a cada nova chamada — sem isso, o custo por mensagem cresce indefinidamente ao longo de uma conversa longa.
- **Rate limiting**: **não existe hoje nenhuma infraestrutura no projeto para isso** (sem Redis, sem Vercel KV, sem qualquer solução de contagem persistente entre requisições). Um rate limit em memória local seria pouco confiável em ambiente serverless (cada instância/cold start reseta a contagem) e por isso não resolveria o problema de verdade. **Decisão técnica registrada, não implementada nesta sprint**: a solução definitiva de rate limiting depende de uma peça de infraestrutura ainda não decidida, e deve ser tratada como uma tarefa/decisão à parte antes do lançamento público do Suzzy Assist para tráfego real. Nenhuma dependência foi instalada para isso nesta tarefa.
- **Modelo mais econômico**: reutilizar `gpt-5-mini` (já em uso, já validado no projeto) é o caminho mais simples; avaliar um modelo ainda mais leve fica para a tarefa de implementação, se necessário, sem comprometer a qualidade das respostas.
- **Respostas com limite de tamanho**: reforçar, na instrução do sistema, que as respostas devem ser curtas (alinhado à seção "Personalidade"), o que já ajuda a limitar tokens de saída e, portanto, custo por resposta.

## Conhecimento

Para o MVP, **priorizar uma base de conhecimento controlada dentro do próprio projeto**, no mesmo espírito das bibliotecas já existentes (`lib/real-estate-scenarios.ts`, `lib/real-estate-objections.ts`, `lib/real-estate-strategies.ts`) — **não implementar RAG ou banco vetorial nesta sprint**, por ser complexidade desnecessária para o estágio atual do produto.

Estrutura proposta para tarefas futuras:
- `lib/agents/assist-knowledge.ts` — conteúdo público e aprovado sobre a SUZZY AI (o que é, funcionalidades, público-alvo, teste gratuito, planos, Programa Fundadores, uso de IA, privacidade em linhas gerais, com referências às páginas jurídicas).
- `lib/agents/support-knowledge.ts` — conteúdo operacional sobre como usar a plataforma (contexto, tarefa, cenário, objeção, estratégias, histórico).

A base do Assist deve refletir **somente informações já publicadas e aprovadas** (a própria Landing Page e as páginas jurídicas da Sprint 15) — nunca informação nova, não publicada, ou promessas que a Landing Page ainda não faz.

## Privacidade

Com a introdução dos dois chats, mensagens adicionais do usuário passam a ser enviadas à OpenAI, além do que já é descrito em `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md` e `docs/AI_TRANSPARENCY.md` (que hoje descrevem apenas o fluxo de `/api/generate`). **Nenhum documento jurídico foi alterado nesta tarefa** — mas fica registrado que, antes do lançamento comercial dos agentes, será necessário atualizar esses três documentos para:
- mencionar que o Suzzy Assist e o Suzzy Support também enviam conteúdo digitado pelo usuário à OpenAI;
- deixar claro que o Suzzy Assist é público (não exige login) e, portanto, mensagens digitadas nele não estão vinculadas a uma conta;
- confirmar que o Suzzy Support, por ser autenticado, segue o mesmo tratamento de dados já descrito para `/api/generate` (sem envio de e-mail ou identificadores de conta ao modelo).

## Tarefas numeradas

1. **Auditoria e arquitetura** (esta tarefa).
2. **Base de conhecimento do Suzzy Assist** — criar `lib/agents/assist-knowledge.ts` (somente dados, sem lógica, sem componente).
3. **Endpoint `/api/assist`** — rota pública, camada compartilhada (`lib/ai/client.ts`, `lib/agents/limits.ts`), limites de tamanho de mensagem/histórico, sem componente visual ainda.
4. **Componente de chat do Suzzy Assist** — widget flutuante na Landing Page, conectado ao endpoint da Tarefa 3.
5. **Base de conhecimento do Suzzy Support** — criar `lib/agents/support-knowledge.ts`.
6. **Endpoint `/api/support`** — rota autenticada, reutilizando a camada compartilhada das Tarefas 3/5.
7. **Componente de chat do Suzzy Support** — dentro do Dashboard, conectado ao endpoint da Tarefa 6.
8. **Validação de segurança e consistência** — revisão por inspeção de código dos pontos de prompt injection, limites de custo, e confirmação de que `/api/generate`, autenticação, dashboard e Landing Page não sofreram nenhuma regressão.
9. **Encerramento documental** — atualizar este arquivo com o resultado final, e registrar formalmente a pendência de atualização dos documentos jurídicos da Sprint 15.

*Sequência incremental proposta: cada agente é construído em três passos pequenos e isolados (conhecimento → endpoint → interface), com o Assist completo antes de iniciar o Support — assim, qualquer ajuste de padrão descoberto ao construir o primeiro agente já beneficia o segundo. Essa divisão segue o mesmo padrão já validado nas Sprints 11 a 13 deste projeto (biblioteca de dados → organização/API → interface → validação → documentação).*

## Fora do escopo

- Implementação de qualquer componente, endpoint ou dependência nesta tarefa (Tarefa 1 é só auditoria e planejamento).
- RAG, banco de dados vetorial, ou qualquer busca semântica externa.
- Ações executáveis pelo Suzzy Support (alterar dados, apagar histórico, chamadas administrativas) — nesta primeira versão, é só um agente de orientação.
- Rate limiting com infraestrutura externa (Redis, Upstash, Vercel KV ou equivalente) — decisão técnica registrada, não implementada.
- Persistência de histórico de conversa dos agentes entre sessões (nem em `localStorage`, nem em banco), a menos que decidido em contrário em uma tarefa futura.
- Atualização dos documentos jurídicos da Sprint 15 — apenas a necessidade é registrada aqui.
- Suporte a múltiplos idiomas.
- Alteração de `/api/generate`, autenticação, dashboard ou Landing Page fora do estritamente necessário para integrar os agentes.

## Definition of Done (da sprint, a validar ao final da Tarefa 8/9)

- Suzzy Assist funcional na Landing Page, público, respondendo com base na base de conhecimento aprovada, sem vazar informação proibida.
- Suzzy Support funcional no Dashboard, exigindo autenticação, sem executar nenhuma ação além de responder em texto.
- `/api/assist` e `/api/support` implementados como rotas separadas de `/api/generate`, que permanece inalterado.
- Limites de tamanho de mensagem e de histórico aplicados nos dois endpoints de chat.
- Nenhuma regressão em `/api/generate`, autenticação, dashboard ou Landing Page.
- Pendência de atualização dos documentos jurídicos formalmente registrada.
- npm run lint e npm run build aprovados em cada tarefa que alterar código.

## Riscos e pendências

- **Rate limiting real ainda não implementado**: até que uma solução de infraestrutura seja escolhida, o Suzzy Assist público representa risco de custo de API não controlado sob uso real/abuso. Monitoramento manual de custo é a única mitigação disponível até lá.
- **Nenhuma defesa contra prompt injection é absoluta**: a mitigação proposta (tratar mensagem do usuário como dado, nunca expor segredos ao modelo) reduz o risco, mas não o elimina — deve ficar registrado que isso é uma limitação conhecida de qualquer sistema baseado em LLM, não uma garantia.
- **Documentos jurídicos da Sprint 15 ficarão desatualizados** assim que os agentes forem publicados, até serem revisados para mencionar os novos fluxos de dados — não bloqueia a implementação técnica, mas bloqueia o lançamento comercial público dos agentes até ser resolvido.
- **Ambiente serverless limita soluções simples de rate limiting** (contagem em memória não é confiável entre instâncias) — reforça que essa pendência não tem uma solução trivial dentro da arquitetura atual do projeto.

## Status

Concluída em 2026-08-09.

## Resumo das tarefas executadas

- **Tarefa 1 — Auditoria e arquitetura**: auditoria técnica completa do projeto (Landing Page, Dashboard, `/api/generate`, autenticação, componentes, modelo OpenAI, variáveis de ambiente) e definição da arquitetura recomendada — endpoints separados (`/api/assist`, `/api/support`) com camada interna compartilhada, sem reutilizar `/api/generate`.
- **Tarefa 2 — Base de conhecimento da Suzzy Assist**: criado `lib/agents/assist-knowledge.ts` com identidade, produto, planos, Programa Fundadores, resumo de privacidade/IA, orientação de conversão e limites de conhecimento — apenas dados públicos e aprovados.
- **Tarefa 3 — Endpoint `/api/assist`**: criado `app/api/assist/route.ts` (rota pública) e `lib/ai/client.ts` (helper compartilhado do cliente OpenAI, sem alterar `/api/generate`). Durante os testes reais, foi identificado e corrigido um problema de orçamento de tokens (`max_output_tokens`/`reasoning`) que causava respostas vazias ou truncadas.
- **Tarefa 4 — Componente de chat da Suzzy Assist**: criado `components/suzzy-assist-chat.tsx` (widget flutuante, sem dependências novas) e integrado à Landing Page (`app/page.tsx`). Refinamento posterior: ajustadas as instruções para evitar apresentação repetitiva, promessas de ações inexistentes (avisos futuros, cadastro de interesse) e sugestões de navegação que o agente não executa.
- **Tarefa 5 — Base de conhecimento da Suzzy Support**: criado `lib/agents/support-knowledge.ts`, reaproveitando como fonte única de verdade as listas reais de cenários (`lib/real-estate-scenarios.ts`) e objeções (`lib/real-estate-objections.ts`) e as categorias de estratégias (`lib/real-estate-strategies.ts`), em vez de duplicá-las.
- **Tarefa 6 — Endpoint `/api/support`**: criado `app/api/support/route.ts` (rota autenticada via `supabase.auth.getClaims()`, mesmo padrão de `/api/generate`).
- **Tarefa 7 — Componente de chat da Suzzy Support**: criado `components/suzzy-support-chat.tsx` e integrado ao Dashboard (`app/dashboard/page.tsx`), visível apenas para usuários autenticados.
- **Investigação e correção de limites de histórico (entre as Tarefas 7 e 8)**: um teste manual real revelou que respostas legítimas da própria IA (geradas com `max_output_tokens: 500`) podiam ultrapassar 1000 caracteres, fazendo o histórico da conversa ser rejeitado (`400`) no turno seguinte — a própria resposta do agente virava "histórico inválido". Causa confirmada com evidências reais (respostas de até 2142 caracteres) em ambos os endpoints. Corrigido elevando `MAX_HISTORY_MESSAGE_LENGTH` para `2000` (Support) e `2500` (Assist, por evidência de resposta ainda maior). Nesse mesmo refinamento, a Suzzy Support ganhou duas regras adicionais: nunca se oferecer para gerar a resposta comercial final (papel exclusivo do fluxo principal do Dashboard) e responder de forma mais curta por padrão, aprofundando só quando solicitado.
- **Tarefa 8 — Validação de segurança e regressão**: bateria de testes reais e simulados cobrindo multi-turno, limites de mensagem/histórico, prompt injection, pedidos de chave/dados de outros usuários, escopo, privacidade e confirmação de zero regressão em `/api/generate` e no restante do produto.
- **Tarefa 9 — Encerramento documental**: este fechamento.

## Suzzy Assist — o que foi criado

- **Endpoint**: `app/api/assist/route.ts` — público, `POST`, sem exigir autenticação.
- **Base de conhecimento**: `lib/agents/assist-knowledge.ts`.
- **Componente**: `components/suzzy-assist-chat.tsx` — widget flutuante no canto inferior direito.
- **Integração**: `app/page.tsx` (Landing Page), duas linhas adicionadas (import + render), sem alterar nenhuma outra seção da página.

## Suzzy Support — o que foi criado

- **Endpoint**: `app/api/support/route.ts` — autenticado, `POST`, exige sessão Supabase válida (`401` caso contrário).
- **Base de conhecimento**: `lib/agents/support-knowledge.ts`.
- **Componente**: `components/suzzy-support-chat.tsx` — widget flutuante visível apenas dentro do Dashboard autenticado.
- **Integração**: `app/dashboard/page.tsx`, duas linhas adicionadas (import + render), sem alterar o formulário ou qualquer outra parte do Dashboard.

## Correções de limite de histórico descobertas em testes reais

Durante testes manuais reais (não apenas simulados), identificou-se que o limite original de 1000 caracteres por mensagem de histórico (`MAX_HISTORY_MESSAGE_LENGTH`) era menor do que respostas legítimas que a própria IA podia gerar com o orçamento de `max_output_tokens: 500`. Isso fazia com que, em conversas normais, a resposta anterior do próprio agente fosse rejeitada como "histórico inválido" no turno seguinte, retornando `400` e exibindo ao usuário uma mensagem genérica de erro. Corrigido, com evidência real (respostas de até 1282 caracteres no Support e 2142 no Assist), elevando o limite para `2000` (Support) e `2500` (Assist). Ambas as correções foram revalidadas com conversas multi-turno reais/simuladas após o ajuste, sem novas ocorrências do problema.

## Resultado da validação final

- Nenhuma regressão funcional encontrada em `/api/generate`, autenticação, histórico de gerações, templates, cenários, objeções ou estratégias.
- Nenhuma promessa de ação inexistente, vazamento de prompt/chave/dados de outros usuários, ou repetição desnecessária de apresentação, nos dois agentes.
- Suzzy Support confirmada como agente de orientação: não executa ações, não substitui a geração principal, explica estratégias como automáticas e o histórico como local ao navegador.
- Nenhum segredo, prompt ou conhecimento interno presente no bundle enviado ao navegador (verificado por inspeção do build compilado).
- `npm run lint` e `npm run build` aprovados em todas as tarefas que alteraram código.
- Veredito da Tarefa 8: **Sprint 16 aprovada para encerramento.**

## Confirmações

- **`/api/generate` permaneceu intacto** durante toda a Sprint 16 — confirmado repetidamente por `git diff`, sem nenhuma alteração.
- **Nenhuma regressão funcional foi encontrada** em nenhuma área do produto existente antes desta sprint.

## Pendências antes de exposição pública em produção

Esta sprint conclui a **primeira versão funcional** dos dois agentes, mas as pendências abaixo devem ser resolvidas antes do lançamento comercial público:

1. **Rate limiting real para `/api/assist`** — endpoint público, hoje sem nenhum controle de abuso ou custo por visitante.
2. **Rate limiting por usuário para `/api/support`** — endpoint autenticado, mas ainda sem limite de custo por conta.
3. **Atualização dos documentos jurídicos da Sprint 15** (`docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/AI_TRANSPARENCY.md`) para cobrir as mensagens enviadas pela Suzzy Assist e pela Suzzy Support à OpenAI.

## Melhoria futura não bloqueante

- Evitar que a Suzzy Support sugira o uso do fluxo principal de geração para perguntas completamente fora do propósito imobiliário da plataforma (observado em teste com uma pergunta de receita culinária) — comportamento inofensivo, mas que pode ser refinado em uma iteração futura das instruções do agente.
