# Política de Privacidade — SUZZY AI

*Versão: documento-base — [A CONFIRMAR ANTES DO LANÇAMENTO] (data da versão final).*

## 1. Introdução

Esta Política de Privacidade explica, de forma simples e transparente, como a SUZZY AI trata os dados das pessoas que utilizam a plataforma. Ela se aplica a todos os usuários da SUZZY AI — uma assistente de inteligência artificial voltada a corretores de imóveis e pequenas imobiliárias, com lançamento inicial voltado ao Brasil.

Esta Política foi elaborada com base na Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD) como referência principal, e descreve apenas práticas efetivamente implementadas na plataforma ou decisões já formalmente definidas. Informações institucionais ou operacionais ainda não confirmadas estão marcadas como **[A CONFIRMAR ANTES DO LANÇAMENTO]**.

## 2. Quem é responsável pela SUZZY AI

- Responsável legal / razão social: **[A CONFIRMAR ANTES DO LANÇAMENTO]**
- CNPJ, se aplicável: **[A CONFIRMAR ANTES DO LANÇAMENTO]**
- Endereço, se necessário: **[A CONFIRMAR ANTES DO LANÇAMENTO]**
- Canal oficial de privacidade/LGPD: **[A CONFIRMAR ANTES DO LANÇAMENTO]**

## 3. Quais dados podem ser tratados

### A) Dados de conta e autenticação

Para permitir o acesso à plataforma, podem ser tratados:
- o e-mail utilizado no login;
- identificadores necessários para autenticação e manutenção da sessão;
- informações eventualmente disponibilizadas pelo provedor de login escolhido (ex.: Google), conforme as permissões concedidas pelo usuário naquele momento.

Não afirmamos que dados como nome ou foto de perfil sejam sempre coletados — isso depende das permissões concedidas pelo usuário ao provedor de login e ainda está **[A CONFIRMAR ANTES DO LANÇAMENTO]**.

### B) Conteúdo fornecido pelo usuário

Ao utilizar a plataforma, o corretor pode inserir, no campo de contexto, informações sobre o atendimento e a situação comercial em análise, para solicitar a geração de uma resposta pela IA. O corretor também pode selecionar, entre opções pré-definidas pela própria plataforma, a tarefa, o cenário e a objeção relacionados ao atendimento — essas seleções não são dados pessoais, são escolhas entre categorias já existentes no sistema.

**Importante:** o usuário não deve inserir dados pessoais desnecessários, dados pessoais sensíveis, ou informações confidenciais de clientes quando isso não for necessário para o uso da plataforma. Veja a seção 10 ("Responsabilidade do usuário") para mais detalhes.

### C) Conteúdo gerado pela IA

A plataforma produz respostas e recomendações a partir das informações fornecidas pelo usuário (contexto, tarefa, cenário e objeção, quando aplicável) combinadas com recursos internos da própria aplicação (bibliotecas de cenários, objeções e estratégias de negociação pré-definidas). Esse conteúdo gerado não é, por si só, uma nova coleta de dados pessoais além do que já foi fornecido pelo usuário.

### D) Histórico local

Na versão atual auditada da plataforma, o histórico de gerações (contexto, tarefa e resposta) é armazenado **localmente no navegador do usuário**, por meio da tecnologia `localStorage`, e **não é armazenado em uma tabela própria da aplicação no servidor**. Essa afirmação descreve o funcionamento técnico atual, comprovado por auditoria do código, e não deve ser generalizada para versões futuras da plataforma, que poderão adotar uma arquitetura diferente.

## 4. Finalidades

Os dados tratados pela SUZZY AI têm as seguintes finalidades, compatíveis com o funcionamento atual do sistema:
- autenticar o usuário e permitir o acesso à plataforma;
- processar as solicitações de geração enviadas pelo usuário;
- produzir respostas e recomendações por meio de inteligência artificial;
- manter o histórico de gerações localmente no navegador do usuário, para sua própria conveniência;
- garantir a segurança e o funcionamento técnico da plataforma, quando aplicável.

Não realizamos, hoje, atividades de marketing direcionado, criação de perfil de comportamento (profiling), publicidade ou analytics de rastreamento — nenhuma dessas práticas foi identificada na auditoria técnica do projeto.

## 5. Bases legais

Considerando a LGPD, as finalidades descritas acima podem se relacionar, em princípio, com as seguintes bases legais, sem prejuízo de análise jurídica específica:
- **execução de contrato ou de procedimentos preliminares relacionados a contrato**, para autenticação, acesso à plataforma e processamento das solicitações de geração;
- **legítimo interesse**, quando juridicamente adequado, para finalidades de segurança e funcionamento técnico da plataforma;
- **cumprimento de obrigação legal ou regulatória**, quando aplicável.

Esta seção representa um enquadramento preliminar e prudente, não uma conclusão jurídica definitiva. A definição final das bases legais aplicáveis a cada finalidade deverá ser revisada por profissional jurídico antes do lançamento comercial.

## 6. Fornecedores e terceiros

Para funcionar, a SUZZY AI utiliza os seguintes fornecedores tecnológicos, identificados na auditoria técnica do projeto:
- **Supabase** — utilizado para autenticação (login, manutenção de sessão e logout);
- **Google** — utilizado apenas quando o usuário escolhe fazer login com sua conta Google, conforme as permissões concedidas por ele naquele momento;
- **OpenAI** — utilizado para o processamento das solicitações de inteligência artificial. O conteúdo necessário à geração da resposta (contexto informado pelo usuário, tarefa, e, quando aplicável, cenário/objeção/estratégia selecionados) pode ser processado por esse fornecedor de IA para produzir a resposta solicitada.

Não afirmamos, nesta versão do documento, a localização geográfica dos servidores desses fornecedores, seus prazos de retenção específicos, certificações obtidas ou condições contratuais aplicáveis à conta da SUZZY AI, pois essas informações ainda não estão confirmadas — ver seção 13 e os pontos "A confirmar" registrados em `docs/SPRINT-15.md`.

## 7. Cookies e armazenamento local

A plataforma utiliza:
- **cookies ou mecanismos de sessão estritamente necessários à autenticação**, geridos automaticamente pelo provedor de autenticação (Supabase), para manter o usuário conectado;
- **`localStorage`** do navegador, para manter o histórico local de gerações descrito na seção 3-D.

Não utilizamos cookies de publicidade, rastreamento ou analytics — nenhum foi identificado na auditoria técnica do projeto. Uma análise mais detalhada sobre cookies e tecnologias semelhantes será aprofundada em documento específico (Tarefa 5 da Sprint 15).

## 8. Retenção

Sobre o tempo de retenção dos dados tratados pela plataforma:
- o histórico local de gerações permanece no dispositivo/navegador do usuário até que seja removido por ele, conforme os mecanismos disponíveis no próprio navegador (ex.: limpeza de dados de navegação) ou, futuramente, por um mecanismo próprio da plataforma;
- os dados processados pelos fornecedores externos (Supabase, Google, OpenAI) estão sujeitos às práticas e configurações de retenção aplicáveis a cada um desses fornecedores, que não são definidas por este documento;
- períodos específicos de retenção da sessão de autenticação e de eventuais dados tratados pelos fornecedores ainda precisam ser confirmados.

Não estabelecemos, nesta versão do documento, um prazo de retenção próprio da SUZZY AI para dados de conta, pois essa definição ainda está **[A CONFIRMAR ANTES DO LANÇAMENTO]**.

## 9. Direitos do titular

Nos termos da LGPD, quando aplicáveis, o titular dos dados pode exercer os seguintes direitos:
- confirmação da existência de tratamento;
- acesso aos dados;
- correção de dados incompletos, inexatos ou desatualizados;
- anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD, quando cabíveis;
- portabilidade dos dados, quando aplicável;
- informação sobre as entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados;
- revogação do consentimento, quando essa for a base legal utilizada para o tratamento;
- demais direitos previstos na legislação aplicável.

Não existe, na versão atual da plataforma, um botão ou funcionalidade de autoatendimento para exclusão de conta — essa funcionalidade ainda não foi implementada. O canal para exercício dos direitos descritos nesta seção será: **[A CONFIRMAR ANTES DO LANÇAMENTO]**.

## 10. Responsabilidade do usuário

Ao utilizar a SUZZY AI, o corretor deve:
- evitar inserir dados pessoais desnecessários de seus clientes no campo de contexto;
- não inserir dados pessoais sensíveis de clientes sem necessidade e sem uma base legal adequada para fazê-lo;
- possuir autorização ou base legal apropriada para qualquer informação de terceiros que decida inserir na plataforma, já que o corretor também atua como agente de tratamento dessas informações ao inseri-las;
- revisar cuidadosamente as respostas geradas pela IA antes de enviá-las a um cliente, garantindo que estejam corretas, adequadas e alinhadas com a realidade do atendimento.

## 11. Inteligência Artificial

A SUZZY AI utiliza inteligência artificial para gerar respostas e recomendações. É importante que o usuário compreenda que:
- parte relevante do serviço utiliza modelos de inteligência artificial de um fornecedor externo (ver seção 6);
- as respostas geradas podem conter erros, imprecisões ou inadequações à situação real;
- o conteúdo gerado pela IA **não substitui o julgamento profissional do corretor**;
- **não há garantia de resultado comercial** decorrente do uso das respostas ou recomendações geradas;
- o corretor é responsável por revisar o conteúdo gerado e decidir, com seu próprio julgamento profissional, como e se irá utilizá-lo.

Um documento específico de transparência sobre o uso de Inteligência Artificial será aprofundado na Tarefa 4 da Sprint 15.

## 12. Segurança

Adotamos medidas técnicas e organizacionais compatíveis com o funcionamento atual da plataforma, sujeitas à evolução contínua do produto. Não declaramos segurança absoluta — nenhum sistema é inteiramente livre de riscos — e não mencionamos, nesta versão do documento, padrões específicos de criptografia ou certificações, pois isso ainda não está comprovado para a operação completa da plataforma.

## 13. Transferências internacionais

Como a SUZZY AI utiliza fornecedores tecnológicos internacionais (ver seção 6), poderá existir tratamento ou transferência internacional de dados, conforme a infraestrutura e os serviços efetivamente utilizados por esses fornecedores. Não indicamos, nesta versão do documento, países ou servidores específicos, pois essa informação ainda não está confirmada.

Esta seção deve ser revisada por profissional jurídico antes do lançamento comercial, especialmente quanto às salvaguardas exigidas pela LGPD para transferência internacional de dados.

## 14. Alterações desta Política

Esta Política poderá ser atualizada conforme a plataforma evolua. Sempre que isso ocorrer, a data da versão vigente será indicada no início deste documento.

## 15. Contato

Para dúvidas sobre esta Política ou para exercer os direitos descritos na seção 9, entre em contato através de: **[A CONFIRMAR ANTES DO LANÇAMENTO]**.

---

## 16. Aviso interno

> **Nota interna — não destinada à futura página pública.**
> Documento-base sujeito a revisão jurídica profissional antes do lançamento comercial definitivo.
