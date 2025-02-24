import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Stats {
  totalAlunos: number;
  treinosAtivos: number;
  avaliacoesPendentes: number;
  academia?: string;
}

export function useUserData(profileType: 'instrutor' | 'aluno') {
  const [stats, setStats] = useState<Stats>({
    totalAlunos: 0,
    treinosAtivos: 0,
    avaliacoesPendentes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClientComponentClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // Verificar sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          router.push('/');
          return;
        }

        // Buscar dados do instrutor
        const { data: instrutorData, error: instrutorError } = await supabase
          .from('instrutores')
          .select(`
            id,
            academia_email,
            alunos (
              id
            ),
            treinos (
              id,
              status
            ),
            avaliacoes (
              id,
              status
            )
          `)
          .eq('user_id', session.user.id)
          .single();

        if (instrutorError) throw instrutorError;

        // Buscar nome da academia
        let academiaNome = 'Não vinculado';
        if (instrutorData?.academia_email) {
          const { data: academiaData, error: academiaError } = await supabase
            .from('academias')
            .select('full_name')
            .eq('email', instrutorData.academia_email)
            .single();

          if (!academiaError && academiaData) {
            academiaNome = academiaData.full_name;
          }
        }

        // Calcular estatísticas
        const totalAlunos = instrutorData.alunos?.length || 0;
        const treinosAtivos = instrutorData.treinos?.filter(t => t.status === 'ativo').length || 0;
        const avaliacoesPendentes = instrutorData.avaliacoes?.filter(a => a.status === 'pendente').length || 0;

        if (isMounted) {
          setStats({
            totalAlunos,
            treinosAtivos,
            avaliacoesPendentes,
            academia: academiaNome
          });
        }
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err);
        if (isMounted) {
          if (err.message === 'Auth session missing!') {
            router.push('/');
          } else {
            setError(err.message);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return { stats, loading, error };
} 