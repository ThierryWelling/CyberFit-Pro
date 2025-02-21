import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserStats {
  totalAlunos?: number;
  treinosAtivos?: number;
  avaliacoesPendentes?: number;
  instrutores?: number;
  receitaMensal?: number;
  taxaRetencao?: number;
}

interface Atividade {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  status: string;
}

interface Aluno {
  id: string;
  full_name: string;
  ultimo_treino: string;
}

export interface Instrutor {
  id: string;
  full_name: string;
  email: string;
  cref: string;
  alunos_ativos: number;
  status: 'ativo' | 'inativo';
}

export function useUserData(userType: 'aluno' | 'instrutor' | 'academia') {
  const [stats, setStats] = useState<UserStats>({});
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;

        switch (userType) {
          case 'aluno':
            // Buscar estatísticas do aluno
            const { data: alunoStats } = await supabase
              .from('treinos')
              .select('*')
              .eq('aluno_id', userId);

            const { data: alunoAtividades } = await supabase
              .from('atividades')
              .select('*')
              .eq('aluno_id', userId)
              .order('data', { ascending: false })
              .limit(5);

            setStats({
              treinosAtivos: alunoStats?.filter(t => t.status === 'ativo').length || 0,
            });
            setAtividades(alunoAtividades || []);
            break;

          case 'instrutor':
            // Buscar estatísticas do instrutor
            const { data: instrutorStats } = await supabase
              .from('instrutores')
              .select('*, alunos(*)')
              .eq('user_id', userId)
              .single();

            const { data: instrutorAlunos } = await supabase
              .from('alunos')
              .select('*')
              .eq('instrutor_id', instrutorStats?.id)
              .order('created_at', { ascending: false });

            setStats({
              totalAlunos: instrutorStats?.alunos?.length || 0,
              treinosAtivos: instrutorStats?.treinos_ativos || 0,
              avaliacoesPendentes: instrutorStats?.avaliacoes_pendentes || 0,
            });
            setAlunos(instrutorAlunos || []);
            break;

          case 'academia':
            // Buscar estatísticas da academia
            const { data: academiaStats } = await supabase
              .from('academias')
              .select('*, instrutores(*), alunos(*)')
              .eq('user_id', userId)
              .single();

            const { data: academiaInstrutores } = await supabase
              .from('instrutores')
              .select('*')
              .eq('academia_id', academiaStats?.id)
              .order('created_at', { ascending: false });

            setStats({
              totalAlunos: academiaStats?.alunos?.length || 0,
              instrutores: academiaStats?.instrutores?.length || 0,
              receitaMensal: academiaStats?.receita_mensal || 0,
              taxaRetencao: academiaStats?.taxa_retencao || 0,
            });
            setInstrutores(academiaInstrutores || []);
            break;
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados');
        setLoading(false);
      }
    };

    fetchData();
  }, [userType]);

  return { stats, atividades, alunos, instrutores, loading, error };
} 