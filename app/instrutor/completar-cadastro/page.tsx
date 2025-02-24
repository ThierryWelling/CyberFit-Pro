'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Warning, ChalkboardTeacher } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  cref?: string;
  submit?: string;
}

export default function CompletarCadastro() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    cref: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Verificar erros no hash
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const error = hashParams.get('error');
        const errorCode = hashParams.get('error_code');
        
        console.log('Hash params:', { error, errorCode });

        if (error === 'access_denied' && errorCode === 'otp_expired') {
          setTokenExpired(true);
          return;
        }

        // Verificar se já tem uma sessão
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Sessão atual:', session);

        if (!session) {
          // Verificar token na URL
          const params = new URLSearchParams(window.location.search);
          const token = params.get('token');
          const type = params.get('type');
          
          console.log('Parâmetros URL:', { token, type });
          
          if (!token) {
            throw new Error('Token não encontrado');
          }

          // Tentar verificar o token
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any || 'recovery'
          });

          if (verifyError) {
            console.error('Erro ao verificar token:', verifyError);
            throw verifyError;
          }

          // Verificar novamente se a sessão foi estabelecida
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (!newSession) {
            throw new Error('Não foi possível estabelecer uma sessão');
          }
        }
      } catch (error) {
        console.error('Erro no processo de autenticação:', error);
        setTokenExpired(true);
      }
    };

    setupAuth();
  }, [router]);

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres';
    }
    if (!/[A-Z]/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula';
    }
    if (!/[a-z]/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula';
    }
    if (!/[0-9]/.test(password)) {
      return 'A senha deve conter pelo menos um número';
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erros ao digitar
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    try {
      // Verificar se já tem uma sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      // Verificar se é uma senha temporária
      const isTempPass = session.user.user_metadata.temp_pass;
      
      // Validar senha
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        setFormErrors(prev => ({ ...prev, password: passwordError }));
        setLoading(false);
        return;
      }

      // Validar confirmação de senha
      if (formData.password !== formData.confirmPassword) {
        setFormErrors(prev => ({ ...prev, confirmPassword: 'As senhas não coincidem' }));
        setLoading(false);
        return;
      }

      // Validar CREF
      if (!formData.cref.trim()) {
        setFormErrors(prev => ({ ...prev, cref: 'CREF é obrigatório' }));
        setLoading(false);
        return;
      }

      // Atualizar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
        data: {
          temp_pass: false // Remover flag de senha temporária
        }
      });

      if (updateError) {
        if (updateError.message.includes('different from the old password')) {
          setFormErrors(prev => ({ 
            ...prev, 
            password: 'A nova senha deve ser diferente da senha temporária' 
          }));
          return;
        }
        throw updateError;
      }

      // Obter o ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      // Atualizar o CREF do instrutor
      const { error: updateProfileError } = await supabase
        .from('instrutores')
        .update({ 
          cref: formData.cref.toUpperCase(),
          status: 'ativo'
        })
        .eq('user_id', user.id);

      if (updateProfileError) throw updateProfileError;

      // Redirecionar para o dashboard do instrutor
      router.push('/instrutor/dashboard');
    } catch (error: any) {
      console.error('Erro ao completar cadastro:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: error.message || 'Erro ao completar cadastro. Tente novamente.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('instructor_email');
      
      if (!email) {
        router.push('/');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/instrutor/completar-cadastro`
      });

      if (error) throw error;

      setFormErrors(prev => ({
        ...prev,
        submit: 'Um novo link foi enviado para seu email!'
      }));

      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error: any) {
      setFormErrors(prev => ({
        ...prev,
        submit: 'Erro ao enviar novo link. Tente novamente.'
      }));
    } finally {
      setLoading(false);
    }
  };

  if (tokenExpired) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Layers */}
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="fixed inset-0 bg-background [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#7C3AFF_100%)]" style={{ opacity: 0.6 }} />
        
        <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-background-card/80 backdrop-blur-xl rounded-3xl shadow-card p-8 border border-white/5"
          >
            <h2 className="text-2xl font-semibold text-white text-center mb-4">
              Link Expirado
            </h2>
            <p className="text-purple-light/70 text-center mb-8">
              O link de confirmação expirou ou é inválido. Clique abaixo para receber um novo link.
            </p>

            {formErrors.submit && (
              <div className={cn(
                "flex items-center gap-2 text-sm p-3 rounded-lg border mb-4",
                formErrors.submit.includes('enviado')
                  ? "bg-green-500/10 border-green-500/20 text-green-500"
                  : "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                <Warning size={20} />
                <span>{formErrors.submit}</span>
              </div>
            )}

            <div className="space-y-4">
              <motion.button
                onClick={handleResendLink}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={cn(
                  "w-full bg-accent-blue text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-accent-blue/20 relative overflow-hidden group",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                <span className="relative z-10">
                  {loading ? 'Enviando...' : 'Solicitar Novo Link'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>

              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 text-purple-light hover:text-purple transition-colors text-sm"
              >
                Voltar para o Login
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Layers */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="fixed inset-0 bg-background [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#7C3AFF_100%)]" style={{ opacity: 0.6 }} />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-purple-500/30 to-accent-blue/30 rounded-full blur-3xl animate-orbit-1" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-l from-purple-500/30 to-accent-blue/30 rounded-full blur-3xl animate-orbit-2" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] [mask-image:radial-gradient(white,transparent_90%)] opacity-20" />
      </div>

      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background-card/80 backdrop-blur-xl rounded-3xl shadow-card p-8 border border-white/5 relative overflow-hidden"
          >
            {/* Card Background Effect */}
            <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-10" />
            
            <h2 className="text-white text-2xl mb-2 text-center relative">
              Complete seu Cadastro
            </h2>
            <p className="text-purple-light/70 text-sm mb-8 text-center">
              Defina sua senha e informe seu CREF para começar
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
                <input
                  type="password"
                  name="password"
                  placeholder="Nova Senha"
                  required
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-background/50 text-white placeholder-purple-light/50 border rounded-xl px-10 py-3 focus:outline-none transition-colors",
                    formErrors.password 
                      ? "border-red-500/50 focus:border-red-500/70"
                      : "border-purple-light/10 focus:border-purple-light/30"
                  )}
                />
                {formErrors.password && (
                  <span className="text-xs text-red-500 mt-1 ml-2">{formErrors.password}</span>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar Nova Senha"
                  required
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-background/50 text-white placeholder-purple-light/50 border rounded-xl px-10 py-3 focus:outline-none transition-colors",
                    formErrors.confirmPassword 
                      ? "border-red-500/50 focus:border-red-500/70"
                      : "border-purple-light/10 focus:border-purple-light/30"
                  )}
                />
                {formErrors.confirmPassword && (
                  <span className="text-xs text-red-500 mt-1 ml-2">{formErrors.confirmPassword}</span>
                )}
              </div>

              <div className="relative">
                <ChalkboardTeacher className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
                <input
                  type="text"
                  name="cref"
                  placeholder="CREF"
                  required
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-background/50 text-white placeholder-purple-light/50 border rounded-xl px-10 py-3 focus:outline-none transition-colors",
                    formErrors.cref 
                      ? "border-red-500/50 focus:border-red-500/70"
                      : "border-purple-light/10 focus:border-purple-light/30"
                  )}
                />
                {formErrors.cref && (
                  <span className="text-xs text-red-500 mt-1 ml-2">{formErrors.cref}</span>
                )}
              </div>

              <div className="space-y-3">
                {formErrors.submit && (
                  <div className="flex items-center gap-2 text-sm p-3 rounded-lg border bg-red-500/10 border-red-500/20 text-red-500">
                    <Warning size={20} />
                    <span>{formErrors.submit}</span>
                  </div>
                )}
                
                <motion.button 
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={cn(
                    "w-full bg-accent-blue text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-accent-blue/20 relative overflow-hidden group",
                    loading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  <span className="relative z-10">
                    {loading ? 'Processando...' : 'Completar Cadastro'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 