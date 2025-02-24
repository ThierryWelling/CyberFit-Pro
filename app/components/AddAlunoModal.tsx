'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Warning, 
  Envelope, 
  User, 
  IdentificationCard, 
  Phone,
  Calendar
} from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { validarEmail, validarCPF, formatarCPF, formatarTelefoneInternacional } from '../lib/validators';

interface AddAlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  email: string;
  fullName: string;
  cpf: string;
  telefone: string;
  birthDate: string;
}

interface FormErrors {
  email?: string;
  fullName?: string;
  cpf?: string;
  telefone?: string;
  birthDate?: string;
  submit?: string;
}

export default function AddAlunoModal({ isOpen, onClose, onSuccess }: AddAlunoModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    fullName: '',
    cpf: '',
    telefone: '',
    birthDate: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar formatação específica para cada campo
    switch (name) {
      case 'cpf':
        formattedValue = formatarCPF(value);
        break;
      case 'telefone':
        formattedValue = formatarTelefoneInternacional(value);
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpar erros ao digitar
    setFormErrors(prev => ({
      ...prev,
      [name]: '',
      submit: ''
    }));
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    // Validar email
    if (!validarEmail(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar CPF
    if (!validarCPF(formData.cpf)) {
      errors.cpf = 'CPF inválido';
    }

    // Validar telefone (formato: (85) 98831-8679)
    if (!formData.telefone.match(/^\(\d{2}\)\s\d{5}-\d{4}$/)) {
      errors.telefone = 'Telefone inválido';
    }

    // Validar nome completo
    if (formData.fullName.trim().split(' ').length < 2) {
      errors.fullName = 'Digite o nome completo';
    }

    // Validar data de nascimento
    if (!formData.birthDate) {
      errors.birthDate = 'Data de nascimento é obrigatória';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos os campos
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      // Buscar o ID do instrutor atual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');

      const { data: instrutor, error: instrutorError } = await supabase
        .from('instrutores')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (instrutorError) throw instrutorError;

      // Formatar dados antes de enviar
      const formattedData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, '')
      };

      // Inserir aluno usando a função segura
      const { data: alunoData, error: alunoError } = await supabase
        .rpc('insert_aluno', {
          _full_name: formattedData.fullName,
          _email: formattedData.email,
          _cpf: formattedData.cpf,
          _telefone: formattedData.telefone,
          _birth_date: formattedData.birthDate,
          _instrutor_id: instrutor.id
        });

      if (alunoError) {
        console.error('Erro ao criar aluno:', alunoError);
        
        if (alunoError.code === '23505') {
          if (alunoError.message.includes('email')) {
            throw new Error('Este email já está cadastrado');
          }
          if (alunoError.message.includes('cpf')) {
            throw new Error('Este CPF já está cadastrado');
          }
        }
        
        throw alunoError;
      }

      // Sucesso
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao adicionar aluno:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: error.message || 'Erro ao adicionar aluno. Tente novamente.'
      }));
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
        className="bg-background-card/95 backdrop-blur-xl rounded-2xl border border-white/5 p-6 w-full max-w-md relative overflow-y-auto max-h-[90vh]"
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-purple-light/70 hover:text-purple-light transition-colors"
        >
          <X size={20} />
        </button>

        {/* Título */}
        <h2 className="text-xl font-semibold text-white mb-2">Adicionar Aluno</h2>
        <p className="text-purple-light/70 text-sm mb-6">
          Preencha os dados do aluno para cadastrá-lo
        </p>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Email do Aluno"
              required
              onChange={handleInputChange}
              className={cn(
                "w-full bg-background/50 text-white placeholder-purple-light/50 border rounded-xl px-10 py-3 focus:outline-none transition-colors",
                formErrors.email 
                  ? "border-red-500/50 focus:border-red-500/70"
                  : "border-purple-light/10 focus:border-purple-light/30"
              )}
            />
            {formErrors.email && (
              <span className="text-xs text-red-500 mt-1 ml-2">{formErrors.email}</span>
            )}
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              placeholder="Nome Completo"
              required
              onChange={handleInputChange}
              className={cn(
                "w-full bg-background/50 text-white placeholder-purple-light/50 border rounded-xl px-10 py-3 focus:outline-none transition-colors",
                formErrors.fullName 
                  ? "border-red-500/50 focus:border-red-500/70"
                  : "border-purple-light/10 focus:border-purple-light/30"
              )}
            />
            {formErrors.fullName && (
              <span className="text-xs text-red-500 mt-1 ml-2">{formErrors.fullName}</span>
            )}
          </div>

          <div className="relative">
            <IdentificationCard className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              placeholder="CPF (000.000.000-00)"
              required
              maxLength={14}
              onChange={handleInputChange}
              className={cn(
                "w-full bg-background/50 text-white placeholder-purple-light/50 border rounded-xl px-10 py-3 focus:outline-none transition-colors",
                formErrors.cpf 
                  ? "border-red-500/50 focus:border-red-500/70"
                  : "border-purple-light/10 focus:border-purple-light/30"
              )}
            />
            {formErrors.cpf && (
              <span className="text-xs text-red-500 mt-1 ml-2">{formErrors.cpf}</span>
            )}
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              placeholder="Telefone ((00) 00000-0000)"
              required
              maxLength={15}
              onChange={handleInputChange}
              className={cn(
                "w-full bg-background/50 text-white placeholder-purple-light/50 border rounded-xl px-10 py-3 focus:outline-none transition-colors",
                formErrors.telefone 
                  ? "border-red-500/50 focus:border-red-500/70"
                  : "border-purple-light/10 focus:border-purple-light/30"
              )}
            />
            {formErrors.telefone && (
              <span className="text-xs text-red-500 mt-1 ml-2">{formErrors.telefone}</span>
            )}
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              required
              onChange={handleInputChange}
              className={cn(
                "w-full bg-background/50 text-white placeholder-purple-light/50 border rounded-xl px-10 py-3 focus:outline-none transition-colors",
                formErrors.birthDate 
                  ? "border-red-500/50 focus:border-red-500/70"
                  : "border-purple-light/10 focus:border-purple-light/30"
              )}
            />
            {formErrors.birthDate && (
              <span className="text-xs text-red-500 mt-1 ml-2">{formErrors.birthDate}</span>
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
                {loading ? 'Adicionando...' : 'Adicionar Aluno'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 