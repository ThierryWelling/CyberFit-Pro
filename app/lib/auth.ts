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
    console.log('=== INÍCIO DO CADASTRO ===');
    console.log('Dados recebidos:', {
      email: data.email,
      fullName: data.fullName,
      profileType: data.profileType,
      cnpj: data.cnpj,
      telefone: data.telefone,
      address: data.address
    });

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

    if (authError) {
      console.error('Erro na autenticação:', authError);
      throw authError;
    }

    console.log('=== USUÁRIO CRIADO ===');
    console.log('Dados do usuário:', {
      id: authData.user?.id,
      email: authData.user?.email,
      role: authData.user?.role
    });

    if (!authData.user?.id) {
      console.error('ID do usuário não encontrado');
      throw new Error('ID do usuário não encontrado');
    }

    // 2. Preparar dados para inserção
    const profileSpecificData = getProfileSpecificData(data);
    console.log('=== DADOS ESPECÍFICOS DO PERFIL ===', profileSpecificData);

    const profileData = {
      user_id: authData.user.id,
      full_name: data.fullName,
      email: data.email,
      telefone: data.telefone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...profileSpecificData
    };

    const targetTable = getProfileTable(data.profileType);
    
    console.log('=== TENTANDO INSERIR NA TABELA ===');
    console.log('Tabela:', targetTable);
    console.log('Dados completos:', profileData);

    // 3. Inserir no banco de dados
    const { data: insertedData, error: profileError } = await supabase
      .from(targetTable)
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      console.error('=== ERRO AO INSERIR PERFIL ===');
      console.error('Detalhes do erro:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      });
      throw profileError;
    }

    console.log('=== PERFIL INSERIDO COM SUCESSO ===');
    console.log('Dados inseridos:', insertedData);

    return { 
      success: true, 
      data: authData,
      message: 'Cadastro realizado com sucesso! Por favor, verifique seu email para confirmar sua conta.'
    };
  } catch (error) {
    console.error('=== ERRO NO CADASTRO ===');
    console.error('Erro completo:', error);
    return { success: false, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Erro no login:', error);
      
      // Verificar tipo específico de erro
      if (error.message === 'Email not confirmed') {
        return { 
          success: false, 
          error: {
            message: 'Email not confirmed',
            details: 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.'
          }
        };
      }
      
      throw error;
    }

    // Determinar a rota correta baseada no tipo de perfil
    const profileType = data.user?.user_metadata?.profile_type;
    let redirectTo = '/';

    switch (profileType) {
      case 'aluno':
        redirectTo = '/aluno';
        break;
      case 'instrutor':
        redirectTo = '/instrutor';
        break;
      case 'academia':
        redirectTo = '/academia';
        break;
    }

    return { success: true, data, redirectTo };
  } catch (error) {
    console.error('Erro no login:', error);
    return { 
      success: false, 
      error: {
        message: error instanceof Error ? error.message : 'Erro ao fazer login',
        details: 'Verifique suas credenciais e tente novamente.'
      }
    };
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
  console.log('=== GERANDO DADOS ESPECÍFICOS ===');
  console.log('Tipo de perfil:', data.profileType);
  
  let specificData;
  switch (data.profileType) {
    case 'aluno':
      specificData = {
        cpf: data.cpf,
        birth_date: data.birthDate,
        instrutor_token: data.token,
      };
      break;
    case 'instrutor':
      specificData = {
        cpf: data.cpf,
        cref: data.cref,
        academia_token: data.token,
      };
      break;
    case 'academia':
      specificData = {
        cnpj: data.cnpj,
        address: data.address,
      };
      break;
  }
  
  console.log('Dados específicos gerados:', specificData);
  return specificData;
} 