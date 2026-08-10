# Transparência e Uso de Inteligência Artificial — SUZZY AI

*Versão: documento-base — [A CONFIRMAR ANTES DO LANÇAMENTO] (data da versão final).*

Este documento explica, em linguagem simples, como a SUZZY AI utiliza Inteligência Artificial (IA) e quais são os limites dessa tecnologia. Ele complementa a [Política de Privacidade](./PRIVACY_POLICY.md) e os [Termos de Uso](./TERMS_OF_USE.md), e deve ser lido em conjunto com esses documentos.

## 1. Onde a SUZZY AI usa Inteligência Artificial

A plataforma utiliza IA em três fluxos distintos:

### 1.1 Geração principal

O uso central da plataforma: a partir do contexto informado pelo corretor, da tarefa selecionada (por exemplo, responder um lead ou criar um follow-up) e, quando aplicável, do cenário e da objeção selecionados, a IA produz uma resposta ou recomendação para apoiar o atendimento.

### 1.2 Suzzy Assist

Chat público, disponível na página inicial (Landing Page), que não exige login. Responde dúvidas informativas sobre a SUZZY AI — como a plataforma funciona, planos, uso geral — para visitantes que ainda não são usuários.

### 1.3 Suzzy Support

Chat disponível no Dashboard, para usuários já autenticados. Orienta sobre como usar a plataforma (por exemplo, como preencher o contexto, escolher cenários e objeções, interpretar o histórico). A Suzzy Support **orienta o usuário; quem executa é o próprio usuário** — ela não realiza ações automaticamente no Dashboard em nome dele.

Nos três casos, a IA é o mecanismo por trás da geração do conteúdo, mas a plataforma continua sendo, acima de tudo, uma ferramenta de apoio ao trabalho do corretor.

## 2. Como as respostas são produzidas

**Geração principal**: de forma simples, a resposta gerada leva em conta:
- o contexto informado pelo corretor no momento da solicitação;
- a tarefa selecionada (por exemplo, responder um lead ou criar um follow-up);
- o cenário de atendimento, quando selecionado pelo corretor;
- a objeção do cliente, quando selecionada pelo corretor;
- estratégias internas de negociação relevantes para a situação, escolhidas automaticamente pela plataforma quando aplicável.

**Suzzy Assist e Suzzy Support**: funcionam de forma diferente da geração principal — não usam contexto, tarefa, cenário ou objeção. Cada uma responde com base na mensagem digitada pelo usuário naquele chat e no histórico recente da própria conversa, orientada por um conjunto interno de informações sobre a plataforma (o que cada uma pode e não pode fazer, seus limites de escopo, e regras de segurança contra tentativas de manipulação da conversa).

Não detalhamos publicamente os prompts internos, as instruções proprietárias ou os demais detalhes técnicos de como esses elementos são combinados, em nenhum dos três usos — essa é uma informação interna de funcionamento da plataforma, não necessária para que o usuário compreenda, na prática, o que a IA faz com as informações fornecidas, e sua divulgação poderia facilitar tentativas de manipulação dos assistentes.

## 3. Processamento por fornecedor externo

A geração de respostas nos três usos descritos na seção 1 utiliza tecnologia de um fornecedor externo especializado em inteligência artificial: a **OpenAI**. Isso significa que o conteúdo necessário para gerar cada resposta (o contexto e demais elementos da geração principal; ou a mensagem e o histórico recente da conversa, no caso da Suzzy Assist e da Suzzy Support) pode ser processado por esse fornecedor.

Não afirmamos, neste documento, a localização geográfica dos servidores utilizados, prazos específicos de retenção de dados por esse fornecedor, certificações obtidas ou quaisquer condições contratuais não confirmadas para a conta da SUZZY AI — para mais detalhes sobre fornecedores e tratamento de dados, consulte a [Política de Privacidade](./PRIVACY_POLICY.md).

À parte do processamento de IA, a Suzzy Assist e a Suzzy Support também usam um mecanismo técnico de controle de limite de uso (rate limiting), operado por outro fornecedor (Upstash), com a finalidade de prevenir abuso e conter custos — esse mecanismo não participa da geração das respostas em si. Detalhes sobre esse fornecedor e os identificadores usados estão na [Política de Privacidade](./PRIVACY_POLICY.md).

## 4. Limitações da IA

É importante que o usuário compreenda que a inteligência artificial tem limitações — nos três usos descritos na seção 1. A IA:
- pode errar;
- pode interpretar o contexto ou a pergunta de forma incorreta;
- pode produzir informações inadequadas à situação real.

Por isso, as respostas geradas **devem ser revisadas pelo usuário** antes de qualquer uso. A decisão final de utilizar, adaptar ou enviar uma resposta a um cliente é sempre **humana** — nunca automática. Em particular:
- a Suzzy Support orienta o uso da plataforma, mas não executa ações no Dashboard em nome do usuário;
- a Suzzy Assist informa sobre a SUZZY AI, mas não executa ações, navegação ou contato futuro em nome do visitante.

## 5. Resultados comerciais

A SUZZY AI **não garante**:
- vendas;
- conversão de leads;
- fechamento de negócios;
- comissões ou qualquer outro resultado financeiro.

O uso da plataforma é um apoio ao trabalho comercial do corretor, não uma promessa de resultado.

## 6. Uso responsável

Ao utilizar a IA da SUZZY AI, o usuário deve:
- revisar o conteúdo gerado antes de utilizá-lo;
- adaptar a resposta quando necessário para refletir a realidade do atendimento;
- não inserir dados pessoais desnecessários de clientes;
- evitar dados pessoais sensíveis quando não forem necessários e adequadamente fundamentados;
- não utilizar a IA para práticas ilegais, discriminatórias, fraudulentas ou abusivas.

## 7. Conteúdo especializado

As respostas produzidas pela SUZZY AI **não substituem aconselhamento jurídico, financeiro, tributário ou qualquer outro serviço profissional especializado**. Para essas áreas, o usuário (ou seu cliente) deve buscar um profissional habilitado.

## 8. Supervisão humana

A SUZZY AI é uma ferramenta de apoio ao corretor. Ela **não substitui** a experiência, a responsabilidade ou o julgamento profissional do corretor perante seus clientes e o mercado imobiliário.

## 9. Evolução da tecnologia

Os modelos de inteligência artificial utilizados, os recursos disponíveis e o funcionamento da IA na plataforma podem evoluir ao longo do tempo, à medida que a SUZZY AI e a tecnologia de seus fornecedores avançam. Quando essas mudanças forem relevantes, este documento poderá ser atualizado.

## 10. Contato

Para dúvidas sobre o uso de Inteligência Artificial na SUZZY AI, entre em contato através de: **[A CONFIRMAR ANTES DO LANÇAMENTO]**.

---

## 11. Aviso interno

> **Nota interna — não destinada à futura página pública.**
> Documento-base sujeito a revisão jurídica profissional antes do lançamento comercial definitivo.
