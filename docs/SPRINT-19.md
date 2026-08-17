# Sprint 19 — Primeiro Deploy da SUZZY AI

## Objetivo

Preparar, com segurança, o primeiro deploy da SUZZY AI em um ambiente publicado de teste na Vercel, usando inicialmente o domínio temporário `*.vercel.app` — sem comprar domínio próprio e sem contratar o plano Pro agora. O objetivo desta fase **não é lançar um beta real**, é **comprovar que a aplicação funciona de ponta a ponta fora do `localhost`**.

Decisão já tomada pelo proprietário (contexto desta tarefa, não uma conclusão desta auditoria):
- não contratar Vercel Pro agora;
- usar o plano Hobby (gratuito) apenas para desenvolvimento/teste técnico, não comercial;
- domínio próprio fica para depois;
- primeiro provar que tudo funciona publicado, antes de qualquer decisão de beta ou lançamento.

Esta tarefa (Tarefa 1) é **exclusivamente de auditoria e planejamento**. Nenhum deploy foi realizado, nenhum domínio comprado, nenhuma configuração externa alterada, nenhum código funcional alterado.

## Estado herdado da Sprint 18

- **Técnico**: aprovado. Rate limiting real nos três endpoints de IA (`/api/generate` 8/60s+150/dia, `/api/assist` 5/60s+40/dia, `/api/support` 10/60s+100/dia), `max_output_tokens` configurado em todos, fail-closed, segredos server-side confirmados, `npm audit` só com 3 vulnerabilidades altas de dev-tooling (sem exposição em produção), lint/build aprovados.
- **Infraestrutura**: Vercel avaliada tecnicamente como adequada (Sprint 18, Tarefa 3), mas **nada foi contratado ou deployado ainda** — essa é exatamente a lacuna que esta sprint existe para fechar.
- **Jurídico**: documentos tecnicamente coerentes com o código, mas revisão profissional e dados institucionais seguem pendentes (P0 para lançamento comercial, não bloqueiam um deploy técnico privado).
- **Comercial**: sem cobrança, trial técnico, controle de plano ou suporte humano — tudo já mapeado e transparente (Sprint 18, Tarefa 7).
- **Decisão formal da Sprint 18**: beta fechado gratuito = GO COM CONDIÇÕES; beta pago e lançamento público = NO-GO. A recomendação de próxima direção foi justamente "resolver infraestrutura de produção" — esta sprint.

## Escopo

**Dentro do escopo desta sprint** (visão geral, detalhada tarefa a tarefa): auditoria e planejamento do deploy (esta tarefa); execução do primeiro deploy técnico na Vercel com domínio `*.vercel.app`; configuração das variáveis de ambiente necessárias; validação de ponta a ponta em ambiente publicado (Landing Page, login, Dashboard, os três agentes de IA, rate limiting); registro de qualquer ajuste técnico real necessário, descoberto só em produção.

**Fora do escopo desta sprint**: compra de domínio próprio; contratação do plano Pro (salvo impedimento técnico comprovado); implementação de cobrança; divulgação pública do link; convite de usuários reais de beta (isso é decisão de uma sprint/tarefa futura, após comprovar que o deploy técnico funciona).

## Riscos

- **Ambiguidade sobre uso comercial no plano Hobby** (detalhada na seção "Vercel — Plano Hobby" abaixo): a Landing Page já contém conteúdo comercial (preços, Programa Fundadores). Um deploy técnico privado, não divulgado, é uma leitura defensável de "uso não comercial" — mas a mesma leitura fica mais frágil assim que houver usuários reais convidados, mesmo sem cobrança. Risco registrado para decisão futura, não resolvido nesta tarefa.
- **`NEXT_PUBLIC_APP_URL` incorreta quebra o login por completo** — já identificado como P0 desde a Sprint 18, Tarefa 1; esta sprint é onde esse risco finalmente é resolvido na prática.
- **Primeira exposição real dos headers de IP fora do `localhost`** — a estratégia de rate limiting do Assist nunca foi validada contra tráfego real da Vercel, só em teoria (Sprint 18, Tarefa 3) e em `localhost` (onde os headers podem ser forjados livremente nos testes).
- **Primeira execução real do build da Vercel** — diferente do `next build` local; pode revelar diferenças de ambiente (versão de Node, variáveis ausentes) só visíveis em produção.
- **Custo real de OpenAI/Upstash pela primeira vez fora de controle 100% local** — mitigado pelas quatro camadas de proteção já implementadas (Sprint 18), mas ainda não testado em ambiente onde qualquer pessoa com o link poderia, em tese, acessar.

## Checklist inicial (visão executiva — detalhado nas seções técnicas abaixo)

- [ ] Confirmar leitura desta auditoria e aprovar a Tarefa 1.
- [ ] Decidir a ambiguidade de uso comercial no Hobby para a fase de deploy técnico privado (seção "Vercel — Plano Hobby").
- [ ] Criar/conectar conta Vercel (Tarefa 2, não nesta).
- [ ] Importar o repositório GitHub já existente (`github.com/HerProm/suzzy-ai`, branch `master`, já sincronizado com o último commit local).
- [ ] Configurar as variáveis de ambiente possíveis antes do domínio existir.
- [ ] Realizar o primeiro deploy.
- [ ] Obter a URL `*.vercel.app` real.
- [ ] Configurar `NEXT_PUBLIC_APP_URL`, Supabase e Google OAuth com a URL real.
- [ ] Testar de ponta a ponta (roteiro completo na seção 14).

## Sequência proposta de tarefas da Sprint 19

1. **Auditoria e planejamento do primeiro deploy** (esta tarefa).
2. **Criação do projeto na Vercel e configuração inicial** — conectar conta, importar repositório, configurar variáveis já disponíveis, sem realizar o deploy definitivo ainda (ou realizando um primeiro deploy só para obter a URL, conforme decidido na Tarefa 2).
3. **Obtenção da URL `*.vercel.app` e configuração de `NEXT_PUBLIC_APP_URL`, Supabase e Google OAuth**.
4. **Redeploy e validação de ponta a ponta** — executar o roteiro de testes da seção 14/16 desta auditoria.
5. **Registro de ajustes técnicos reais encontrados em produção** (se houver) e encerramento documental da sprint.

*Sequência sujeita a ajuste caso a Tarefa 2 revele necessidade técnica real não prevista nesta auditoria.*

---

## Auditoria do projeto para deploy

Revisão direta do código (não presumida de sprints anteriores) de `package.json`, `package-lock.json`, `next.config.ts`, `.env.example`, `.gitignore`, estrutura de `app/`, `app/api/*`, autenticação Supabase, `proxy.ts`, scripts de build/start.

- **`package.json`**: `next@16.3.0`, `react@19.2.4`, `@supabase/ssr@^0.12.3`, `@supabase/supabase-js@^2.110.8`, `@upstash/ratelimit@^2.0.8`, `@upstash/redis@^1.38.2`, `openai@^6.49.0`. Scripts padrão do Next.js (`dev`, `build`, `start`, `lint`) — nenhum script customizado que pudesse confundir o build da Vercel. **Sem campo `engines`** — versão de Node não fixada (ver seção "Node.js" abaixo).
- **`package-lock.json`**: presente e sincronizado (`npm audit`/`npm run build` já rodaram sobre ele na Sprint 18 sem erro) — a Vercel usa `npm ci` por padrão quando encontra um `package-lock.json` válido.
- **`next.config.ts`**: mínimo — só `turbopack.root` (caminho absoluto local, irrelevant fora do ambiente de build, não deveria causar problema na Vercel, mas registrado como ponto de atenção não comprovado) e `agentRules: false`. Nenhuma configuração de `images.domains`, `redirects`, `headers` customizados, nem `output: "standalone"` — comportamento padrão do Next.js na Vercel.
- **`.env.example`**: 6 variáveis (detalhadas na seção "Variáveis de ambiente"), sem valores. Comentário na linha 8 desatualizado desde a Sprint 18 (diz "usado por `/api/assist` e `/api/support`", faltando `/api/generate`) — já registrado como P2 na Sprint 18, não corrigido aqui (fora do escopo desta tarefa).
- **`.gitignore`**: `.env*` ignorado exceto `.env.example`; `.vercel` já ignorado (preparado para quando o CLI da Vercel for usado localmente, se for); `/.next/` ignorado corretamente.
- **`app/`**: estrutura padrão do App Router — `page.tsx` (Landing Page), `login/`, `dashboard/`, `auth/callback/`, `auth/logout/`, `api/{generate,assist,support}/`, mais as quatro páginas jurídicas. Nenhuma rota dinâmica com parâmetros de segmento, nenhum uso de `generateStaticParams`, nada que exija configuração especial de build.
- **`app/api/*`**: as três rotas não declaram `export const runtime`, portanto usam o runtime Node.js por padrão na Vercel (confirmado na Sprint 18, Tarefa 3, e reconfirmado nesta tarefa por leitura de código) — compatível com `node:crypto` (usado em `lib/rate-limit/identifier.ts`) e com o SDK da OpenAI.
- **Autenticação Supabase**: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/proxy.ts` usam `@supabase/ssr`, com um comentário já existente no código (`lib/supabase/proxy.ts`) que referencia explicitamente "Fluid compute" — terminologia própria da Vercel, confirmando que o código já foi escrito seguindo o guia oficial de integração Supabase + Vercel.
- **`proxy.ts`** (middleware): matcher padrão excluindo `_next/static`, `_next/image`, `favicon.ico` e extensões de imagem — configuração padrão, sem necessidade de ajuste para a Vercel.

**Nenhuma incompatibilidade comprovada com deploy na Vercel foi encontrada.** Nada foi corrigido nesta tarefa (não havia nada a corrigir).

## Vercel — compatibilidade (documentação oficial consultada nesta tarefa)

- **Next.js 16.3.0**: sem incompatibilidade encontrada; a Vercel é mantenedora do Next.js.
- **Route Handlers**: compatíveis, viram Vercel Functions.
- **Runtime esperado**: Node.js, por padrão, para as três rotas de API (confirmado na auditoria de código acima).
- **Variáveis de ambiente**: suportadas nativamente, com escopo por ambiente (Production/Preview/Development) — confirmado em `vercel.com/docs/environment-variables/framework-environment-variables`.
- **Domínio automático `*.vercel.app`**: gerado automaticamente a cada projeto/deploy, com **HTTPS automático** — padrão da plataforma, sem configuração manual necessária.
- **Deploy via integração com GitHub**: suportado nativamente — o projeto já tem um remote real (`github.com/HerProm/suzzy-ai`), o que simplifica a Tarefa 2 (importar em vez de criar do zero).
- **Production vs. Preview Deployments**: pushes para a branch de produção (por padrão, a branch default do repositório — este projeto usa `master`) geram um deploy de Production; qualquer outra branch/PR gera um Preview Deployment com URL própria e efêmera.

Nenhum projeto foi criado na Vercel nesta tarefa. Nenhum plano foi contratado.

## Vercel — Plano Hobby (reconfirmado nesta tarefa, com distinção A/B/C pedida)

Consultado diretamente `vercel.com/docs/plans/hobby` e `vercel.com/docs/limits/fair-use-guidelines` (ambos verificados nesta tarefa, não reaproveitados sem checar). Texto oficial atual: *"Hobby teams are restricted to non-commercial personal use only... Commercial usage is defined as any Deployment that is used for the purpose of financial gain of **anyone** involved in **any part of the production** of the project"* — com exemplos explícitos: processar pagamento, **anunciar a venda de um produto ou serviço**, receber pagamento para criar/hospedar o site, affiliate linking, anúncios, doações.

**"Gratuito" não significa automaticamente "não comercial"** — são conceitos diferentes na própria definição da Vercel, exatamente como a tarefa pediu para não presumir.

Aplicando aos três cenários pedidos:

- **A. Desenvolvimento/teste técnico não comercial (o que esta sprint pretende fazer)**: um deploy **não divulgado publicamente**, usado apenas pelo próprio proprietário/equipe para verificar que a aplicação funciona de ponta a ponta, sem visitantes reais e sem promoção — é uma leitura razoável de "uso pessoal/não comercial", mesmo que o código contenha texto de marketing (o conteúdo existir no repositório não é o mesmo que o *deployment* estar "sendo usado para" anunciar algo a alguém). **Recomendação prática de reforço, não implementada aqui**: habilitar o recurso *Vercel Authentication* (Deployment Protection, disponível no Hobby) para impedir acesso de qualquer pessoa fora da conta durante esta fase — reforça objetivamente que o deploy é privado, não fica só na intenção. Fica registrado como passo a considerar na Tarefa 2.
- **B. Beta fechado gratuito (próxima fase, fora do escopo desta sprint)**: **ambígua — registrada para decisão futura, não resolvida aqui.** No momento em que pessoas reais convidadas começam a acessar a Landing Page com preços e Programa Fundadores, o deployment passa a estar, na prática, "anunciando a venda de um produto" a essas pessoas — mesmo sem cobrança. A própria Vercel reconhece a ambiguidade e recomenda contato com o suporte em caso de dúvida (*"If you are unsure whether or not your site would be defined as commercial usage, please contact the Vercel Support team"*). Não decidido aqui, não presumido como seguro nem como proibido.
- **C. Uso comercial real (cobrança, divulgação pública ampla)**: **exige Pro**, sem ambiguidade — já concluído na Sprint 18 e reconfirmado agora.

**Nenhum impedimento técnico comprovado** para o teste técnico (cenário A) foi encontrado nos limites do Hobby relevantes ao nosso estágio: Function Invocations (1M/mês), Active CPU (4 CPU-hrs), duração máxima de função (300s, muito acima do necessário para as chamadas à OpenAI), 100 deploys/dia, 50 domínios por projeto. **Não recomendo Pro nesta tarefa** — não há impedimento comprovado para o teste técnico, conforme instruído.

**Limitação menor identificada, não bloqueante**: Runtime Logs no Hobby ficam disponíveis por só **1 hora** (vs. 1 dia no Pro) — relevante para depuração após o fato, registrado como P2.

## Variáveis de ambiente

Nenhum valor foi lido, impresso ou copiado de `.env.local`. Mapeamento por uso real no código (`process.env.*`, já auditado nas Sprints 17/18 e reconfirmado agora):

| Variável | Pública/Privada | Onde é usada | Development | Preview | Production | Contém segredo? | Configurar manualmente na Vercel? |
|---|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | `lib/supabase/{client,server,proxy}.ts` | Sim | Sim | Sim | Não | Sim |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Pública | idem | Sim | Sim | Sim | Não (chave publicável, projetada para exposição) | Sim |
| `NEXT_PUBLIC_APP_URL` | Pública | `app/login/page.tsx` (redirect OAuth/Magic Link) | Sim (`localhost`) | Sim (URL de preview, quando aplicável) | Sim (URL real de produção) | Não | **Sim, com valor diferente por ambiente** — ver seção dedicada abaixo |
| `OPENAI_API_KEY` | **Privada** | `lib/ai/client.ts`, as três rotas `app/api/*/route.ts` | Sim | Sim | Sim | **Sim** | Sim, marcada como *Sensitive* |
| `UPSTASH_REDIS_REST_URL` | **Privada** | `lib/rate-limit/redis.ts` | Sim | Sim | Sim | **Sim** | Sim, *Sensitive* |
| `UPSTASH_REDIS_REST_TOKEN` | **Privada** | idem | Sim | Sim | Sim | **Sim** | Sim, *Sensitive* |

Todas as seis são necessárias nos três ambientes — não há variável exclusiva de um único ambiente, exceto pelo **valor** de `NEXT_PUBLIC_APP_URL` (ver abaixo).

## `NEXT_PUBLIC_APP_URL`

Usada em exatamente dois pontos, ambos em `app/login/page.tsx`: `redirectTo` do `signInWithOAuth` (Google) e `emailRedirectTo` do `signInWithOtp` (Magic Link), ambos montados como `` `${NEXT_PUBLIC_APP_URL}/auth/callback` ``. **Confirmado nesta tarefa**: `app/auth/callback/route.ts` **não depende** dessa variável — ele deriva o `origin` diretamente da própria URL da requisição recebida, então o redirect final (`/dashboard` ou `/login`) sempre aponta para o domínio real de onde a requisição chegou, sem depender de nenhuma configuração. Isso significa que o único ponto crítico é: `NEXT_PUBLIC_APP_URL` precisa corresponder a uma URL que também esteja na lista de **Redirect URLs** do Supabase — se não corresponder, o próprio Supabase rejeita o redirect antes mesmo de chegar à aplicação.

**Não é possível inventar a URL antes de o projeto existir.** Sequência correta, confirmada como a única ordem tecnicamente possível:

1. Criar o projeto/primeiro deploy na Vercel (Tarefa 2) — a Vercel atribui a URL `*.vercel.app` automaticamente, não é escolhida antes.
2. Obter a URL real gerada.
3. Configurar `NEXT_PUBLIC_APP_URL` com essa URL real (painel da Vercel, variável de ambiente).
4. Redeploy — variáveis `NEXT_PUBLIC_*` são embutidas em tempo de build no Next.js, então uma mudança nessa variável **exige novo build/deploy**, não só reiniciar o processo.

Nenhuma estratégia melhor sem alteração de código foi identificada para evitar esse redeploy único — é uma limitação inerente a como o Next.js embute variáveis `NEXT_PUBLIC_*` no bundle em tempo de build, não uma lacuna deste projeto especificamente.

## Supabase — checklist manual para o futuro deploy

- [ ] **Site URL**: configurar com a URL `*.vercel.app` real, só disponível após o primeiro deploy (Tarefa 2/3).
- [ ] **Redirect URLs**: incluir `https://<url-real>.vercel.app/auth/callback` — só disponível após o primeiro deploy.
- [ ] **Google OAuth**: confirmar que o provedor já configurado no Supabase continua válido (nenhuma alteração esperada nesse provedor especificamente, só nas URLs de redirect que dependem dele).
- [ ] **Magic Link**: nenhuma configuração adicional além da Site URL/Redirect URLs — o e-mail enviado já usa a Site URL configurada no Supabase.
- [ ] **Callback da aplicação**: `/auth/callback`, já implementado e não dependente de nenhuma configuração nova.
- [ ] **Logout**: `/auth/logout`, já implementado, sem dependência de URL externa.
- [ ] **Proteção do Dashboard**: já implementada via `getClaims()` — nenhuma mudança necessária para o deploy em si; deve ser **testada de novo** no ambiente publicado (roteiro da seção 14), não presumida como igual ao `localhost`.

**URLs que só poderão ser configuradas depois de conhecermos a URL `*.vercel.app`**: Site URL e Redirect URLs do Supabase — ambas dependem diretamente da URL real, que só existe após o primeiro deploy. Não acessado o painel do Supabase nesta tarefa.

## Google OAuth — checklist

Fluxo real (confirmado por leitura de `app/login/page.tsx` e `app/auth/callback/route.ts`): o botão "Continuar com Google" chama `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: ... } })` — é o **Supabase**, não a aplicação Next.js diretamente, quem troca o código OAuth com o Google.

- [ ] **Origem autorizada** (Authorized JavaScript origins, no Google Cloud Console): deve incluir a URL `*.vercel.app` real, quando conhecida.
- [ ] **Redirect URI do Google** (Authorized redirect URIs, no Google Cloud Console): deve ser a URL de callback **do próprio Supabase** (formato `https://<projeto>.supabase.co/auth/v1/callback`) — não a URL da aplicação. Esse valor exato deve ser confirmado no painel do Supabase (Authentication → Providers → Google), não presumido aqui, e **provavelmente já está configurado** desde que o login com Google já funciona em `localhost` hoje (o Redirect URI do Google aponta para o Supabase, que é o mesmo projeto independentemente do domínio da aplicação — só a Site URL/Redirect URLs do Supabase mudam por ambiente).
- [ ] **Callback da aplicação** (`/auth/callback`): já implementado, não depende do Google diretamente.

**Nenhuma credencial foi acessada. Nenhuma URL foi inventada.**

## OpenAI — checklist

Confirmado por leitura de código (Sprint 18, Tarefa 8, reconfirmado agora): `OPENAI_API_KEY` é usada exclusivamente em `lib/ai/client.ts` e nas três rotas server-side — nunca em componente `"use client"`, nunca com prefixo `NEXT_PUBLIC_`. **Nenhuma configuração especial da OpenAI é necessária apenas por sair do `localhost` para a Vercel** — a chamada é feita server-side em ambos os casos, a OpenAI não distingue a origem da requisição do servidor. Os três endpoints continuam protegidos exatamente como definido na Sprint 18 (rate limiting, `max_output_tokens`, fail-closed) — nenhuma dessas proteções depende do ambiente de hospedagem.

**Checklist de ações manuais futuras** (já registradas na Sprint 18, Tarefa 5, reafirmadas aqui): configurar hard spend limit e spend alerts no painel da OpenAI; confirmar a qual organização/projeto a chave em uso pertence.

## Upstash — checklist

- Variáveis necessárias: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (privadas, seção "Variáveis de ambiente").
- Conexão via REST: já confirmada compatível com ambientes serverless/Vercel na Sprint 17 (o SDK `@upstash/redis` usa `fetch`, sem conexão TCP persistente) — nenhuma mudança nesta tarefa.
- Região do banco já registrada: São Paulo, Brasil (banco `suzzy-ai-ratelimit`, plano Free — Sprint 17).
- Rate limiting dos três endpoints: já implementado e testado (Sprint 17/18); deve ser **reconfirmado no ambiente publicado** (roteiro da seção 14), não presumido idêntico.
- Nenhuma dependência de estado local do servidor — confirmado, é exatamente o problema que o Upstash resolve (Sprint 17, Tarefa 1).

**Checklist para configurar na Vercel**: `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` como variáveis privadas (*Sensitive*), no mesmo passo das demais. **Nenhum token ou URL foi acessado, impresso ou copiado nesta tarefa.**

## Headers de IP — revalidação

Reconfirmado nesta tarefa contra `vercel.com/docs/headers/request-headers` (`last_updated: 2025-12-13`, texto idêntico ao já verificado na Sprint 18, Tarefa 3 — sem mudança desde então): a Vercel **sobrescreve `x-forwarded-for` e não repassa IPs externos**, especificamente para prevenir spoofing; `x-real-ip` é idêntico a `x-forwarded-for` na Vercel; existe também `x-vercel-forwarded-for`, preservado mesmo que um proxy adicional na frente da Vercel sobrescreva o `x-forwarded-for`.

Comparado com `lib/rate-limit/identifier.ts` (`x-forwarded-for` → fallback `x-real-ip` → fallback `"unknown"`): **classificação A) implementação atual adequada** — mesma conclusão da Sprint 18, Tarefa 3, agora reconfirmada sem alteração na documentação da Vercel. Não é uma correção obrigatória antes do primeiro deploy, nem uma melhoria necessária antes do beta — é, na melhor das hipóteses, uma melhoria futura opcional (usar `x-vercel-forwarded-for` como sinal primário), já classificada como P2 na Sprint 18. **Nenhum código foi alterado nesta tarefa.**

## Node.js

`package.json` não fixa `engines`; não existe `.nvmrc` na raiz do projeto (confirmado nesta tarefa — só existe um `.nvmrc` irrelevante dentro de `node_modules/is-generator-function`). A Vercel detecta e usa uma versão padrão do Node.js para projetos Next.js quando nenhuma é especificada, mas essa versão padrão pode não ser exatamente a mesma usada localmente (`v24.13.0`, verificada nesta tarefa). **Recomendável fixar uma versão** (`engines.node` em `package.json`, e/ou selecionar a versão de Node no painel de configurações do projeto na Vercel) para evitar divergência entre local e produção — registrado como **tarefa futura (P1)**, não implementado aqui, `package.json` não foi alterado.

## Git / GitHub

Auditoria somente de leitura, sem push, sem troca de branch, sem reescrita de histórico:

- **Branch atual**: `master`.
- **Remote**: `origin` → `https://github.com/HerProm/suzzy-ai.git` (já existe, fetch e push configurados).
- **Sincronização**: `git status -sb` mostra `master...origin/master` sem indicação de "ahead"/"behind" — a branch local está sincronizada com o remote (o último commit local, de encerramento da Sprint 18, já inclui `git push` na própria mensagem, confirmando que já foi enviado).
- **`.gitignore`**: ignora `.env*` exceto `.env.example`.
- **`.env.local` rastreado?** `git ls-files` filtrado por `.env` retorna **somente** `.env.example` — **não confirmado que `.env.local` nunca esteve no histórico** (uma auditoria completa do histórico exigiria varrer todos os commits, não feita nesta tarefa por não ser estritamente necessária: o arquivo não está no snapshot atual nem seria in-scope reescrever histórico mesmo que estivesse). **Registrado como "confirmado para o estado atual, não para todo o histórico."**
- **Segredo conhecido no Git**: nenhum encontrado no snapshot atual (mesma conclusão já obtida por buscas textuais nas Sprints 17/18, reforçada agora pela ausência de `.env.local` no `git ls-files`).

**Achado favorável para a Tarefa 2**: como o remote já existe e está sincronizado, a etapa "importar repositório" na Vercel é literalmente selecionar o repositório já existente — não é necessário criar ou conectar um novo repositório GitHub.

---

## Primeiro deploy — roteiro passo a passo (planejado, não executado)

Ordem ajustada a partir do exemplo da tarefa, refletindo os achados desta auditoria (remote já existe; `NEXT_PUBLIC_APP_URL` só pode ser definida depois da URL real; Supabase/Google só depois disso):

1. Criar/conectar conta Vercel.
2. Importar o repositório `github.com/HerProm/suzzy-ai` (branch `master`) — já existente, não precisa ser criado.
3. Revisar as configurações de build detectadas automaticamente (framework Next.js, comando de build/start padrão) — confirmar, não presumir que estão corretas sem olhar.
4. Configurar as variáveis que já podem ser configuradas agora, sem depender da URL: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. Deixar `NEXT_PUBLIC_APP_URL` com um valor provisório (ou vazio) por enquanto.
5. Realizar o primeiro deploy — o objetivo deste deploy inicial é só **obter a URL real**; espera-se que o login ainda não funcione corretamente até o passo 8.
6. Obter a URL `*.vercel.app` real gerada.
7. Configurar `NEXT_PUBLIC_APP_URL` com essa URL real.
8. Configurar Supabase (Site URL + Redirect URLs) com a mesma URL real.
9. Confirmar/ajustar Google OAuth no Google Cloud Console, se necessário (provavelmente já correto, ver checklist específico).
10. Redeploy — necessário porque `NEXT_PUBLIC_APP_URL` é embutida em tempo de build.
11. Testar Landing Page.
12. Testar páginas jurídicas (`/privacidade`, `/termos`, `/ia`, `/cookies`).
13. Testar login (Google e Magic Link).
14. Testar Dashboard protegido (acesso autenticado e redirecionamento sem sessão).
15. Testar `/api/generate` autenticado.
16. Testar Suzzy Assist (pública).
17. Testar Suzzy Support (autenticado).
18. Testar logout.
19. Testar rate limiting (ao menos confirmar que o mecanismo responde; não é necessário esgotar o limite de propósito).
20. Revisar logs (1 hora de retenção no Hobby, checar logo após os testes) e os painéis de custo da OpenAI/Upstash.

*Este roteiro é o plano para a Tarefa 2 em diante — nada dele foi executado nesta tarefa.*

## Rollback — procedimento simples (planejado)

- **Deploy com problema geral**: a Vercel mantém deploys anteriores; usar o botão de rollback/"Promote to Production" de um deploy anterior estável direto no painel — não requer nenhuma ação de código.
- **Variáveis de ambiente incorretas**: corrigir a variável no painel e fazer redeploy (mesma mecânica do passo 10 do roteiro) — reversível a qualquer momento, sem risco para o código.
- **Falha de autenticação** (login quebrado): sintoma mais provável é `NEXT_PUBLIC_APP_URL`/Redirect URLs desalinhadas — corrigir a variável/configuração do Supabase e redeploy; não é um problema de código, então não exige reverter nada no Git.
- **Falha da OpenAI** (chave inválida/indisponibilidade): os três endpoints já retornam erro genérico (`502`) sem expor detalhe — não é uma falha que "quebra" o site, apenas a geração de respostas; corrigir a variável ou aguardar a OpenAI, sem necessidade de rollback de deploy.
- **Falha do Upstash**: já coberta pelo fail-closed (`503` genérico, sem OpenAI) — mesmo raciocínio acima.
- **Remoção temporária de acesso**: se necessário interromper o teste por completo, habilitar a *Vercel Authentication* (Deployment Protection, disponível no Hobby, mencionada na seção do Plano Hobby) restringe o acesso a contas autorizadas da equipe Vercel, sem precisar remover o deploy.

Nenhuma automação de rollback foi implementada — é um procedimento manual, documentado para a Tarefa 2 em diante.

## Critérios de sucesso do primeiro deploy

- [ ] Aplicação publicada via HTTPS (automático na Vercel).
- [ ] Nenhuma credencial exposta (bundle cliente, logs, respostas de erro).
- [ ] Landing Page renderiza corretamente.
- [ ] As quatro páginas jurídicas renderizam corretamente.
- [ ] Login funciona (Google e Magic Link).
- [ ] Dashboard protegido (bloqueia acesso sem sessão, permite com sessão).
- [ ] `/api/generate` funciona autenticado, sem truncamento.
- [ ] Suzzy Assist funciona (pública).
- [ ] Suzzy Support funciona (autenticado).
- [ ] Logout funciona.
- [ ] Rate limiting responde corretamente nos três endpoints.
- [ ] Erros não revelam segredos, stack traces ou detalhes internos.
- [ ] O ambiente local (`localhost`) continua funcionando normalmente após o deploy (nenhuma regressão causada pela configuração de produção).

## P0 / P1 / P2 — achados desta auditoria

Classificações reavaliadas nesta tarefa, não reaproveitadas automaticamente das sprints anteriores.

**P0 — impede o primeiro deploy técnico**: nenhum encontrado. Nenhuma incompatibilidade comprovada com a Vercel; toda a infraestrutura de código já está pronta.

**P1 — resolver antes do beta fechado** (não antes deste deploy técnico):
- Decidir a ambiguidade de uso comercial do Hobby para a fase de beta (não para esta fase de teste técnico privado).
- Fixar a versão do Node (`engines`/`.nvmrc`) para evitar divergência local/produção.
- Corrigir o comentário desatualizado em `.env.example` (linha 8) — trivial, ainda não feito.
- Revalidar rate limiting/headers de IP contra tráfego real da Vercel (não simulável em `localhost`) assim que o deploy existir.

**P2 — melhoria posterior**:
- Considerar `x-vercel-forwarded-for` como sinal primário de IP (já registrado na Sprint 18).
- Retenção de Runtime Logs de só 1 hora no Hobby — considerar exportar/observar logs mais de perto durante os primeiros testes reais.
- Avaliar, futuramente, se a *Vercel Authentication* deve continuar ativa além da fase de teste técnico ou ser removida antes de qualquer convite de beta.

---

## Tarefa 2 — Validação funcional real em produção (interrompida por bug real — aguardando ação do proprietário)

Tarefa iniciada como auditoria + teste. **Interrompida no meio do roteiro** por um bug real e reproduzível encontrado na Suzzy Assist em produção — conforme instruído, o diagnóstico não foi contornado nem simulado, e a tarefa não avançou para os itens que exigem sessão autenticada real.

### 1. Marco de autenticação (confirmado manualmente pelo proprietário, registrado como evidência)

- Deployment de Production ativo em `https://suzzy-ai.vercel.app`.
- `NEXT_PUBLIC_APP_URL` corrigida para `https://suzzy-ai.vercel.app`.
- Novo deployment de Production realizado após a correção.
- Google OAuth testado manualmente em aba anônima: **Google → `/auth/callback` → sessão criada → `/dashboard`** — confirmado com sucesso.
- Dashboard acessado com sucesso em produção, autenticado.

Nenhum código OAuth, cookie, token ou credencial foi registrado aqui, conforme instruído.

**Confirmação técnica independente feita nesta tarefa** (não apenas aceitando o relato): busquei o JavaScript compilado servido publicamente em `/login` e confirmei que o bundle atual contém `redirectTo:"https://suzzy-ai.vercel.app/auth/callback"` e `emailRedirectTo:"https://suzzy-ai.vercel.app/auth/callback"` — valores corretos, em um chunk (`00gx1r_rng5t7.js`) diferente do bundle quebrado investigado na tarefa anterior (`3dq52o-22am_3.js`), confirmando que um redeploy real e distinto aconteceu. **Não reabri o diagnóstico anterior** — apenas confirmei, com evidência nova, que a correção está de fato no ar.

### 2. Configuração de produção — validado sem imprimir valores

| Variável | Situação confirmada |
|---|---|
| `NEXT_PUBLIC_APP_URL` | ✅ Correta — confirmada no bundle público (acima). |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ Corretas — confirmado indiretamente: OAuth completo funcionou, `/dashboard` reconheceu a sessão, e `POST /api/support`/`POST /api/generate` sem sessão retornaram `401` corretamente (prova que `lib/supabase/server.ts` — usado por ambas as rotas — está instanciando o cliente Supabase com sucesso em produção). |
| `OPENAI_API_KEY` | **Não confirmável isoladamente** — a rota que a usaria (Assist) crasha antes de chegar lá (ver achado abaixo). Não é possível afirmar se está presente/correta. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | **Suspeita de problema** — ver achado abaixo. Não confirmável como corretas; o comportamento observado é consistente com uma falha nessa etapa. |
| Deployment Production = branch `master` | **Não confirmável sem acesso ao painel da Vercel** (não tenho credenciais/API da Vercel). Evidência indireta a favor: o bundle do `/login` mudou de hash entre a tarefa anterior e esta, compatível com um redeploy recente da branch corrente. |

### 3–5. Geração principal (Generate) e Suzzy Support — **NÃO TESTADOS**

**Motivo**: ambos exigem uma sessão autenticada real pelo fluxo normal da interface. Não tenho navegador nem credenciais de login neste ambiente, e — conforme instrução explícita — **não vou contornar autenticação, fabricar sessão nem simular sucesso**. Além disso, dado o bug real encontrado no item 5 (abaixo), testar esses dois agora seria arriscado sem antes entender a causa, já que os três endpoints compartilham exatamente o mesmo padrão de código na inicialização do rate limiter.

**Preciso que você realize manualmente, e me informe o resultado exato (status HTTP e se apareceu resposta ou erro)**:
1. Logado no Dashboard em produção, gerar uma resposta normal (`/api/generate`, um envio comum pela interface).
2. Na mesma sessão, enviar uma mensagem simples para a Suzzy Support (widget do Dashboard).

Se qualquer um dos dois falhar com um erro genérico ("Não foi possível...") sem mais detalhes, isso já seria um forte indício de que o mesmo bug do item 5 também os atinge — me avise mesmo assim, com o texto exato da mensagem de erro exibida.

### 5. Suzzy Assist — **FAIL confirmado, bug real reproduzido**

Testei via `POST https://suzzy-ai.vercel.app/api/assist` (uma mensagem real, simples), a mesma forma como o widget público da Landing Page chama o endpoint.

**Resultado**: `HTTP 500`, corpo de resposta **vazio** (`Content-Length: 0`), sem JSON, sem mensagem de erro — não é uma das respostas de erro já previstas no código (`400`, `429`, `503`, `502` sempre vêm com corpo JSON `{"error": "..."}`; só o caso `!OPENAI_API_KEY` retorna `500`, mas **com** corpo JSON — o que recebemos não tem corpo algum).

**Diagnóstico diferencial feito** (sem custo de OpenAI):
- `GET /api/assist` → `405` (Method Not Allowed) — confirma que o módulo da rota carrega normalmente; o problema não é de build/import quebrado, é de execução dentro do handler `POST`.
- `POST /api/support` e `POST /api/generate`, ambos sem sessão → `401` normalmente — confirma que a checagem de autenticação (Supabase) funciona bem em produção, mas **não exercita** o código de rate limiting dessas duas rotas (o `401` acontece antes de qualquer chamada a `getSupportRateLimiters()`/`getGenerateRateLimiters()`).

**Causa mais provável, por revisão de código** (hipótese fundamentada, não confirmada por stack trace — não tenho acesso aos logs da Vercel): em `app/api/assist/route.ts`, as chamadas `getAssistRateLimiters()` e `getAssistRateLimitIdentifier(request)` **não estão dentro de nenhum bloco `try/catch`** — só a chamada seguinte, `checkRateLimit(...)`, está protegida. Se `new Redis(...)` ou `new Ratelimit(...)` (dentro de `lib/rate-limit/redis.ts`/`limiters.ts`) lançar uma exceção síncrona por qualquer motivo específico do ambiente de produção (não reproduzido em nenhum teste local ou de sprints anteriores), essa exceção escapa de todo o código da aplicação, o Next.js/Vercel não tem um `NextResponse` para devolver, e a plataforma retorna um `500` vazio — exatamente o sintoma observado. **Isso é uma lacuna real no código** (o desenho pretendia fail-closed em todo lugar, mas essa inicialização especificamente não está protegida), independentemente de qual seja a causa exata do lançamento da exceção.

**Como as três rotas (`assist`, `support`, `generate`) compartilham o mesmíssimo padrão não protegido** (`getXRateLimiters()` fora de `try/catch`), a Suzzy Assist é a única que expõe isso sem exigir login — mas o mesmo código existe, inalterado, em `/api/support` e `/api/generate`, alcançável assim que a checagem de autenticação passa. **Não sei se eles também falham — preciso do seu teste manual (itens 3–4 acima) para saber.**

### 6. Logout — **NÃO TESTADO**

Requer sessão autenticada real. Preciso que você, com uma sessão ativa, execute logout pela interface, tente acessar `/dashboard` de novo (deve redirecionar para `/login`) e confirme se um novo login continua funcionando.

### 7. Magic Link — **aguardando teste manual do proprietário**

A configuração (`NEXT_PUBLIC_APP_URL`, Redirect URLs) é a mesma usada pelo Google OAuth, já confirmada correta no bundle (item 1) — não há evidência de que Magic Link estaria diferente. Mas não posso testar sem acesso a uma caixa de e-mail real. Fluxo esperado: e-mail → link → `/auth/callback` → `exchangeCodeForSession` → `/dashboard`. **Não inventado resultado** — genuinamente pendente do seu teste.

### 8. Logs da Vercel — **não acessível a mim**

Não tenho credenciais nem acesso ao painel/CLI da Vercel. **Preciso que você verifique os Runtime Logs** do deployment de Production atual (Vercel Dashboard → projeto → aba Logs, ou Deployments → deployment atual → Runtime Logs) filtrando por `/api/assist`, e me traga o texto do erro/stack trace (sem se preocupar em omitir nada — stack traces de erro não costumam conter segredos, mas se algo parecer uma chave/token, apague antes de colar aqui). Isso vai confirmar ou refutar a hipótese da seção 5.

### 9. Chamadas reais à OpenAI nesta tarefa

**Zero.** A falha na Suzzy Assist ocorre antes de qualquer chamada à OpenAI (a inicialização do rate limiter é a primeira coisa que a rota faz). Todos os outros testes desta tarefa (`GET /api/assist`, `POST /api/support` e `POST /api/generate` sem sessão) também não geram custo de IA.

### 10. Achado classificado

**P0 — Suzzy Assist completamente inoperante em produção** (`500` vazio em toda tentativa de uso pela Landing Page pública). Risco: além de quebrar a funcionalidade, um `500` sem tratamento é pior, do ponto de vista de robustez, do que o `503` fail-closed que o desenho original pretendia — embora, nesta investigação, nenhum segredo tenha aparecido exposto no corpo vazio da resposta. Causa mais provável (não confirmada por log): inicialização do rate limiter sem `try/catch` em `app/api/assist/route.ts` (e, potencialmente, no mesmo padrão em `app/api/support/route.ts` e `app/api/generate/route.ts`, ainda não testados). **Correção mínima recomendada, ainda não implementada**: envolver as chamadas `getAssistRateLimiters()`/`getSupportRateLimiters()`/`getGenerateRateLimiters()` (e a extração do identificador) no mesmo padrão `try/catch` → fail-closed (`503`) já usado para `checkRateLimit()`, preservando exatamente a mesma política, mensagens e comportamento — sem tocar em rate limiting, prompts, textos comerciais ou qualquer outra coisa. **Não implementada nesta tarefa**, aguardando sua aprovação e, idealmente, a confirmação do stack trace real (item 8) antes de aplicar.

### 11. Dashboard visual

Registrado apenas como observação do proprietário: o Dashboard parece visualmente simples. **Fica marcado como futura frente de UX/UI**, para uma tarefa/sprint dedicada, sem lógica alterada. Nenhuma ação nesta tarefa.

---

## Correção — Botão de logout ausente no Dashboard (concluída, aguardando aprovação para deploy)

### Causa encontrada

**Logout nunca foi exposto na interface.** A lógica já existia por completo desde etapas anteriores do projeto (`app/auth/logout/route.ts` — `POST` que chama `supabase.auth.signOut()` e redireciona para `/login` com `303`), mas **nenhum componente, botão, link ou formulário em todo o projeto chamava essa rota** — confirmado por busca textual por `signOut`/`logout`/`Sair` em todo o repositório, que só encontrou a própria definição da rota e uma menção em comentário (não uma chamada real). O cabeçalho do Dashboard (`app/dashboard/page.tsx`) continha apenas o nome do produto e um texto estático ("Assistente para corretores"), sem nenhum elemento interativo. Não é um bug de lógica quebrada — é uma funcionalidade que existia no backend e nunca foi conectada a nenhum lugar clicável.

### Arquivo alterado

`app/dashboard/page.tsx` — único arquivo alterado.

### Como foi implementado

Adicionado, no cabeçalho do Dashboard, um `<form action="/auth/logout" method="POST">` com um `<button type="submit">Sair</button>`, reaproveitando a rota já existente sem nenhuma alteração nela. Por ser um formulário HTML nativo com submissão `POST` real (não uma chamada `fetch`/client-side), funciona no Server Component do Dashboard sem exigir nenhum novo `"use client"`, nenhum novo estado, nenhuma nova dependência. Estilo do botão reaproveita exatamente a mesma classe já usada para o botão "Entrar" da Landing Page (borda, fundo branco, foco visível) — consistente com o restante da aplicação, sem introduzir um novo padrão visual.

### UX

- Texto visível ("Sair"), não depende de ícone.
- Estado de foco acessível (`focus-visible:outline`), mesmo padrão já usado em todos os outros botões/links do projeto.
- Funciona em desktop e mobile (formulário HTML nativo, sem JavaScript necessário para funcionar).
- Nenhum redesenho do Dashboard — o cabeçalho manteve a mesma estrutura, só ganhou o botão ao lado do texto já existente.

### Testes

- `npm run lint` ✅.
- `npm run build` ✅ — mesmas 15 rotas, incluindo `/auth/logout` inalterada.
- **Testado localmente**: `GET /dashboard` sem sessão → `307` para `/login` (comportamento de proteção inalterado). `POST /auth/logout` → `303`, `Location: http://localhost:3000/login` (confirma que a rota reagia corretamente antes e continua reagindo — nenhuma mudança nela).
- **Não testado localmente**: o clique real no botão dentro de uma sessão autenticada, por exigir login real (Google OAuth), indisponível neste ambiente automatizado. O comportamento esperado — `POST` do formulário para `/auth/logout`, que já chama `signOut()` e redireciona para `/login` — depende inteiramente da mesma rota já validada isoladamente acima; nenhuma lógica nova foi introduzida que pudesse se comportar diferente estando autenticado.

**Recomendo teste manual em produção antes ou logo após o deploy**: login → clicar em "Sair" → confirmar redirecionamento para `/login` → tentar acessar `/dashboard` de novo → confirmar redirecionamento para `/login` → confirmar que um novo login continua funcionando.

### Confirmações

- Google OAuth, Magic Link, `lib/supabase/*`, `proxy.ts` e a proteção de `/dashboard` (checagem `getClaims()`) — **não alterados**, confirmado via `git status` (único arquivo modificado é `app/dashboard/page.tsx`).
- Nenhum novo sistema de autenticação criado — reaproveitada 100% a rota `/auth/logout` já existente.

---

## Diagnóstico — Magic Link não conclui sessão em produção (investigação, sem correção aplicada)

Tarefa exclusivamente de diagnóstico. **Nenhum arquivo de código foi alterado.**

### 1–2. Fluxo atual auditado (confirmado por leitura de código, não presumido)

- `app/login/page.tsx`: `handleMagicLinkLogin()` chama `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: \`${NEXT_PUBLIC_APP_URL}/auth/callback\` } })` — envia o e-mail corretamente, apontando para a **mesma rota de callback usada pelo Google**.
- `app/auth/callback/route.ts`: lê **somente** o parâmetro `code` da URL (`searchParams.get("code")`) e, se presente, chama `exchangeCodeForSession(code)`. **Não existe nenhum tratamento para `token_hash` ou `type`** — confirmado por leitura completa do arquivo (19 linhas, sem nenhuma outra ramificação).
- Busca em todo o repositório por `verifyOtp`/`token_hash`: **nenhuma ocorrência em nenhum arquivo de código** — confirmado, não presumido.
- Não existe nenhuma outra rota em `app/auth/` além de `callback/route.ts` e `logout/route.ts` (confirmado por listagem direta do diretório).

**Conclusão da auditoria de código**: a aplicação tem exatamente **uma** rota de retorno de autenticação, e ela só sabe processar o formato de retorno do OAuth (`?code=...` → `exchangeCodeForSession`). Não existe, em lugar nenhum do código, um caminho que leve a `verifyOtp({ token_hash, type })`.

### 3. Documentação oficial do Supabase (consultada)

Consultado `supabase.com/docs/guides/auth/server-side/email-based-auth-with-pkce-flow-for-ssr` (guia oficial específico para este cenário — SSR + fluxo PKCE, que é o que `@supabase/ssr` usa por padrão e o que já confirmamos funcionando para o Google via `code`/`exchangeCodeForSession`).

Confirmado na documentação oficial:
- Para e-mail/Magic Link com PKCE em SSR, o template de e-mail deve apontar para uma URL no formato `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}` — **um formato de parâmetros completamente diferente do OAuth** (`token_hash`+`type`, nunca `code`).
- A rota que recebe esse link deve chamar `supabase.auth.verifyOtp({ type, token_hash })` — **não** `exchangeCodeForSession`.
- No exemplo oficial da Supabase, essa é uma rota própria (`/auth/confirm`), com uma lógica de verificação diferente da usada para OAuth.

**Isso confirma, com fonte primária, que Magic Link sob PKCE/SSR é estruturalmente um fluxo diferente do OAuth** — não é uma variação do mesmo `code`, é outro mecanismo (`token_hash`/`verifyOtp`), que este projeto nunca implementou.

### 4. Template de e-mail — o que precisa ser verificado no painel (não acessado nesta tarefa)

Sem acessar o painel, não é possível confirmar qual template exato está configurado hoje. **O que você precisa verificar** (Supabase Dashboard → Authentication → Email Templates → Magic Link): se o template ainda usa a variável padrão de confirmação (`{{ .ConfirmationURL }}`, formato de fábrica) ou se já foi customizado para o formato `token_hash`/`type` recomendado pela Supabase para PKCE/SSR. **Pela ausência completa de qualquer rota/código no projeto capaz de processar `token_hash`, é seguro concluir que o template nunca foi customizado para esse fluxo** — não há necessidade de acessar o painel para saber isso, o código já prova que o lado da aplicação não está pronto para nenhum dos dois formatos que a Supabase poderia enviar (nem `token_hash`, que precisaria de uma rota nova; nem o antigo formato implícito com tokens no fragmento da URL, que nunca chegaria ao servidor de qualquer forma).

Nenhum token real foi solicitado ou necessário para chegar a essa conclusão.

### 5. Evidência (sem acessar o link secreto)

- Código: callback só aceita `code` (seção 1–2).
- Documentação oficial: Magic Link em PKCE/SSR exige `token_hash`+`verifyOtp`, formato diferente (seção 3).
- Sintoma relatado: usuário volta para `/login` — exatamente o comportamento do próprio `app/auth/callback/route.ts` quando `code` está ausente (`if (code) {...}`, senão cai direto no `return NextResponse.redirect(`${origin}/login`)` final) — consistente com a rota receber uma requisição sem o parâmetro que ela sabe processar, qualquer que seja o formato realmente enviado pelo Supabase.

### 6. Causa raiz

**A + B, combinadas — a mesma causa vista por dois ângulos:**
- **A. O callback atual só suporta OAuth/code exchange** — confirmado por leitura de código, sem exceção.
- **B. Nenhuma rota do projeto processa o formato que a Supabase usa para Magic Link sob PKCE/SSR** (`token_hash`/`type` via `verifyOtp`) — confirmado pela documentação oficial e pela ausência total dessa lógica no código.

Não há evidência de **C** (Redirect URL incorreta — as mesmas URLs já validadas para o Google, e o Google usa a mesma rota com sucesso), nem de **D** (sessão criada mas redirect errado — nada indica que uma sessão chegou a ser criada). **E** (link expirado/uso único) não pode ser descartado como fator pontual em um teste específico, mas não é a causa estrutural — mesmo um Magic Link novo e válido falharia hoje, porque a rota de destino não sabe processar o formato que ele carrega.

### 7. Correção mínima recomendada (não implementada)

**Duas alternativas, ambas preservando o Google OAuth sem tocar nele:**

**Opção 1 — rota dedicada (recomendada, menor risco)**: criar `app/auth/confirm/route.ts`, no mesmo padrão de `app/auth/callback/route.ts` (mesmo `createClient()`, mesma lógica de redirect para `/dashboard`/`/login`), mas lendo `token_hash` e `type` da URL e chamando `supabase.auth.verifyOtp({ type, token_hash })` em vez de `exchangeCodeForSession`. Exigiria também alterar uma linha em `app/login/page.tsx` (`emailRedirectTo` apontando para `/auth/confirm` em vez de `/auth/callback`). **Zero alteração em `app/auth/callback/route.ts`** — o Google continua exatamente como está, sem nenhum risco de regressão nele.

**Opção 2 — unificar no callback existente (alternativa, risco um pouco maior)**: modificar `app/auth/callback/route.ts` para checar `code` primeiro (caminho atual do Google, inalterado) e, se ausente, checar `token_hash`+`type` e chamar `verifyOtp`. Mantém `emailRedirectTo` apontando para `/auth/callback` (sem alterar `login/page.tsx`), mas modifica um arquivo hoje funcional — risco baixo, porém não nulo, já que qualquer edição num arquivo que já funciona para o Google merece re-teste do Google depois.

**Em ambas as opções, é necessária uma ação manual externa, fora do código**: customizar o template de Magic Link no painel do Supabase (Authentication → Email Templates) para usar `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=...` (Opção 1) ou `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=...` (Opção 2) — sem essa mudança no painel, nenhuma correção de código sozinha resolve o problema, porque o e-mail continuaria sendo gerado no formato atual. Também será necessário adicionar a nova/mesma URL às Redirect URLs já configuradas, caso a Opção 1 (rota nova `/auth/confirm`) seja escolhida.

**Nada disso foi implementado nesta tarefa.**

---

## Correção — Rota de confirmação do Magic Link (concluída, aguardando aprovação para deploy)

Implementada a **Opção 1** proposta no diagnóstico anterior: rota dedicada, sem tocar em `app/auth/callback/route.ts`.

### Arquivos criados/alterados

- **Criado**: `app/auth/confirm/route.ts` — nova rota `GET`, no mesmo padrão estrutural de `app/auth/callback/route.ts` (mesmo `createClient()`, mesma lógica de redirect via `origin` da própria requisição — nunca um domínio fixo no código). Lê `token_hash` e `type` da query string; só aceita `type=email` (único tipo de OTP usado por este fluxo de login — qualquer outro valor, como `recovery`/`signup`/`invite`, é rejeitado antes mesmo de chamar `verifyOtp`); chama `supabase.auth.verifyOtp({ type, token_hash })`; redireciona para `/dashboard` em sucesso ou `/login` em qualquer falha (parâmetros ausentes, tipo não permitido, token inválido/expirado/já usado — todos caem no mesmo fallback, sem distinção exposta ao usuário).
- **Alterado**: `app/login/page.tsx` — uma linha: `emailRedirectTo` do `signInWithOtp` passou de `.../auth/callback` para `.../auth/confirm`. `handleGoogleLogin`/`redirectTo` (linha 19, `.../auth/callback`) **não foi tocado**.
- **Não alterado**: `app/auth/callback/route.ts` — confirmado via `git status`, o arquivo não aparece na lista de modificados.

### Segurança confirmada

- `token_hash` só é lido da URL e passado diretamente para `supabase.auth.verifyOtp()` — nunca logado (`console.error`/`console.log`), nunca persistido pela aplicação (nenhum banco de dados de aplicação existe, reforçado nas Sprints anteriores), nunca retornado na resposta (a rota só retorna redirects `307`, sem corpo).
- Nenhum detalhe interno do erro do Supabase é exposto — sucesso e qualquer tipo de falha levam ao mesmo redirect genérico para `/login`, sem mensagem específica.
- A sessão continua sendo estabelecida exclusivamente via cookies pelo cliente Supabase SSR já existente (`lib/supabase/server.ts`, reaproveitado sem alteração) — nenhum armazenamento próprio de token foi criado.
- Link inválido/expirado: `verifyOtp` retorna erro → `/login`, sem sessão criada — testado localmente com um `token_hash` inválido (ver testes abaixo).
- Link já utilizado: o comportamento de uso único é garantido pelo próprio Supabase (o token deixa de ser válido no lado do servidor de autenticação após o primeiro uso) — não é algo que a aplicação precise controlar.
- Dashboard continua protegido pela mesma checagem `getClaims()` já existente, sem nenhuma alteração.

### Testes

- `npm run lint` ✅.
- `npm run build` ✅ — agora **16 rotas** (as 15 anteriores + `/auth/confirm`).
- **Testado localmente** (servidor de desenvolvimento real, sem fabricar nenhum token válido):
  - `GET /auth/confirm` sem parâmetros → `307` para `/login`.
  - `GET /auth/confirm?token_hash=invalidtoken123&type=email` → `307` para `/login` (token inválido rejeitado pelo próprio Supabase).
  - `GET /auth/confirm?token_hash=abc&type=recovery` → `307` para `/login` (tipo não permitido, rejeitado antes de chamar `verifyOtp`).
  - `GET /auth/callback` sem `code` → `307` para `/login` — **comportamento idêntico ao de antes**, confirma que o Google OAuth não foi afetado.
  - `GET /dashboard` sem sessão → `307` para `/login` — proteção inalterada.
  - `POST /auth/logout` → `303` para `/login` — inalterado.
- **Não testado** (exigiria um `token_hash` real, válido, de um e-mail genuíno — não fabricado, conforme instruído): o caminho de sucesso completo (token válido → sessão criada → `/dashboard`). Só pode ser validado com um teste manual real, depois do deploy e da configuração do template (abaixo).

### Ação manual necessária no painel do Supabase (não realizada nesta tarefa)

**Onde**: Supabase Dashboard → Authentication → Email Templates → **Magic Link**.

**Correção registrada nesta microtarefa**: o template deve usar `{{ .RedirectTo }}`, não `{{ .SiteURL }}`. `app/login/page.tsx` já fornece `emailRedirectTo` explicitamente em `signInWithOtp({ email, options: { emailRedirectTo: \`${NEXT_PUBLIC_APP_URL}/auth/confirm\` } })` — e é exatamente esse valor, por requisição, que `{{ .RedirectTo }}` resolve no template, ao contrário de `{{ .SiteURL }}`, que é um único valor global fixo no projeto. Usar `{{ .RedirectTo }}` preserva corretamente tanto produção quanto `localhost`, sem a limitação registrada anteriormente.

**O que configurar**: o corpo do template deve conter um link apontando para:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
  Entrar na SUZZY AI
</a>
```

Confirmado na documentação oficial atual da Supabase (`supabase.com/docs/guides/auth/auth-email-templates`):
- `{{ .RedirectTo }}` — *"Contains the redirect URL passed when `signUp`, `signInWithOtp`, `signInWithOAuth`, `resetPasswordForEmail` or `inviteUserByEmail` is called."* — confirma exatamente que corresponde ao `emailRedirectTo` fornecido pela aplicação em `signInWithOtp`, já apontando para `/auth/confirm` (produção ou `localhost`, conforme de onde o login foi solicitado).
- `{{ .TokenHash }}` — *"Contains a hashed version of the `{{ .Token }}`. This is useful for constructing your own email link in the email template."* — placeholder correto para o fluxo `verifyOtp` já implementado em `app/auth/confirm/route.ts`.
- A própria documentação confirma que a URL de redirecionamento usada precisa estar na allow list: *"The redirect URL allow list can be configured in your project's authentication settings."*

`type=email` continua sendo um valor fixo no link (não um placeholder), correspondendo ao único tipo aceito pela rota (`ALLOWED_OTP_TYPES` em `app/auth/confirm/route.ts`).

**Sobre localhost vs. produção — corrigido**: como `{{ .RedirectTo }}` reflete o `emailRedirectTo` enviado a cada chamada (não um valor único fixo do projeto), um Magic Link solicitado a partir do `localhost:3000` gera um link para `http://localhost:3000/auth/confirm`, e um solicitado a partir de `https://suzzy-ai.vercel.app` gera um link para essa mesma origem — **os dois ambientes ficam corretamente preservados com um único template**, sem a limitação registrada anteriormente (que presumia o uso de `{{ .SiteURL }}`, um valor global único). Nenhuma solução alternativa (ex.: projeto Supabase separado) é necessária.

### Redirect URLs a adicionar/confirmar no Supabase

Como `{{ .RedirectTo }}` pode resolver tanto para produção quanto para `localhost`, **ambas as URLs precisam estar presentes** na allow list (Authentication → URL Configuration → Redirect URLs), pelo mesmo motivo já diagnosticado na correção do OAuth: se a URL usada não estiver na allow list, a Supabase cai no fallback (Site URL), reproduzindo o mesmo tipo de bug já corrigido, agora nesta rota:

- `https://suzzy-ai.vercel.app/auth/confirm`
- `http://localhost:3000/auth/confirm`

### Passos de deploy e teste recomendados (não executados)

1. Revisar e aprovar este diff (`app/auth/confirm/route.ts`, `app/login/page.tsx`).
2. Deploy para Production na Vercel.
3. No painel do Supabase: atualizar o template de Magic Link (acima) e adicionar `https://suzzy-ai.vercel.app/auth/confirm` (e, opcionalmente, a versão `localhost`) às Redirect URLs.
4. Teste manual real: solicitar Magic Link em produção → abrir o e-mail → clicar no link → confirmar chegada em `/dashboard` autenticado.
5. Reconfirmar que o Google OAuth continua funcionando após o deploy (checagem rápida, já que nada nele foi alterado, mas todo deploy novo merece essa confirmação).

---

## Auditoria — Cadastro/Perfil do Corretor (planejamento, nada implementado)

Nova decisão de produto: Magic Link deixa de ser prioridade; Google é o método de login desta fase; será criado um cadastro/perfil pós-login. **Esta seção é 100% planejamento** — nenhuma tabela criada, nenhuma migration executada, nenhum código alterado, nenhuma configuração do Supabase alterada, Magic Link não removido, Google OAuth não tocado.

### 1. O que o Supabase Auth já armazena hoje ao entrar com Google

Confirmado por auditoria de código e dos tipos instalados (`@supabase/auth-js`), não presumido: o único dado que a aplicação **lê** hoje é `data.claims.sub` (confirmado por busca em todo o projeto — nenhuma outra claim é lida em nenhum arquivo). O `sub` é a única claim garantida (`RequiredClaims`); `email` é tipada como **opcional** (`email?: string`) — presente na prática para login Google (o escopo de e-mail é padrão), mas não uma garantia do sistema de tipos. O Supabase Auth também pode reter, do lado dele (não lido pela aplicação hoje), `user_metadata`/`app_metadata` com o que o Google disponibilizar conforme as permissões concedidas pelo usuário (tipicamente nome e foto de perfil) — isso já está registrado, de forma propositalmente cautelosa, na Política de Privacidade atual (seção 3-A: "não afirmamos que dados como nome ou foto de perfil sejam sempre coletados").

**Resumo**: hoje, a aplicação só usa `sub` (identificador estável da conta). Tudo o mais que o Supabase possa reter do Google fica do lado da própria Supabase, não é lido nem exibido por nenhum código deste projeto.

### 2. Existe tabela própria de usuários/perfis?

**Não.** Reconfirmado nesta auditoria por busca exaustiva: zero ocorrências de `supabase.from(...)` ou `.storage.` em todo o código; **não existe pasta `supabase/` no projeto** (nenhum CLI do Supabase inicializado localmente, nenhuma migration versionada). O Supabase é usado exclusivamente para autenticação, exatamente como documentado desde a Sprint 15. **Criar a tabela de perfil seria a primeira tabela de aplicação deste projeto** — uma mudança estrutural relevante, não incremental, e é por isso que os itens 10–11 abaixo (implicações jurídicas) importam tanto quanto o desenho técnico.

### 3. Estrutura mínima recomendada

Um único novo objeto — `public.profiles` — com relação 1:1 com `auth.users`, usando o próprio `id` (o `sub` da autenticação) como chave primária e estrangeira, sem inventar um novo identificador. Esboço (não executado):

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  creci_number text not null,
  creci_uf text not null,
  city text not null,
  state text not null,
  professional_type text not null check (professional_type in ('autonomo', 'imobiliaria')),
  terms_accepted_at timestamptz not null,
  terms_version text not null,
  privacy_accepted_at timestamptz not null,
  privacy_version text not null,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
-- políticas: usuário só lê/cria/atualiza a própria linha (auth.uid() = id)
```

**Decisões de desenho já embutidas, para justificar**:
- **`id` = `auth.users.id`** (não um ID novo): evita duplicar identificador, mantém a mesma relação 1:1 já usada para `sub` em todo o resto do sistema (rate limiting, etc.).
- **E-mail não duplicado na tabela**: já vive em `auth.users`/na claim `email`; duplicá-lo criaria risco de dessincronia (ex.: usuário troca e-mail no provedor) sem necessidade real, já que qualquer consulta autenticada já tem acesso ao `sub` e, via `getClaims()`, ao e-mail atual.
- **`terms_version`/`privacy_version`**: registrar não só *que* o usuário aceitou, mas *qual versão* dos documentos — boa prática de conformidade (permite provar o que foi aceito, mesmo que os documentos mudem depois). Pequeno acréscimo ao pedido original, mas diretamente relevante para o item 10 (implicações jurídicas), por isso incluído na proposta.
- **RLS obrigatório**: cada usuário só pode ler/escrever a própria linha — sem isso, qualquer usuário autenticado poderia ler dados de perfil de outro.

Isso permanece deliberadamente pequeno — uma tabela, sem tabelas relacionadas, sem histórico de alterações, sem CRM de leads/imóveis (fora do escopo do MVP, conforme `CLAUDE.md`).

### 4. Avaliação campo a campo

| Campo | Recomendação | Observação |
|---|---|---|
| Nome completo | **Obrigatório** | Necessário para identificar o profissional; já não é coletado hoje. |
| E-mail | **Não duplicar na tabela** | Já disponível via `auth.users`/claim `email` — ver item 3. |
| Telefone/WhatsApp | **Obrigatório** | Canal de contato relevante para o produto (corretores usam WhatsApp no dia a dia); ainda assim, dado pessoal — deve ser tratado com a mesma prudência já aplicada a outros dados (nunca enviado à OpenAI, nunca exposto em log). |
| CRECI (número) | **Obrigatório, autodeclarado** | Ver item 6 — sem verificação externa. |
| UF do CRECI | **Obrigatório** | O registro de corretor é estadual no Brasil (conselhos regionais); sem a UF, o número sozinho não identifica o registro de forma inequívoca. |
| Cidade/estado de atuação | **Obrigatório** | Relevante para o produto (contexto do mercado imobiliário local), campo simples, baixo risco. |
| Autônomo ou imobiliária | **Obrigatório** | Já existe distinção equivalente nos planos da Landing Page ("Corretor Autônomo" vs. "Pequena Imobiliária") — reaproveita um conceito já existente no produto, não cria um novo. |
| Aceite dos Termos de Uso | **Obrigatório** | Hoje o acesso à plataforma não registra aceite explícito algum — esta seria a primeira vez. Deve gravar data/hora e versão do documento (ver item 3). |
| Aceite da Política de Privacidade | **Obrigatório** | Mesma lógica do item anterior. |
| Consentimento de marketing | **Opcional, separado** | Ver item 7 — nunca pode ser pré-marcado nem obrigatório para concluir o cadastro. |

### 5. CPF — recomendação: **não coletar nesta fase**

Não há finalidade concreta hoje que justifique CPF: não existe cobrança, não existe emissão de nota fiscal, não existe processo de KYC. Coletar um dado pessoal sem finalidade específica e informada viola o princípio de **necessidade/minimização** da LGPD (art. 6º, III) — o dado mais seguro é o que nunca foi coletado. **Recomendação**: registrar CPF como pendência condicionada — só voltar a considerar quando houver uma finalidade concreta e determinada (ex.: emissão de nota fiscal ao implementar cobrança real), e, quando isso acontecer, tratá-lo com a base legal apropriada para aquele momento (provavelmente execução de contrato/obrigação legal fiscal), não antecipadamente.

### 6. CRECI — estratégia recomendada

- Armazenar **apenas o que o usuário informar** (número + UF), como texto simples autodeclarado.
- **Nunca afirmar, em nenhum lugar da interface ou dos documentos, que o CRECI foi verificado, validado ou está ativo** — isso seria uma alegação factual não comprovada, exatamente o tipo de afirmação que este projeto tem evitado sistematicamente desde a Sprint 15.
- **Não implementar verificação automática externa nesta fase**: não encontrei, nesta auditoria, confirmação de uma API pública/oficial unificada dos conselhos regionais de corretores (CRECI é regulado por conselho estadual, via COFECI/CRECI-UF, sem uma API nacional unificada e amplamente documentada) — implementar uma integração sem essa fonte confirmada seria inventar uma capacidade que não existe, o oposto do padrão de rigor já mantido no projeto. Se uma fonte oficial/integrável for confirmada no futuro, isso seria uma tarefa própria, com sua própria auditoria.

### 7. Consentimento de marketing — separado do uso da conta

O consentimento de marketing **nunca pode ser condição** para criar a conta ou usar o produto — LGPD exige que consentimento para comunicações promocionais seja **livre, específico e inequívoco**, nunca embutido em um aceite genérico de Termos/Privacidade (que são, esses sim, condição de uso). Na estrutura proposta (item 3), isso já aparece como `marketing_consent boolean not null default false` — **desmarcado por padrão**, nunca pré-selecionado, com seu próprio timestamp (`marketing_consent_at`) separado dos timestamps de aceite dos documentos legais. O formulário de cadastro (quando implementado) precisa apresentar isso como um checkbox visualmente distinto dos aceites obrigatórios, não como mais um item da mesma lista.

### 8. Como impedir acesso ao `/dashboard` sem cadastro completo

**Precisa ser reforçado no servidor, em mais de um ponto** — não basta um redirecionamento na página do Dashboard, pelo mesmo motivo pelo qual o rate limiting não pôde depender só da interface (Sprint 17/18): qualquer verificação só no cliente pode ser contornada.

Pontos que precisariam da mesma checagem (perfil existe? senão, redireciona/bloqueia):
- `app/dashboard/page.tsx` (Server Component, já faz `getClaims()` — extenderia para também checar a existência da linha em `profiles`, redirecionando para `/cadastro` em vez de renderizar o formulário).
- `app/api/generate/route.ts` e `app/api/support/route.ts` — **hoje só checam autenticação, não checam perfil completo**. Se o gate ficasse só no Dashboard, um usuário autenticado sem perfil ainda poderia chamar essas rotas diretamente (mesmo tipo de risco já tratado com cuidado em toda a Sprint 17/18 para rate limiting). Precisariam da mesma checagem, ou uma decisão consciente de que essas rotas continuam acessíveis mesmo sem perfil completo (não recomendado, mas é uma decisão de produto, não técnica).
- `app/auth/callback/route.ts` **não precisaria mudar** — pode continuar redirecionando sempre para `/dashboard`; é o próprio `/dashboard` (ou um middleware) que decidiria se deixa passar ou redireciona para `/cadastro`. Isso mantém o Google OAuth, já validado, intocado.

**Opção de otimização futura, não necessária no MVP**: gravar um custom claim (`profile_completed: true`) no JWT via Auth Hook do Supabase após o cadastro ser concluído, evitando uma consulta ao banco em toda requisição protegida. Registrado como possível melhoria futura (P2), não como parte da implementação mínima — o caminho mais simples (consulta direta a `profiles` nos pontos acima) já resolve o problema, e este projeto tem preferido consistentemente a solução mais simples que funcione (`CLAUDE.md`).

### 9. Usuários que já existem hoje

**Nenhum tratamento especial ou migração é necessária** — a própria checagem "existe uma linha em `profiles` para este `id`?" já resolve isso de forma uniforme: uma conta Google já autenticada anteriormente (inclusive contas de teste já usadas nesta sprint) simplesmente não teria linha em `profiles` ainda, e cairia no mesmo fluxo de "primeiro acesso" descrito no objetivo — sem distinguir, em código, entre "conta nova" e "conta antiga sem perfil". Mais simples e mais correto do que qualquer script de backfill.

### 10. Implicações nos documentos jurídicos

Esta é a mudança mais significativa desde a criação dos documentos jurídicos na Sprint 15 — pela primeira vez, **haveria dados de aplicação persistidos em um banco de dados real**, algo que a Política de Privacidade e os Termos de Uso afirmam hoje, repetidamente e com evidência de código, que **não existe** ("não existe banco de dados de aplicação em uso", Sprint 15/17/18). Quando esta funcionalidade for implementada (não nesta tarefa), os documentos precisarão de atualização real, não cosmética:

- **Política de Privacidade**: nova subseção descrevendo os dados de perfil coletados (nome, telefone, CRECI+UF, cidade/estado, tipo de atuação), a finalidade de cada um, a base legal (provavelmente execução de contrato, já que são necessários para usar o produto), e o fato de que, pela primeira vez, existe uma tabela de aplicação com dados pessoais persistidos no Supabase (Postgres) — não mais "tudo local ao navegador ou efêmero". CRECI precisa ser descrito explicitamente como autodeclarado, não verificado.
- **Termos de Uso**: passaria a exigir aceite explícito e registrado (não apenas "ao usar, você concorda") — o próprio ato de completar o cadastro se torna o momento do aceite, o que é uma mudança de mecanismo, não só de texto.
- **Transparência sobre dados armazenados**: a seção de retenção precisaria cobrir a nova tabela (por quanto tempo os dados de perfil ficam retidos, o que acontece com eles se a conta for encerrada).
- **Exclusão de conta/dados**: hoje a ausência de autoatendimento para exclusão é justificada, em parte, por não existir dado de aplicação para excluir. Com uma tabela real de perfil, essa lacuna passa a ter peso concreto — não seria obrigatório implementar autoatendimento imediatamente, mas a pendência deixaria de ser abstrata e precisaria de um processo claro (mesmo que manual) para exclusão de perfil mediante solicitação.
- **Consentimento de marketing**: precisaria de uma menção própria na Política de Privacidade, deixando claro que é opcional, revogável, e desvinculado do uso do produto.

**Nenhum documento foi alterado nesta tarefa** — apenas mapeado o que precisará mudar quando a funcionalidade for implementada.

### 11. Arquivos/tabelas que precisariam ser criados ou alterados (futuramente, não agora)

- **Nova migration Supabase**: `public.profiles` + políticas de RLS (item 3).
- **Nova página**: `app/cadastro/page.tsx` (ou `/onboarding`) — formulário de perfil.
- **Novo componente**: formulário client-side para os campos do item 4.
- **Nova rota/Server Action**: para validar e gravar o perfil (leitura de `sub` via `getClaims()`, nunca confiar em um ID vindo do formulário).
- **`app/dashboard/page.tsx`**: estender a checagem existente para incluir perfil completo.
- **`app/api/generate/route.ts`/`app/api/support/route.ts`**: decisão pendente sobre se também precisam da checagem (item 8).
- **`docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`** e as páginas públicas correspondentes (item 10).
- **Nenhuma alteração necessária** em `/auth/callback`, Google OAuth, `proxy.ts`, `/api/assist` (pública, sem perfil de usuário aplicável).

### Riscos encontrados

- **RLS mal configurado** exporia dados de perfil de um usuário para outro — obrigatório testar isolamento antes de qualquer uso real.
- **Checagem só no cliente/só na página do Dashboard** permitiria contornar o cadastro chamando `/api/generate`/`/api/support` diretamente — precisa de decisão explícita (item 8).
- **CRECI apresentado de forma que pareça verificado**, mesmo sem intenção — risco de comunicação/UX, não só de dados; precisa de atenção no texto da interface, não só nos documentos.
- **Consentimento de marketing pré-marcado ou obrigatório**, mesmo que por engano de implementação — violaria a exigência de consentimento específico da LGPD.
- **Fricção de ativação**: exigir cadastro completo antes do Dashboard é uma escolha de produto que pode reduzir conversão de novos usuários — não é um risco técnico, é um trade-off de produto que o proprietário deve assumir conscientemente.
- **Mudança estrutural na narrativa de privacidade**: os documentos jurídicos atuais afirmam ativamente a ausência de banco de dados de aplicação; implementar isso sem atualizar os documentos criaria uma inconsistência factual real entre o que é dito e o que o sistema faz — exatamente o tipo de problema que outras tarefas desta sprint já trataram como prioridade alta.

### Sequência recomendada de implementação (proposta, não iniciada)

1. Migration da tabela `profiles` + RLS (com teste de isolamento entre contas).
2. Página `/cadastro` + formulário + rota/Server Action de gravação.
3. Gate de perfil completo em `app/dashboard/page.tsx` (e decisão consciente sobre `/api/generate`/`/api/support`).
4. Atualização da Política de Privacidade e dos Termos de Uso (documentos-base primeiro, depois páginas públicas) refletindo a nova coleta e persistência de dados.
5. Teste end-to-end: conta nova → cadastro obrigatório → Dashboard; conta já existente sem perfil → mesmo fluxo de cadastro no próximo login; conta com perfil completo → acesso direto ao Dashboard.
6. Decisão e, se aprovada, implementação de um processo (mesmo que manual) de exclusão de perfil mediante solicitação.

---

## Implementação — Perfil do Corretor (Sprint 19)

*Implementado em 2026-08-15, com base na auditoria acima (aprovada pelo proprietário). Migration criada no repositório, mas **não aplicada** no Supabase remoto; **nenhum deploy foi realizado** — ambos aguardam aprovação explícita, conforme instrução recebida.*

### O que foi implementado

**1. Tabela `public.profiles`** — `supabase/migrations/20260815000000_create_profiles.sql`:
- `id uuid primary key references auth.users(id) on delete cascade` — sem duplicar e-mail;
- `full_name`, `creci_number`, `creci_uf`, `city`, `state`, `professional_type` (`not null`, com `check` restringindo a `'autonomo'`/`'imobiliaria'`);
- `phone` (`text`, **nullable** — conforme instrução explícita desta tarefa, que substitui a recomendação "obrigatório" da auditoria anterior);
- `marketing_consent boolean not null default false` + `marketing_consent_at` (nulo se não houver consentimento);
- `terms_accepted_at`/`terms_version` e `privacy_accepted_at`/`privacy_version` (`not null`) — registram data/hora e a versão exata do documento aceito;
- `created_at`/`updated_at timestamptz not null default now()`;
- **CPF não é coletado** — nenhum campo relacionado existe na tabela;
- comentário na tabela (`comment on table`) documentando que o CRECI é autodeclarado, sem verificação automática.

**2. RLS** — habilitado (`alter table ... enable row level security`), com três políticas, todas restritas ao papel `authenticated` e à condição `auth.uid() = id`:
- `profiles_select_own` (SELECT);
- `profiles_insert_own` (INSERT, com `with check` — impede que alguém grave um perfil com `id` de outra pessoa);
- `profiles_update_own` (UPDATE).
- **Nenhuma política de DELETE** foi criada, de propósito — o processo de exclusão ainda não está definido (item 10 da auditoria); o `on delete cascade` do FK cobre a remoção em cascata caso a conta seja excluída por outro meio.
- Nenhuma role de serviço (`service_role`) é usada em nenhum ponto do código novo — toda leitura/escrita passa pelo cliente Supabase autenticado do próprio usuário (`lib/supabase/server.ts`), que já respeita RLS.

**3. Helper reutilizável** — `lib/supabase/profile.ts`, função `hasCompleteProfile(supabase, userId)`: consulta `profiles` filtrando por `id`, retorna `true`/`false` conforme a linha existir. **Fail-closed**: qualquer erro na consulta é tratado como perfil incompleto (mesmo padrão já usado no rate limiting).

**4. Rota de gravação** — `app/api/profile/route.ts` (POST): exige sessão (`getClaims()`, 401 se ausente); valida todos os campos obrigatórios (incluindo `termsAccepted`/`privacyAccepted` estritamente `true`); telefone tratado como opcional (string vazia/ausente vira `null`); grava via `upsert` com o `id` sempre igual a `data.claims.sub` (nunca aceito do corpo da requisição); gera `terms_accepted_at`/`privacy_accepted_at` e as versões (`"2026-08-15"`, provisório — os documentos-base ainda não têm numeração formal) no servidor, nunca confiando em timestamps enviados pelo cliente.

**5. Página `/cadastro`** — `app/cadastro/page.tsx` (Server Component): redireciona para `/login` se não autenticado; redireciona para `/dashboard` se o perfil já estiver completo (evita reexibir o formulário desnecessariamente); caso contrário, renderiza `<ProfileForm />` dentro do mesmo padrão visual (header/card) já usado no Dashboard.

**6. Formulário** — `components/profile-form.tsx` (Client Component), reaproveitando os padrões visuais já estabelecidos em `components/dashboard-form.tsx` (classes de campo, padrão de "cartão-rádio" para seleção de tipo de atuação, `UF_OPTIONS` com as 27 unidades federativas para os selects de UF do CRECI e Estado). Nome, CRECI, UF, cidade e estado são obrigatórios (`required` no HTML + validação client-side desabilitando o botão); telefone é opcional e claramente rotulado como tal; um aviso curto deixa explícito que o CRECI é autodeclarado; os aceites de Termos e Privacidade são checkboxes obrigatórios com link para as páginas públicas; o consentimento de marketing é um checkbox **separado, desmarcado por padrão, dentro de um bloco visualmente distinto** dos aceites obrigatórios — nunca preenchido ou pré-selecionado.

**7. Gates server-side** (item 4 da auditoria, decisão tomada: sim, proteger também as rotas de IA):
- `app/dashboard/page.tsx`: após a checagem de sessão existente, chama `hasCompleteProfile`; sem perfil, redireciona para `/cadastro`.
- `app/api/generate/route.ts` e `app/api/support/route.ts`: logo após a checagem de autenticação (401) e **antes** de consultar o Upstash, chamam o mesmo helper; sem perfil, retornam `403` com `{ error: "Complete seu cadastro antes de continuar." }` — status diferente do `401` (não autenticado), para o cliente conseguir distinguir os dois casos no futuro se precisar.
- `app/api/assist/route.ts` **não foi alterado** — continua público, sem checagem de autenticação ou de perfil, conforme instrução explícita.
- `app/auth/callback/route.ts`, `app/auth/confirm/route.ts`, `proxy.ts`, Google OAuth e Magic Link **não foram tocados**.

**8. Usuários existentes**: nenhum script de migração/backfill foi criado. A própria ausência de linha em `profiles` já direciona qualquer conta (nova ou pré-existente) para `/cadastro` no próximo acesso — validado no código, não apenas na teoria da auditoria.

### Documentos jurídicos atualizados

Alterações factuais, sem inventar conteúdo novo:
- **`docs/PRIVACY_POLICY.md`**: nova seção 3-F ("Dados de perfil do corretor (cadastro)") descrevendo os campos coletados, o caráter autodeclarado e não verificado do CRECI, a ausência de coleta de CPF, e o consentimento de marketing como opcional/separado; seção 4 (Finalidades) menciona a nova finalidade; seção 6 (Fornecedores) atualiza a descrição do Supabase para incluir o armazenamento do perfil com RLS; seção 8 (Retenção) e seção 9 (Direitos do titular) passam a mencionar os dados de perfil explicitamente.
- **`docs/TERMS_OF_USE.md`**: seção 4 (Conta e acesso) passa a descrever a exigência de cadastro no primeiro acesso e reforça, de forma explícita, que o CRECI é autodeclarado e não verificado; seção 5 (Responsabilidades do usuário) passa a incluir a veracidade dos dados de cadastro.
- **`app/privacidade/page.tsx`** e **`app/termos/page.tsx`**: as mesmas mudanças foram espelhadas manualmente nas páginas públicas correspondentes (esses arquivos não são gerados a partir dos `.md`; são mantidos em paralelo, seguindo o padrão já existente no projeto).
- Nenhum novo `[A CONFIRMAR ANTES DO LANÇAMENTO]` foi resolvido nem inventado — os pontos já pendentes de revisão jurídica continuam marcados como estavam.

### Testes realizados

- `npm run lint`: **aprovado**, sem erros ou avisos novos.
- `npm run build`: em execução no momento em que esta seção foi escrita — resultado registrado na entrega final desta tarefa.
- Testes locais possíveis sem fabricar autenticação: fluxo de redirecionamento (`/dashboard`, `/cadastro` sem sessão → `/login`) e a estrutura das rotas seguem o mesmo padrão já validado nas tarefas anteriores desta sprint (logout, Magic Link) — um teste de ponta a ponta real do cadastro (criar conta Google nova → `/cadastro` → preencher → `/dashboard`) exige a migration aplicada no Supabase remoto, que **não foi feita nesta tarefa**, e por isso não pôde ser exercitado localmente de ponta a ponta.

### Instruções para aplicar a migration (manual, aguardando aprovação)

1. Abrir o painel do Supabase do projeto → **SQL Editor**.
2. Colar o conteúdo integral de `supabase/migrations/20260815000000_create_profiles.sql`.
3. Executar.
4. Verificar, em **Table Editor**, que a tabela `profiles` foi criada com RLS habilitado (ícone de cadeado) e as três políticas (`profiles_select_own`, `profiles_insert_own`, `profiles_update_own`) listadas em **Authentication → Policies**.
5. Recomendado: testar isolamento entre contas antes do deploy — logar com duas contas Google diferentes e confirmar, via SQL Editor com a chave anônima/RLS ativo (não com a service role), que uma conta não consegue ler nem alterar a linha da outra.

Nenhuma dessas etapas foi executada por mim — nenhum acesso ao projeto Supabase remoto foi feito nesta tarefa.

*Nota (2026-08-17): a migration acima já foi aplicada manualmente pelo proprietário no Supabase de produção, e a tabela `profiles` foi confirmada no Table Editor. Ver também a remoção do Magic Link logo abaixo, que reduz o escopo de login desta fase a apenas Google OAuth.*

---

## Remoção do Magic Link da interface (2026-08-17)

**Decisão de produto**: nesta fase, o login da SUZZY AI passa a ser **somente por Google OAuth**. O Magic Link foi retirado da tela de login — não por bug, mas por decisão consciente de não configurar SMTP customizado agora. Pode voltar no futuro, quando houver infraestrutura de e-mail apropriada (Custom SMTP configurado no Supabase).

**O que saiu de `app/login/page.tsx`**:
- o estado `email` e o `input` de e-mail;
- o divisor visual "ou" entre os dois métodos de login;
- o botão "Continuar com Magic Link";
- a função `handleMagicLinkLogin` e a chamada a `supabase.auth.signInWithOtp`;
- a mensagem de sucesso ("Verifique seu e-mail para acessar o link de acesso.").

**O que foi preservado integralmente**: o botão "Continuar com Google", `handleGoogleLogin`, `signInWithOAuth` com o mesmo `redirectTo` (`.../auth/callback`), o estado `message` (agora só usado para erros do Google) e o estado `loading`, o texto "Novo por aqui? Sua conta é criada automaticamente no primeiro acesso." (mensagem genérica, não exclusiva do Magic Link), e todo o restante do layout.

**`app/auth/confirm/route.ts` — removido.** Antes de remover, foi feita uma busca por todas as referências a `auth/confirm`, `verifyOtp`, `signInWithOtp` e `EmailOtpType` no projeto: a única referência em código (fora do próprio arquivo e da documentação) era o `emailRedirectTo` em `app/login/page.tsx`, que foi removido junto com o restante do fluxo de Magic Link. Sem nenhuma chamada a `signInWithOtp` em nenhum lugar da aplicação, nenhum e-mail de Magic Link é mais enviado, e a rota `/auth/confirm` nunca seria alcançada por ninguém — por isso foi considerada segura para remoção, em vez de deixada como código morto.

**Não alterado**: `app/auth/callback/route.ts` (Google OAuth), `app/auth/logout/route.ts`, `lib/supabase/*`, `proxy.ts`, o fluxo `/cadastro` completo (`app/cadastro/page.tsx`, `components/profile-form.tsx`, `app/api/profile/route.ts`, `lib/supabase/profile.ts`), os gates de perfil em `app/dashboard/page.tsx`/`app/api/generate/route.ts`/`app/api/support/route.ts`, `app/api/assist/route.ts`, OpenAI, Upstash e rate limiting.

**Testes**: `npm run lint` e `npm run build` executados após a remoção (resultado registrado na entrega desta tarefa). Como o Google OAuth exige uma sessão real do navegador, não foi possível clicar em "Continuar com Google" fim a fim neste ambiente — a verificação ficou restrita a: a função e a rota permanecem exatamente como estavam antes desta tarefa (nenhum diff nelas), e o build/lint confirmam que a página compila sem os trechos removidos.

**Nenhum deploy foi realizado nesta tarefa** — aguardando aprovação.

---

## Status

Tarefa 1 concluída em 2026-08-10. Implementação do Perfil do Corretor concluída em 2026-08-15 (migration aplicada manualmente em produção em 2026-08-17, confirmada no Table Editor). Magic Link removido da interface em 2026-08-17 (Google OAuth é o único método de login nesta fase); `app/auth/confirm/route.ts` removido por não ter mais nenhuma chamada que o alcance. Aguardando aprovação para deploy.
