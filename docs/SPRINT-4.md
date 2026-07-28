# SPRINT 4 - Integração real com IA

## Objetivo

Conectar o dashboard existente a uma integração real com IA (OpenAI, Responses API, modelo `gpt-5-mini`), usando o contexto informado pelo usuário e a tarefa selecionada para gerar uma resposta de fato, substituindo o feedback estático da Sprint 3.

## Decisões técnicas

- **Provedor:** OpenAI.
- **SDK:** pacote oficial `openai`.
- **API:** Responses API.
- **Modelo inicial:** `gpt-5-mini`.
- **Modo de resposta:** única, sem streaming.
- **Variável de ambiente:** `OPENAI_API_KEY`, já reservada em `.env.example` desde a Sprint 0 — não precisa ser criada nem alterada. O valor real é configurado manualmente em `.env.local`, que nunca é commitado.
- **Nenhuma variável `NEXT_PUBLIC_` relacionada à IA** — a chave nunca é exposta ao navegador.

## Funcionalidades entregues

- Definição server-side das tarefas permitidas, seus tipos e as instruções (prompts) associadas a cada uma.
- Endpoint `POST /api/generate` (Route Handler), protegido por autenticação, que valida a entrada e chama a OpenAI.
- Chamada real ao endpoint a partir do `DashboardForm`.
- Exibição da resposta gerada na interface do dashboard.
- Estados de carregamento, sucesso e erro no client.

## Fora do escopo

- Histórico de respostas.
- Streaming de resposta.
- Persistência em banco de dados.
- Rate limiting, cache ou filas.
- Múltiplos provedores de IA ou seleção de modelo pelo usuário.
- Papéis, permissões, CRM, funil ou gestão de leads.

## Contrato do endpoint `POST /api/generate`

**Entrada:**
```json
{
  "context": "string",
  "task": "identificador permitido"
}
```

**Sucesso (200):**
```json
{
  "response": "texto gerado"
}
```

**Erro:**
```json
{
  "error": "mensagem amigável e genérica"
}
```

### Identificadores de tarefa permitidos
- `responder_lead`
- `criar_follow_up`
- `gerar_anuncio`
- `sugerir_proximos_passos`

### Validação de entrada no servidor
- o corpo da requisição precisa ser JSON válido;
- `context` precisa ser `string`;
- `context.trim()` não pode ser vazio;
- `context` deve ter no máximo 5.000 caracteres;
- `task` precisa pertencer à lista fechada dos quatro identificadores acima.

O contexto do usuário é delimitado e identificado explicitamente como conteúdo fornecido pelo usuário ao ser enviado ao modelo. As instruções principais de cada tarefa ficam fixas no servidor, associadas a cada identificador de tarefa (Tarefa 3); o contrato da API não permite que o cliente envie ou substitua diretamente essas instruções internas. Essa separação reduz, mas não elimina completamente, o risco de prompt injection a partir do texto de contexto.

## Tarefas previstas

### Tarefa 1 — Registrar decisões técnicas e preparar configuração local — concluída
- Confirmar por escrito (neste documento) as decisões de provedor, SDK, API e modelo.
- Verificar que `OPENAI_API_KEY` já está presente em `.env.example` (sem valor) e orientar a configuração manual do valor real em `.env.local`.
- **Critério de aceitação:** nenhuma alteração de código ou de `.env.example`/`.env.local` necessária nesta tarefa; documentação reflete as decisões aprovadas.

### Tarefa 2 — Instalar o SDK oficial da OpenAI — concluída
- Adicionar a dependência `openai` ao projeto.
- **Critério de aceitação:** dependência instalada; `npm run lint` e `npm run build` continuam passando; nenhuma lógica de integração criada ainda.

### Tarefa 3 — Criar tipos, lista de tarefas permitidas e prompts no servidor — concluída
- Definir o tipo TypeScript para os identificadores de tarefa permitidos (`responder_lead`, `criar_follow_up`, `gerar_anuncio`, `sugerir_proximos_passos`).
- Definir o mapeamento entre cada identificador e sua instrução interna (prompt de sistema).
- Criar uma função simples que monta a entrada enviada ao modelo, combinando a instrução da tarefa (fixa, definida no servidor) com o contexto do usuário (tratado como dado).
- **Critério de aceitação:** tipos e mapeamento vivem apenas no servidor; a função de montagem não aceita nem interpreta instruções vindas do usuário — apenas o texto de contexto.

### Tarefa 4 — Criar o Route Handler protegido com validação e integração real — concluída
- Criar `app/api/generate/route.ts` (POST).
- Verificar autenticação (reaproveitando `lib/supabase/server`) **antes** de qualquer chamada à OpenAI; sem sessão, retornar 401.
- Validar o corpo da requisição conforme a seção "Validação de entrada no servidor"; entrada inválida retorna 400.
- Usar o SDK oficial da OpenAI somente no servidor, com a Responses API e o modelo `gpt-5-mini`, retornando uma resposta única (sem streaming).
- Extrair e validar o texto retornado pela IA antes de responder ao cliente.
- Tratar todos os cenários de erro (ver seção "Tratamento de erros") sem expor chave, stack trace ou detalhes internos do SDK.
- **Critério de aceitação:**
  - requisição sem sessão retorna 401 e não chama a OpenAI;
  - entrada inválida retorna 400 e não chama a OpenAI;
  - entrada válida retorna `{ "response": "..." }` com o texto gerado;
  - qualquer falha retorna `{ "error": "..." }` com mensagem genérica, sem detalhes sensíveis.

### Tarefa 5 — Conectar DashboardForm ao endpoint — concluída
- Substituir a mensagem estática do clique em "Gerar resposta" por uma chamada `fetch` real a `POST /api/generate`, enviando `context` e `task`.
- **Critério de aceitação:** clique dispara exatamente uma requisição ao endpoint; a resposta (`response` ou `error`) é recebida pelo componente.

### Tarefa 6 — Adicionar estados de carregamento, sucesso e erro — concluída
- Indicar visualmente que a geração está em andamento (ex. botão desabilitado/texto alterado).
- Exibir o texto gerado em caso de sucesso.
- Exibir mensagem amigável em caso de erro (rede, 401, 400, 500), sem detalhes técnicos.
- **Critério de aceitação:** os três estados (carregando, sucesso, erro) são visualmente distinguíveis; nenhum erro quebra a interface.

### Tarefa 7 — Validar segurança e fluxo completo — concluída
- Executar a checklist de validação completa (ver seção "Validação final").
- **Critério de aceitação:** todos os itens da checklist passam; `npm run lint` e `npm run build` sem erros.

## Resultado da validação (Tarefa 7)

Validação manual realizada em 2026-07-28, utilizando uma chave real da OpenAI configurada em `.env.local`:

- **Autenticação**: validada — o endpoint `/api/generate` exige sessão ativa antes de qualquer chamada à OpenAI, retornando 401 sem sessão.
- **Integração com Responses API**: validada — chamada real a `client.responses.create` com o modelo `gpt-5-mini`.
- **Geração real**: confirmada — entrada válida (contexto + tarefa) retornou `{ "response": "..." }` com texto gerado de fato pela OpenAI.
- **Frontend integrado ao endpoint**: confirmado — `DashboardForm` chama `POST /api/generate` e exibe a resposta real sob "Resposta gerada".
- **Endpoint protegido**: confirmado — validações de entrada (JSON inválido, contexto vazio/excedente, tarefa inválida) e autenticação funcionando conforme especificado.
- **Build**: aprovado (`npm run build` sem erros).
- **Lint**: aprovado (`npm run lint` sem erros).
- **Sprint 4**: concluída.

## Dependências entre tarefas

- Tarefa 1 é pré-requisito das Tarefas 2 e 3.
- Tarefas 2 e 3 são independentes entre si.
- Tarefas 2 e 3 são pré-requisitos da Tarefa 4.
- Tarefa 4 é pré-requisito da Tarefa 5.
- Tarefa 5 é pré-requisito da Tarefa 6.
- Tarefa 7 depende da conclusão das Tarefas 1 a 6.

## Tratamento de erros

O endpoint deve tratar explicitamente:
- **ausência de sessão:** 401;
- **entrada inválida** (JSON malformado, `context` não string ou vazio após `trim()`, `context` acima de 5.000 caracteres, `task` fora da lista fechada): 400;
- **método não permitido:** comportamento padrão do Route Handler (apenas `POST` é implementado);
- **`OPENAI_API_KEY` ausente ou mal configurada:** erro tratado no servidor, resposta genérica ao cliente (sem revelar detalhes de configuração);
- **falha do provedor** (erro de rede, timeout, erro retornado pela OpenAI): resposta genérica ao cliente;
- **resposta vazia da IA:** tratada como erro, com mensagem genérica ao cliente;
- **erro interno inesperado:** capturado, resposta genérica ao cliente.

Em nenhum desses cenários o navegador deve receber chave, stack trace, detalhes internos do SDK ou qualquer informação sensível — sempre `{ "error": "mensagem amigável e genérica" }`.

## Cuidados de segurança

- **Chave da IA somente no servidor:** `OPENAI_API_KEY` lida e usada exclusivamente dentro do Route Handler; nenhuma variável `NEXT_PUBLIC_` relacionada à IA.
- **Nenhuma credencial exposta ao navegador:** a chave nunca aparece em props, respostas JSON, logs client-side, bundle do client ou na aba Network.
- **Validação das entradas:** conforme a seção "Validação de entrada no servidor"; o contexto do usuário é delimitado e identificado explicitamente como conteúdo fornecido pelo usuário — as instruções principais por tarefa ficam fixas no servidor (Tarefa 3) e o contrato da API não permite que o cliente envie ou substitua diretamente essas instruções. Essa separação não elimina completamente o risco de prompt injection.
- **Tratamento de erros:** conforme a seção "Tratamento de erros" — mensagens sempre genéricas para o cliente.
- **Autenticação obrigatória no endpoint:** mesma verificação de sessão usada em `/dashboard`, aplicada antes de qualquer chamada à OpenAI.

## Validação final (Tarefa 7)

- `npm run lint`;
- `npm run build`;
- chamar o endpoint sem sessão ativa → 401;
- enviar JSON inválido → 400;
- enviar contexto vazio (ou só espaços) → 400;
- enviar contexto acima de 5.000 caracteres → 400;
- enviar `task` inválida (fora da lista fechada) → 400;
- gerar uma resposta válida de ponta a ponta (contexto + tarefa corretos) → 200 com texto gerado;
- simular erro de chave/provedor (ex. chave ausente ou inválida) → erro genérico, sem detalhes sensíveis;
- inspecionar bundle do client, aba Network e respostas do endpoint → nenhuma chave exposta em nenhum desses lugares;
- confirmar que cada clique em "Gerar resposta" dispara exatamente uma requisição;
- confirmar ausência de erros no console durante todo o fluxo.

## Definição de pronto (Definition of Done)

A Sprint 4 estará concluída quando:

- o usuário autenticado conseguir preencher contexto e tarefa e receber uma resposta real gerada pela OpenAI no dashboard;
- o endpoint `POST /api/generate` exigir autenticação e validar a entrada antes de chamar a OpenAI;
- as instruções internas de cada tarefa forem fixas no servidor, sem possibilidade de o usuário substituí-las;
- a chave da OpenAI nunca for exposta ao navegador (bundle, Network ou respostas);
- todos os cenários de erro listados forem tratados com mensagens genéricas, sem detalhes internos;
- nenhuma funcionalidade fora do escopo (histórico, persistência, streaming, múltiplos provedores, rate limiting/cache/filas) tiver sido introduzida sem aprovação prévia;
- `npm run lint` e `npm run build` passarem sem erros;
- a checklist de validação final tiver sido executada com sucesso.
