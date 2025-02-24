'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Warning } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  submit?: string;
}

export default function ResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Extrair o token de acesso da URL
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const token = params.get('access_token');
      setAccessToken(token);
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

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

    try {
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      // Atualizar a senha usando o token de acesso
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) throw error;

      // Redirecionar para a página de login com mensagem de sucesso
      router.push('/?message=password-updated');
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: 'Erro ao redefinir senha. Tente novamente.'
      }));
    } finally {
      setLoading(false);
    }
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

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Link Inválido</h1>
          <p className="text-purple-light/70 mb-6">O link de redefinição de senha é inválido ou expirou.</p>
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-purple text-white rounded-xl font-medium hover:bg-purple/90 transition-colors"
          >
            Voltar para o Login
          </motion.button>
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
            {/* Removendo o efeito de gradiente */}
            <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-10" />

            <h2 className="text-white text-2xl mb-8 text-center relative">
              Redefinir Senha
            </h2>

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
                    {loading ? 'Redefinindo...' : 'Redefinir Senha'}
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