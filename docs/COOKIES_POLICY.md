# Cookies e Tecnologias Semelhantes — SUZZY AI

*Versão: documento-base — [A CONFIRMAR ANTES DO LANÇAMENTO] (data da versão final).*

Este documento explica, de forma simples e transparente, quais cookies e mecanismos de armazenamento são realmente utilizados atualmente pela SUZZY AI. Ele foi elaborado com base na auditoria técnica do projeto e complementa a [Política de Privacidade](./PRIVACY_POLICY.md), os [Termos de Uso](./TERMS_OF_USE.md) e o documento de [Transparência e Uso de Inteligência Artificial](./AI_TRANSPARENCY.md).

## 1. Cookies necessários

A plataforma utiliza mecanismos de sessão relacionados à autenticação por meio do Supabase. Esses mecanismos são **necessários** para o login, a manutenção da sessão do usuário e o funcionamento do acesso autenticado à plataforma — sem eles, não é possível permanecer conectado à SUZZY AI.

Não afirmamos, neste documento, nomes específicos de cookies, duração, domínio, características de criptografia ou outros detalhes técnicos não confirmados — esses mecanismos são geridos automaticamente pela biblioteca de autenticação utilizada, não configurados manualmente pela aplicação.

## 2. Login com Google

Quando o usuário escolhe se autenticar utilizando sua conta Google, esse fornecedor também pode utilizar tecnologias e mecanismos próprios, conforme suas próprias políticas e funcionamento. Não detalhamos aqui características técnicas desses mecanismos, por não serem controlados pela SUZZY AI.

## 3. Armazenamento local

A versão atual da plataforma utiliza o `localStorage` do navegador para armazenar o histórico de gerações do usuário. Sobre esse armazenamento:
- ele fica no navegador/dispositivo do próprio usuário;
- pode ser perdido caso os dados de navegação do navegador sejam apagados;
- **não existe**, atualmente, sincronização desse histórico em um banco de dados próprio da aplicação — o histórico não é enviado a nenhum servidor.

## 4. Chats Suzzy Assist e Suzzy Support

A plataforma conta com dois assistentes de conversa (Suzzy Assist, público, na página inicial; e Suzzy Support, autenticado, no Dashboard — descritos em detalhe na [Política de Privacidade](./PRIVACY_POLICY.md)). Com base na auditoria técnica do projeto:
- nenhum dos dois chats cria cookie próprio;
- nenhum dos dois chats usa `localStorage` para guardar a conversa — cada conversa existe apenas na memória da página enquanto ela estiver aberta, e é perdida ao fechá-la ou recarregar;
- o controle de limite de uso desses chats (rate limiting, usado para prevenir abuso e conter custos) é feito inteiramente no servidor e **não depende de cookie nem de armazenamento local** — usa, como identificador técnico, o IP do visitante (com hash) no caso da Suzzy Assist, e um identificador interno já associado à conta no caso da Suzzy Support;
- o acesso à Suzzy Support continua dependendo dos mesmos mecanismos de sessão/autenticação já descritos na seção 1 — nenhum cookie ou mecanismo adicional foi introduzido para viabilizar esse chat.

Essa conclusão descreve o estado técnico atual do projeto, verificado por auditoria de código — não é, por si só, um parecer jurídico definitivo sobre a ausência de necessidade de banner de consentimento (ver seção 6).

## 5. Analytics, publicidade e rastreamento

Conforme a auditoria técnica realizada no projeto:
- **não foram identificados** cookies de publicidade;
- **não foram identificadas** ferramentas de analytics;
- **não foram identificados** mecanismos de rastreamento (tracking) comercial.

Esta seção descreve a **versão atual** da plataforma — incluindo os chats Suzzy Assist e Suzzy Support (seção 4) — e poderá ser atualizada caso novas tecnologias desse tipo sejam adicionadas no futuro.

## 6. Consentimento e banner de cookies

Com base na configuração técnica atual — na qual foram identificados apenas mecanismos necessários à autenticação e um armazenamento local de natureza funcional (histórico de gerações) — não implementamos, nesta etapa, um banner de consentimento nem um mecanismo de "Aceitar todos". Cookies estritamente necessários ao funcionamento do serviço, em geral, não dependem desse tipo de banner.

Esta conclusão preliminar deve ser **revista** caso a SUZZY AI passe a utilizar, futuramente, cookies de analytics, publicidade ou quaisquer outros cookies não essenciais. A interpretação jurídica final sobre a necessidade (ou não) de um banner de consentimento deve passar por **revisão profissional** antes do lançamento comercial definitivo.

## 7. Gerenciamento pelo usuário

O usuário pode, por meio das configurações do próprio navegador, apagar cookies e dados armazenados localmente. É importante saber que isso pode:
- encerrar a sessão ativa na plataforma;
- remover o histórico local de gerações;
- afetar funcionalidades que dependem desses dados.

## 8. Alterações futuras

Este documento poderá ser atualizado caso a SUZZY AI passe a utilizar novas tecnologias de cookies, armazenamento local ou mecanismos semelhantes.

## 9. Contato

Para dúvidas sobre esta política de cookies, entre em contato através de: **[A CONFIRMAR ANTES DO LANÇAMENTO]**.

---

## 10. Aviso interno

> **Nota interna — não destinada à futura página pública.**
> Documento-base sujeito a revisão jurídica profissional antes do lançamento comercial definitivo.
