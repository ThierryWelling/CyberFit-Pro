-- Schema do banco de dados CyberFit Pro
-- Versão: 1.0.0
-- Data: 2024-02-20

-- Habilitar a extensão UUID
create extension if not exists "uuid-ossp";

-- Tabela de Alunos
create table public.alunos (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    full_name varchar(255) not null,
    email varchar(255) not null unique,
    cpf varchar(14) not null unique,
    telefone varchar(20) not null,
    birth_date date not null,
    instrutor_token varchar(100),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Instrutores
create table public.instrutores (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    full_name varchar(255) not null,
    email varchar(255) not null unique,
    cpf varchar(14) not null unique,
    telefone varchar(20) not null,
    cref varchar(50) not null unique,
    academia_email varchar(255) references academias(email),
    status varchar(20) check (status in ('pendente', 'ativo', 'inativo')) not null default 'pendente',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Academias
create table public.academias (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    full_name varchar(255) not null,
    email varchar(255) not null unique,
    cnpj varchar(18) not null unique,
    telefone varchar(20) not null,
    address text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Função para atualizar o updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Triggers para atualizar updated_at
create trigger handle_alunos_updated_at
    before update on public.alunos
    for each row
    execute function public.handle_updated_at();

create trigger handle_instrutores_updated_at
    before update on public.instrutores
    for each row
    execute function public.handle_updated_at();

create trigger handle_academias_updated_at
    before update on public.academias
    for each row
    execute function public.handle_updated_at();

-- Políticas de Segurança RLS (Row Level Security)

-- Habilitar RLS para todas as tabelas
alter table public.alunos enable row level security;
alter table public.instrutores enable row level security;
alter table public.academias enable row level security;

-- Políticas para Alunos
create policy "Alunos podem ver seus próprios dados"
    on public.alunos for select
    using (auth.uid() = user_id);

create policy "Alunos podem inserir seus próprios dados"
    on public.alunos for insert
    with check (auth.uid() = user_id);

create policy "Alunos podem atualizar seus próprios dados"
    on public.alunos for update
    using (auth.uid() = user_id);

create policy "Instrutores podem ver dados dos seus alunos"
    on public.alunos for select
    using (exists (
        select 1 from public.tokens
        where tokens.token = alunos.instrutor_token
        and tokens.created_by = auth.uid()
    ));

-- Políticas para Instrutores
create policy "Instrutores podem ver seus próprios dados"
    on public.instrutores for select
    using (auth.uid() = user_id);

create policy "Instrutores podem inserir seus próprios dados"
    on public.instrutores for insert
    with check (auth.uid() = user_id);

create policy "Instrutores podem atualizar seus próprios dados"
    on public.instrutores for update
    using (auth.uid() = user_id);

create policy "Academias podem ver dados dos seus instrutores"
    on public.instrutores for select
    using (auth.jwt() ->> 'email' = academia_email);

-- Políticas para Academias
drop policy if exists "Academias podem ver seus próprios dados" on public.academias;
drop policy if exists "Academias podem inserir seus próprios dados" on public.academias;
drop policy if exists "Academias podem atualizar seus próprios dados" on public.academias;

create policy "Permitir inserção sem restrições"
    on public.academias for insert
    with check (true);

create policy "Permitir visualização sem restrições"
    on public.academias for select
    using (true);

create policy "Permitir atualização pelo próprio usuário"
    on public.academias for update
    using (auth.uid() = user_id);

-- Índices para melhor performance
create index alunos_user_id_idx on public.alunos(user_id);
create index alunos_email_idx on public.alunos(email);
create index alunos_cpf_idx on public.alunos(cpf);
create index alunos_instrutor_token_idx on public.alunos(instrutor_token);

create index instrutores_user_id_idx on public.instrutores(user_id);
create index instrutores_email_idx on public.instrutores(email);
create index instrutores_cpf_idx on public.instrutores(cpf);
create index instrutores_cref_idx on public.instrutores(cref);
create index instrutores_academia_email_idx on public.instrutores(academia_email);

create index academias_user_id_idx on public.academias(user_id);
create index academias_email_idx on public.academias(email);
create index academias_cnpj_idx on public.academias(cnpj); 