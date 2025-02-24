-- Verificar se as tabelas existem antes de tentar remover suas dependências
DO $$ 
BEGIN
    -- Remover políticas de segurança apenas se as tabelas existirem
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'alunos') THEN
        DROP POLICY IF EXISTS "Alunos podem ver seus próprios dados" ON public.alunos;
        DROP POLICY IF EXISTS "Alunos podem inserir seus próprios dados" ON public.alunos;
        DROP POLICY IF EXISTS "Alunos podem atualizar seus próprios dados" ON public.alunos;
        DROP POLICY IF EXISTS "Instrutores podem ver dados dos seus alunos" ON public.alunos;
        DROP POLICY IF EXISTS "Instrutores podem ver seus alunos" ON public.alunos;
        DROP POLICY IF EXISTS "Instrutores podem adicionar alunos" ON public.alunos;
        DROP POLICY IF EXISTS "Instrutores podem atualizar seus alunos" ON public.alunos;
        
        DROP TRIGGER IF EXISTS handle_alunos_updated_at ON public.alunos;
        DROP INDEX IF EXISTS alunos_instrutor_id_idx;
        DROP INDEX IF EXISTS alunos_email_idx;
        DROP INDEX IF EXISTS alunos_cpf_idx;
        DROP INDEX IF EXISTS alunos_status_idx;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'instrutores') THEN
        DROP POLICY IF EXISTS "Instrutores podem ver seus próprios dados" ON public.instrutores;
        DROP POLICY IF EXISTS "Instrutores podem inserir seus próprios dados" ON public.instrutores;
        DROP POLICY IF EXISTS "Instrutores podem atualizar seus próprios dados" ON public.instrutores;
        DROP POLICY IF EXISTS "Academias podem ver dados dos seus instrutores" ON public.instrutores;
        DROP POLICY IF EXISTS "Instrutores podem atualizar seus dados" ON public.instrutores;
        
        DROP TRIGGER IF EXISTS handle_instrutores_updated_at ON public.instrutores;
        DROP INDEX IF EXISTS instrutores_user_id_idx;
        DROP INDEX IF EXISTS instrutores_email_idx;
        DROP INDEX IF EXISTS instrutores_cpf_idx;
        DROP INDEX IF EXISTS instrutores_cref_idx;
        DROP INDEX IF EXISTS instrutores_academia_email_idx;
        DROP INDEX IF EXISTS instrutores_status_idx;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'academias') THEN
        DROP POLICY IF EXISTS "Permitir inserção sem restrições" ON public.academias;
        DROP POLICY IF EXISTS "Permitir visualização sem restrições" ON public.academias;
        DROP POLICY IF EXISTS "Permitir atualização pelo próprio usuário" ON public.academias;
        DROP POLICY IF EXISTS "Academias podem atualizar seus dados" ON public.academias;
        
        DROP TRIGGER IF EXISTS handle_academias_updated_at ON public.academias;
        DROP INDEX IF EXISTS academias_user_id_idx;
        DROP INDEX IF EXISTS academias_email_idx;
        DROP INDEX IF EXISTS academias_cnpj_idx;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'treinos') THEN
        DROP POLICY IF EXISTS "Instrutores podem ver treinos de seus alunos" ON public.treinos;
        DROP POLICY IF EXISTS "Instrutores podem gerenciar treinos" ON public.treinos;
        
        DROP TRIGGER IF EXISTS handle_treinos_updated_at ON public.treinos;
        DROP INDEX IF EXISTS treinos_aluno_id_idx;
        DROP INDEX IF EXISTS treinos_instrutor_id_idx;
        DROP INDEX IF EXISTS treinos_data_treino_idx;
        DROP INDEX IF EXISTS treinos_status_idx;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'avaliacoes') THEN
        DROP POLICY IF EXISTS "Instrutores podem ver avaliações de seus alunos" ON public.avaliacoes;
        DROP POLICY IF EXISTS "Instrutores podem gerenciar avaliações" ON public.avaliacoes;
        
        DROP TRIGGER IF EXISTS handle_avaliacoes_updated_at ON public.avaliacoes;
        DROP INDEX IF EXISTS avaliacoes_aluno_id_idx;
        DROP INDEX IF EXISTS avaliacoes_instrutor_id_idx;
        DROP INDEX IF EXISTS avaliacoes_data_avaliacao_idx;
        DROP INDEX IF EXISTS avaliacoes_status_idx;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'planos_treino') THEN
        DROP TRIGGER IF EXISTS handle_planos_treino_updated_at ON public.planos_treino;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'plano_treino_exercicios') THEN
        DROP TRIGGER IF EXISTS handle_plano_treino_exercicios_updated_at ON public.plano_treino_exercicios;
    END IF;
END $$;

-- Remover tabelas (em ordem para respeitar as dependências)
DROP TABLE IF EXISTS public.plano_treino_exercicios CASCADE;
DROP TABLE IF EXISTS public.planos_treino CASCADE;
DROP TABLE IF EXISTS public.avaliacoes CASCADE;
DROP TABLE IF EXISTS public.treinos CASCADE;
DROP TABLE IF EXISTS public.alunos CASCADE;
DROP TABLE IF EXISTS public.instrutores CASCADE;
DROP TABLE IF EXISTS public.academias CASCADE;

-- Remover função com CASCADE para remover todas as dependências
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Remover extensão UUID se não for mais necessária
-- DROP EXTENSION IF EXISTS "uuid-ossp"; 