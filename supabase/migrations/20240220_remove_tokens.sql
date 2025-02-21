-- Desabilitar RLS temporariamente para fazer as alterações
alter table public.alunos disable row level security;
alter table public.instrutores disable row level security;
alter table public.academias disable row level security;

-- Remover índices relacionados a tokens (apenas se existirem)
drop index if exists public.alunos_instrutor_token_idx;
drop index if exists public.instrutores_academia_token_idx;

-- Remover TODAS as políticas existentes
drop policy if exists "Instrutores podem ver dados dos seus alunos" on public.alunos;
drop policy if exists "Alunos podem ver seus próprios dados" on public.alunos;
drop policy if exists "Alunos podem inserir seus próprios dados" on public.alunos;
drop policy if exists "Alunos podem atualizar seus próprios dados" on public.alunos;

drop policy if exists "Academias podem ver dados dos seus instrutores" on public.instrutores;
drop policy if exists "Instrutores podem ver seus próprios dados" on public.instrutores;
drop policy if exists "Instrutores podem inserir seus próprios dados" on public.instrutores;
drop policy if exists "Instrutores podem atualizar seus próprios dados" on public.instrutores;
drop policy if exists "Permitir inserção de instrutores" on public.instrutores;

-- Adicionar coluna academia_email na tabela instrutores
alter table public.instrutores 
    drop column if exists academia_token,
    add column if not exists academia_email varchar(255) references public.academias(email),
    add column if not exists status varchar(20) check (status in ('pendente', 'ativo', 'inativo')) not null default 'pendente';

-- Adicionar coluna instrutor_email na tabela alunos
alter table public.alunos
    drop column if exists instrutor_token,
    add column if not exists instrutor_email varchar(255) references public.instrutores(email);

-- Criar novos índices
create index if not exists instrutores_academia_email_idx on public.instrutores(academia_email);
create index if not exists alunos_instrutor_email_idx on public.alunos(instrutor_email);

-- Criar novas políticas de segurança para alunos
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
    using (auth.jwt() ->> 'email' = instrutor_email);

-- Criar novas políticas de segurança para instrutores
create policy "Instrutores podem ver seus próprios dados"
    on public.instrutores for select
    using (auth.uid() = user_id);

create policy "Permitir inserção de instrutores"
    on public.instrutores for insert
    with check (true);

create policy "Instrutores podem atualizar seus próprios dados"
    on public.instrutores for update
    using (auth.uid() = user_id);

create policy "Academias podem ver dados dos seus instrutores"
    on public.instrutores for select
    using (auth.jwt() ->> 'email' = academia_email);

-- Habilitar RLS novamente
alter table public.alunos enable row level security;
alter table public.instrutores enable row level security;
alter table public.academias enable row level security;

-- Adicionar comentários nas tabelas para documentação
comment on column public.instrutores.academia_email is 'Email da academia que convidou o instrutor';
comment on column public.instrutores.status is 'Status do instrutor: pendente, ativo ou inativo';
comment on column public.alunos.instrutor_email is 'Email do instrutor responsável pelo aluno'; 