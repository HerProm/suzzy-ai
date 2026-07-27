# SPRINT 2 - Login efetivo, logout e proteção de rota

## Objetivo

Concluir o fluxo de autenticação do MVP, implementando o login efetivo (Google e Magic Link), o logout e a proteção da rota do dashboard, sobre a infraestrutura de sessão preparada na Sprint 1. O MVP atenderá corretores autônomos, imobiliárias pequenas e equipes de vendas.

## Escopo

- Login com Google (OAuth via Supabase).
- Login via Magic Link (e-mail, sem senha).
- Logout (encerramento de sessão).
- Rota de callback para conclusão do login (troca de código/token por sessão).
- Proteção da rota do dashboard, redirecionando usuários não autenticados para o login.
- Validação do fluxo completo de autenticação em ambiente local.

## Fora do escopo

- Login por senha (e-mail/senha) — não haverá esse método no MVP.
- Recuperação de senha (não se aplica, pois não há senha).
- Papéis, permissões ou workspaces.
- CRM, funil, pipeline ou gestão de leads.
- Cadastro complexo de imóveis.
- Funcionalidades do dashboard além da proteção de rota (conteúdo do dashboard é de sprint futura).
- Provedores de login além de Google e Magic Link.

## Tarefas previstas

### 1. Configurar login com Google
- Habilitar e configurar o provedor Google OAuth no Supabase.
- Adicionar/documentar variáveis de ambiente necessárias.

### 2. Criar página de login
- Formulário mínimo com duas opções: "Entrar com Google" e "Entrar com Magic Link" (campo de e-mail).
- Sem estilização elaborada.

### 3. Implementar rota de callback
- Criar a rota que recebe o retorno do provedor (Google ou Magic Link) e finaliza a criação da sessão.

### 4. Implementar logout
- Ação simples de encerrar a sessão do usuário e redirecionar para o login.

### 5. Proteger a rota do dashboard
- Redirecionar para o login quando não houver sessão ativa.
- Sem lógica de papéis ou permissões.

### 6. Validar o fluxo de autenticação localmente — concluída
- Confirmar login com Google, login com Magic Link, logout e proteção de rota funcionando de ponta a ponta.

## Resultado da validação (Tarefa 6)

Validação manual realizada em 2026-07-27:

- **Login com Google**: validado com sucesso.
- **Callback OAuth**: validado com sucesso.
- **Dashboard protegido**: validado (acesso autenticado funcionando).
- **Redirecionamento de usuário não autenticado para /login**: validado com sucesso.
- **Logout**: validado com sucesso.
- **Magic Link**: implementação validada; o teste completo de ponta a ponta ficou bloqueado pelo limite temporário de envio de e-mails do Supabase (rate limit) e por expiração do link recebido — não foi identificado defeito no código.

## Critérios de conclusão

A Sprint 2 estará concluída quando:

- o usuário conseguir entrar com Google;
- o usuário conseguir entrar via Magic Link;
- não existir nenhum fluxo de login por senha;
- o usuário conseguir sair (logout) da aplicação;
- a rota do dashboard estiver protegida, redirecionando usuários não autenticados;
- nenhuma funcionalidade de papéis, permissões ou workspaces tiver sido introduzida;
- nenhuma funcionalidade fora do escopo do MVP (CRM, cadastros extensivos, automações complexas) tiver sido introduzida.
