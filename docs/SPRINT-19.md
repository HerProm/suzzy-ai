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

## Status

Tarefa 1 concluída em 2026-08-10. Aguardando aprovação para a Tarefa 2.
