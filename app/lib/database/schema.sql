-- Schema do banco de dados CyberFit Pro
-- Versão: 1.0.0
-- Data: 2024-02-20

-- Habilitar a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função para inserir academia de forma segura
CREATE OR REPLACE FUNCTION public.insert_academia(
    _user_id uuid,
    _full_name varchar,
    _email varchar,
    _cnpj varchar,
    _telefone varchar,
    _address text
) RETURNS uuid AS $$
DECLARE
    _id uuid;
BEGIN
    INSERT INTO public.academias (
        id,
        user_id,
        full_name,
        email,
        cnpj,
        telefone,
        address,
        created_at,
        updated_at
    ) VALUES (
        uuid_generate_v4(),
        _user_id,
        _full_name,
        _email,
        _cnpj,
        _telefone,
        _address,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ) RETURNING id INTO _id;

    RETURN _id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para inserir instrutor de forma segura
CREATE OR REPLACE FUNCTION public.insert_instrutor(
    _user_id uuid,
    _full_name varchar,
    _email varchar,
    _cpf varchar,
    _telefone varchar,
    _cref varchar,
    _academia_email varchar
) RETURNS uuid AS $$
DECLARE
    _id uuid;
BEGIN
    INSERT INTO public.instrutores (
        id,
        user_id,
        full_name,
        email,
        cpf,
        telefone,
        cref,
        academia_email,
        status,
        created_at,
        updated_at
    ) VALUES (
        uuid_generate_v4(),
        _user_id,
        _full_name,
        _email,
        _cpf,
        _telefone,
        _cref,
        _academia_email,
        'pendente',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ) RETURNING id INTO _id;

    RETURN _id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para inserir aluno de forma segura
CREATE OR REPLACE FUNCTION public.insert_aluno(
    _full_name varchar,
    _email varchar,
    _cpf varchar,
    _telefone varchar,
    _birth_date date,
    _instrutor_id uuid
) RETURNS uuid AS $$
DECLARE
    _id uuid;
BEGIN
    INSERT INTO public.alunos (
        id,
        full_name,
        email,
        cpf,
        telefone,
        birth_date,
        instrutor_id,
        status,
        created_at,
        updated_at
    ) VALUES (
        uuid_generate_v4(),
        _full_name,
        _email,
        _cpf,
        _telefone,
        _birth_date,
        _instrutor_id,
        'ativo',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    ) RETURNING id INTO _id;

    RETURN _id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabela de Academias
CREATE TABLE public.academias (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    full_name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    cnpj varchar(18) NOT NULL UNIQUE,
    telefone varchar(20) NOT NULL,
    address text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Instrutores
CREATE TABLE public.instrutores (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    full_name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    cpf varchar(14) NOT NULL UNIQUE,
    telefone varchar(20) NOT NULL,
    cref varchar(50) NOT NULL UNIQUE,
    academia_email varchar(255) REFERENCES academias(email),
    status varchar(20) CHECK (status IN ('pendente', 'ativo', 'inativo')) NOT NULL DEFAULT 'pendente',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Alunos
CREATE TABLE public.alunos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    cpf varchar(14) NOT NULL UNIQUE,
    telefone varchar(20) NOT NULL,
    birth_date date NOT NULL,
    instrutor_id uuid REFERENCES instrutores(id),
    status varchar(20) CHECK (status IN ('ativo', 'inativo')) NOT NULL DEFAULT 'ativo',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Treinos
CREATE TABLE public.treinos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id uuid REFERENCES alunos(id) NOT NULL,
    instrutor_id uuid REFERENCES instrutores(id) NOT NULL,
    data_treino timestamp with time zone NOT NULL,
    status varchar(20) CHECK (status IN ('agendado', 'concluido', 'cancelado')) NOT NULL DEFAULT 'agendado',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Avaliações
CREATE TABLE public.avaliacoes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id uuid REFERENCES alunos(id) NOT NULL,
    instrutor_id uuid REFERENCES instrutores(id) NOT NULL,
    data_avaliacao timestamp with time zone NOT NULL,
    status varchar(20) CHECK (status IN ('agendada', 'concluida', 'cancelada')) NOT NULL DEFAULT 'agendada',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER handle_alunos_updated_at
    BEFORE UPDATE ON public.alunos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_instrutores_updated_at
    BEFORE UPDATE ON public.instrutores
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_academias_updated_at
    BEFORE UPDATE ON public.academias
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_treinos_updated_at
    BEFORE UPDATE ON public.treinos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_avaliacoes_updated_at
    BEFORE UPDATE ON public.avaliacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instrutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para Alunos
CREATE POLICY "Alunos podem ver seus próprios dados"
    ON public.alunos FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM instrutores WHERE id = instrutor_id
    ));

CREATE POLICY "Instrutores podem ver seus alunos"
    ON public.alunos FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM instrutores WHERE id = instrutor_id
    ));

CREATE POLICY "Instrutores podem adicionar alunos"
    ON public.alunos FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM instrutores WHERE id = instrutor_id
    ));

CREATE POLICY "Instrutores podem atualizar seus alunos"
    ON public.alunos FOR UPDATE
    USING (auth.uid() IN (
        SELECT user_id FROM instrutores WHERE id = instrutor_id
    ));

-- Políticas para Instrutores
CREATE POLICY "Instrutores podem ver seus próprios dados"
    ON public.instrutores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Academias podem ver seus instrutores"
    ON public.instrutores FOR SELECT
    USING (auth.jwt() ->> 'email' = academia_email);

CREATE POLICY "Instrutores podem atualizar seus dados"
    ON public.instrutores FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Permitir inserção de instrutores"
    ON public.instrutores FOR INSERT
    WITH CHECK (
        -- Permitir que academias insiram instrutores
        (auth.jwt() ->> 'email' = academia_email AND 
         auth.jwt() ->> 'profile_type' = 'academia') OR
        -- Permitir que o próprio instrutor se cadastre
        (auth.uid() = user_id)
    );

-- Políticas para Academias
CREATE POLICY "Academias podem ver seus próprios dados"
    ON public.academias FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Academias podem atualizar seus dados"
    ON public.academias FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para Treinos
CREATE POLICY "Instrutores podem ver treinos de seus alunos"
    ON public.treinos FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM instrutores WHERE id = instrutor_id
    ));

CREATE POLICY "Instrutores podem gerenciar treinos"
    ON public.treinos FOR ALL
    USING (auth.uid() IN (
        SELECT user_id FROM instrutores WHERE id = instrutor_id
    ));

-- Políticas para Avaliações
CREATE POLICY "Instrutores podem ver avaliações de seus alunos"
    ON public.avaliacoes FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM instrutores WHERE id = instrutor_id
    ));

CREATE POLICY "Instrutores podem gerenciar avaliações"
    ON public.avaliacoes FOR ALL
    USING (auth.uid() IN (
        SELECT user_id FROM instrutores WHERE id = instrutor_id
    ));

-- Índices para melhor performance
CREATE INDEX alunos_instrutor_id_idx ON public.alunos(instrutor_id);
CREATE INDEX alunos_email_idx ON public.alunos(email);
CREATE INDEX alunos_cpf_idx ON public.alunos(cpf);
CREATE INDEX alunos_status_idx ON public.alunos(status);

CREATE INDEX instrutores_user_id_idx ON public.instrutores(user_id);
CREATE INDEX instrutores_email_idx ON public.instrutores(email);
CREATE INDEX instrutores_cpf_idx ON public.instrutores(cpf);
CREATE INDEX instrutores_cref_idx ON public.instrutores(cref);
CREATE INDEX instrutores_academia_email_idx ON public.instrutores(academia_email);
CREATE INDEX instrutores_status_idx ON public.instrutores(status);

CREATE INDEX academias_user_id_idx ON public.academias(user_id);
CREATE INDEX academias_email_idx ON public.academias(email);
CREATE INDEX academias_cnpj_idx ON public.academias(cnpj);

CREATE INDEX treinos_aluno_id_idx ON public.treinos(aluno_id);
CREATE INDEX treinos_instrutor_id_idx ON public.treinos(instrutor_id);
CREATE INDEX treinos_data_treino_idx ON public.treinos(data_treino);
CREATE INDEX treinos_status_idx ON public.treinos(status);

CREATE INDEX avaliacoes_aluno_id_idx ON public.avaliacoes(aluno_id);
CREATE INDEX avaliacoes_instrutor_id_idx ON public.avaliacoes(instrutor_id);
CREATE INDEX avaliacoes_data_avaliacao_idx ON public.avaliacoes(data_avaliacao);
CREATE INDEX avaliacoes_status_idx ON public.avaliacoes(status);

-- Garantir que a função insert_academia tenha as permissões necessárias
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON public.academias TO postgres;
GRANT EXECUTE ON FUNCTION public.insert_academia TO postgres;

-- Garantir que a função insert_instrutor tenha as permissões necessárias
GRANT EXECUTE ON FUNCTION public.insert_instrutor TO postgres;

-- Garantir que a função insert_aluno tenha as permissões necessárias
GRANT EXECUTE ON FUNCTION public.insert_aluno TO postgres; 