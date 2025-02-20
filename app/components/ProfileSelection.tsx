'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ChalkboardTeacher, Buildings, Barbell, Envelope, Lock, CaretLeft, Phone, IdentificationCard, CaretDown, Warning } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { validarCPF, validarTelefone, validarEmail, validarCNPJ, formatarCPF, formatarCNPJ, formatarTelefoneInternacional, paisesDDI } from '../lib/validators';
import { signIn, signUp, resetPassword, validateToken } from '../lib/auth';
import { useRouter } from 'next/navigation';

type ProfileType = 'aluno' | 'instrutor' | 'academia' | null;

interface FormErrors {
  cpf?: string;
  telefone?: string;
  email?: string;
  cnpj?: string;
  token?: string;
  submit?: string;
}

export default function ProfileSelection() {
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null);
  const [formType, setFormType] = useState<'login' | 'register'>('login');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [selectedDDI, setSelectedDDI] = useState('55');
  const [showDDISelector, setShowDDISelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileSelect = (profile: ProfileType) => {
    setSelectedProfile(profile);
    setFormType('login');
  };

  const handleFormTypeChange = (type: 'login' | 'register') => {
    setFormType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData);

      if (formType === 'login') {
        const result = await signIn(data.email as string, data.password as string);
        
        if (result.success) {
          router.push('/dashboard');
        } else {
          setFormErrors(prev => ({
            ...prev,
            submit: 'Email ou senha inválidos'
          }));
        }
      } else {
        // Validar token se necessário
        if (selectedProfile !== 'academia' && data.token) {
          const tokenValidation = await validateToken(
            data.token as string,
            selectedProfile as 'aluno' | 'instrutor'
          );

          if (!tokenValidation.success) {
            setFormErrors(prev => ({
              ...prev,
              token: 'Token inválido'
            }));
            setIsLoading(false);
            return;
          }
        }

        // Registrar usuário
        const result = await signUp({
          email: data.email as string,
          password: data.password as string,
          fullName: data.fullName as string,
          cpf: data.cpf as string,
          cnpj: data.cnpj as string,
          telefone: data.telefone as string,
          birthDate: data.birthDate as string,
          cref: data.cref as string,
          academyName: data.academyName as string,
          address: data.address as string,
          token: data.token as string,
          profileType: selectedProfile as 'aluno' | 'instrutor' | 'academia'
        });

        if (result.success) {
          if (result.message) {
            setFormErrors(prev => ({
              ...prev,
              submit: result.message
            }));
          } else {
            router.push('/dashboard');
          }
        } else {
          setFormErrors(prev => ({
            ...prev,
            submit: 'Erro ao criar conta. Tente novamente.'
          }));
        }
      }
    } catch (error) {
      console.error('Erro no formulário:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: 'Ocorreu um erro. Tente novamente.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value;
    
    if (!email) {
      setFormErrors(prev => ({
        ...prev,
        email: 'Digite seu email para recuperar a senha'
      }));
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        alert('Enviamos um email com instruções para redefinir sua senha');
      } else {
        setFormErrors(prev => ({
          ...prev,
          submit: 'Erro ao enviar email de recuperação'
        }));
      }
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: 'Ocorreu um erro. Tente novamente.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let error = '';

    switch (name) {
      case 'cpf':
        formattedValue = formatarCPF(value);
        if (value && !validarCPF(value)) {
          error = 'CPF inválido';
        }
        e.target.value = formattedValue;
        break;
      
      case 'cnpj':
        formattedValue = formatarCNPJ(value);
        if (value && !validarCNPJ(value)) {
          error = 'CNPJ inválido';
        }
        e.target.value = formattedValue;
        break;
      
      case 'telefone':
        formattedValue = formatarTelefoneInternacional(value, selectedDDI);
        if (value && !validarTelefone(value, selectedDDI)) {
          error = 'Telefone inválido';
        }
        e.target.value = formattedValue;
        break;

      case 'email':
        if (value && !validarEmail(value)) {
          error = 'Email inválido';
        }
        break;
    }

    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const renderPhoneInput = () => (
    <div className="relative">
      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
      <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center">
        <button
          type="button"
          onClick={() => setShowDDISelector(!showDDISelector)}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-purple-light/10 transition-colors"
        >
          <span className="text-sm text-purple-light">
            {paisesDDI.find(p => p.ddi === selectedDDI)?.bandeira}
          </span>
          <span className="text-sm text-purple-light">+{selectedDDI}</span>
          <CaretDown size={12} className="text-purple-light/70" />
        </button>
      </div>
      <input
        type="text"
        name="telefone"
        placeholder="Telefone"
        required
        maxLength={20}
        onChange={handleInputChange}
        className={cn(
          "w-full bg-background/50 text-white placeholder-purple-light/50 border rounded-xl pl-32 pr-10 py-3 focus:outline-none transition-colors",
          formErrors.telefone 
            ? "border-red-500/50 focus:border-red-500/70"
            : "border-purple-light/10 focus:border-purple-light/30"
        )}
      />
      {formErrors.telefone && (
        <span className="text-xs text-red-500 mt-1 ml-2">{formErrors.telefone}</span>
      )}
      
      {showDDISelector && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute left-0 top-full mt-2 w-64 max-h-60 overflow-y-auto bg-background-card/95 backdrop-blur-xl rounded-xl border border-purple-light/10 shadow-xl z-50"
        >
          <div className="p-2 space-y-1">
            {paisesDDI.map((pais) => (
              <button
                key={pais.ddi + pais.nome}
                type="button"
                onClick={() => {
                  setSelectedDDI(pais.ddi);
                  setShowDDISelector(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  selectedDDI === pais.ddi
                    ? "bg-purple text-white"
                    : "hover:bg-purple-light/10 text-purple-light"
                )}
              >
                <span>{pais.bandeira}</span>
                <span>{pais.nome}</span>
                <span className="ml-auto">+{pais.ddi}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderProfileFields = () => {
    if (!selectedProfile || formType !== 'register') return null;

    switch (selectedProfile) {
      case 'aluno':
        return (
          <>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
              <input
                type="text"
                name="fullName"
                placeholder="Nome Completo"
                required
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
              />
            </div>

            <div className="relative">
              <IdentificationCard className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
              <input
                type="text"
                name="cpf"
                placeholder="CPF"
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

            {renderPhoneInput()}

            <div className="relative">
              <input
                type="date"
                name="birthDate"
                placeholder="Data de Nascimento"
                required
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V17M6 9V11C6 13.2091 8.79086 15 12 15C15.2091 15 18 13.2091 18 11V9M6 9C6 6.79086 8.79086 5 12 5C15.2091 5 18 6.79086 18 9M6 9C6 11.2091 8.79086 13 12 13C15.2091 13 18 11.2091 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                name="token"
                placeholder="Token do Instrutor"
                required
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
              />
              <div className="mt-1 text-xs text-purple-light/60 px-2">
                Token enviado pelo seu instrutor para vinculação
              </div>
            </motion.div>
          </>
        );
      case 'instrutor':
        return (
          <>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
              <input
                type="text"
                name="fullName"
                placeholder="Nome Completo"
                required
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
              />
            </div>

            <div className="relative">
              <IdentificationCard className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
              <input
                type="text"
                name="cpf"
                placeholder="CPF"
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

            {renderPhoneInput()}

            <div className="relative">
              <ChalkboardTeacher className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
              <input
                type="text"
                name="cref"
                placeholder="CREF"
                required
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V17M6 9V11C6 13.2091 8.79086 15 12 15C15.2091 15 18 13.2091 18 11V9M6 9C6 6.79086 8.79086 5 12 5C15.2091 5 18 6.79086 18 9M6 9C6 11.2091 8.79086 13 12 13C15.2091 13 18 11.2091 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                name="token"
                placeholder="Token da Academia"
                required
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
              />
              <div className="mt-1 text-xs text-purple-light/60 px-2">
                Token enviado pela academia para vinculação
              </div>
            </motion.div>
          </>
        );
      case 'academia':
        return (
          <>
            <div className="relative">
              <Buildings className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
              <input
                type="text"
                name="academyName"
                placeholder="Nome da Academia"
                required
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
              />
            </div>
            <div className="relative">
              <IdentificationCard className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
              <input
                type="text"
                name="cnpj"
                placeholder="CNPJ"
                required
                maxLength={18}
                onChange={handleInputChange}
                className={cn(
                  "w-full bg-background/50 text-white placeholder-purple-light/50 border rounded-xl px-10 py-3 focus:outline-none transition-colors",
                  formErrors.cnpj 
                    ? "border-red-500/50 focus:border-red-500/70"
                    : "border-purple-light/10 focus:border-purple-light/30"
                )}
              />
              {formErrors.cnpj && (
                <span className="text-xs text-red-500 mt-1 ml-2">{formErrors.cnpj}</span>
              )}
            </div>
            {renderPhoneInput()}
            <div className="relative">
              <input
                type="text"
                name="address"
                placeholder="Endereço"
                required
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderForm = () => {
    const formTitle = formType === 'register' ? 'Criar Conta' : 'Entrar';
    const buttonText = formType === 'register' ? 'Cadastrar' : 'Entrar';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 space-y-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-white">{formTitle}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => handleFormTypeChange('login')}
            className={cn(
              "py-3 px-4 rounded-xl font-medium transition-all duration-300",
              formType === 'login'
                ? "bg-purple text-white shadow-neon border border-purple-light/50"
                : "bg-background/50 text-purple-light border border-purple-light/10 hover:bg-purple/5 hover:border-purple-light/30"
            )}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleFormTypeChange('register')}
            className={cn(
              "py-3 px-4 rounded-xl font-medium transition-all duration-300",
              formType === 'register'
                ? "bg-purple text-white shadow-neon border border-purple-light/50"
                : "bg-background/50 text-purple-light border border-purple-light/10 hover:bg-purple/5 hover:border-purple-light/30"
            )}
          >
            Cadastro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email"
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
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Senha"
              required
              className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
            />
          </div>

          {formType === 'register' && (
            <>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar Senha"
                  required
                  className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
                />
              </div>
              {renderProfileFields()}
            </>
          )}

          <div className="space-y-3">
            {formErrors.submit && (
              <div className={cn(
                "flex items-center gap-2 text-sm p-3 rounded-lg border",
                formErrors.submit.includes('sucesso') || formErrors.submit.includes('verifique seu email')
                  ? "bg-green-500/10 border-green-500/20 text-green-500"
                  : "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                <Warning size={20} />
                <span>{formErrors.submit}</span>
              </div>
            )}
            
            <motion.button 
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={cn(
                "w-full bg-accent-blue text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-accent-blue/20 relative overflow-hidden group",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              <span className="relative z-10">
                {isLoading ? 'Carregando...' : formType === 'register' ? 'Cadastrar' : 'Entrar'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            {formType === 'login' && (
              <motion.button 
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02, x: isLoading ? 0 : 5 }}
                className={cn(
                  "w-full text-sm text-purple-light/70 hover:text-purple-light transition-colors mt-2",
                  isLoading && "opacity-70 cursor-not-allowed"
                )}
              >
                Esqueceu sua senha?
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    );
  };

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

      {/* Header */}
      <header className="absolute top-0 right-0 p-6 flex gap-4 z-10">
        <button className="group flex items-center px-4 py-2 rounded-xl bg-background-card/50 backdrop-blur-sm border border-white/5 hover:border-purple-light/30 transition-all duration-300">
          <Buildings className="text-purple-light/70 group-hover:text-purple-light transition-colors" size={20} weight="light" />
          <span className="ml-2 text-sm font-medium text-purple-light/70 group-hover:text-purple-light">Suporte</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-block"
            >
              <div className="relative">
                <Barbell size={64} weight="duotone" className="text-purple-light animate-glow" />
                <div className="absolute inset-0 animate-pulse bg-purple-500/20 rounded-full blur-xl" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-gradient"
            >
              CyberFit Pro
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-purple-light/60 text-sm tracking-wide"
            >
              Sistema de Acesso
            </motion.p>
          </div>

          {/* Selection Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            {selectedProfile && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex gap-4 items-center">
                  <motion.button
                    type="button"
                    onClick={() => setSelectedProfile(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl font-medium transition-all duration-300 bg-background/50 text-purple-light border border-purple-light/10 hover:bg-purple/5 hover:border-purple-light/30"
                  >
                    <CaretLeft size={24} weight="bold" />
                  </motion.button>
                  
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <motion.button
                      type="button"
                      onClick={() => handleFormTypeChange('login')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "py-4 px-6 rounded-xl font-medium transition-all duration-300",
                        formType === 'login'
                          ? "bg-purple text-white shadow-neon border border-purple-light/50"
                          : "bg-background/50 text-purple-light border border-purple-light/10 hover:bg-purple/5 hover:border-purple-light/30"
                      )}
                    >
                      Login
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => handleFormTypeChange('register')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "py-4 px-6 rounded-xl font-medium transition-all duration-300",
                        formType === 'register'
                          ? "bg-purple text-white shadow-neon border border-purple-light/50"
                          : "bg-background/50 text-purple-light border border-purple-light/10 hover:bg-purple/5 hover:border-purple-light/30"
                      )}
                    >
                      Cadastro
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-background-card/80 backdrop-blur-xl rounded-3xl shadow-card p-8 border border-white/5 relative overflow-hidden"
            >
              {/* Card Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-accent-blue/5" />
              <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-10" />
              
              <h2 className="text-white text-2xl mb-8 text-center relative">
                {selectedProfile ? `${formType === 'register' ? 'Cadastro' : 'Login'} como ${selectedProfile}` : 'Você é Aluno, Instrutor ou Academia?'}
              </h2>

              {!selectedProfile ? (
                <div className="grid grid-cols-3 gap-4 relative">
                  {[
                    { id: 'aluno', label: 'Aluno', icon: User, description: 'Acesse seus treinos' },
                    { id: 'instrutor', label: 'Instrutor', icon: ChalkboardTeacher, description: 'Gerencie alunos' },
                    { id: 'academia', label: 'Academia', icon: Buildings, description: 'Gerencie academia' }
                  ].map((profile) => {
                    const Icon = profile.icon;
                    return (
                      <motion.button
                        key={profile.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProfileSelect(profile.id as ProfileType)}
                        className={cn(
                          "flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 group relative backdrop-blur-sm",
                          selectedProfile === profile.id
                            ? "bg-purple text-white shadow-neon border border-purple-light/50"
                            : "bg-background/50 hover:bg-purple/5 text-purple-light border border-purple-light/10 hover:border-purple-light/30"
                        )}
                      >
                        <Icon size={32} weight={selectedProfile === profile.id ? "fill" : "light"} 
                              className="transition-all duration-300 group-hover:scale-110" />
                        <span className="mt-3 font-medium text-base">{profile.label}</span>
                        <span className="text-xs mt-1 opacity-60">{profile.description}</span>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
                      <input
                        type="password"
                        name="password"
                        placeholder="Senha"
                        required
                        className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
                      />
                    </div>

                    {formType === 'register' && (
                      <>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" size={20} />
                          <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmar Senha"
                            required
                            className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl px-10 py-3 focus:outline-none focus:border-purple-light/30 transition-colors"
                          />
                        </div>
                        {renderProfileFields()}
                      </>
                    )}

                    <div className="space-y-3">
                      {formErrors.submit && (
                        <div className={cn(
                          "flex items-center gap-2 text-sm p-3 rounded-lg border",
                          formErrors.submit.includes('sucesso') || formErrors.submit.includes('verifique seu email')
                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                            : "bg-red-500/10 border-red-500/20 text-red-500"
                        )}>
                          <Warning size={20} />
                          <span>{formErrors.submit}</span>
                        </div>
                      )}
                      
                      <motion.button 
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className={cn(
                          "w-full bg-accent-blue text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-accent-blue/20 relative overflow-hidden group",
                          isLoading && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        <span className="relative z-10">
                          {isLoading ? 'Carregando...' : formType === 'register' ? 'Cadastrar' : 'Entrar'}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.button>

                      {formType === 'login' && (
                        <motion.button 
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={isLoading}
                          whileHover={{ scale: isLoading ? 1 : 1.02, x: isLoading ? 0 : 5 }}
                          className={cn(
                            "w-full text-sm text-purple-light/70 hover:text-purple-light transition-colors mt-2",
                            isLoading && "opacity-70 cursor-not-allowed"
                          )}
                        >
                          Esqueceu sua senha?
                        </motion.button>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 