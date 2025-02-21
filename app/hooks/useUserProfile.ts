import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  profile_type: 'aluno' | 'instrutor' | 'academia';
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const userId = session.user.id;
        const userType = session.user.user_metadata.profile_type;
        let tableName = '';

        // Determinar a tabela correta baseada no tipo de perfil
        switch (userType) {
          case 'aluno':
            tableName = 'alunos';
            break;
          case 'instrutor':
            tableName = 'instrutores';
            break;
          case 'academia':
            tableName = 'academias';
            break;
          default:
            throw new Error('Tipo de perfil inválido');
        }

        // Buscar dados do perfil
        const { data: profileData, error: profileError } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError) throw profileError;

        setProfile({
          id: profileData.id,
          full_name: profileData.full_name,
          email: session.user.email!,
          profile_type: userType
        });

      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
} 