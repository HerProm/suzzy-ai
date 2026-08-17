-- Sprint 19 — Perfil do Corretor
-- Cria a primeira tabela de dados de aplicação do projeto (até aqui, o
-- Supabase era usado só para autenticação). id = auth.users.id: nenhum
-- e-mail é duplicado aqui, o vínculo é sempre pelo identificador do Auth.
-- CRECI é autodeclarado pelo próprio usuário — não há verificação
-- automática contra nenhum órgão regulador nesta versão.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  creci_number text not null,
  creci_uf text not null,
  city text not null,
  state text not null,
  professional_type text not null,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  terms_accepted_at timestamptz not null,
  terms_version text not null,
  privacy_accepted_at timestamptz not null,
  privacy_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_professional_type_check
    check (professional_type in ('autonomo', 'imobiliaria'))
);

comment on table public.profiles is
  'Perfil do corretor, preenchido no primeiro acesso após o login. CRECI é autodeclarado pelo próprio usuário -- nao ha verificacao automatica contra nenhum orgao regulador.';

alter table public.profiles enable row level security;

-- Cada usuário só pode ler o próprio perfil.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Cada usuário só pode criar a própria linha de perfil (o `id` inserido
-- precisa ser o próprio auth.uid(), nunca o de outra pessoa).
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Cada usuário só pode atualizar o próprio perfil.
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Nenhuma política de DELETE foi criada de propósito: o processo de
-- exclusão de conta/perfil ainda não está definido (ver docs/SPRINT-19.md).
-- A cláusula "on delete cascade" acima garante que, se a conta em
-- auth.users for removida por outro meio, o perfil correspondente é
-- removido automaticamente — não fica um registro órfão.
