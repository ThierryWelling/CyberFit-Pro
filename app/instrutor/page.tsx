'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Barbell, Users, ChartLineUp, Plus } from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import { useUserData } from '../hooks/useUserData';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function InstrutorDashboard() {
  const { stats, alunos, loading, error } = useUserData('instrutor');

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

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Painel do Instrutor</h2>
          <p className="text-purple-light/70">Gerencie seus alunos e treinos</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Total de Alunos',
              value: stats.totalAlunos || 0,
              icon: Users,
              color: 'from-purple-500/20 to-accent-blue/20'
            },
            {
              title: 'Treinos Ativos',
              value: stats.treinosAtivos || 0,
              icon: Barbell,
              color: 'from-green-500/20 to-emerald-500/20'
            },
            {
              title: 'Avaliações Pendentes',
              value: stats.avaliacoesPendentes || 0,
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

        {/* Alunos Section */}
        <section className="bg-background-card/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Meus Alunos</h3>
            <button className="flex items-center px-4 py-2 rounded-xl bg-purple text-white hover:bg-purple/90 transition-colors">
              <Plus size={20} className="mr-2" />
              Novo Aluno
            </button>
          </div>
          
          <div className="space-y-4">
            {alunos.length > 0 ? (
              alunos.map((aluno) => (
                <div
                  key={aluno.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-white/5 hover:border-purple-light/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-light/10 flex items-center justify-center">
                      <Users size={20} className="text-purple-light" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-white">{aluno.full_name}</h4>
                      <p className="text-xs text-purple-light/70">
                        Último treino: {
                          aluno.ultimo_treino 
                            ? formatDistanceToNow(new Date(aluno.ultimo_treino), {
                                addSuffix: true,
                                locale: ptBR
                              })
                            : 'Sem treinos registrados'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 rounded-lg bg-purple-light/10 text-purple-light text-sm hover:bg-purple-light/20 transition-colors">
                      Ver Treino
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-purple-light/10 text-purple-light text-sm hover:bg-purple-light/20 transition-colors">
                      Avaliar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-purple-light/70">
                Nenhum aluno cadastrado
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
} 