'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Warning, Lock } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';

export default function CompletarCadastroPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar se há um token de redefinição de senha na URL
    if (!searchParams?.has('token')) {
      router.push('/login');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar senhas
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      // Atualizar a senha do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Atualizar o status do instrutor para 'ativo'
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      const { error: statusError } = await supabase
        .from('instrutores')
        .update({ status: 'ativo' })
        .eq('user_id', user.id);

      if (statusError) throw statusError;

      // Redirecionar para a página do instrutor
      router.push('/instrutor');

    } catch (err) {
      console.error('Erro ao completar cadastro:', err);
      setError('Erro ao completar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-background-card/95 backdrop-blur-xl rounded-2xl border border-white/5 p-8"
      >
        <h1 className="text-2xl font-bold text-white mb-2">Complete seu Cadastro</h1>
        <p className="text-purple-light/70 mb-8">
          Defina sua senha para acessar a plataforma
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Senha */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-purple-light">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
                required
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-purple-light">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
                required
              />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
              <Warning size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-purple text-white py-3 px-4 rounded-xl font-semibold transition-all",
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-purple/90"
            )}
          >
            {loading ? 'Processando...' : 'Completar Cadastro'}
          </button>
        </form>
      </motion.div>
    </div>
  );
} 