# Sprint 15 — Base Jurídica e Transparência

## Objetivo da sprint

Criar a base jurídica e de transparência da SUZZY AI — Termos de Uso, Política de Privacidade e aviso sobre uso de Inteligência Artificial — refletindo com precisão as práticas reais implementadas no produto até a Sprint 14, sem inventar garantias, certificações ou práticas não comprovadas.

## Contexto

A Landing Page Comercial (Sprint 14) já promete "início do teste gratuito" e cobrança futura via os planos Corretor e Pequena Imobiliária, e o rodapé já expõe os links "Termos de Uso" e "Política de Privacidade" apontando provisoriamente para `#`. O FAQ da Landing Page também já adianta, textualmente, que "Nossa Política de Privacidade completa será disponibilizada antes do lançamento oficial." A Sprint 15 existe para cumprir essa promessa com documentos que descrevam **o que o sistema realmente faz hoje**, não o que ele poderá vir a fazer.

## Auditoria técnica encontrada

Auditoria feita por inspeção de código e configuração (nomes de variáveis de ambiente, não seus valores; nenhum segredo, token ou chave é reproduzido abaixo).

**Dados que o usuário informa à plataforma**
- E-mail, usado para login via Google OAuth ou Magic Link (`app/login/page.tsx`).
- Texto livre no campo "Contexto" do dashboard — pode conter dados pessoais de terceiros (ex.: nome, telefone ou situação de um cliente do corretor), já que o corretor cola trechos de conversas reais.
- Seleção de tarefa, cenário e objeção: não são dados pessoais, são escolhas entre opções pré-definidas pela própria aplicação (`lib/ai/tasks.ts`, `lib/real-estate-scenarios.ts`, `lib/real-estate-objections.ts`).

**Dados de autenticação utilizados**
- Autenticação via Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`), com dois métodos: OAuth Google e Magic Link (OTP por e-mail) — ver `app/login/page.tsx`.
- Sessão mantida via cookies HTTP geridos automaticamente pela biblioteca do Supabase, renovados a cada requisição pelo proxy/middleware (`proxy.ts` → `lib/supabase/proxy.ts`).
- A aplicação não implementa cadastro de senha própria; não armazena senha em código ou banco próprio.

**Provedores externos identificados**
- **Supabase** — autenticação (login, sessão, logout).
- **OpenAI** (pacote `openai`, modelo `gpt-5-mini`, Responses API) — geração das respostas de IA (`app/api/generate/route.ts`).
- Nenhum outro provedor externo foi encontrado. Confirmado por `package.json` (dependências) e pelas variáveis de ambiente declaradas em `.env.example`/`.env.local` (apenas `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_APP_URL`): não há Stripe, analytics, CRM externo, WhatsApp API ou qualquer outro serviço de terceiros.

**Onde os dados do usuário são armazenados**
- Sessão de autenticação: gerida pelo Supabase (cookies no navegador + backend do Supabase). O armazenamento interno do lado do Supabase não é visível pelo código deste repositório.
- **Não existe banco de dados de aplicação em uso**: nenhuma chamada a tabelas do Supabase (`supabase.from(...)`) ou a Supabase Storage foi encontrada em todo o projeto. O Supabase é usado exclusivamente para autenticação.
- Histórico de gerações: armazenado **somente no navegador do usuário**, via `localStorage` (chave `suzzy-ai:generation-history`, ver `hooks/use-generation-history.ts`) — não é enviado nem sincronizado com nenhum servidor.

**Histórico de gerações**
- Existe, mas é inteiramente local ao navegador (client-side). Não é compartilhado entre dispositivos, não é acessível pela equipe da SUZZY AI, e é perdido se o usuário limpar os dados do navegador.

**Informações enviadas para o serviço de IA (OpenAI)**
- O texto digitado pelo usuário no campo "Contexto" (literal, incluindo eventuais dados pessoais de terceiros que o corretor tenha colado ali).
- A tarefa selecionada.
- Quando aplicável: o cenário e a objeção selecionados pelo usuário, e as estratégias de negociação resolvidas automaticamente pelo servidor — todos esses três são textos fixos definidos pela própria aplicação, não dados pessoais do usuário.
- **Não é enviado** à OpenAI: e-mail, nome, ou qualquer outro dado de autenticação do usuário (`app/api/generate/route.ts` só encaminha `context`, `task`, `scenarioId` resolvido e `objectionId` resolvido).

**Cookies ou mecanismos equivalentes**
- Cookies de sessão do Supabase (estritamente necessários para manter o login), geridos automaticamente por `@supabase/ssr`; não há configuração manual de cookies no código da aplicação.
- `localStorage` do navegador para o histórico de gerações — tecnicamente não é um cookie HTTP, mas é um mecanismo de armazenamento local equivalente para fins de transparência.
- Nenhum cookie de terceiros, analytics ou publicidade foi encontrado.

**Analytics, tracking ou publicidade**
- Nenhum encontrado. Não há Google Analytics, Vercel Analytics, Meta Pixel, Segment, PostHog, Sentry ou qualquer outra ferramenta de rastreamento nas dependências (`package.json`) ou no código.

**Pagamento/assinatura**
- Não implementado. A Landing Page (Sprint 14) exibe preços e o "Programa Fundadores", mas não há nenhuma integração de cobrança, checkout ou gateway de pagamento em nenhum arquivo do projeto.

**Exclusão de conta ou de dados**
- Não implementada. Existe apenas logout (`app/auth/logout/route.ts`, via `supabase.auth.signOut()`). Não há endpoint, botão ou fluxo para exclusão de conta ou de dados armazenados.

**Período de retenção definido**
- Não definido nem implementado no código. Não há expiração automática do histórico local nem rotina de expurgo de dados.

**Compartilhamento de dados com terceiros**
- O único compartilhamento tecnicamente identificável é o envio do contexto informado pelo usuário à OpenAI, necessário para gerar a resposta solicitada. Não há compartilhamento com anunciantes, CRMs externos ou qualquer outro terceiro.

**Informações que não podem ser determinadas apenas pelo código**
- Escopos exatos de dados retornados pelo provedor OAuth do Google (ex.: se nome e foto de perfil são obtidos, além do e-mail).
- Política de retenção e uso de dados da OpenAI aplicável à conta/tier de API utilizada.
- Localização geográfica dos servidores do Supabase e da OpenAI efetivamente usados pela conta do projeto.
- Configurações adicionais feitas diretamente no painel do Supabase (regras de RLS, triggers, webhooks) que não estejam refletidas no código deste repositório.
- Ambiente de hospedagem em produção: o `CLAUDE.md` cita Vercel como stack prevista, mas isso é um plano, não uma confirmação de que a aplicação já está hospedada ali.
- Canal de contato oficial (e-mail de suporte, encarregado de dados/DPO) para fins de exercício de direitos do titular perante a LGPD.

## Pontos "A confirmar"

Resumo consolidado dos itens que precisam de decisão ou informação externa ao código antes da redação final dos documentos jurídicos:

1. Escopos de dados obtidos via login com Google (nome, foto de perfil, outros).
2. Política de retenção/uso de dados da OpenAI para a conta/tier usada pelo projeto.
3. Localização geográfica dos dados (servidores do Supabase e da OpenAI).
4. Ambiente e região de hospedagem em produção da aplicação.
5. Canal de contato oficial para privacidade/LGPD (e-mail de suporte e/ou encarregado de dados).
6. Se e quando um período de retenção formal será definido para sessão e histórico.
7. Se a exclusão de conta/dados será implementada nesta sprint ou fica para uma sprint futura de produto.
8. CNPJ/razão social e endereço da empresa responsável (se já existir formalização jurídica da SUZZY AI).

## Escopo

1. Auditoria e planejamento (esta tarefa).
2. Política de Privacidade (texto).
3. Termos de Uso (texto).
4. Transparência e uso de Inteligência Artificial (texto).
5. Cookies e tecnologias semelhantes (análise + texto, se necessário).
6. Implementação das páginas jurídicas (rotas públicas).
7. Integração com a Landing Page e o rodapé (substituição dos links `#`).
8. Validação jurídica/técnica de consistência.
9. Encerramento documental.

*Sequência mantida conforme sugerido, sem ajustes: cada tarefa entrega um artefato pequeno e verificável (um documento, depois outro, depois a implementação, depois a integração, depois a validação), seguindo o mesmo padrão incremental já usado nas Sprints 11 a 14 deste projeto — nenhuma tarefa mistura redação de conteúdo jurídico com implementação de código, o que facilita revisão isolada de cada etapa.*

## Fora do escopo

- Implementação de páginas jurídicas nesta tarefa (Tarefa 1 é só auditoria e planejamento).
- Qualquer alteração em `app/page.tsx`, `app/login/page.tsx`, dashboard, autenticação, API ou geração de IA.
- Instalação de dependências.
- Sistema de cobrança/pagamento (fora do escopo desde a Sprint 14).
- Implementação de exclusão de conta/dados (a menos que definida como necessária durante a Sprint, com aprovação prévia).
- Redação jurídica definitiva sem revisão profissional (ver aviso abaixo).

## Tarefas numeradas

1. **Auditoria e planejamento** — este documento.
2. **Política de Privacidade** — redigir o texto com base na auditoria técnica, distinguindo dados do usuário, dados de autenticação, conteúdo inserido pelo corretor, conteúdo gerado pela IA, e os provedores envolvidos (Supabase, OpenAI).
3. **Termos de Uso** — redigir o texto cobrindo responsabilidades do usuário, limitações da IA e proibição explícita de tratar as respostas da IA como garantia de resultado comercial.
4. **Transparência e uso de IA** — texto específico explicando, em linguagem simples, que as respostas são geradas por IA (OpenAI), com apoio de dados pré-definidos (cenários, objeções, estratégias) e do contexto informado pelo usuário.
5. **Cookies e tecnologias semelhantes** — decidir, com base na auditoria (cookies de sessão do Supabase + `localStorage` do histórico, sem tracking/analytics), se é necessário um Aviso de Cookies dedicado ou se basta uma seção dentro da Política de Privacidade.
6. **Implementação das páginas jurídicas** — criar as rotas públicas para os documentos definidos nas Tarefas 2 a 5.
7. **Integração com a Landing Page e rodapé** — substituir os links `#` de "Termos de Uso" e "Política de Privacidade" pelas rotas reais, e revisar as menções a privacidade/IA já existentes na Landing Page (Hero, FAQ) para garantir consistência com os documentos publicados.
8. **Validação jurídica/técnica de consistência** — conferir se os documentos publicados refletem exatamente o que o código faz (sem promessas não implementadas), rodar lint/build.
9. **Encerramento documental** — atualizar este arquivo com o resultado final da sprint.

## Definition of Done

- Política de Privacidade, Termos de Uso e aviso de Transparência/IA publicados em rotas próprias.
- Decisão registrada sobre a necessidade (ou não) de um Aviso de Cookies dedicado.
- Rodapé da Landing Page apontando para as páginas reais, não mais para `#`.
- Nenhuma afirmação no texto jurídico sobre criptografia específica, certificações, prazos de retenção, localização geográfica, anonimização, exclusão automática ou conformidade de terceiros, a menos que tecnicamente comprovado ou formalmente definido.
- Aviso explícito, em todos os documentos, de que o conteúdo não constitui aconselhamento jurídico definitivo e exige revisão por profissional habilitado antes do lançamento comercial.
- Nenhuma regressão nas funcionalidades existentes.
- npm run lint aprovado.
- npm run build aprovado.

## Pendências que exigem decisão do fundador

- Definir o canal oficial de contato para assuntos de privacidade/LGPD (e-mail de suporte e/ou encarregado de dados).
- Decidir se a exclusão de conta/dados será implementada nesta sprint (como funcionalidade de produto) ou registrada apenas como "disponível mediante solicitação" nos documentos.
- Confirmar CNPJ/razão social e endereço, caso já existam, para constar nos documentos.
- Confirmar ambiente e região de hospedagem em produção, para decidir se algo pode ser afirmado sobre localização dos dados.
- Confirmar se há necessidade de aceite explícito (checkbox) dos Termos de Uso no fluxo de login/cadastro, ou se a publicação das páginas é suficiente nesta fase do MVP.

## Aviso de revisão jurídica profissional

Os documentos produzidos nesta sprint são um **rascunho técnico de transparência**, escrito com base na auditoria do código e com a LGPD como referência principal para usuários no Brasil. Eles **não constituem aconselhamento jurídico definitivo** e **devem passar por revisão de um profissional advogado(a) habilitado(a)** antes de qualquer lançamento comercial oficial da SUZZY AI.

## Status

Concluída em 2026-08-07.

## Resumo das tarefas executadas

- **Tarefa 1 — Auditoria e planejamento**: auditoria técnica completa do projeto (dados tratados, autenticação, fornecedores externos, armazenamento, cookies, analytics, cobrança, exclusão de conta, retenção, compartilhamento com terceiros) e criação deste documento, incluindo os pontos "A confirmar" e a estrutura da sprint.
- **Tarefa 2 — Política de Privacidade**: criado `docs/PRIVACY_POLICY.md`, distinguindo dados de conta/autenticação, conteúdo fornecido pelo usuário, conteúdo gerado pela IA e histórico local, com bases legais, fornecedores, cookies, retenção, direitos do titular e demais seções exigidas pela LGPD, usando placeholders `[A CONFIRMAR ANTES DO LANÇAMENTO]` onde a informação institucional ainda não existe.
- **Tarefa 3 — Termos de Uso**: criado `docs/TERMS_OF_USE.md`, coerente com a Política de Privacidade, cobrindo o que é a SUZZY AI, limitações da IA, responsabilidades do usuário, uso aceitável, propriedade intelectual e a seção "Planos, teste gratuito e cobrança" (deixando claro que não há sistema de cobrança implementado e que nenhuma regra comercial é ainda uma obrigação contratual definitiva).
- **Tarefa 4 — Transparência e uso de IA**: criado `docs/AI_TRANSPARENCY.md`, explicando em linguagem simples como as respostas são produzidas, o uso da OpenAI como fornecedor externo, as limitações da IA e a ausência de garantia de resultado comercial.
- **Tarefa 5 — Cookies e tecnologias semelhantes**: criado `docs/COOKIES_POLICY.md`, com a conclusão preliminar de que um banner de consentimento não é necessário nesta fase (apenas cookies estritamente necessários e `localStorage` funcional foram identificados), condicionada a revisão caso analytics/publicidade sejam adicionados no futuro.
- **Tarefa 6 — Implementação das páginas jurídicas**: criadas as rotas públicas `/privacidade`, `/termos`, `/ia` e `/cookies` (mais o componente compartilhado `components/legal-page-layout.tsx`), convertendo os quatro documentos-base em páginas legíveis e visualmente consistentes com a SUZZY AI, removendo notas internas, placeholders e informações institucionais não definidas.
- **Tarefa 7 — Integração com a Landing Page e rodapé**: os links do rodapé de `app/page.tsx` passaram a apontar para as quatro rotas reais (antes apontavam para `#`); a resposta do FAQ sobre proteção de dados deixou de prometer que a Política "será disponibilizada" e passou a linkar diretamente para `/privacidade`; um link discreto para `/ia` foi adicionado à pergunta sobre a IA substituir o corretor.
- **Tarefa 8 — Validação jurídica/técnica de consistência**: verificação cruzada dos quatro documentos-base, das quatro páginas públicas e da Landing Page — nenhuma contradição, nenhum vazamento de nota interna/placeholder/informação inventada, links funcionando, FAQ consistente, nenhuma promessa técnica não comprovada, e nenhuma funcionalidade do produto afetada.
- **Tarefa 9 — Encerramento documental**: este fechamento.

## Documentos criados

- `docs/PRIVACY_POLICY.md`
- `docs/TERMS_OF_USE.md`
- `docs/AI_TRANSPARENCY.md`
- `docs/COOKIES_POLICY.md`

## Páginas públicas criadas

- `/privacidade` — Política de Privacidade
- `/termos` — Termos de Uso
- `/ia` — Transparência sobre Inteligência Artificial
- `/cookies` — Cookies e Armazenamento Local

## Integração com a Landing Page

O rodapé de `app/page.tsx` agora aponta para as quatro rotas reais acima (antes: `#`). A comunicação sobre privacidade e IA no FAQ foi revisada para não prometer mais nada "para o futuro" e para linkar diretamente às páginas públicas correspondentes. Nenhuma outra parte da Landing Page (Hero, planos, Programa Fundadores, preços) foi alterada.

## Resultado da validação final

- Nenhuma contradição entre os quatro documentos-base.
- Nenhuma página pública exibe `[A CONFIRMAR ANTES DO LANÇAMENTO]`, notas internas, comentários sobre revisão jurídica ou informação empresarial inventada.
- Links jurídicos da Landing Page funcionando corretamente.
- Comunicação sobre IA e sobre cookies coerente com a arquitetura real do produto.
- `npm run lint` — sem erros.
- `npm run build` — sucesso, todas as rotas (incluindo as quatro páginas jurídicas) geradas normalmente.
- **Nenhuma regressão funcional foi encontrada** em nenhuma área do produto (dashboard, API, autenticação, histórico, templates, cenários, objeções, estratégias).

## Pendências antes do lançamento comercial

Esta sprint **preparou a base jurídica e de transparência da SUZZY AI, mas não representa autorização automática para lançamento comercial**. Antes de qualquer lançamento comercial definitivo, é necessário resolver:

- responsável legal;
- CNPJ, se aplicável;
- endereço, se necessário;
- canal oficial de contato e de privacidade/LGPD;
- regras definitivas de cobrança (preço final, meio de pagamento, renovação, cancelamento, reembolso e condições definitivas do Programa Fundadores);
- **revisão jurídica profissional de todos os documentos** (`docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/AI_TRANSPARENCY.md`, `docs/COOKIES_POLICY.md`) por advogado(a) habilitado(a).
