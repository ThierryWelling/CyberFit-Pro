'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Barbell, 
  Calendar, 
  ChartLineUp,
  Buildings,
  Warning
} from '@phosphor-icons/react';
import { useUserData } from '../../hooks/useUserData';
import { cn } from '../../lib/utils';

interface DashboardCard {
  title: string;
  value: number | string;
  icon: any;
  description: string;
  color: string;
}

export default function InstructorDashboard() {
  const { stats, loading, error } = useUserData('instrutor');

  const cards: DashboardCard[] = [
    {
      title: 'Total de Alunos',
      value: stats.totalAlunos || 0,
      icon: Users,
      description: 'Alunos ativos',
      color: 'from-purple-500/20 to-accent-blue/20'
    },
    {
      title: 'Treinos Ativos',
      value: stats.treinosAtivos || 0,
      icon: Barbell,
      description: 'Treinos em andamento',
      color: 'from-green-500/20 to-emerald-500/20'
    },
    {
      title: 'Avaliações Pendentes',
      value: stats.avaliacoesPendentes || 0,
      icon: Calendar,
      description: 'Aguardando avaliação',
      color: 'from-yellow-500/20 to-orange-500/20'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
          <Warning size={24} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Dashboard</h1>
        <div className="flex items-center gap-2 text-purple-light/70">
          <Buildings size={20} />
          <span>Academia: {stats.academia || 'Não vinculado'}</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:bg-background-card/70 transition-colors"
          >
            {/* Background Gradient */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              card.color
            )} />

            {/* Content */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-light/70">{card.title}</span>
                <card.icon size={24} className="text-purple-light" weight="duotone" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-3xl font-semibold text-white">{card.value}</h3>
                <p className="text-sm text-purple-light/70">{card.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Seção de Atividades Recentes */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Atividades Recentes</h2>
        <div className="bg-background-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
          {/* Adicionar lista de atividades aqui */}
          <p className="text-purple-light/70">Em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
} 