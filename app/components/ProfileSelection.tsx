'use client';

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ChalkboardTeacher, Buildings } from '@phosphor-icons/react';

type ProfileType = 'aluno' | 'instrutor' | null;

export default function ProfileSelection() {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null);

  return (
    <div className="min-h-screen bg-background bg-grid-pattern bg-[size:30px_30px] relative">
      {/* Header */}
      <header className="absolute top-0 right-0 p-4 flex gap-4">
        <button className="text-purple-light/70 hover:text-purple-light transition-colors">
          <Buildings size={24} weight="light" />
          <span className="ml-2">Admin</span>
        </button>
        <button className="text-purple-light/70 hover:text-purple-light transition-colors">
          <Buildings size={24} weight="light" />
          <span className="ml-2">Academia</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-background-card rounded-3xl shadow-card p-8"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-light to-accent-blue bg-clip-text text-transparent mb-2">
              CyberFit Pro
            </h1>
            <p className="text-purple-light/60 text-sm">Sistema de Acesso</p>
          </div>

          <h2 className="text-white text-xl mb-6 text-center">
            Você é Aluno ou Instrutor?
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedProfile('aluno')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all ${
                selectedProfile === 'aluno'
                  ? 'bg-purple text-white shadow-neon'
                  : 'bg-background hover:bg-purple/10 text-purple-light'
              }`}
            >
              <User size={32} weight="light" />
              <span className="mt-2">Aluno</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedProfile('instrutor')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all ${
                selectedProfile === 'instrutor'
                  ? 'bg-purple text-white shadow-neon'
                  : 'bg-background hover:bg-purple/10 text-purple-light'
              }`}
            >
              <ChalkboardTeacher size={32} weight="light" />
              <span className="mt-2">Instrutor</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 