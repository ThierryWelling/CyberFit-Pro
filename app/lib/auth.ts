import { supabase } from './supabase';

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  cpf?: string;
  cnpj?: string;
  telefone: string;
  birthDate?: string;
  cref?: string;
  academyName?: string;
  address?: string;
  token?: string;
  profileType: 'aluno' | 'instrutor' | 'academia';
}

export async function signUp(data: RegisterData) {
  try {
    console.log('Iniciando cadastro com dados:', data);

    // 1. Criar usuário na autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          profile_type: data.profileType
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (authError) throw authError;

    console.log('Usuário criado:', authData);

    if (!authData.session) {
      return { 
        success: true, 
        data: authData,
        message: 'Por favor, verifique seu email para confirmar o cadastro.'
      };
    }

    // 2. Fazer login imediatamente após o registro
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (signInError) {
      console.error('Erro ao fazer login após registro:', signInError);
      throw signInError;
    }

    console.log('Login realizado após registro');

    // 3. Inserir dados específicos do perfil na tabela correspondente
    const profileData = {
      user_id: authData.user?.id,
      email: data.email,
      telefone: data.telefone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...getProfileSpecificData(data)
    };

    console.log('Dados do perfil a serem inseridos:', profileData);
    console.log('Tabela de destino:', getProfileTable(data.profileType));

    const { error: profileError } = await supabase
      .from(getProfileTable(data.profileType))
      .insert([profileData]);

    if (profileError) {
      console.error('Erro ao inserir perfil:', profileError);
      throw profileError;
    }

    console.log('Perfil inserido com sucesso');

    return { 
      success: true, 
      data: authData,
      message: 'Cadastro realizado com sucesso! Redirecionando...'
    };
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return { success: false, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao sair:', error);
    return { success: false, error };
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return { success: false, error };
  }
}

export async function validateToken(token: string, profileType: 'aluno' | 'instrutor') {
  try {
    let query;
    
    if (profileType === 'aluno') {
      // Verificar token do instrutor
      query = supabase
        .from('tokens')
        .select('*')
        .eq('token', token)
        .eq('type', 'instrutor_token')
        .single();
    } else {
      // Verificar token da academia
      query = supabase
        .from('tokens')
        .select('*')
        .eq('token', token)
        .eq('type', 'academia_token')
        .single();
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return { success: false, error };
  }
}

function getProfileTable(profileType: 'aluno' | 'instrutor' | 'academia'): string {
  switch (profileType) {
    case 'aluno':
      return 'alunos';
    case 'instrutor':
      return 'instrutores';
    case 'academia':
      return 'academias';
  }
}

function getProfileSpecificData(data: RegisterData) {
  switch (data.profileType) {
    case 'aluno':
      return {
        cpf: data.cpf,
        birth_date: data.birthDate,
        instrutor_token: data.token,
        full_name: data.fullName
      };
    case 'instrutor':
      return {
        cpf: data.cpf,
        cref: data.cref,
        academia_token: data.token,
        full_name: data.fullName
      };
    case 'academia':
      return {
        cnpj: data.cnpj,
        address: data.address,
        full_name: data.academyName
      };
  }
} 