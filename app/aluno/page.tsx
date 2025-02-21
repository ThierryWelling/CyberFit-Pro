'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Barbell, Calendar, ChartLineUp, Users } from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import { useUserData } from '../hooks/useUserData';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AlunoDashboard() {
  const { stats, atividades, loading, error } = useUserData('aluno');

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
          <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo(a)!</h2>
          <p className="text-purple-light/70">Acompanhe seus treinos e evolução</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Treino do Dia',
              icon: Barbell,
              description: 'Visualize seu treino atual',
              value: stats.treinosAtivos ? `${stats.treinosAtivos} treinos ativos` : 'Nenhum treino ativo',
              color: 'from-purple-500/20 to-accent-blue/20'
            },
            {
              title: 'Agenda',
              icon: Calendar,
              description: 'Próximo treino agendado',
              value: 'Hoje às 18:00',
              color: 'from-green-500/20 to-emerald-500/20'
            },
            {
              title: 'Progresso',
              icon: ChartLineUp,
              description: 'Sua evolução este mês',
              value: '85% concluído',
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
              <button className="relative w-full p-6 rounded-2xl bg-background-card/50 backdrop-blur-sm border border-white/5 hover:border-purple-light/20 transition-all">
                <item.icon size={32} className="text-purple-light mb-4" weight="duotone" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-purple-light/70 mb-2">{item.description}</p>
                <p className="text-sm font-medium text-white">{item.value}</p>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <section className="bg-background-card/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Atividades Recentes</h3>
          <div className="space-y-4">
            {atividades.length > 0 ? (
              atividades.map((atividade) => (
                <div
                  key={atividade.id}
                  className="flex items-center p-4 rounded-xl bg-background/50 border border-white/5"
                >
                  <div className="h-10 w-10 rounded-full bg-purple-light/10 flex items-center justify-center">
                    <Barbell size={20} className="text-purple-light" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-white">{atividade.descricao}</h4>
                    <p className="text-xs text-purple-light/70">
                      {formatDistanceToNow(new Date(atividade.data), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-purple-light/70">
                Nenhuma atividade recente
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
} 