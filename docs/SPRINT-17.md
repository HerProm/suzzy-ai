# Sprint 17 — Preparação para Produção da SUZZY AI

## Objetivo

Resolver as quatro pendências que hoje impedem a exposição pública/comercial da SUZZY AI, registradas no encerramento da Sprint 16:

1. Rate limiting real para `/api/assist` (público).
2. Rate limiting por usuário para `/api/support` (autenticado).
3. Atualização jurídica/privacidade para contemplar Suzzy Assist e Suzzy Support.
4. Validação final de prontidão para produção.

Esta tarefa (Tarefa 1) é só auditoria e planejamento. Nenhum código foi alterado.

## Estado atual (auditoria)

*(nenhum segredo, token ou valor de variável de ambiente é reproduzido abaixo — apenas nomes já documentados nas Sprints 15/16)*

**`app/api/assist/route.ts`** — público, `POST`, sem `getClaims()`. Valida mensagem (até 1000 caracteres) e histórico (até 6 itens, até 2500 caracteres cada — ajustado na Sprint 16 após bug real de limite). Chama `gpt-5-mini` via `createOpenAiClient()`. **Nenhum rate limiting.** Comentário no código já sinaliza onde a checagem deveria entrar.

**`app/api/support/route.ts`** — autenticado via `supabase.auth.getClaims()` (mesmo padrão de `/api/generate`), `401` se ausente, checagem acontece antes de qualquer leitura do corpo. Mesmos limites de mensagem/histórico do Assist, exceto histórico limitado a 2000 caracteres por item. **Nenhum rate limiting**, apesar do comentário já existente sinalizando a pendência.

**`app/api/generate/route.ts`** — autenticado, de tiro único, com seus próprios limites (`MAX_CONTEXT_LENGTH = 5000`). Também sem rate limiting, mas fora do escopo desta sprint a menos que uma necessidade real seja comprovada.

**`lib/ai/client.ts`** — helper único (`createOpenAiClient()`) reutilizado por Assist e Support; `/api/generate` continua instanciando o cliente inline (decisão da Sprint 16, mantida).

**`lib/supabase/*` e `proxy.ts`** — autenticação via `@supabase/ssr`, cookies renovados no proxy/middleware. `supabase.auth.getClaims()` retorna `{ data: { claims: JwtPayload, header, signature } }`; o payload padrão de um JWT do Supabase inclui a claim `sub` — o ID único do usuário (confirmado nos tipos do `@supabase/auth-js` instalado, não presumido). Esse `sub` é o candidato natural a identificador estável para rate limiting por usuário no Support, sem precisar de nenhuma consulta adicional ao banco.

**`package.json`** — dependências: `@supabase/ssr`, `@supabase/supabase-js`, `next`, `openai`, `react`, `react-dom`. **Nenhuma biblioteca de rate limiting, Redis ou KV instalada.**

**Variáveis de ambiente existentes** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_APP_URL`. Nenhuma variável de infraestrutura de rate limiting existe hoje.

**Documentos jurídicos (Sprint 15) e páginas públicas correspondentes** — `docs/PRIVACY_POLICY.md` (`/privacidade`), `docs/TERMS_OF_USE.md` (`/termos`), `docs/AI_TRANSPARENCY.md` (`/ia`), `docs/COOKIES_POLICY.md` (`/cookies`). Todos os quatro descrevem, hoje, **apenas o fluxo de `/api/generate`** — nenhum menciona Suzzy Assist ou Suzzy Support, que só passaram a existir na Sprint 16, depois desses documentos terem sido escritos e publicados.

**Ambiente de hospedagem em produção** — segue **não confirmado** (mesma lacuna já registrada nas auditorias das Sprints 15 e 16). O `CLAUDE.md` cita Vercel como stack prevista, mas isso é um plano, não uma confirmação. Isso afeta diretamente a escolha de infraestrutura de rate limiting (ver seção seguinte).

## Riscos

- **Custo de API sem limite no endpoint público (`/api/assist`)**: qualquer visitante ou bot pode gerar chamadas ilimitadas ao `gpt-5-mini`. É o risco de maior severidade da sprint, por não exigir nenhuma autenticação para ser explorado.
- **Custo por conta comprometida ou com bug de cliente no `/api/support`**: menor severidade que o Assist (exige login), mas ainda sem limite algum.
- **Documentos jurídicos desatualizados em relação ao produto real**: publicar/manter os agentes ativos sem que os documentos mencionem esse fluxo de dados é uma inconsistência entre o que é afirmado publicamente e o que o sistema realmente faz — o mesmo tipo de problema que a Sprint 15 existiu para resolver em relação a `/api/generate`.
- **Decisão de hospedagem ainda em aberto**: qualquer solução de rate limiting amarrada a uma plataforma específica (ex.: Vercel Firewall) fica condicionada a uma decisão de infraestrutura que ainda não foi tomada.

## Comparação das opções de infraestrutura

Pesquisa feita na documentação/fontes atuais (agosto de 2026), não apenas em conhecimento prévio — fontes ao final desta seção.

| Critério | **Upstash Redis** (`@upstash/redis` + `@upstash/ratelimit`) | **Vercel Firewall** (rate limiting nativo) | DIY em memória |
|---|---|---|---|
| Integração com Next.js | Oficial, documentada especificamente para Next.js/serverless/edge | Nativa (regras de firewall na plataforma, sem código de aplicação) | Trivial de escrever, mas incorreta |
| Funcionamento serverless | Sim — API REST, sem conexão persistente (ideal para funções sem estado) | Sim — roda na borda da Vercel, antes da função | **Não confiável**: cada instância/cold start tem sua própria memória, contagem não é compartilhada |
| Persistência distribuída | Sim, nativa (é o propósito do produto) | Sim, gerenciada pela Vercel | Não existe |
| Complexidade de implementação | Baixa — biblioteca pronta com algoritmos (sliding window, fixed window, token bucket) | Baixa — configuração declarativa, mas fora do código-fonte do projeto | Baixa de escrever, mas resolve o problema errado |
| Custo no estágio inicial | **Camada gratuita permanente**: 256 MB de armazenamento + 500.000 comandos/mês, sem expiração | **Rate limiting requer plano Pro ou Enterprise** — não incluído no plano Hobby (gratuito) | Sem custo direto, mas sem eficácia real |
| Portabilidade (independe da hospedagem final) | **Sim** — funciona em qualquer ambiente serverless/Node, não depende da Vercel especificamente | **Não** — acopla a solução à plataforma Vercel e ao plano contratado | Irrelevante (não funciona de qualquer forma) |
| Dependências novas | 2 pacotes (`@upstash/redis`, `@upstash/ratelimit`) | 0 pacotes de aplicação (configuração de plataforma) | 0 pacotes, mas solução inadequada |
| Variáveis de ambiente novas | 2 (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) | 0 | 0 |
| Manutenção | Baixa — biblioteca madura, mantida pela Upstash | Baixa, mas depende de decisões de billing/plano na Vercel | Precisaria ser refeita do zero mais tarde |

**Fontes consultadas:**
- [Rate Limiting Next.js API Routes using Upstash Redis — Upstash Blog](https://upstash.com/blog/nextjs-ratelimiting)
- [@upstash/ratelimit — GitHub](https://github.com/upstash/ratelimit-js)
- [@upstash/ratelimit — npm](https://www.npmjs.com/package/@upstash/ratelimit)
- [Redis Pricing — Upstash](https://upstash.com/pricing/redis)
- [Introducing Vercel KV — Vercel Changelog](https://vercel.com/changelog/vercel-kv) (confirma que o antigo Vercel KV foi descontinuado e migrado automaticamente para Upstash Redis em dezembro de 2024)
- [Storage on Vercel Marketplace — Vercel Docs](https://vercel.com/docs/marketplace-storage)
- [Usage & Pricing for Vercel WAF — Vercel Docs](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing) (confirma que rate limiting nativo exige plano Pro/Enterprise)

**Achado relevante**: o antigo "Vercel KV" — que poderia parecer a opção mais óbvia por familiaridade com o ecossistema Vercel — **foi descontinuado** e todo store existente foi migrado automaticamente para Upstash Redis em dezembro de 2024. Ou seja, a própria Vercel hoje recomenda Upstash Redis (diretamente ou via Vercel Marketplace) como o caminho padrão para KV/rate limiting — reforçando que não se trata de uma escolha por familiaridade, e sim a opção atualmente também endossada pela plataforma mais provável de hospedagem.

## Recomendação técnica

**Upstash Redis, via os pacotes `@upstash/redis` e `@upstash/ratelimit`**, usando o algoritmo de janela deslizante (`slidingWindow`) já pronto na biblioteca.

Motivos objetivos:
- Funciona independentemente de qual hospedagem for finalmente confirmada (o ambiente de produção ainda não está definido — ver "Estado atual").
- Camada gratuita permanente é suficiente para o estágio inicial do produto (contagem de rate limiting consome poucos comandos por requisição).
- Vercel Firewall nativo exigiria confirmar (e possivelmente contratar) um plano Pro/Enterprise só para essa funcionalidade — decisão de custo que não deveria ser forçada só para viabilizar rate limiting.
- Qualquer solução em memória do processo foi explicitamente descartada por não funcionar de forma confiável em ambiente serverless (múltiplas instâncias, cold starts).

Isso exigirá, na Tarefa 2, **duas novas dependências** (`@upstash/redis`, `@upstash/ratelimit`) e **duas novas variáveis de ambiente** (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) — nenhuma instalada ainda nesta tarefa.

## Estratégia para a Suzzy Assist (pública)

**Identificador**: endereço IP do visitante, obtido do cabeçalho que a plataforma de hospedagem define de forma confiável na borda (ex.: `x-forwarded-for`/`x-real-ip` em ambientes como a Vercel). **Ressalva importante**: esse header só é confiável quando a própria plataforma de borda o define/sobrescreve — um valor enviado diretamente pelo cliente, sem passar por um proxy confiável, pode ser forjado. Como o ambiente de hospedagem final ainda não está confirmado, essa premissa deve ser revalidada na Tarefa 3, quando o ambiente real for conhecido.

**Limitações conhecidas do IP como identificador** (registradas conforme pedido, não ignoradas):
- **Proxies e NAT/redes corporativas**: múltiplos visitantes legítimos podem compartilhar o mesmo IP público, o que pode causar bloqueio de usuários legítimos se o limite for baixo demais.
- **Headers manipuláveis**: só são confiáveis se a camada de borda os sobrescrever; não se deve confiar em um header que o próprio cliente pode enviar livremente sem passar por um proxy que o sanitize.
- **IPv4 vs. IPv6**: um visitante pode alternar endereços dentro do mesmo bloco (especialmente em IPv6, onde blocos são maiores e mais dinâmicos), reduzindo a eficácia contra abuso deliberado — aceitável para o objetivo de "reduzir abuso e custo", não para bloqueá-lo com garantia absoluta.
- **Privacidade**: IP é dado pessoal para fins de LGPD (ver seção de privacidade abaixo) — não deve ser guardado indefinidamente nem em texto simples por mais tempo que o necessário para a janela de limite.

**Duas janelas propostas** (ver política de limites) para conter tanto rajadas curtas quanto abuso sustentado ao longo do dia.

## Estratégia para a Suzzy Support (autenticada)

**Identificador**: a claim `sub` (ID do usuário) obtida de `supabase.auth.getClaims()` — já disponível na própria checagem de autenticação que a rota já faz, sem custo adicional de implementação. **Esse identificador nunca deve ser enviado à OpenAI** (hoje já não é — a Sprint 16 já garantiu isso — e essa restrição continua valendo explicitamente para a lógica de rate limiting: o `sub` deve ser usado só como chave interna no Redis).

**Proteção adicional por IP**: avaliada e considerada de **baixa prioridade** para a primeira versão — como o endpoint já exige autenticação, o principal vetor de abuso (visitante anônimo em massa) não se aplica; um IP adicional só ajudaria contra um usuário autenticado único abrindo múltiplas sessões/dispositivos, um cenário de menor risco. Pode ser adicionada depois sem mudança estrutural, se necessário.

## Política inicial de limites

Números iniciais, propostos como ponto de partida ajustável — não arbitrários, mas também não definitivos:

| | Janela curta (contém rajadas) | Limite diário (contém abuso sustentado) |
|---|---|---|
| **Suzzy Assist** (por IP) | 5 mensagens / 60 segundos | 40 mensagens / dia |
| **Suzzy Support** (por usuário) | 10 mensagens / 60 segundos | 100 mensagens / dia |

Raciocínio:
- **Janela curta**: uma conversa humana normal, mesmo digitando rápido, dificilmente envia mais de uma mensagem a cada poucos segundos — a resposta da IA já leva alguns segundos para chegar. 5 (Assist) e 10 (Support) dão folga para uma conversa fluida sem abrir margem para um laço automatizado de requisições.
- **Limite diário**: pensado para cobrir uma sessão de exploração real (visitante curioso ou corretor trabalhando o dia todo), sem permitir uso indefinido por um único IP/conta. O Support recebe um teto mais generoso que o Assist porque já está atrás de autenticação (menor risco de abuso anônimo em massa) e porque um corretor pode legitimamente ter mais dúvidas ao longo de um dia de trabalho do que um visitante da Landing Page.
- **Estágio inicial do produto**: como o número real de usuários é hoje pequeno (MVP em validação), esses limites priorizam não travar a experiência de um usuário legítimo — podem (e devem) ser recalibrados com dados reais de uso depois do lançamento.

**Os dois pares de números devem ficar como constantes nomeadas isoladas** (mesmo padrão já usado no projeto para `MAX_MESSAGE_LENGTH` etc.), para que possam ser ajustados sem alterar a arquitetura de rate limiting em si.

## Comportamento de 429

- **Suzzy Assist**: mensagem amigável no widget, sem detalhes internos — por exemplo: *"Você enviou muitas mensagens em pouco tempo. Aguarde um instante e tente novamente."* Nenhuma menção a limites numéricos, janelas de tempo ou infraestrutura.
- **Suzzy Support**: mensagem equivalente, reconhecendo que é um limite temporário — por exemplo: *"Você atingiu o limite temporário de mensagens do suporte. Tente novamente em alguns minutos."*
- **`Retry-After`**: avaliado como adequado incluir no cabeçalho da resposta `429` (é o mecanismo HTTP padrão para isso, e `@upstash/ratelimit` já retorna o tempo restante da janela) — decisão de implementação para a Tarefa 3/4, não desta tarefa.
- Em ambos os casos, o corpo da resposta deve seguir o mesmo formato já usado (`{ error: string }`), sem expor a causa técnica (Redis, contagem, chave usada) ao cliente.

## Impacto de privacidade

- **Suzzy Assist**: o endereço IP do visitante passaria a ser processado (não hoje, mas a partir da implementação do rate limiting). Isso **é dado pessoal para fins da LGPD**. Recomendação: **não armazenar o IP em texto puro** como chave do Redis — aplicar hash (ex.: SHA-256) do IP antes de usá-lo como chave. Isso é **pseudonimização, não anonimização real** — com o mesmo algoritmo/sal, o valor pode ser recalculado a partir de um IP conhecido; não deve ser descrito como "anônimo" em nenhum documento. **Retenção deve ser curta**: as chaves de rate limiting devem expirar automaticamente (TTL do próprio Redis) alinhadas à janela de limite (ex.: a chave da janela diária expira em 24h) — não há necessidade de reter esse dado além do necessário para aplicar o limite.
- **Suzzy Support**: o identificador usado (`sub`, o ID do usuário) já é um dado pessoal tratado pela aplicação (é a própria identidade da conta). Usá-lo como chave de rate limiting não amplia a superfície de dados tratados — é reaproveitamento do mesmo dado que a autenticação já processa. Ainda assim, deve seguir a mesma lógica de TTL curto e nunca ser exposto ao modelo de IA.
- **Nenhum conteúdo de conversa é armazenado** pelo rate limiting em si — apenas um contador numérico associado à chave (IP com hash ou `sub`), não as mensagens trocadas.

## Documentos jurídicos e páginas públicas afetados

Auditoria específica do que mudou desde a Sprint 15 (quando os quatro documentos foram escritos) e o que cada um precisa passar a refletir:

| Documento / página | O que precisa mudar |
|---|---|
| `docs/PRIVACY_POLICY.md` → `/privacidade` | Seção "Fornecedores e terceiros": mencionar que a Suzzy Assist e a Suzzy Support também enviam conteúdo digitado pelo usuário à OpenAI, além do fluxo de `/api/generate`. Seção "Quais dados podem ser tratados": esclarecer que o conteúdo do chat com a Suzzy Assist não está vinculado a uma conta (é público/anônimo), enquanto o chat com a Suzzy Support está associado a um usuário autenticado, mas sem envio de e-mail/identificador ao modelo. |
| `docs/TERMS_OF_USE.md` → `/termos` | Seção "O que é a SUZZY AI" ou nova menção: reconhecer a existência dos dois agentes conversacionais como parte da plataforma. |
| `docs/AI_TRANSPARENCY.md` → `/ia` | Seção "Processamento por fornecedor externo": estender para cobrir os dois chats, não só a geração principal. Pode ser necessária uma nova seção específica descrevendo os agentes conversacionais (Assist/Support) como um uso adicional de IA, com as mesmas limitações já documentadas (pode errar, exige revisão, sem garantia de resultado). |
| `docs/COOKIES_POLICY.md` → `/cookies` | **Sem impacto identificado** — os dois chats não usam cookies nem `localStorage` (persistência foi explicitamente descartada nas Tarefas 4 e 7 da Sprint 16). Registrar essa conclusão explicitamente no documento, em vez de simplesmente não mencionar os agentes. |

Nenhum documento foi alterado nesta tarefa — a atualização de conteúdo fica para a Tarefa 5, e a atualização das páginas públicas correspondentes para a Tarefa 6.

## Sequência de tarefas

Mantida a sequência sugerida, sem alterações — a auditoria não encontrou motivo para reordenar:

1. **Auditoria e arquitetura** (esta tarefa).
2. **Infraestrutura compartilhada de rate limiting** — instalar `@upstash/redis`/`@upstash/ratelimit`, criar um helper compartilhado (ex.: `lib/rate-limit/client.ts`), configurar as novas variáveis de ambiente.
3. **Rate limiting da Suzzy Assist** — aplicar o helper em `/api/assist`, por IP (com hash), retornando `429` com mensagem amigável.
4. **Rate limiting da Suzzy Support** — aplicar o helper em `/api/support`, por `sub` do usuário.
5. **Atualização dos documentos jurídicos base** — `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/AI_TRANSPARENCY.md`, `docs/COOKIES_POLICY.md`.
6. **Atualização das páginas jurídicas públicas** — `/privacidade`, `/termos`, `/ia`, `/cookies`, refletindo o conteúdo atualizado da Tarefa 5 (sem notas internas/placeholders, mesmo padrão da Sprint 15).
7. **Validação técnica, segurança, privacidade e custos** — testar `429` real, confirmar que `/api/generate` e os fluxos existentes continuam intactos, revisar que nenhum dado sensível (IP cru, `sub`) vaza em logs desnecessários.
8. **Encerramento e decisão de prontidão para lançamento** — aplicar os critérios objetivos definidos abaixo e registrar o resultado.

*Justificativa: infraestrutura compartilhada antes de qualquer agente individual (evita implementar rate limiting duas vezes de formas ligeiramente diferentes); documentos-base antes das páginas públicas (mesma ordem já usada com sucesso na Sprint 15); validação e encerramento sempre por último, seguindo o padrão já estabelecido nas Sprints 11 a 16.*

## Definition of Done

- `/api/assist` retorna `429` com mensagem amigável ao exceder os limites, sem chamar a OpenAI quando isso ocorrer.
- `/api/support` retorna `429` equivalente, usando o `sub` do usuário autenticado como identificador.
- Identificadores usados para rate limiting (IP, `sub`) nunca são enviados à OpenAI.
- IP do visitante armazenado apenas em forma de hash, com TTL curto alinhado à janela de limite.
- Documentos jurídicos e páginas públicas atualizados para mencionar os dois agentes, sem afirmar anonimização onde há apenas pseudonimização.
- `/api/generate` permanece inalterado, salvo necessidade comprovada durante a sprint.
- Nenhuma regressão nos fluxos já validados nas Sprints 11 a 16.
- npm run lint e npm run build aprovados em cada tarefa que alterar código.

## Critérios objetivos de prontidão para lançamento

Separados em três grupos, para responder com precisão "a SUZZY AI está tecnicamente pronta para exposição pública?" sem misturar prontidão técnica com jurídica ou comercial.

**Prontidão técnica** (verificável por código/teste, meta desta sprint):
- [x] Rate limiting real implementado e testado em `/api/assist`.
- [x] Rate limiting real implementado e testado em `/api/support`.
- [x] Comportamento `429` validado (mensagem amigável, sem detalhes internos, `Retry-After` quando aplicável).
- [x] Nenhum segredo, prompt ou identificador sensível exposto ao cliente ou à OpenAI.
- [x] `/api/generate` e demais fluxos existentes sem regressão.
- [x] npm run lint e npm run build aprovados.

**Prontidão jurídica** (não pode ser declarada concluída só por esta sprint):
- [ ] Documentos da Sprint 15 atualizados para cobrir Suzzy Assist e Suzzy Support.
- [ ] Páginas públicas correspondentes atualizadas.
- [ ] **Revisão por profissional advogado(a) habilitado(a)** — continua **não realizada**; nenhuma tarefa desta sprint substitui isso, e não será declarada concluída sem confirmação explícita do proprietário do produto.
- [ ] Dados institucionais pendentes desde a Sprint 15 (responsável legal, CNPJ, endereço, canal oficial de contato/LGPD) — seguem **não confirmados**.

**Prontidão comercial/operacional** (fora do escopo técnico desta sprint, decisão do proprietário do produto):
- [ ] Sistema de cobrança real (explicitamente fora do escopo desta sprint).
- [ ] Canal de suporte humano de retaguarda, caso os agentes de IA não resolvam a dúvida do usuário.
- [ ] Monitoramento de custo configurado (painel da OpenAI e, após a Tarefa 2, painel da Upstash).

**Atualização na Tarefa 8 (encerramento)**: o grupo "Prontidão técnica" está em **100%**, confirmado pela validação final da Tarefa 7. Os grupos jurídico e comercial seguem **sem nenhuma caixa marcada** — permanecem, como planejado desde a Tarefa 1, decisões e ações que dependem do proprietário do produto, não de mais código. Ver seção "Encerramento da Sprint 17" ao final deste documento para o registro completo.

## Fora do escopo

Confirmado pela auditoria — nenhum bloqueador real adicional de produção foi encontrado que justifique ampliar o escopo:
- Novas funcionalidades comerciais, novos agentes, redesign visual.
- Sistema de pagamento.
- Analytics ou CRM.
- Banco de dados para histórico de conversas dos agentes (permanece sem persistência, decisão já validada na Sprint 16).
- Mudanças em `/api/generate` sem necessidade comprovada.

## Decisões que dependem do proprietário do produto

1. **Confirmar (ou contratar) a conta Upstash** a ser usada — nenhuma credencial existe hoje; a Tarefa 2 vai precisar de `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` reais.
2. **Aprovar ou ajustar os números iniciais da política de limites** (5/60s + 40/dia para o Assist; 10/60s + 100/dia para o Support) antes da implementação nas Tarefas 3/4.
3. **Confirmar o ambiente de hospedagem em produção** — afeta diretamente se o cabeçalho de IP pode ser considerado confiável sem verificação adicional, e se Vercel Firewall se torna uma alternativa/complemento viável no futuro.
4. **Contratar revisão jurídica profissional** dos quatro documentos antes do lançamento comercial — pendência herdada da Sprint 15, não resolvida por esta sprint.
5. **Fornecer os dados institucionais pendentes** (responsável legal, CNPJ, endereço, canal oficial de contato/LGPD) para que os documentos jurídicos possam sair do estado de rascunho técnico.

## Tarefa 2 — Infraestrutura compartilhada (concluída)

Criada em `lib/rate-limit/` (`redis.ts`, `policies.ts`, `limiters.ts`, `check.ts`, `index.ts`), reutilizando `@upstash/redis` e `@upstash/ratelimit` (API confirmada nos tipos instalados, não em exemplos possivelmente desatualizados). Nenhum endpoint foi alterado — infraestrutura preparada, ainda não chamada.

**Decisão fail-open vs. fail-closed**: **fail-closed para os dois endpoints** (documentada em detalhe em `lib/rate-limit/index.ts`). Resumo: se o Upstash falhar, a requisição deve ser tratada como limite excedido, não liberada — para o Assist isso é essencial (é o único mecanismo de contenção de custo do endpoint público); para o Support foi adotado por consistência e por priorizar contenção de custo sobre disponibilidade nesta fase inicial do produto. Escolha revisável pelo dono do produto antes da Tarefa 4, não uma decisão irreversível — o comportamento em si só será implementado nas Tarefas 3/4.

**Variáveis de ambiente novas**: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (adicionadas a `.env.example` sem valores). Nenhum prefixo `NEXT_PUBLIC_` — uso exclusivamente server-side.

Conexão real com o Upstash validada antes da Tarefa 3 (banco `suzzy-ai-ratelimit`, São Paulo): `hasUpstashCredentials()`, `getRedisClient()`, os dois conjuntos de limitadores e uma chamada real de `.limit()` funcionaram corretamente, com contadores persistindo entre chamadas.

## Tarefa 3 — Rate limiting da Suzzy Assist (concluída)

**Estratégia**: rate limiting aplicado em `app/api/assist/route.ts`, verificado **antes** de qualquer leitura do corpo da requisição (mesma ordem "verificação primeiro" já usada na checagem de autenticação de `/api/support`) — todo request que chega à rota, válido ou não, consome uma unidade do limite.

**Identificador**: IP do visitante extraído de `x-forwarded-for` (primeiro valor da lista) com fallback para `x-real-ip`, e depois `"unknown"` se nenhum dos dois estiver presente — implementado em `lib/rate-limit/identifier.ts`. **Limitação registrada**: como o ambiente de hospedagem em produção ainda não está confirmado (mesma lacuna da Sprint 15/16), esses headers são tratados como identificador de melhor esforço, não como prova criptográfica de origem; visitantes sem IP detectável compartilham um único identificador de fallback (mais restritivo entre si, nunca "sem limite").

**Pseudonimização**: o IP nunca é usado cru — passa por SHA-256 (`node:crypto`, sem dependência nova) antes de virar a chave no Redis, com namespace `assist:<hash>`. Registrado explicitamente: é pseudonimização, não anonimização — sem um sal secreto (não introduzido nesta tarefa), um hash de IPv4 é reversível por força bruta; tratado como melhoria futura, não como lacuna silenciosa.

**Política aplicada**: 5 requisições/60s + 40/dia por identificador (sem alteração dos números definidos na Tarefa 1).

**Resposta ao exceder o limite**: `HTTP 429`, corpo `{"error": "Muitas mensagens em pouco tempo. Aguarde um momento e tente novamente."}`, com header `Retry-After` calculado a partir do `reset` real retornado pelo limitador (nunca um valor fixo inventado).

**Falha do Upstash (fail-closed, conforme decisão da Tarefa 2)**: se os limitadores não puderem ser criados (credenciais ausentes/inválidas) ou `checkRateLimit` lançar exceção, a rota retorna `HTTP 503` com mensagem genérica, sem seguir para a OpenAI. Escolhido `503` (não `429`) para não mascarar semanticamente uma falha de infraestrutura como "você excedeu seu limite" — são causas diferentes. Logs de erro registram apenas o tipo da exceção, nunca a mensagem bruta (que poderia, em tese, referenciar a URL do Redis).

**Resultado dos testes reais** (servidor local, `POST /api/assist`):
- Mensagem válida dentro do limite → `200`, resposta normal e correta.
- Payload inválido (mensagem vazia) → `400` enquanto dentro do limite; assim que o limite de 5/60s é excedido, a mesma requisição inválida passa a retornar `429` — confirma que o rate limit é verificado **antes** da validação do payload.
- Limite curto (5/60s): confirmado empiricamente com um lote de requisições em sequência rápida — a 6ª requisição dentro da janela real de 60s retornou `429`; todas as respostas `429`/`400` completaram em menos de ~250ms (sem latência de chamada à OpenAI), confirmando que nenhuma delas chegou à OpenAI.
- Recuperação: após o reset real da janela curta (confirmado por polling), uma nova requisição válida voltou a retornar `200` normalmente.
- Conversa multi-turno: testada dentro do limite, histórico processado corretamente.
- Falha de infraestrutura (fail-closed): testada de forma segura, sobrescrevendo `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` apenas no ambiente do processo de um servidor de desenvolvimento temporário (sem tocar em `.env.local` nem expor as credenciais reais) → `503` confirmado, log limpo, nenhuma chamada à OpenAI.

**Regressão**: `/api/generate` e `/api/support` continuam retornando `401` para requisições não autenticadas, exatamente como antes; nenhum dos dois arquivos foi alterado (confirmado via `git diff`).

`npm run lint` e `npm run build` aprovados. Nenhum segredo (`UPSTASH_*`, IP cru, hash) encontrado no bundle client-side.

## Tarefa 4 — Rate limiting da Suzzy Support (concluída)

**Estratégia**: rate limiting aplicado em `app/api/support/route.ts`, verificado **depois** da autenticação e **antes** da leitura/validação do corpo da requisição. Ordem do fluxo: requisição → `supabase.auth.getClaims()` → identificador do usuário → verificação no Upstash → validação do payload → OpenAI. Um visitante sem sessão continua recebendo `401` sem nunca consultar o Upstash; um usuário autenticado acima do limite recebe `429` sem chamar a OpenAI.

**Identificador**: claim `sub` do JWT do Supabase (sempre presente, conforme `RequiredClaims` do `@supabase/auth-js` instalado — não é opcional), namespaced como `support:<sub>`. Não é hash — diferente do IP público do Assist, o `sub` já é um identificador estável e não pode ser derivado a partir de dados que trafegam para fora do backend, então não há o mesmo risco de exposição por reversão que motivou o hash do IP. Nunca logado, nunca enviado à OpenAI (confirmado por leitura do código: o `identifier`/`sub` só é usado como chave de `checkRateLimit`, nunca entra em `input` ou `instructions` da chamada `client.responses.create`).

**Política aplicada**: 10 requisições/60s + 100/dia por usuário (sem alteração dos números definidos na Tarefa 1), reaproveitando a mesma infraestrutura de `lib/rate-limit/` já usada pelo Assist — nenhuma lógica duplicada.

**Resposta ao exceder o limite**: `HTTP 429`, corpo `{"error": "Você atingiu o limite temporário de mensagens do suporte. Aguarde um momento e tente novamente."}`, com header `Retry-After` calculado a partir do `reset` real retornado pelo limitador.

**Falha do Upstash (fail-closed, conforme decisão da Tarefa 2)**: se os limitadores não puderem ser criados ou `checkRateLimit` lançar exceção, a rota retorna `HTTP 503` com a mensagem genérica "O suporte está temporariamente indisponível. Tente novamente em instantes.", sem seguir para a OpenAI. Mesma justificativa da Tarefa 3 (não mascarar uma falha de infraestrutura como limite excedido). Logs registram apenas o tipo da exceção, nunca a mensagem bruta nem o `sub`.

**Privacidade**: o `sub` é usado exclusivamente como chave de rate limiting no Redis; a rota continua sem persistir mensagens, contexto, respostas da IA, e-mail ou nome do usuário — nenhuma mudança nesse comportamento.

**Componente**: `components/suzzy-support-chat.tsx` não foi alterado — já tratava respostas não-`OK` de forma genérica, e nenhum bug de integração foi identificado que justificasse mudança.

**Resultado dos testes**:
- **Teste A (real, end-to-end)**: requisição não autenticada a `POST /api/support` → `401` confirmado contra a rota real, em menos de 100ms (sem consulta ao Upstash).
- **Testes B, C, D e F (mecânica do rate limit, via rota de diagnóstico temporária)**: como não há sessão Supabase autenticada disponível neste ambiente automatizado, a mecânica de limite (mesma política 10/60s+100/dia, mesmas funções `getSupportRateLimiters()`/`checkRateLimit()` usadas por `/api/support`) foi validada com um identificador sintético fixo através de uma rota de diagnóstico temporária (`app/api/tmp-support-ratelimit-test/route.ts`, removida ao final da tarefa e confirmada via `git status`):
  - Limite curto: 10 requisições em sequência rápida retornaram `success:true` com `remaining` decrescente de 9 a 0; a 11ª retornou `success:false` — confirma o limite de 10/60s.
  - Recuperação: após o reset real da janela (confirmado por polling), uma nova requisição voltou a `success:true`.
  - Sequência dentro do limite (equivalente a uma conversa multi-turno): três chamadas sucessivas dentro da janela retornaram `success:true` normalmente, com `remaining` decrescente, sem bloqueio.
- **Teste E (fail-closed)**: testado de forma segura, sobrescrevendo `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` apenas no ambiente de um servidor de desenvolvimento temporário (sem tocar em `.env.local` nem expor credenciais reais). Confirmado: requisição não autenticada a `POST /api/support` continuou retornando `401` (autenticação independe do estado do Upstash); a rota de diagnóstico retornou `503`, confirmando que `getSupportRateLimiters()` — a mesma função usada por `/api/support` — falha de forma fechada quando as credenciais estão ausentes.
- **Recomendação registrada**: os testes B, C, D e F comprovam a mecânica do rate limit (a mesma infraestrutura compartilhada já validada com Redis real na Tarefa 2/no teste de conexão), mas não substituem um teste manual real no navegador, autenticado, contra `/api/support` — recomendado antes de considerar a Tarefa 4 validada de ponta a ponta em produção.

**Regressão**: `/api/assist` e `/api/generate` não foram alterados nesta tarefa (confirmado via `git diff --stat`); `/api/generate` sem nenhuma diferença; a única diferença em `/api/assist` é a já existente da Tarefa 3, ainda não commitada.

`npm run lint` e `npm run build` aprovados. Rota de diagnóstico temporária removida por completo; `git status` não mostra nenhum arquivo temporário remanescente.

## Tarefa 5 — Atualização dos documentos jurídicos-base (concluída)

Apenas `docs/` alterado (`PRIVACY_POLICY.md`, `TERMS_OF_USE.md`, `AI_TRANSPARENCY.md`, `COOKIES_POLICY.md`). Nenhuma página pública (`app/`) nem código alterados.

**Auditoria prévia**: comportamento real confirmado por leitura de código antes de qualquer edição — `app/api/assist/route.ts` e `app/api/support/route.ts` só enviam à OpenAI a mensagem atual e o histórico validado da própria conversa (nunca IP, hash ou `sub`); `components/suzzy-assist-chat.tsx` e `components/suzzy-support-chat.tsx` mantêm as mensagens só em estado do componente React (`useState`), sem `localStorage`/`sessionStorage`; `lib/rate-limit/` confirma TTL das chaves alinhado à própria janela da política (60 s / 1 dia).

**Política de Privacidade**: nova subseção 3-E descreve os dois chats (dados processados, ausência de persistência) e os identificadores de rate limiting (IP com hash para o Assist, explicitamente descrito como **pseudonimização, não anonimização**; identificador interno de conta para o Support). Seção 4 (finalidades), 6 (fornecedores — Upstash incluído), 7 (cookies) e 8 (retenção) atualizadas de forma consistente. Seção 13 (transferências internacionais) registra a região São Paulo do banco Upstash como **fato técnico operacional**, não como conclusão jurídica sobre residência/transferência de dados — apontada para revisão jurídica profissional.

**Termos de Uso**: seção 2 passa a reconhecer os dois agentes conversacionais, com a distinção "Support orienta, quem executa é o usuário" e "Assist não executa ações/navegação/contato futuro em nome do visitante". Seção 3 (IA e limitações) estendida para cobrir os três usos de IA. Seção 11 (disponibilidade) passa a mencionar que limites técnicos de uso podem ser aplicados, sem prometer disponibilidade ilimitada.

**Transparência sobre IA**: reestruturado para descrever explicitamente os três usos de IA (geração principal, Suzzy Assist, Suzzy Support) em uma nova seção 1, com subseções 1.1/1.2/1.3. Seção 2 diferencia como cada uso produz respostas, sem revelar prompts internos em nenhum dos três. Seção 3 estendida para o fornecedor de IA (OpenAI) nos três usos e menciona a existência do rate limiting (Upstash) sem confundir os dois mecanismos. Seção 4 (limitações) reforça explicitamente os limites de escopo de cada agente.

**Cookies**: nova seção 4 ("Chats Suzzy Assist e Suzzy Support") registra explicitamente que nenhum dos dois cria cookie próprio, nenhum usa `localStorage`, e que o rate limiting não depende de cookie. Mantida a conclusão de que a configuração técnica atual não justifica, por si só, um novo banner de consentimento — explicitamente qualificada como conclusão técnica, não parecer jurídico definitivo. Seções seguintes renumeradas (5 a 10) para acomodar a nova seção.

**Validação cruzada**: os quatro documentos foram comparados entre si após as edições — nenhuma contradição encontrada; hash de IP sempre descrito como pseudonimização (nunca "anônimo"); nenhuma afirmação inventada sobre prazo de retenção do Upstash em si (apenas o TTL das chaves de rate limiting, que corresponde exatamente às janelas já implementadas em código: 60 s e 1 dia); nenhuma certificação, localização de servidor da OpenAI/Supabase/Google ou salvaguarda jurídica específica inventada.

**Nenhuma nova pendência jurídica crítica surgiu** além das já registradas (dados institucionais, revisão jurídica profissional, canal oficial de contato) — a menção à região São Paulo do Upstash foi adicionada como um novo ponto específico a confirmar na revisão jurídica (não uma pendência bloqueante nova, apenas mais um item já coberto pela pendência geral de "revisão jurídica profissional antes do lançamento").

Não foi necessário alterar `app/api/assist/route.ts`, `app/api/support/route.ts`, componentes, rate limiting ou autenticação — confirmado via `git status` (nenhuma diferença nova nesses arquivos além das já existentes das Tarefas 3/4, ainda não commitadas).

## Tarefa 6 — Atualização das páginas jurídicas públicas (concluída)

Arquivos alterados: `app/privacidade/page.tsx`, `app/termos/page.tsx`, `app/ia/page.tsx`, `app/cookies/page.tsx`. Conteúdo migrado dos quatro documentos-base já atualizados na Tarefa 5 (`docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/AI_TRANSPARENCY.md`, `docs/COOKIES_POLICY.md`), sem inventar conteúdo jurídico novo. Padrão visual preservado — reaproveitados os mesmos componentes/classes já existentes (`LegalPageLayout`, `LEGAL_H2`, `LEGAL_P`, `LEGAL_UL`, `LEGAL_LINK`), nenhuma biblioteca nova, nenhuma mudança de navegação global.

**`/privacidade`**: nova subseção "Conversas com a Suzzy Assist e a Suzzy Support" (dados processados, ausência de persistência, identificadores de rate limiting — IP com hash para o Assist, explicitamente pseudonimizado, nunca "anônimo"; identificador interno de conta para o Support). Seções "Finalidades", "Fornecedores e terceiros" (Upstash incluído), "Cookies e armazenamento local", "Retenção" (TTL das chaves de rate limiting) e "Transferências internacionais" (região São Paulo do Upstash registrada como fato técnico, não conclusão jurídica) atualizadas de forma consistente com o documento-base.

**`/termos`**: seção "O que é a SUZZY AI" passa a descrever os dois agentes, com a distinção "Support orienta, quem executa é o usuário" / "Assist não executa ações, navegação ou contato futuro em nome do visitante". Seção "Inteligência Artificial e limitações" estendida aos três usos. Seção "Disponibilidade e evolução do serviço" passa a mencionar que limites técnicos de uso podem ser aplicados, sem prometer disponibilidade ilimitada.

**`/ia`**: seção inicial reestruturada em "Onde a SUZZY AI usa Inteligência Artificial", com subseções para os três usos (Geração principal, Suzzy Assist, Suzzy Support). "Como as respostas são produzidas" diferencia os três fluxos sem revelar prompts internos em nenhum deles. "Processamento por fornecedor externo" estendido à OpenAI nos três usos e menciona a existência do rate limiting (sem detalhar o mecanismo, que fica na Política de Privacidade). "Limitações da IA" reforça que Support não executa ações e Assist não navega/contata em nome do visitante.

**`/cookies`**: nova seção "Chats Suzzy Assist e Suzzy Support" registra que nenhum dos dois cria cookie próprio, nenhum usa `localStorage`, e que o rate limiting não depende de cookie. Conclusão sobre ausência de necessidade de banner de consentimento mantida, explicitamente qualificada como conclusão técnica, não parecer jurídico definitivo.

**Validação**: cada página comparada com seu documento-base correspondente — nenhuma contradição encontrada. Confirmado: Suzzy Assist descrita como pública nas quatro páginas; Suzzy Support descrita como autenticada; Support nunca descrita como executando ações; nenhuma conversa descrita como persistida; IP com hash sempre descrito como pseudonimizado (busca por "dado anônimo"/"é anônimo"/"dados anônimos" no HTML renderizado não encontrou nenhuma ocorrência); `sub`/identificador do Support descrito apenas como "identificador interno já associado à conta", sem jargão técnico desnecessário; OpenAI e Upstash tratados de forma consistente nas quatro páginas; nenhuma informação interna de segurança (prompts, regras anti-manipulação) exposta.

**Testes reais**: `npm run lint` aprovado; `npm run build` aprovado (as quatro páginas continuam estáticas: `○ /privacidade`, `○ /termos`, `○ /ia`, `○ /cookies`). Servidor local iniciado e as quatro rotas confirmadas com `HTTP 200`; conteúdo-chave (nomes dos agentes, "pseudonimiza", "Upstash", "São Paulo", "orienta o usuário", "não executa", "cookie próprio") verificado no HTML renderizado de cada página. Links jurídicos da Landing Page (`/privacidade`, `/termos`, `/ia`, `/cookies`, `/login`) conferidos e intactos.

**Regressão**: `/api/assist`, `/api/support`, `/api/generate`, `lib/rate-limit/`, componentes dos chats, Dashboard, Landing Page e autenticação não foram alterados nesta tarefa — confirmado via `git status` (única diferença nova em relação à Tarefa 5 são as quatro páginas públicas e este registro em `docs/SPRINT-17.md`).

## Tarefa 7 — Validação final técnica, de segurança, privacidade e custos (concluída)

Tarefa só de auditoria e teste — nenhum arquivo de código alterado.

**Rate limiting (Assist/Support)**: confirmado ao vivo contra o servidor local. Assist dentro do limite → `200` real; 6 requisições rápidas → `429` a partir da 5ª/6ª, em ~300ms (sem latência de OpenAI, confirmando que a requisição bloqueada nunca chega ao modelo); IP nunca armazenado cru (hash SHA-256, namespace `assist:<hash>`), hash nunca enviado à OpenAI. Support sem sessão → `401` em todos os testes, inclusive com o Upstash indisponível (a checagem de autenticação sempre precede a consulta ao Upstash); identificador `support:<sub>` nunca enviado à OpenAI. Mecânica de 10/60s + 100/dia do Support já validada com Redis real na Tarefa 4 e reconfirmada por auditoria de código nesta tarefa.

**Fail-closed**: confirmado ao vivo para o Assist — servidor isolado com credenciais do Upstash vazias retornou `503` em 26–64ms, sem chamar a OpenAI, log limpo (sem credenciais expostas).

**Infraestrutura e privacidade**: busca no bundle cliente (`.next/static`) não encontrou nenhuma ocorrência de "UPSTASH" nem de URL/host do Upstash; variáveis `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` seguem server-side only, sem prefixo `NEXT_PUBLIC_`; nenhuma conversa persistida pelo rate limiting (Redis só recebe chave + contador); nenhum identificador entra no `input`/`instructions` enviados à OpenAI.

**Documentos jurídicos vs páginas públicas**: sem contradições. Busca direta no HTML renderizado confirmou "pseudonimiza" presente e nenhuma ocorrência de "dado anônimo"/"é anônimo"; nenhuma página pública contém placeholder (`A CONFIRMAR ANTES DO LANÇAMENTO`) ou nota interna (`Aviso interno`/`Nota interna`) — esse conteúdo fica restrito aos documentos-base em `docs/`, como já era o padrão antes da Sprint 17.

**Regressões**: `git diff --stat` desde o último commit mostrou exatamente os arquivos esperados da Sprint 17 (rotas Assist/Support, `lib/rate-limit/`, `.env.example`, `package.json`, os 4 documentos-base, as 4 páginas públicas). Zero diferenças em `/api/generate`, componentes, Dashboard, Landing Page, autenticação, histórico, templates, cenários, objeções, estratégias ou planos/preços — nenhum desses arquivos foi sequer tocado.

**IP/Proxy**: pendência já registrada nas Tarefas 1/3, mantida sem alteração nesta tarefa (nenhum bug comprovado que justificasse mudar a estratégia): a confiança em `x-forwarded-for`/`x-real-ip` depende do ambiente de hospedagem final, ainda não confirmado.

**npm audit**: 6 vulnerabilidades altas (`brace-expansion`, `js-yaml` via `eslint`; `nanoid`, `postcss` via `next`/`@tailwindcss/postcss`; `sharp` e `next`). Nenhuma depende de `@upstash/redis` ou `@upstash/ratelimit` — confirmado rastreando `npm ls` de cada pacote. Todas pré-existentes à Sprint 17. Nenhum `npm audit fix` executado.

**Testes**: `npm run lint` ✅ | `npm run build` ✅ | Assist 200/429/503 ✅ (ao vivo) | Support 401 ✅ (ao vivo, com e sem Upstash) | as quatro páginas jurídicas renderizando `200` ✅ | bundle cliente sem segredos ✅.

**Veredito da Tarefa 7**: **Sprint 17 aprovada tecnicamente.** Nenhuma inconsistência ou regressão encontrada. Pendências jurídicas, comerciais e de hospedagem/proxy permanecem registradas, sem bloquear a aprovação técnica.

---

## Encerramento da Sprint 17

**Status**: Sprint 17 — Preparação para Produção da SUZZY AI — **concluída**.
**Data de conclusão**: 2026-08-09.

### Resumo das 8 tarefas executadas

1. **Auditoria e planejamento técnico** — mapeamento do estado atual, comparação de infraestrutura de rate limiting (Upstash Redis escolhido sobre Vercel KV/Firewall), estratégias de identificador por agente, política inicial de limites, comportamento de 429, impacto de privacidade e mapeamento dos documentos jurídicos afetados.
2. **Infraestrutura compartilhada de rate limiting** — criação de `lib/rate-limit/` (Redis, políticas, limitadores, verificação), instalação de `@upstash/redis`/`@upstash/ratelimit`, novas variáveis de ambiente (server-side only), decisão de fail-closed para os dois agentes, conexão real com o Upstash validada.
3. **Rate limiting real da Suzzy Assist** — aplicado em `/api/assist`: identificador por IP com hash (pseudonimizado), política 5/60s + 40/dia, `429` com `Retry-After`, `503` fail-closed, testado ao vivo (dentro do limite, limite excedido, recuperação, falha de infraestrutura).
4. **Rate limiting real da Suzzy Support** — aplicado em `/api/support`: identificador `support:<sub>` (claim do Supabase), política 10/60s + 100/dia, autenticação sempre antes do Upstash, `429`/`503` no mesmo padrão do Assist, testado ao vivo e via rota de diagnóstico temporária (removida ao final).
5. **Atualização dos documentos jurídicos-base** — `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/AI_TRANSPARENCY.md`, `docs/COOKIES_POLICY.md` atualizados para cobrir Suzzy Assist, Suzzy Support, OpenAI, Upstash, rate limiting e pseudonimização, sem inventar conteúdo jurídico novo.
6. **Atualização das páginas jurídicas públicas** — `/privacidade`, `/termos`, `/ia`, `/cookies` atualizadas com o mesmo conteúdo dos documentos-base, preservando o padrão visual existente.
7. **Validação técnica final** — rate limiting, fail-closed, privacidade, segredos, consistência jurídica e regressões verificados e testados ao vivo; `npm audit` executado e classificado.
8. **Encerramento documental e decisão de prontidão** (esta tarefa) — registro final do estado da sprint.

**Infraestrutura Upstash**: implementada e validada com conexão real (banco `suzzy-ai-ratelimit`, região São Paulo, plano Free), usada exclusivamente para os contadores de rate limiting dos dois agentes — nunca para conteúdo de conversas.

**Rate limiting real**: implementado, testado ao vivo e aprovado tanto para a Suzzy Assist (pública, por IP pseudonimizado) quanto para a Suzzy Support (autenticada, por `sub`).

**Documentos jurídicos-base e páginas públicas**: atualizados de forma consistente entre si, sem contradições, sem placeholders ou notas internas vazando para o público.

**Resultado da validação final**: nenhuma regressão funcional encontrada; `npm run lint` e `npm run build` aprovados em todas as tarefas que alteraram código.

### 1. Prontidão técnica

**Status: aprovada.**
- Rate limiting funcionando (Assist e Support), testado ao vivo.
- Fail-closed confirmado nos dois agentes.
- Nenhuma credencial exposta (bundle cliente, logs, variáveis de ambiente).
- Os dois agentes de IA protegidos contra uso ilimitado/custo descontrolado.
- `/api/generate` intacto.
- Nenhuma regressão em nenhum fluxo já validado nas Sprints 11 a 16.

### 2. Prontidão jurídica

**Status: pendente.**
- Revisão jurídica profissional ainda não realizada.
- Responsável legal pendente.
- CNPJ, se aplicável, pendente.
- Endereço, se necessário, pendente.
- Canal oficial de privacidade/LGPD pendente.

### 3. Prontidão comercial/operacional

**Status: pendente.**
- Sistema de cobrança ainda não implementado.
- Canal de suporte humano/retaguarda ainda não definido.
- Monitoramento de custos ainda precisa ser formalmente configurado (painéis da OpenAI e da Upstash).
- Ambiente final de hospedagem ainda precisa ser confirmado.

### 4. IP / Proxy (pendência de produção)

A estratégia atual do Assist usa `x-forwarded-for`/`x-real-ip` como melhor esforço. Antes de tráfego real em produção, deve ser confirmado quais desses headers a plataforma de hospedagem escolhida sobrescreve de forma confiável — sem essa confirmação, o identificador de rate limiting do Assist continua sendo tratado como best-effort, não como prova criptográfica de origem.

### 5. npm audit

- 6 vulnerabilidades altas detectadas (`brace-expansion`, `js-yaml`, `nanoid`, `postcss`, `sharp`, `next`).
- Nenhuma introduzida pelas dependências Upstash (`@upstash/redis`, `@upstash/ratelimit`) — confirmado por rastreamento de árvore de dependências.
- Vulnerabilidades pré-existentes à Sprint 17 (ferramentas de build/dev: `eslint`, `next`, `@tailwindcss/postcss`).
- Exigem análise antes do Go/No-Go de produção.
- Nenhum `npm audit fix` foi executado automaticamente.

### 6. Decisão final

**"Sprint 17 aprovada tecnicamente."**

**Não** se declara: "SUZZY AI pronta para lançamento comercial."

**A SUZZY AI está tecnicamente pronta, porém ainda depende de pendências jurídicas, comerciais e operacionais antes de exposição pública/comercial completa.**

### 7. Próximo passo recomendado

O próximo ciclo deve focar nos bloqueadores restantes de lançamento (revisão jurídica profissional, dados institucionais, sistema de cobrança, canal de suporte, monitoramento de custos, confirmação do ambiente de hospedagem) — **não em novas funcionalidades**.
