import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface UserStats {
  academia?: {
    nome: string;
  };
}

interface UserProfile {
  profile_type: 'aluno' | 'instrutor' | 'academia';
  full_name: string;
  stats?: UserStats;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
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

        // Buscar dados do usuário
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const profileType = userData.user.user_metadata.profile_type;
        let fullName = userData.user.user_metadata.full_name;
        let stats: UserStats | undefined;

        // Se for instrutor, buscar dados da academia
        if (profileType === 'instrutor') {
          const { data: instrutorData, error: instrutorError } = await supabase
            .from('instrutores')
            .select('full_name, academia_email')
            .eq('user_id', userData.user.id)
            .single();

          if (instrutorError) {
            console.error('Erro ao buscar instrutor:', instrutorError);
            throw instrutorError;
          }

          // Usar o nome do instrutor da tabela instrutores
          if (instrutorData) {
            fullName = instrutorData.full_name;

            if (instrutorData.academia_email) {
              const { data: academiaData, error: academiaError } = await supabase
                .from('academias')
                .select('full_name')
                .eq('email', instrutorData.academia_email)
                .single();

              if (!academiaError && academiaData) {
                stats = {
                  academia: {
                    nome: academiaData.full_name
                  }
                };
              }
            }
          }
        }

        if (isMounted) {
          setProfile({
            profile_type: profileType,
            full_name: fullName,
            stats
          });
        }
      } catch (err: any) {
        console.error('Erro ao buscar perfil:', err);
        if (isMounted) {
          if (err.message === 'Auth session missing!') {
            router.push('/');
          } else {
            setError('Erro ao carregar perfil');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return { profile, loading, error };
} 