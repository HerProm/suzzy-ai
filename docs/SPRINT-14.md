# Sprint 14

## Objetivo

Desenvolver a Landing Page Comercial da SUZZY AI, proporcionando uma excelente primeira impressão ao visitante e aumentando a conversão de novos usuários.

## Escopo

1. Planejamento.
2. Estrutura da Landing Page.
3. Hero Section.
4. Seção "Problema".
5. Seção "Solução".
6. Seção "Como Funciona".
7. Seção "Benefícios".
8. Seção "Para quem é a SUZZY AI".
9. Chamada para ação (CTA).
10. Validação.
11. Documentação.

## Fora do escopo

- Alterações na autenticação.
- Dashboard.
- API.
- Banco de dados.
- Integrações externas.
- Área administrativa.
- Sistema de cobrança.
- Documentação jurídica (será desenvolvida na Sprint 15).

## Estrutura da Landing Page

Blueprint da página, seção por seção, na ordem em que serão exibidas. Cada seção tem um objetivo específico e uma intenção de conversão — o visitante deve avançar por um funil de "entender o problema" → "confiar na solução" → "agir".

### 1. Hero Section

**Ordem de exibição:** 1 (primeira dobra, sem rolagem).

**Conteúdo:**
- Logo SUZZY AI.
- Headline principal.
- Subheadline.
- Botão principal: "Experimente gratuitamente por 15 dias" (sem emoji — decisão de produto registrada na validação final; ver seção "Decisão de produto" abaixo).
- Botão secundário: "Entrar".
- Screenshot do Dashboard.

**Objetivo:** Comunicar em segundos o que é a SUZZY AI e para quem é, gerando a primeira impressão que decide se o visitante continua rolando a página.

**Intenção de conversão:** Captar o visitante já decidido (que veio pronto para testar) através do CTA principal, e reconhecer o usuário que já tem conta através do botão "Entrar" — sem forçar todo mundo a ler a página inteira antes de agir.

### 2. Seção "O problema"

**Ordem de exibição:** 2.

**Conteúdo:** os principais desafios do dia a dia do corretor:
- excesso de mensagens;
- dificuldade em responder objeções;
- follow-up;
- falta de tempo;
- insegurança nas negociações.

**Objetivo:** Fazer o visitante se reconhecer na dor descrita ("isso sou eu"), criando identificação antes de qualquer menção ao produto.

**Intenção de conversão:** Preparar o terreno emocional para a seção seguinte — um visitante que não se reconhece no problema dificilmente vai valorizar a solução.

### 3. Seção "A solução"

**Ordem de exibição:** 3.

**Conteúdo:** como a SUZZY AI resolve os problemas apresentados, organizada em três pilares:
- Atendimento Inteligente;
- Negociação Estratégica;
- Orientação Comercial.

**Objetivo:** Apresentar o produto como resposta direta a cada dor listada na seção anterior, sem entrar em detalhes técnicos.

**Intenção de conversão:** Construir a percepção de valor ("isso resolve o meu problema") que sustenta a decisão de testar o produto mais adiante.

### 4. Seção "Como funciona"

**Ordem de exibição:** 4.

**Conteúdo:** fluxo de uso em quatro etapas:
1. Descreva o contexto.
2. Escolha o cenário.
3. Escolha a objeção.
4. Receba uma resposta estratégica.

**Objetivo:** Reduzir a incerteza sobre "como eu uso isso", mostrando que o processo é simples e rápido.

**Intenção de conversão:** Diminuir a fricção percebida antes do cadastro — um fluxo claro em 4 passos reduz o medo de "ferramenta complicada".

### 5. Seção "Benefícios"

**Ordem de exibição:** 5.

**Conteúdo:** benefícios práticos e mensuráveis:
- economia de tempo;
- respostas profissionais;
- apoio durante negociações;
- aumento da produtividade.

**Objetivo:** Traduzir as funcionalidades em ganhos concretos para a rotina do corretor.

**Intenção de conversão:** Reforçar o retorno percebido do uso da ferramenta, aumentando a disposição a experimentar.

### 6. Seção "Para quem é"

**Ordem de exibição:** 6.

**Conteúdo:** público-alvo declarado:
- corretores autônomos;
- pequenas imobiliárias.

**Objetivo:** Ajudar o visitante a se autoidentificar como o público certo para o produto, e sinalizar quem a SUZZY AI atende hoje.

**Intenção de conversão:** Aumentar a confiança de quem se encaixa no perfil ("isso é pra mim") imediatamente antes da chamada final para ação.

### 7. CTA Final

**Ordem de exibição:** 7 (última seção da página).

**Conteúdo:**
- Título de encerramento.
- Botão: "🚀 Experimente gratuitamente por 15 dias" (o emoji foi mantido nos CTAs posteriores ao Hero).
- Observação: "Sem cartão de crédito • Sem compromisso" (texto final, ajustado durante os refinamentos da tarefa 12).

**Objetivo:** Oferecer uma última chamada para ação a quem leu a página inteira sem converter na Hero Section, removendo objeções finais (custo, compromisso).

**Intenção de conversão:** Fechar o funil capturando o visitante que precisava de mais contexto antes de decidir — a observação sobre cartão de crédito/cancelamento existe especificamente para reduzir o risco percebido nesse momento de decisão.

## Definition of Done

- Landing Page implementada.
- Navegação preservada.
- Design responsivo.
- CTA principal do Hero:
  "Experimente gratuitamente por 15 dias"
  (sem emoji — o emoji 🚀 é usado nos CTAs seguintes: seção Planos e CTA Final).
- Nenhuma regressão.
- npm run lint aprovado.
- npm run build aprovado.

## Status

Concluída em 2026-08-05.

## Resumo das tarefas executadas

- **Tarefa 1 — Planejamento**: criação deste documento com objetivo, escopo, fora do escopo e Definition of Done.
- **Tarefa 2 — Estrutura da Landing Page**: blueprint completo das 7 seções principais (objetivo, ordem de exibição e intenção de conversão de cada uma), documentado acima em "Estrutura da Landing Page".
- **Tarefa 3 — Hero Section**: implementada em `app/page.tsx` como a rota `/`, substituindo o boilerplate padrão do Next.js. Título, subheadline, CTA principal, botão "Entrar" e uma prévia visual (mockup) do dashboard.
- **Tarefa 4 — Cabeçalho comercial e seção "O problema"**: cabeçalho fixo com marca, navegação por âncoras (Recursos, Como funciona, Planos, Perguntas frequentes) e botão "Entrar"; seção "O problema" com os cinco desafios do corretor.
- **Tarefa 5 — Seção "A solução"**: os três pilares do produto (Atendimento Inteligente, Negociação Estratégica, Orientação Comercial), com `id="recursos"` fazendo o link do menu funcionar.
- **Tarefa 6 — Seção "Como funciona"**: fluxo de 4 etapas conectadas visualmente, com `id="como-funciona"`.
- **Tarefa 7 — Seção "Benefícios"**: quatro cartões de benefício, com `id="beneficios"`.
- **Tarefa 8 — Seções "Para quem é" e "Planos"**: público-alvo (corretor autônomo e pequena imobiliária) com `id="publico"`; primeira versão dos dois cartões de plano, com `id="planos"`.
- **Tarefa 9 — FAQ, CTA Final e Rodapé**: cinco perguntas frequentes com `id="perguntas-frequentes"`, seção de chamada final e rodapé com marca, links e copyright.
- **Ajuste de texto intermediário**: revisão da resposta do FAQ sobre proteção de dados, do texto de apoio do CTA final ("Sem cartão de crédito • Sem compromisso") e inclusão do aviso "Após o período gratuito de 15 dias." no plano Corretor.
- **Tarefa 11 — Validação de UX/conversão**: análise crítica da página como consultor de UX/SaaS B2B, sem alterar código, identificando pontos fortes, pontos fracos e melhorias priorizadas.
- **Tarefa 12 — Refinamentos finais**: criação da seção "Programa Fundadores SUZZY AI" (acima de "Planos"); selos de status nos planos ("🟢 Disponível agora" no Corretor, "🟡 Em desenvolvimento" na Imobiliária); novo texto do plano Imobiliária; e ajustes de comunicação em `/login` para acolher tanto quem já tem conta quanto quem está iniciando o teste gratuito, sem alterar autenticação ou lógica.
- **Validação final**: verificação completa de todas as seções, da navegação, dos planos, do FAQ, do rodapé, da página `/login` e ausência de regressões em dashboard, API, histórico, templates, cenários, objeções, estratégias e autenticação. Identificada uma única inconsistência de copy (CTA do Hero sem o emoji 🚀 presente na Definition of Done original) — resolvida por decisão de produto (ver abaixo), não por alteração de código.
- **Tarefa (encerramento documental)**: este documento, refletindo a implementação final e a decisão de produto sobre o CTA do Hero.

## Arquivos alterados durante a sprint

- `docs/SPRINT-14.md` — criado e atualizado ao longo das tarefas.
- `app/page.tsx` — reescrito por completo: deixou de ser o boilerplate do Next.js e passou a ser a Landing Page Comercial (cabeçalho, Hero, Problema, Recursos, Como funciona, Benefícios, Público, Programa Fundadores, Planos, FAQ, CTA Final e Rodapé).
- `app/login/page.tsx` — apenas textos ajustados (subtítulo, rótulos dos botões, mensagem pós-Magic Link e aviso de criação automática de conta), sem alteração de autenticação ou lógica.

Nenhum outro arquivo foi tocado: dashboard, API de geração, hooks, histórico, templates, cenários, objeções e estratégias permanecem exatamente como estavam ao final da Sprint 13.

## Decisão de produto

O CTA principal do Hero foi mantido, deliberadamente, como **"Experimente gratuitamente por 15 dias"**, sem o emoji 🚀. Essa é a redação oficial desse botão específico. O emoji 🚀 continua sendo usado nos CTAs seguintes (seção "Programa Fundadores", botão do plano Corretor e CTA Final), que permanecem inalterados. A divergência identificada na validação final entre o Hero e a Definition of Done original (que citava o CTA com emoji) foi resolvida atualizando a própria Definition of Done para refletir esta decisão — nenhuma alteração de código foi necessária.

## Decisões comerciais vigentes

- Teste gratuito de 15 dias, sem exigência de cartão de crédito.
- Plano Corretor Autônomo: R$ 97/mês, cobrado após o período gratuito de 15 dias — **disponível agora**.
- Plano Pequena Imobiliária: R$ 247/mês — **em desenvolvimento**, sem previsão de data, botão de interesse desabilitado (sem ação).
- Programa Fundadores SUZZY AI: preço de lançamento garantido por 12 meses, acesso antecipado a novas funcionalidades e participação mais próxima na evolução da plataforma — oferta limitada aos 100 primeiros assinantes.

## Pendências conhecidas

Registradas para acompanhamento futuro, sem implementação nesta sprint:

- Termos de Uso e Política de Privacidade ainda apontam para `#` no rodapé — serão implementados na Sprint 15, conforme já previsto em "Fora do escopo".
- A navegação do cabeçalho fica oculta em telas pequenas (mobile), sem uma alternativa de menu — pode ser aprimorada em uma sprint futura.
- Os controles da página `/login` (botões e campo de e-mail) não têm destaque de foco visível (`focus-visible`) como o restante do produto — é uma melhoria de acessibilidade pendente, não introduzida nem alterada por esta sprint.

## Resultado da validação final

- Nenhuma regressão funcional encontrada em nenhuma área (landing page, login, dashboard, API, histórico, templates, cenários, objeções, estratégias, autenticação).
- `npm run lint` — sem erros.
- `npm run build` — sucesso, todas as rotas geradas normalmente.
- **Sprint 14 aprovada para encerramento.**
