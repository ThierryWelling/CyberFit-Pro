'use client';

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ChalkboardTeacher, Buildings, Barbell } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

type ProfileType = 'aluno' | 'instrutor' | null;

export default function ProfileSelection() {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null);

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
          <span className="ml-2 text-sm font-medium text-purple-light/70 group-hover:text-purple-light">Admin</span>
        </button>
        <button className="group flex items-center px-4 py-2 rounded-xl bg-background-card/50 backdrop-blur-sm border border-white/5 hover:border-purple-light/30 transition-all duration-300">
          <Buildings className="text-purple-light/70 group-hover:text-purple-light transition-colors" size={20} weight="light" />
          <span className="ml-2 text-sm font-medium text-purple-light/70 group-hover:text-purple-light">Academia</span>
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
              className="text-5xl font-bold font-display text-gradient"
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
            className="bg-background-card/80 backdrop-blur-xl rounded-3xl shadow-card p-8 border border-white/5 relative overflow-hidden"
          >
            {/* Card Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-accent-blue/5" />
            <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-10" />
            
            <h2 className="text-white text-2xl mb-8 text-center font-display relative">
              Você é Aluno ou Instrutor?
            </h2>

            <div className="grid grid-cols-2 gap-4 relative">
              {[
                { id: 'aluno', label: 'Aluno', icon: User, description: 'Acesse seus treinos' },
                { id: 'instrutor', label: 'Instrutor', icon: ChalkboardTeacher, description: 'Gerencie alunos' }
              ].map((profile) => {
                const Icon = profile.icon;
                return (
                  <motion.button
                    key={profile.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedProfile(profile.id as ProfileType)}
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

            {selectedProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8"
              >
                <button className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-accent-blue/20 relative overflow-hidden group">
                  <span className="relative z-10">Continuar</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 