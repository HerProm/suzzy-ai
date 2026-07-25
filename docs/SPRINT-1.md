# SPRINT 1 - Autenticação simples via Supabase

## Objetivo

Implementar a autenticação simples prevista no escopo do MVP, integrando o projeto Next.js ao Supabase sobre a fundação técnica preparada na Sprint 0.

## Escopo

- Integração do projeto Next.js com o Supabase (clientes de browser e servidor).
- Infraestrutura de sessão via cookies (middleware de renovação de sessão).
- Autenticação simples (entrada e saída do usuário).
- Proteção mínima de rota para o dashboard.

## Escopo excluído da Sprint 1

Não devem ser implementados nesta sprint:

- CRM, funil, pipeline ou gestão de leads;
- cadastro complexo de imóveis;
- gestão de usuários, papéis ou permissões;
- recuperação de senha, verificação de e-mail avançada ou múltiplos provedores de login;
- dashboard e suas funcionalidades (apenas o "portão" de acesso autenticado);
- qualquer funcionalidade de produto além do acesso autenticado.

## Tarefas previstas

### 1. Integrar o projeto Next.js ao Supabase — concluída

- Instalar `@supabase/supabase-js` e `@supabase/ssr`.
- Criar os clientes de browser e servidor (`lib/supabase/client.ts`, `lib/supabase/server.ts`).
- Preparar as variáveis de ambiente necessárias (`.env.example`).

### 2. Preparar infraestrutura de autenticação (middleware)

- Criar o middleware oficial recomendado pelo Supabase para renovação de sessão via cookies.
- Não implementar login, logout, páginas ou proteção de rota nesta tarefa.

### 3. Criar página de login simples

- Formulário mínimo de entrada (e-mail/senha ou magic link, a definir).
- Sem estilização elaborada nem fluxo de recuperação de senha.

### 4. Implementar logout

- Ação simples de encerrar a sessão do usuário.

### 5. Proteger a rota do dashboard

- Redirecionar para o login quando não houver sessão ativa.
- Sem lógica de papéis ou permissões.

### 6. Validar o fluxo de autenticação localmente

- Confirmar login, logout e proteção de rota funcionando de ponta a ponta em ambiente local.

## Critérios de conclusão da Sprint 1

A Sprint 1 estará concluída quando:

- o cliente Supabase estiver configurado e validado (build e lint sem erros);
- o middleware de renovação de sessão estiver funcionando;
- o usuário conseguir entrar (login) e sair (logout) da aplicação;
- a rota do dashboard estiver protegida, redirecionando usuários não autenticados;
- nenhuma funcionalidade fora do escopo (CRM, cadastros, gestão avançada) tiver sido introduzida.

## Regra de execução

Cada tarefa desta sprint deve ser implementada isoladamente, com confirmação explícita antes de avançar para a próxima, seguindo a regra de trabalho definida no CLAUDE.md.
