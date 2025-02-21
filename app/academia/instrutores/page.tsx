'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChalkboardTeacher, 
  Plus, 
  Users, 
  ChartLineUp, 
  Barbell,
  DotsThree,
  Warning
} from '@phosphor-icons/react';
import Sidebar from '../../components/Sidebar';
import { useUserData } from '../../hooks/useUserData';
import InstructorInviteForm from '../../components/InstructorTokenForm';

export default function InstrutoresPage() {
  const { instrutores, loading, error } = useUserData('academia');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-purple-light">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Conteúdo Principal */}
      <main className="ml-64 p-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Instrutores</h2>
            <p className="text-purple-light/70">Gerencie sua equipe de instrutores</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 rounded-xl bg-purple text-white hover:bg-purple/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Novo Instrutor
          </button>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Total de Instrutores',
              value: instrutores.length,
              icon: ChalkboardTeacher,
              color: 'from-purple-500/20 to-accent-blue/20'
            },
            {
              title: 'Alunos Atendidos',
              value: instrutores.reduce((total, instrutor) => total + (instrutor.alunos_ativos || 0), 0),
              icon: Users,
              color: 'from-green-500/20 to-emerald-500/20'
            },
            {
              title: 'Média de Alunos',
              value: instrutores.length ? 
                Math.round(instrutores.reduce((total, instrutor) => total + (instrutor.alunos_ativos || 0), 0) / instrutores.length) : 
                0,
              icon: ChartLineUp,
              color: 'from-orange-500/20 to-red-500/20'
            }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} blur-xl opacity-50 group-hover:opacity-70 transition-opacity`} />
              <div className="relative p-6 rounded-2xl bg-background-card/50 backdrop-blur-sm border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <item.icon size={32} className="text-purple-light" weight="duotone" />
                  <span className="text-2xl font-bold text-white">{item.value}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lista de Instrutores */}
        <div className="bg-background-card/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
          {/* Cabeçalho da Lista */}
          <div className="grid grid-cols-6 gap-4 px-4 py-3 text-sm font-medium text-purple-light/70">
            <div className="col-span-2">Instrutor</div>
            <div>CREF</div>
            <div>Alunos Ativos</div>
            <div>Status</div>
            <div className="text-right">Ações</div>
          </div>

          {/* Lista */}
          <div className="space-y-2 mt-2">
            {instrutores.length > 0 ? (
              instrutores.map((instrutor) => (
                <motion.div
                  key={instrutor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-6 gap-4 items-center p-4 rounded-xl bg-background/50 border border-white/5 hover:border-purple-light/20 transition-all"
                >
                  {/* Instrutor */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-light/10 flex items-center justify-center">
                      <ChalkboardTeacher size={20} className="text-purple-light" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{instrutor.full_name}</h4>
                      <p className="text-xs text-purple-light/70">{instrutor.email}</p>
                    </div>
                  </div>

                  {/* CREF */}
                  <div className="text-sm text-white">{instrutor.cref}</div>

                  {/* Alunos Ativos */}
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-light" />
                    <span className="text-sm text-white">{instrutor.alunos_ativos || 0}</span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                      Ativo
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="flex justify-end gap-2">
                    <button className="p-2 rounded-lg bg-purple-light/10 text-purple-light hover:bg-purple-light/20 transition-colors">
                      <Users size={16} />
                    </button>
                    <button className="p-2 rounded-lg bg-purple-light/10 text-purple-light hover:bg-purple-light/20 transition-colors">
                      <ChartLineUp size={16} />
                    </button>
                    <button className="p-2 rounded-lg bg-purple-light/10 text-purple-light hover:bg-purple-light/20 transition-colors">
                      <DotsThree size={16} weight="bold" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-purple-light/70">
                <Warning size={48} className="mb-4" />
                <p className="text-center">Nenhum instrutor cadastrado</p>
                <p className="text-sm text-center mt-2">
                  Comece adicionando um novo instrutor à sua equipe
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Cadastro */}
      <InstructorInviteForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
} 