'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Warning, Envelope } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { validarEmail } from '../lib/validators';
import { cn } from '../lib/utils';

interface InstructorInviteFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructorInviteForm({ isOpen, onClose }: InstructorInviteFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Verificar rate limit
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;
    if (timeSinceLastSubmit < 60000) { // 60 segundos
      setError(`Aguarde ${Math.ceil((60000 - timeSinceLastSubmit) / 1000)} segundos antes de tentar novamente.`);
      return;
    }

    // Validar email
    if (!validarEmail(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    setLastSubmitTime(now);

    try {
      // Obter o ID do usuário atual (academia)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      // Criar usuário temporário para o instrutor
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-10), // Senha temporária aleatória
        options: {
          data: {
            profile_type: 'instrutor',
            academia_email: session.user.email // Vincula o instrutor à academia pelo email
          }
        }
      });

      if (authError) throw authError;

      // Enviar email de redefinição de senha
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/instrutor/completar-cadastro`
      });

      if (resetError) throw resetError;

      // Inserir registro na tabela de instrutores
      const { error: insertError } = await supabase
        .from('instrutores')
        .insert({
          user_id: authData.user?.id,
          email,
          full_name: email.split('@')[0], // Nome temporário
          cpf: '', // Será preenchido depois
          telefone: '', // Será preenchido depois
          cref: '', // Será preenchido depois
          academia_email: session.user.email, // Email da academia que convidou
          status: 'pendente'
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setEmail('');

      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      console.error('Erro ao convidar instrutor:', err);
      if (err.message.includes('Too Many Requests')) {
        setError('Muitas tentativas. Por favor, aguarde um minuto antes de tentar novamente.');
      } else {
        setError('Erro ao enviar convite. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background-card/95 backdrop-blur-xl rounded-2xl border border-white/5 p-6 w-full max-w-md relative"
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-purple-light/70 hover:text-purple-light transition-colors"
        >
          <X size={20} />
        </button>

        {/* Título */}
        <h2 className="text-xl font-semibold text-white mb-2">Convidar Instrutor</h2>
        <p className="text-purple-light/70 text-sm mb-6">
          Envie um convite por email para o instrutor se juntar à sua academia
        </p>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-purple-light">
              Email do Instrutor
            </label>
            <div className="relative">
              <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
                required
              />
            </div>
          </div>

          {/* Mensagens de Erro/Sucesso */}
          {error && (
            <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
              <Warning size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500">
              <Warning size={20} />
              <span>Convite enviado com sucesso! O instrutor receberá um email para completar o cadastro.</span>
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
            {loading ? 'Enviando...' : 'Enviar Convite'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
} 